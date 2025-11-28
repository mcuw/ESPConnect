export const PACKAGE_LABELS: Record<string, (pkgVersion: number) => string | null> = {
  ESP32: pkgVersion =>
  ({
    0: 'ESP32-D0WDQ6',
    1: 'ESP32-D0WD',
    2: 'ESP32-D2WD',
    4: 'ESP32-U4WDH',
    5: 'ESP32-PICO-D4',
    6: 'ESP32-PICO-V3-02',
  }[pkgVersion] ?? null),
  'ESP32-C3': pkgVersion =>
  ({
    0: 'ESP32-C3 (QFN32)',
    1: 'ESP8685 (QFN28)',
    2: 'ESP32-C3 (AZ QFN32)',
    3: 'ESP8686 (QFN24)',
  }[pkgVersion] ?? null),
  'ESP32-S3': pkgVersion =>
  ({
    0: 'ESP32-S3 (QFN56)',
    1: 'ESP32-S3-PICO-1 (LGA56)',
  }[pkgVersion] ?? null),
  'ESP32-S2': pkgVersion =>
  ({
    0: 'ESP32-S2',
    1: 'ESP32-S2FH2',
    2: 'ESP32-S2FH4',
  }[pkgVersion] ?? null),
};

export const ECO_LABELS: Record<number, string> = {
  0: 'ECO0',
  1: 'ECO1',
  2: 'ECO2',
  3: 'ECO3',
};

export const EMBEDDED_FLASH_CAPACITY: Record<string, Record<number, string>> = {
  'ESP32-C3': {
    1: '4MB',
    2: '2MB',
    3: '1MB',
    4: '8MB',
  },
  'ESP32-S3': {
    1: '8MB',
    2: '4MB',
  },
  'ESP32-S2': {
    1: '2MB',
    2: '4MB',
  },
};

export const EMBEDDED_PSRAM_CAPACITY: Record<string, Record<number, string>> = {
  'ESP32-S3': {
    1: '8MB',
    2: '2MB',
  },
  'ESP32-S2': {
    1: '2MB',
    2: '4MB',
  },
};

export const PACKAGE_FORM_FACTORS: Record<string, string> = {
  QFN56: '56-pin QFN (7 mm x 7 mm)',
  QFN32: '32-pin QFN (5 mm x 5 mm)',
  QFN28: '28-pin QFN',
  QFN24: '24-pin QFN',
  LGA56: '56-pad LGA module footprint',
  QFN48: '48-pin QFN',
};
