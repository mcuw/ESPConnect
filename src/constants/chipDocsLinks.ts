// esp-chip-docs-map.ts
// Central place to map ESP32-family chip IDs -> key documentation URLs.
// Intended usage: look up from CHIP_NAME (e.g. "ESP32-S3") in tools like ESPConnect.

export type EspressifChipId =
  | 'ESP32'
  | 'ESP32-S2'
  | 'ESP32-S3'
  | 'ESP32-C2'
  | 'ESP32-C3'
  | 'ESP32-C5'
  | 'ESP32-C6'
  | 'ESP32-H2'
  | 'ESP32-P4';

export interface ChipDocsLinks {
  /**
   * IDF Hardware Reference hub for this chip:
   * from here you can click through to datasheet, TRM, errata, modules, devkits, etc.
   */
  hwReference: string;

  /** Direct link to the English chip datasheet (PDF), when available. */
  datasheet?: string;

  /** Direct link to the English Technical Reference Manual (TRM) PDF, when available. */
  technicalReferenceManual?: string;

  /** SoC errata (HTML hub) for this chip family, when available. */
  errata?: string;

  /**
   * Hardware Design Guidelines hub (HTML). For board-level design questions:
   * power, decoupling, RF layout, etc.
   */
  hardwareDesignGuidelines?: string;
}

export const ESPRESSIF_CHIP_DOCS: Record<EspressifChipId, ChipDocsLinks> = {
  ESP32: {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/documentation/esp32_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/documentation/esp32_technical_reference_manual_en.pdf',
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32/index.html',
  },

  'ESP32-S2': {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32s2/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/sites/default/files/documentation/esp32-s2_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/sites/default/files/documentation/esp32-s2_technical_reference_manual_en.pdf',
    // As of late 2025, S2 errata is not in the new esp-chip-errata tree;
    // it’s listed via the general technical-documents hub instead.
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32s2/index.html',
  },

  'ESP32-S3': {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/sites/default/files/documentation/esp32-s3_technical_reference_manual_en.pdf',
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32s3/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32s3/index.html',
  },

  'ESP32-C2': {
    // ESP32-C2 is the same silicon family as ESP8684; docs sometimes carry both names.
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32c2/hw-reference/index.html',
    // Public datasheet/TRM are still in flux; prefer the HW-ref hub.
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32c2/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32c2/index.html',
  },

  'ESP32-C3': {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/documentation/esp32-c3_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/documentation/esp32-c3_technical_reference_manual_en.pdf',
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32c3/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32c3/index.html',
  },

  'ESP32-C5': {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32c5/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/documentation/esp32-c5_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/documentation/esp32-c5_technical_reference_manual_en.pdf',
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32c5/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32c5/index.html',
  },

  'ESP32-C6': {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/documentation/esp32-c6_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/documentation/esp32-c6_technical_reference_manual_en.pdf',
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32c6/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32c6/index.html',
  },

  'ESP32-H2': {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32h2/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/documentation/esp32-h2_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/documentation/esp32-h2_technical_reference_manual_en.pdf',
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32h2/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32h2/index.html',
  },

  'ESP32-P4': {
    hwReference:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32p4/hw-reference/index.html',
    datasheet:
      'https://www.espressif.com/sites/default/files/documentation/esp32-p4_datasheet_en.pdf',
    technicalReferenceManual:
      'https://www.espressif.com/sites/default/files/documentation/esp32-p4_technical_reference_manual_en.pdf',
    errata:
      'https://documentation.espressif.com/esp-chip-errata/en/latest/esp32p4/index.html',
    hardwareDesignGuidelines:
      'https://documentation.espressif.com/esp-hardware-design-guidelines/en/latest/esp32p4/index.html',
  },
};

// Optional tiny helper if you want to be a bit more forgiving with incoming IDs.
export function findChipDocs(
  chipName: string,
): ChipDocsLinks | undefined {
  const normalized = chipName.trim().toUpperCase();

  const direct = (ESPRESSIF_CHIP_DOCS as Record<string, ChipDocsLinks>)[normalized];
  if (direct) return direct;

  // Normalize common variants like "ESP32S3" -> "ESP32-S3"
  const withDash = normalized.replace(/^ESP32([SC]\d)/, 'ESP32-$1');
  return (ESPRESSIF_CHIP_DOCS as Record<string, ChipDocsLinks>)[withDash];
}
