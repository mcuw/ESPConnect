import { ESPLoader, Transport } from '../esptool_lib/index.js';
import type { ESPLoader as EsptoolLoader, Transport as EsptoolTransport } from '../esptool_lib/index';
import { DEBUG_SERIAL, DEFAULT_ROM_BAUD } from '../constants/serial';

type StatusCallback = (message: string) => void;

export interface EsptoolOptions {
  port: SerialPort;
  terminal: unknown;
  desiredBaud?: number;
  debugSerial?: boolean;
  debugLogging?: boolean;
  onStatus?: StatusCallback;
}

export interface EsptoolClient {
  loader: EsptoolLoader;
  transport: EsptoolTransport;
  connectAndHandshake: () => Promise<{ chipName: string; chip: any }>;
  disconnect: () => Promise<void>;
  changeBaud: (baud: number) => Promise<void>;
  readPartitionTable: (offset?: number, length?: number) => Promise<any[]>;
  readFlashId: () => Promise<number | undefined>;
  detectFlashSize: () => Promise<number | undefined>;
  readChipMetadata: () => Promise<{
    description: string | undefined;
    features: any;
    crystalFreq: any;
    macAddress: any;
    pkgVersion: any;
    chipRevision: any;
    majorVersion: any;
    minorVersion: any;
    flashVendor: any;
    psramVendor: any;
    flashCap: any;
    psramCap: any;
    blockVersionMajor: any;
    blockVersionMinor: any;
  }>;
}

export function createEsptoolClient({
  port,
  terminal,
  desiredBaud,
  debugSerial = DEBUG_SERIAL,
  debugLogging = false,
  onStatus,
}: EsptoolOptions): EsptoolClient {
  const transport = new Transport(port, debugSerial);
  transport.tracing = debugSerial;
  const loader = new ESPLoader({
    transport,
    baudrate: DEFAULT_ROM_BAUD,
    terminal,
    debugLogging,
  });

  const status = (msg: string) => onStatus?.(msg);

  async function connectAndHandshake() {
    status('Handshaking with ROM bootloader...');
    const chipName = await loader.main();
    const chip = loader.chip;
    status('Reading chip information...');

    if (desiredBaud && desiredBaud !== DEFAULT_ROM_BAUD) {
      await changeBaud(desiredBaud);
    }

    return { chipName, chip };
  }

  async function changeBaud(baud: number) {
    loader.baudrate = baud;
    await loader.changeBaud();
    transport.baudrate = baud;
  }

  async function disconnect() {
    try {
      await transport.disconnect();
    } catch {
      // swallow
    }
  }

  async function readPartitionTable(offset = 0x8000, length = 0x400) {
    const data = await loader.readFlash(offset, length);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const decoder = new TextDecoder();
    const entries = [];
    for (let i = 0; i + 32 <= data.length; i += 32) {
      const magic = view.getUint16(i, true);
      if (magic === 0xffff || magic === 0x0000) break;
      if (magic !== 0x50aa) continue;
      const type = view.getUint8(i + 2);
      const subtype = view.getUint8(i + 3);
      const addr = view.getUint32(i + 4, true);
      const size = view.getUint32(i + 8, true);
      const labelBytes = data.subarray(i + 12, i + 28);
      const label = decoder
        .decode(labelBytes)
        .replace(/\0/g, '')
        .trim();
      entries.push({ label: label || `type 0x${type.toString(16)}`, type, subtype, offset: addr, size });
    }
    return entries;
  }

  async function readFlashId() {
    try {
      return await loader.readFlashId();
    } catch {
      return undefined;
    }
  }

  async function detectFlashSize() {
    try {
      if (typeof loader.detectFlashSize === 'function') {
        return await loader.detectFlashSize();
      }
      if (typeof loader.getFlashSize === 'function') {
        return await loader.getFlashSize();
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  async function readChipMetadata() {
    const chip = loader.chip;
    const callChip = async (method: string) => {
      const fn = chip?.[method];
      if (typeof fn === 'function') {
        try {
          return await fn.call(chip, loader);
        } catch {
          return undefined;
        }
      }
      return undefined;
    };

    return {
      description: await callChip('getChipDescription'),
      features: await callChip('getChipFeatures'),
      crystalFreq: await callChip('getCrystalFreq'),
      macAddress: await callChip('readMac'),
      pkgVersion: await callChip('getPkgVersion'),
      chipRevision: await callChip('getChipRevision'),
      majorVersion: await callChip('getMajorChipVersion'),
      minorVersion: await callChip('getMinorChipVersion'),
      flashVendor: await callChip('getFlashVendor'),
      psramVendor: await callChip('getPsramVendor'),
      flashCap: await callChip('getFlashCap'),
      psramCap: await callChip('getPsramCap'),
      blockVersionMajor: await callChip('getBlkVersionMajor'),
      blockVersionMinor: await callChip('getBlkVersionMinor'),
    };
  }

  return {
    loader,
    transport,
    connectAndHandshake,
    disconnect,
    changeBaud,
    readPartitionTable,
    readFlashId,
    detectFlashSize,
    readChipMetadata,
  };
}
