// pwm-capabilities-table.ts
export const PWM_TABLE = {
  "ESP32": {
    hasLedc: true,
    hasHighSpeedMode: true,
    ledcTimers: 4,
    ledcChannels: 8,
    maxFreqHz1Bit: 40_000_000,
  },

  "ESP32-S2": {
    hasLedc: true,
    hasHighSpeedMode: false,
    ledcTimers: 4,
    ledcChannels: 8,
    maxFreqHz1Bit: 8_000_000,
  },

  "ESP32-S3": {
    hasLedc: true,
    hasHighSpeedMode: false,
    ledcTimers: 4,
    ledcChannels: 8,
    maxFreqHz1Bit: 8_000_000,
  },

  "ESP32-C3": {
    hasLedc: true,
    hasHighSpeedMode: false,
    ledcTimers: 2,
    ledcChannels: 6,
    maxFreqHz1Bit: 10_000_000,
  },

  "ESP32-C2": {
    hasLedc: true,
    hasHighSpeedMode: false,
    ledcTimers: 2,
    ledcChannels: 4,
    maxFreqHz1Bit: 4_000_000,
  },

  "ESP32-C6": {
    hasLedc: true,
    hasHighSpeedMode: false,
    ledcTimers: 4,
    ledcChannels: 8,
    maxFreqHz1Bit: 12_000_000,
  },

  "ESP32-H2": {
    hasLedc: true,
    hasHighSpeedMode: false,
    ledcTimers: 2,
    ledcChannels: 4,
    maxFreqHz1Bit: 4_000_000,
  },

  "ESP32-P4": {
    hasLedc: true,
    hasHighSpeedMode: false, // placeholder until specs are finalized
    ledcTimers: 4,
    ledcChannels: 8,
    maxFreqHz1Bit: 8_000_000,
  },

  "ESP8266": {
    hasLedc: false,
    notes: "Uses software PWM only",
  },
};
