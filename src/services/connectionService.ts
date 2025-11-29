import { ESPLoader, Transport } from '../esptool_lib/index.js';
import type { ESPLoader as EsptoolLoader, Transport as EsptoolTransport } from '../esptool_lib/index';

export async function requestSerialPort(filters?: SerialPortFilter[]) {
  if (!navigator?.serial?.requestPort) {
    throw new Error('Web Serial API not available in this browser.');
  }
  return navigator.serial.requestPort(filters ? { filters } : undefined);
}

export function createConnection(
  port: SerialPort,
  baudrate: number,
  terminal: unknown,
  options: { debugSerial?: boolean; debugLogging?: boolean } = {},
) {
  const transport: EsptoolTransport = new Transport(port, options.debugSerial ?? false);
  transport.tracing = options.debugSerial ?? false;
  const loader: EsptoolLoader = new ESPLoader({
    transport,
    baudrate,
    terminal,
    debugLogging: options.debugLogging ?? false,
  });
  return { transport, loader };
}
