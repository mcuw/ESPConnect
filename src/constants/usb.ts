export const USB_VENDOR_NAMES: Record<number, string> = {
  0x303a: 'Espressif',
  0x1a86: 'WCH (CH34x)',
  0x10c4: 'Silicon Labs (CP210x)',
  0x0403: 'FTDI',
};

export const USB_PRODUCT_NAMES: Record<string, string> = {
  '1A86:55D3': 'CH343 Bridge',
  '1A86:7523': 'CH340 USB-Serial',
  '303A:1001': 'USB JTAG/Serial',
  '303A:4001': 'ESP32-S3 DevKit',
  '303A:4002': 'USB JTAG/Serial (CDC)',
  '10C4:EA60': 'CP210x USB-Serial',
  '0403:6001': 'FT232R USB UART',
};
