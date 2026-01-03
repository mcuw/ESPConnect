import { readFileSync } from "node:fs";
import path from "node:path";
import { ReadableStream } from "node:stream/web";
import {
  ESP_CHANGE_BAUDRATE,
  ESP_GET_SECURITY_INFO,
  ESP_MEM_BEGIN,
  ESP_MEM_DATA,
  ESP_MEM_END,
  ESP_READ_FLASH,
  ESP_READ_REG,
  ESP_SPI_FLASH_MD5,
  ESP_SYNC,
  ESP_WRITE_REG,
} from "tasmota-webserial-esptool/dist/const.js";

type TranscriptStep =
  | {
      type: "response";
      opcode?: string | number;
      value?: string | number;
      data?: string;
      status?: string;
    }
  | {
      type: "timeout";
      opcode?: string | number;
    }
  | {
      type: "raw";
      data: string;
    };

type Transcript = {
  steps: TranscriptStep[];
};

const OPCODE_MAP: Record<string, number> = {
  ESP_CHANGE_BAUDRATE,
  ESP_SYNC,
  ESP_GET_SECURITY_INFO,
  ESP_READ_REG,
  ESP_READ_FLASH,
  ESP_WRITE_REG,
  ESP_MEM_BEGIN,
  ESP_MEM_DATA,
  ESP_MEM_END,
  ESP_SPI_FLASH_MD5,
};

function resolveOpcode(opcode: string | number | undefined): number | undefined {
  if (opcode === undefined) return undefined;
  if (typeof opcode === "number") return opcode;
  if (opcode.startsWith("0x")) {
    return parseInt(opcode.slice(2), 16);
  }
  const resolved = OPCODE_MAP[opcode];
  if (resolved === undefined) {
    throw new Error(`Unknown opcode "${opcode}"`);
  }
  return resolved;
}

function parseHexBytes(hex?: string): number[] {
  if (!hex) return [];
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) {
    throw new Error(`Hex string must be even length: "${hex}"`);
  }
  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i += 2) {
    bytes.push(parseInt(normalized.slice(i, i + 2), 16));
  }
  return bytes;
}

function parseValue(value?: string | number): number {
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  const normalized = value.startsWith("0x") ? value.slice(2) : value;
  return parseInt(normalized, 16);
}

function toBytesLE(value: number, length: number): number[] {
  const out: number[] = [];
  let v = value >>> 0;
  for (let i = 0; i < length; i += 1) {
    out.push(v & 0xff);
    v >>>= 8;
  }
  return out;
}

function slipEncode(data: number[]): Uint8Array {
  const encoded: number[] = [0xc0];
  for (const byte of data) {
    if (byte === 0xc0) {
      encoded.push(0xdb, 0xdc);
    } else if (byte === 0xdb) {
      encoded.push(0xdb, 0xdd);
    } else {
      encoded.push(byte);
    }
  }
  encoded.push(0xc0);
  return new Uint8Array(encoded);
}

function slipDecode(frame: Uint8Array): number[] {
  let started = false;
  let escape = false;
  const decoded: number[] = [];

  for (const byte of frame) {
    if (!started) {
      if (byte === 0xc0) {
        started = true;
      }
      continue;
    }
    if (byte === 0xc0) {
      return decoded;
    }
    if (escape) {
      escape = false;
      if (byte === 0xdc) {
        decoded.push(0xc0);
      } else if (byte === 0xdd) {
        decoded.push(0xdb);
      } else {
        throw new Error(`Invalid SLIP escape byte 0x${byte.toString(16)}`);
      }
      continue;
    }
    if (byte === 0xdb) {
      escape = true;
      continue;
    }
    decoded.push(byte);
  }

  throw new Error("Incomplete SLIP frame");
}

function decodeCommandOpcode(frame: Uint8Array): number | null {
  const payload = slipDecode(frame);
  if (payload.length < 8) {
    return null;
  }
  if (payload[0] !== 0x00) {
    return null;
  }
  return payload[1];
}

function buildResponsePacket(
  opcode: number,
  value: number,
  dataHex?: string,
  statusHex?: string,
): Uint8Array {
  const header = [1, opcode, 0x00, 0x00, ...toBytesLE(value, 4)];
  const dataBytes = parseHexBytes(dataHex);
  const statusBytes = parseHexBytes(statusHex);
  return slipEncode([...header, ...dataBytes, ...statusBytes]);
}

class TranscriptRunner {
  private readonly mode: "replay" | "record";
  private readonly steps: TranscriptStep[];
  readonly recordedWrites: number[] = [];

  constructor(transcript: Transcript, mode: "replay" | "record" = "replay") {
    this.mode = mode;
    this.steps = [...transcript.steps];
  }

  handleWrite(frame: Uint8Array): Uint8Array[] {
    const opcode = decodeCommandOpcode(frame);
    if (opcode === null) {
      return [];
    }

    if (this.mode === "record") {
      this.recordedWrites.push(opcode);
      return [];
    }

    const packets: Uint8Array[] = [];
    const step = this.steps.shift();
    if (!step) {
      throw new Error(`Transcript exhausted (opcode 0x${opcode.toString(16)})`);
    }

    if (step.type === "raw") {
      throw new Error(`Unexpected raw packet before opcode 0x${opcode.toString(16)}`);
    }

    const expectedOpcode = resolveOpcode(step.opcode);
    if (expectedOpcode !== undefined && expectedOpcode !== opcode) {
      throw new Error(
        `Transcript opcode mismatch (expected 0x${expectedOpcode.toString(
          16,
        )}, got 0x${opcode.toString(16)})`,
      );
    }

    if (step.type === "response") {
      packets.push(
        buildResponsePacket(
          expectedOpcode ?? opcode,
          parseValue(step.value),
          step.data,
          step.status,
        ),
      );
    }

    while (this.steps[0]?.type === "raw") {
      const raw = this.steps.shift() as Extract<TranscriptStep, { type: "raw" }>;
      packets.push(slipEncode(parseHexBytes(raw.data)));
    }

    return packets;
  }

  remaining(): number {
    return this.steps.length;
  }
}

export function loadTranscript(name: string): Transcript {
  const filename = name.endsWith(".json") ? name : `${name}.json`;
  const fullPath = path.resolve(
    process.cwd(),
    "tests",
    "fixtures",
    "esptool-transcripts",
    filename,
  );
  const raw = readFileSync(fullPath, "utf8");
  return JSON.parse(raw) as Transcript;
}

export class FakeSerialPort {
  readable: ReadableStream<Uint8Array> | null = null;
  writable: WritableStream<Uint8Array> | null = null;

  private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private readonly runner: TranscriptRunner;
  private writer: {
    write: (chunk: Uint8Array) => Promise<void>;
    close: () => Promise<void>;
    releaseLock: () => void;
  } | null = null;

  constructor(transcript: Transcript, mode: "replay" | "record" = "replay") {
    this.runner = new TranscriptRunner(transcript, mode);
  }

  getInfo() {
    return { usbVendorId: 0x303a, usbProductId: 0x1001 };
  }

  async open(_options?: { baudRate?: number }) {
    this.readable = new ReadableStream<Uint8Array>({
      start: controller => {
        this.controller = controller;
      },
      cancel: () => {
        this.controller = null;
      },
    });

    this.writer = {
      write: async chunk => {
        const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
        const packets = this.runner.handleWrite(bytes);
        if (this.controller) {
          for (const packet of packets) {
            this.controller.enqueue(packet);
          }
        }
      },
      close: async () => {
        this.controller?.close();
      },
      releaseLock: () => undefined,
    };

    this.writable = {
      getWriter: () => this.writer!,
    } as unknown as WritableStream<Uint8Array>;
  }

  async close() {
    this.controller?.close();
    this.controller = null;
    this.writer = null;
    this.readable = null;
    this.writable = null;
  }

  async setSignals(_signals: Record<string, boolean>) {
    return;
  }

  async getSignals() {
    return {};
  }

  assertNoPendingSteps() {
    const remaining = this.runner.remaining();
    if (remaining !== 0) {
      throw new Error(`Transcript has ${remaining} unconsumed step(s).`);
    }
  }
}
