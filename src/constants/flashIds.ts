export const JEDEC_MANUFACTURERS: Record<number, string> = {
  // Common SPI NOR flash vendors
  0x01: 'Spansion / Cypress / Infineon',
  0x04: 'Fujitsu',
  0x07: 'Renesas / IDT',
  0x0B: 'Samsung',
  0x1C: 'Eon / Puya',
  0x20: 'Micron / Numonyx',
  0x25: 'AMIC / ISSI (older devices)',
  0x37: 'AMIC',
  0x40: 'Zbit Semiconductor',
  0x41: 'Intel',
  0x45: 'XMC (Wuhan Xinxin Semiconductor)',
  0x47: 'GigaDevice (older code)',
  0x49: '9F / ESMT (alt)',
  0x62: 'SST (Microchip SST series)',
  0x68: 'Atmel / Adesto / Dialog',
  0x70: 'Winbond (alt older ID)',
  0x85: 'Fudan Microelectronics (FM / FMSH)',
  0x8C: 'ZTE Microelectronics',
  0x9D: 'ISSI',
  0x9F: 'ESMT (Elite Semiconductor Memory Tech)',
  0xA1: 'Intel (legacy)',
  0xA7: 'SMIC (foundry)',
  0xAD: 'Hynix / SK Hynix',
  0xB0: 'Sharp',
  0xBF: 'Microchip / SST',
  0xC2: 'Macronix (MXIC)',
  0xC8: 'GigaDevice',
  0xC9: 'GigaDevice',
  0xCD: 'GigaDevice',
  0xD5: 'ESMT (alt code)',
  0xEF: 'Winbond (W25Q series)',
  0xF8: 'Fremont Micro Devices (FMD/FM25)',
  0xFF: 'XTX Technology',

  // Less common but valid NOR/NAND vendors
  0x52: 'Rohm Semiconductor',
  0x5E: 'Nexperia / NXP (alt)',
  0x69: 'Micron (legacy alt)',
  0x7F: 'Nanya Technology',
};


export const JEDEC_FLASH_PARTS: Record<number, Record<number, string>> = {
  0xef: {
    0x4014: 'Winbond W25Q80 (8 Mbit)',
    0x4015: 'Winbond W25Q16 (16 Mbit)',
    0x4016: 'Winbond W25Q32 (32 Mbit)',
    0x4017: 'Winbond W25Q64 (64 Mbit)',
    0x4018: 'Winbond W25Q128 (128 Mbit)',
    0x4019: 'Winbond W25Q256 (256 Mbit)',
  },
  0xc2: {
    0x4014: 'Macronix MX25L8006 (8 Mbit)',
    0x4015: 'Macronix MX25L1606 (16 Mbit)',
    0x4016: 'Macronix MX25L3206 (32 Mbit)',
    0x4017: 'Macronix MX25L6406 (64 Mbit)',
    0x4018: 'Macronix MX25L12835 (128 Mbit)',
  },
  0xc8: {
    0x4014: 'GigaDevice GD25Q80 (8 Mbit)',
    0x4015: 'GigaDevice GD25Q16 (16 Mbit)',
    0x4016: 'GigaDevice GD25Q32 (32 Mbit)',
    0x4017: 'GigaDevice GD25Q64 (64 Mbit)',
    0x4018: 'GigaDevice GD25Q128 (128 Mbit)',
    0x4019: 'GigaDevice GD25Q256 (256 Mbit)',
  },
  0xbf: {
    0x2541: 'Microchip SST26VF016B (16 Mbit)',
  },
};

export const VENDOR_ALIASES: Record<string, string> = {
  AP_3v3: 'AP Memory 3.3 V',
  AP_1v8: 'AP Memory 1.8 V',
};
