export const FACT_ICONS: Record<string, string> = {
  'Chip Variant': 'mdi-chip',
  Revision: 'mdi-update',
  'Embedded Flash': 'mdi-memory',
  'Embedded PSRAM': 'mdi-chip',
  'Flash Vendor (eFuse)': 'mdi-factory',
  'PSRAM Vendor (eFuse)': 'mdi-factory',
  'Flash ID': 'mdi-barcode',
  'Flash Manufacturer': 'mdi-domain',
  'Flash Device': 'mdi-chip',
  'Package Form Factor': 'mdi-package-variant-closed',
  'USB Bridge': 'mdi-usb-port',
  'Connection Baud': 'mdi-speedometer',
  'eFuse Block Version': 'mdi-shield-key',
};

export const FACT_DISPLAY_ORDER = [
  'Chip Variant',
  'Package Form Factor',
  'Revision',
  'Embedded Flash',
  'Embedded PSRAM',
  'Flash ID',
  'Flash Manufacturer',
  'Flash Device',
  'Flash Vendor (eFuse)',
  'PSRAM Vendor (eFuse)',
  'eFuse Block Version',
  'USB Bridge',
  'Connection Baud',
];

export const FACT_GROUP_CONFIG = [
  {
    title: 'Package & Revision',
    icon: 'mdi-chip',
    labels: ['Chip Variant', 'Package Form Factor', 'Revision'],
  },
  {
    title: 'Embedded Memory',
    icon: 'mdi-memory',
    labels: [
      'Embedded Flash',
      'Embedded PSRAM',
      'Flash ID',
      'Flash Manufacturer',
      'Flash Device',
      'Flash Vendor (eFuse)',
      'PSRAM Vendor (eFuse)',
    ],
  },
  {
    title: 'Security',
    icon: 'mdi-shield-key-outline',
    labels: ['eFuse Block Version'],
  },
  {
    title: 'Connection',
    icon: 'mdi-usb-port',
    labels: ['USB Bridge', 'Connection Baud'],
  },
];
