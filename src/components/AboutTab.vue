<template>
  <div :class="['about-tab', isDark ? 'about-tab--dark' : 'about-tab--light']">
    <v-card variant="tonal" class="mb-4">
      <v-card-title class="text-h6 d-flex align-center ga-2">
        <v-icon color="primary">mdi-chip</v-icon>
        About ESPConnect
      </v-card-title>
      <v-card-text class="text-body-2">
        <p>
          ESPConnect is a browser-based toolkit for ESP32 devices. It brings common maintenance tasks together so you
          can connect, inspect and update your board without installing desktop utilities.
        </p>
        <p>
          The application talks to the device over the Web Serial API, then exposes high-level tools for firmware
          flashing, partition management, filesystem editing, backup/restore workflows, as well as a session log and
          serial monitor for troubleshooting. It is based on Jason2866's
          <a
            href="https://github.com/Jason2866/WebSerial_ESPTool/tree/development"
            target="_blank"
            rel="noreferrer noopener"
          >
            WebSerial ESPTool
          </a>.
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="tonal" class="mb-4">
      <v-card-title class="text-subtitle-1">
        <v-icon start color="primary">mdi-folder-star-multiple</v-icon>
        Filesystem Tools
      </v-card-title>
      <v-card-text class="text-body-2">
        <ul class="about-list">
          <li><strong>SPIFFS:</strong> TypeScript emulator for staging changes locally before writing flash.</li>
          <li><strong>LittleFS:</strong> Backed by the littlefs-wasm module for true storage parity.</li>
          <li><strong>FATFS:</strong> New wasm-powered tooling for FAT partitions, mirroring your device layout.</li>
          <li>
            Drag-and-drop uploads, preview/listen for common file types, diff summaries, and mandatory backups before
            saving keep the workflow safe.
          </li>
        </ul>
      </v-card-text>
    </v-card>

    <v-card variant="tonal" class="mb-4">
      <v-card-title class="text-subtitle-1">
        <v-icon start color="primary">mdi-flash</v-icon>
        Firmware & Maintenance
      </v-card-title>
      <v-card-text class="text-body-2">
        <ul class="about-list">
          <li>Flash custom binaries with progress tracking, presets, and safety prompts.</li>
          <li>Inspect partition tables, OTA slots, device descriptors, and flash usage at a glance.</li>
          <li>Serial monitor with command shortcuts and session logging for troubleshooting.</li>
        </ul>
      </v-card-text>
    </v-card>

    <v-card variant="tonal">
      <v-card-title class="text-subtitle-1">
        <v-icon start color="primary">mdi-shield-check</v-icon>
        Safety-first Workflow
      </v-card-title>
      <v-card-text class="text-body-2">
        <p>
          Every destructive action is gated behind confirmation prompts and recent backups. ESPConnect keeps staged
          changes in-memory until you explicitly write them to flash, making it easy to review modifications or revert
          by
          re-reading the partition.
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="tonal">
      <v-card-title class="text-subtitle-1">
        <v-icon start color="primary">mdi-lock-check</v-icon>
        Privacy &amp; Security
      </v-card-title>
      <v-card-text class="text-body-2">
        <p>
          ESPConnect runs fully in your browser -- there is no backend, account, or telemetry. Firmware files, backups,
          and diagnostics stay local and only move when you download them yourself. Always flash firmware from trusted
          sources.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);
</script>

<style scoped>
.about-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  min-height: 100%;
}

.about-tab--light {
  background-image: url('/assets/images/about_back_light.png');
}

.about-tab--dark {
  background-image: url('/assets/images/about_back_dark.png');
}

.about-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.about-list strong {
  font-weight: 600;
}
</style>