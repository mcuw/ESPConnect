<template>
  <div class="littlefs-manager">
    <v-card class="mb-4" variant="tonal">
      <v-card-title class="text-subtitle-1">
        <v-icon start size="18">mdi-alpha-l-box-outline</v-icon>
        LittleFS Partition
      </v-card-title>
      <v-card-text class="d-flex flex-column gap-4">
        <v-select
          :items="partitions"
          item-title="label"
          item-value="id"
          density="comfortable"
          label="Partition"
          :model-value="state.partitionId"
          :disabled="state.loading || !partitions.length"
          @update:model-value="value => selectPartition(value)"
        />
        <div class="littlefs-manager__controls">
          <v-btn color="primary" variant="tonal"
            :disabled="!hasPartition || state.loading || !state.ready"
            @click="handleRead">
            <v-icon start>mdi-refresh</v-icon>
            Read
          </v-btn>
          <v-btn color="secondary" variant="outlined"
            :disabled="!state.ready || state.loading"
            @click="handleBackup">
            <v-icon start>mdi-content-save</v-icon>
            Backup
          </v-btn>
          <v-btn color="secondary" variant="text"
            :disabled="state.loading"
            @click="handleRestore">
            <v-icon start>mdi-upload</v-icon>
            Restore Image
          </v-btn>
          <v-btn color="error" variant="text"
            :disabled="!state.ready || state.loading"
            @click="formatLittleFs">
            <v-icon start>mdi-delete-sweep</v-icon>
            Format
          </v-btn>
          <v-spacer />
          <v-btn color="primary" variant="elevated"
            :disabled="!state.ready || !state.backupDone"
            @click="handleSaveToFlash">
            <v-icon start>mdi-content-save-outline</v-icon>
            Save to Flash
          </v-btn>
          <v-btn color="secondary" variant="tonal"
            :disabled="state.loading || !hasPartition"
            @click="initializeLittleFs">
            <v-icon start>mdi-power</v-icon>
            {{ state.ready ? 'Reinitialize' : 'Initialize' }}
          </v-btn>
        </div>
        <v-alert v-if="!state.backupDone" type="warning" variant="tonal" density="comfortable" border="start" class="mt-2">
          Download a backup (metadata manifest) first. Save to Flash becomes available once a backup is made.
        </v-alert>
        <p class="text-caption text-medium-emphasis mb-0">
          This preview operates on an in-memory LittleFS instance. Save to Flash is informational only and does not write
          to the connected device.
        </p>
      </v-card-text>
    </v-card>

    <v-alert v-if="state.error" type="error" variant="tonal" density="comfortable" border="start" class="mb-3">
      {{ state.error }}
    </v-alert>
    <v-alert v-else-if="state.status" type="info" variant="tonal" density="comfortable" border="start" class="mb-3">
      {{ state.status }}
    </v-alert>

    <v-card variant="tonal">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1">Files</span>
        <v-chip v-if="state.ready" size="small" variant="tonal">
          {{ usageSummary }}
        </v-chip>
      </v-card-title>
      <v-card-text>
        <div v-if="state.ready" class="spiffs-usage">
          <div class="spiffs-usage__labels">
            <span>Used {{ formatSize(usage.usedBytes) }} / {{ formatSize(usage.capacityBytes) }}</span>
            <span>{{ usagePercent }}%</span>
          </div>
          <v-progress-linear :model-value="usagePercent" height="8" rounded color="primary" />
          <div class="text-caption text-medium-emphasis">
            Free {{ formatSize(usage.freeBytes) }}
          </div>
        </div>

        <div class="upload-row upload-row--split">
          <div class="upload-picker">
            <v-file-input v-model="uploadFile" density="comfortable" accept="*/*" label="Select file"
              prepend-icon="mdi-file-upload" :disabled="!state.ready || state.loading" />
            <v-btn color="primary" variant="tonal" class="upload-row__cta"
              :disabled="!state.ready || state.loading || !uploadFile"
              @click="submitUpload">
              <v-icon start>mdi-upload</v-icon>
              Upload
            </v-btn>
          </div>
          <div class="spiffs-dropzone" :class="{ 'spiffs-dropzone--active': dragActive }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop">
            <div class="spiffs-dropzone__hint">
              <v-icon size="32">mdi-cloud-upload-outline</v-icon>
              <div class="spiffs-dropzone__hint-text">
                <strong>Drop file to upload</strong>
                <span>Auto uploads on drop</span>
              </div>
            </div>
          </div>
        </div>

        <v-alert v-if="!filteredFiles.length && !state.loading" type="info" variant="tonal" density="comfortable"
          border="start" class="mt-4">
          No files detected. Upload to begin.
        </v-alert>
        <template v-else>
          <div class="spiffs-table__toolbar mt-4">
            <v-text-field v-model="fileSearch" label="Filter files" variant="outlined" density="comfortable"
              clearable hide-details prepend-inner-icon="mdi-magnify"
              class="spiffs-table__filter spiffs-table__filter--search" />
            <v-select v-model="fileTypeFilter" :items="fileFilterOptions" item-title="label" item-value="value"
              label="File type" density="comfortable" hide-details variant="outlined"
              class="spiffs-table__filter spiffs-table__filter--type" />
            <v-chip size="small" variant="tonal" color="primary">
              {{ filteredCountLabel }}
            </v-chip>
          </div>
          <v-data-table :headers="fileTableHeaders" :items="filteredFiles" item-key="path" :items-per-page="-1"
            hide-default-footer density="comfortable" class="spiffs-table mt-4">
            <template #item.path="{ item }">
              <code>{{ item.raw.path }}</code>
            </template>
            <template #item.size="{ item }">
              {{ formatSize(item.raw.size) }}
            </template>
            <template #item.actions="{ item }">
              <v-btn size="small" variant="text" color="error"
                :disabled="!state.ready || state.loading"
                @click="deleteFile(item.raw.path)">
                <v-icon start size="16">mdi-delete</v-icon>
                Delete
              </v-btn>
            </template>
          </v-data-table>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

type PartitionOption = { id: number | string; label: string; size: number; sizeText?: string };
type LittleFSFileEntry = { path: string; size: number };
type LittleFS = {
  format(): void;
  list(): LittleFSFileEntry[];
  addFile(path: string, data: Uint8Array | ArrayBuffer | string): void;
  deleteFile(path: string): void;
};

const LITTLEFS_MODULE_PATH = '/wasm/littlefs/index.js';
const DEFAULT_BLOCK_SIZE = 4096;
const FALLBACK_TEXT_EXT = ['txt', 'log', 'json', 'csv', 'ini', 'cfg', 'conf', 'htm', 'html', 'md', 'xml'];
const FALLBACK_IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
const FALLBACK_AUDIO_EXT = ['mp3', 'wav', 'ogg', 'oga', 'opus', 'm4a', 'aac', 'flac', 'weba', 'webm'];
const FILE_CATEGORY_LABELS: Record<string, string> = {
  all: 'All types',
  text: 'Text',
  image: 'Images',
  audio: 'Audio',
  other: 'Other',
};

const props = defineProps<{
  partitions: PartitionOption[];
}>();

const partitions = computed(() => Array.isArray(props.partitions) ? props.partitions : []);

const state = reactive({
  ready: false,
  loading: false,
  status: '',
  error: '',
  fs: null as LittleFS | null,
  files: [] as LittleFSFileEntry[],
  blockSize: DEFAULT_BLOCK_SIZE,
  blockCount: 1,
  partitionId: null as PartitionOption['id'] | null,
  backupDone: false,
});

const selectedPartition = computed(() => {
  if (!partitions.value.length) return null;
  return partitions.value.find(part => part.id === state.partitionId) ?? partitions.value[0];
});

const hasPartition = computed(() => Boolean(selectedPartition.value));

watch(
  partitions,
  list => {
    if (!list.length) {
      state.partitionId = null;
      resetInstanceState(true);
      state.status = 'No LittleFS partitions detected.';
      return;
    }
    if (!list.some(part => part.id === state.partitionId)) {
      state.partitionId = list[0].id;
    }
  },
  { immediate: true },
);

watch(
  () => state.partitionId,
  () => {
    const partition = selectedPartition.value;
    if (!partition) {
      resetInstanceState(true);
      return;
    }
    state.blockCount = Math.max(1, Math.floor(partition.size / state.blockSize));
    resetInstanceState();
    state.status = `Partition "${partition.label}" selected. Click Initialize to work with LittleFS.`;
  },
  { immediate: true },
);

const usage = computed(() => {
  const capacityBytes = selectedPartition.value?.size ?? state.blockSize * state.blockCount;
  const usedBytes = state.files.reduce((sum, file) => sum + file.size, 0);
  const freeBytes = Math.max(capacityBytes - usedBytes, 0);
  return { capacityBytes, usedBytes, freeBytes };
});

const usagePercent = computed(() => {
  if (!usage.value.capacityBytes) return 0;
  const ratio = usage.value.usedBytes / usage.value.capacityBytes;
  if (!Number.isFinite(ratio) || ratio < 0) return 0;
  return Math.min(100, Math.round(ratio * 100));
});

const usageSummary = computed(() => {
  if (!usage.value.capacityBytes) return 'Unavailable';
  return `${formatSize(usage.value.usedBytes)} of ${formatSize(usage.value.capacityBytes)}`;
});

const fileFilterOptions = computed(() => {
  const counts = state.files.reduce<Record<string, number>>((acc, file) => {
    const category = getFileCategory(file.path);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const options = [
    { value: 'all', label: `${FILE_CATEGORY_LABELS.all} (${state.files.length})` },
  ];
  for (const [key, label] of Object.entries(FILE_CATEGORY_LABELS)) {
    if (key === 'all') continue;
    if (counts[key]) {
      options.push({ value: key, label: `${label} (${counts[key]})` });
    }
  }
  return options;
});

const fileSearch = ref('');
const fileTypeFilter = ref('all');
const uploadFile = ref<File | null>(null);
const dragActive = ref(false);

const filteredFiles = computed(() => {
  const query = (fileSearch.value || '').trim().toLowerCase();
  const typeFilter = fileTypeFilter.value;
  return state.files.filter(file => {
    if (typeFilter !== 'all' && getFileCategory(file.path) !== typeFilter) {
      return false;
    }
    if (!query) {
      return true;
    }
    return file.path.toLowerCase().includes(query);
  });
});

const filteredCountLabel = computed(() => {
  const total = state.files.length;
  const filtered = filteredFiles.value.length;
  const pluralize = (count: number) => (count === 1 ? 'file' : 'files');
  if (!total) {
    return 'No files';
  }
  if (filtered === total) {
    return `${total} ${pluralize(total)}`;
  }
  return `${filtered} of ${total} files`;
});

const fileTableHeaders = Object.freeze([
  { title: 'Name', key: 'path', sortable: true, align: 'start' },
  { title: 'Size', key: 'size', sortable: true, align: 'start' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'start' },
]);

function resetInstanceState(hard = false) {
  if (hard) {
    state.status = '';
    state.error = '';
  }
  state.ready = false;
  state.fs = null;
  state.files = [];
  state.backupDone = false;
}

function selectPartition(id: PartitionOption['id']) {
  state.partitionId = id;
}

async function loadFactory() {
  const resolvedUrl = new URL(LITTLEFS_MODULE_PATH, window.location.origin).toString();
  const module = (await import(
    /* @vite-ignore */ resolvedUrl
  )) as typeof import('/wasm/littlefs/index.js');
  return module.createLittleFS || module.default;
}

async function initializeLittleFs() {
  if (state.loading || !hasPartition.value) return;
  const partition = selectedPartition.value;
  if (!partition) {
    state.error = 'Select a LittleFS partition first.';
    return;
  }
  state.loading = true;
  state.error = '';
  state.status = 'Loading WASM module...';
  try {
    const factory = await loadFactory();
    state.status = 'Mounting filesystem...';
    const blockCount = Math.max(1, Math.floor(partition.size / state.blockSize));
    state.blockCount = blockCount;
    state.fs = await factory({
      formatOnInit: true,
      blockSize: state.blockSize,
      blockCount: blockCount,
    });
    state.ready = true;
    state.status = `LittleFS ready for partition "${partition.label}".`;
    await refreshListing();
  } catch (error) {
    console.error('LittleFS init failed', error);
    state.error =
      error?.message || 'Failed to load the LittleFS module. Confirm the WASM files exist under /public/wasm.';
    state.ready = false;
    state.fs = null;
  } finally {
    state.loading = false;
  }
}

async function refreshListing() {
  if (!state.fs || state.loading) return;
  try {
    const entries = state.fs.list();
    state.files = Array.isArray(entries) ? entries : [];
    state.status = `Listed ${state.files.length} item(s).`;
  } catch (error) {
    state.error = error?.message || 'Failed to list files.';
  }
}

function handleRead() {
  if (!state.ready) {
    state.status = 'Initialize LittleFS first.';
    return;
  }
  refreshListing();
}

function handleBackup() {
  if (!state.ready || state.loading) {
    state.status = 'Initialize LittleFS first.';
    return;
  }
  const manifest = {
    createdAt: new Date().toISOString(),
    partition: selectedPartition.value ? {
      id: selectedPartition.value.id,
      label: selectedPartition.value.label,
      size: selectedPartition.value.size,
    } : null,
    files: state.files,
    note: 'This manifest includes file metadata only (no file contents).',
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `littlefs-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  state.backupDone = true;
  state.status = 'Downloaded backup manifest (metadata only).';
}

function handleRestore() {
  state.status = 'Restore is not available in this preview because backups do not include file contents.';
}

function handleSaveToFlash() {
  state.status = 'Saving to flash is not available in this preview.';
}

async function submitUpload() {
  if (!uploadFile.value || !state.fs || state.loading) return;
  const path = uploadFile.value.name.trim();
  if (!path) {
    state.status = 'File must have a name.';
    return;
  }
  try {
    state.loading = true;
    const data = new Uint8Array(await uploadFile.value.arrayBuffer());
    state.fs.addFile(path, data);
    state.status = `Stored "${path}" in LittleFS.`;
    await refreshListing();
  } catch (error) {
    state.error = error?.message || 'Add file failed.';
  } finally {
    uploadFile.value = null;
    state.loading = false;
  }
}

async function formatLittleFs() {
  if (!state.fs || state.loading) return;
  try {
    state.loading = true;
    state.fs.format();
    state.status = 'Filesystem formatted.';
    await refreshListing();
  } catch (error) {
    state.error = error?.message || 'Format failed.';
  } finally {
    state.loading = false;
  }
}

async function deleteFile(path: string) {
  if (!state.fs || state.loading) return;
  try {
    state.loading = true;
    state.fs.deleteFile(path);
    state.status = `Deleted "${path}".`;
    await refreshListing();
  } catch (error) {
    state.error = error?.message || 'Delete failed.';
  } finally {
    state.loading = false;
  }
}

function handleDragOver(event: DragEvent) {
  if (!state.ready || state.loading) {
    event.dataTransfer!.dropEffect = 'none';
    dragActive.value = false;
    return;
  }
  event.dataTransfer!.dropEffect = 'copy';
  dragActive.value = true;
}

function handleDragLeave(event: DragEvent) {
  if (event.currentTarget && event.relatedTarget && (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    return;
  }
  dragActive.value = false;
}

function handleDrop(event: DragEvent) {
  dragActive.value = false;
  if (!state.ready || state.loading) return;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  submitDroppedFile(file);
}

async function submitDroppedFile(file: File) {
  uploadFile.value = file;
  await submitUpload();
}

function getFileCategory(name = '') {
  const ext = normalizeExtension(name);
  if (FALLBACK_TEXT_EXT.includes(ext)) return 'text';
  if (FALLBACK_IMAGE_EXT.includes(ext)) return 'image';
  if (FALLBACK_AUDIO_EXT.includes(ext)) return 'audio';
  return 'other';
}

function normalizeExtension(name = '') {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

function formatSize(size: number) {
  if (!Number.isFinite(size)) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
</script>

<style scoped>
.littlefs-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.littlefs-manager__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.spiffs-usage {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.spiffs-usage__labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}

.upload-row {
  display: grid;
  gap: 12px;
}

.upload-row--split {
  align-items: stretch;
}

.upload-picker {
  display: grid;
  gap: 12px;
}

@media (min-width: 960px) {
  .upload-row {
    grid-template-columns: 1fr auto;
    align-items: end;
  }

  .upload-row--split {
    grid-template-columns: 1fr 1fr;
  }

  .upload-row__cta {
    align-self: center;
  }
}

.spiffs-dropzone {
  position: relative;
  border: 2px dashed transparent;
  border-radius: 12px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spiffs-dropzone--active {
  border-color: color-mix(in srgb, var(--v-theme-primary) 60%, transparent);
  background-color: color-mix(in srgb, var(--v-theme-primary) 10%, transparent);
}

.spiffs-dropzone__hint {
  display: flex;
  align-items: center;
  gap: 12px;
  color: color-mix(in srgb, var(--v-theme-on-surface) 80%, transparent);
}

.spiffs-dropzone__hint-text {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  text-transform: none;
}

.spiffs-table__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.spiffs-table__filter {
  flex: 1;
  max-width: 360px;
}

.spiffs-table__filter--type {
  flex: 0 0 auto;
  min-width: 180px;
  max-width: 220px;
}

.spiffs-table code {
  font-size: 0.85rem;
}
</style>
