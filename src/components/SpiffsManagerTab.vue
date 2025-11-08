<template>
  <div class="spiffs-manager">
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="comfortable"
      border="start"
      class="mb-3"
    >
      {{ error }}
    </v-alert>
    <v-alert
      v-else-if="readOnly"
      type="warning"
      variant="tonal"
      density="comfortable"
      border="start"
      class="mb-3"
    >
      SPIFFS is in read-only mode. {{ readOnlyReason || 'Changes cannot be saved.' }}
    </v-alert>

    <v-card class="mb-4" variant="tonal">
      <v-card-title class="text-subtitle-1">
        <v-icon start size="18">mdi-folder-wrench</v-icon>
        SPIFFS Partition
      </v-card-title>
      <v-card-text class="d-flex flex-column gap-4">
        <v-select
          :items="partitions"
          item-title="label"
          item-value="id"
          density="comfortable"
          label="Partition"
          :model-value="selectedPartitionId"
          :disabled="loading || busy || saving || !partitions.length"
          @update:model-value="value => emit('select-partition', value)"
        />
        <div class="spiffs-manager__controls">
          <v-btn
            color="primary"
            variant="tonal"
            :disabled="!hasPartition || loading || busy || saving"
            @click="emit('refresh')"
          >
            <v-icon start>mdi-refresh</v-icon>
            Read
          </v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            :disabled="!hasPartition || loading || busy || saving"
            @click="emit('backup')"
          >
            <v-icon start>mdi-content-save</v-icon>
            Backup
          </v-btn>
          <v-btn
            color="secondary"
            variant="text"
            :disabled="!hasPartition || loading || busy || saving"
            @click="triggerRestore"
          >
            <v-icon start>mdi-upload</v-icon>
            Restore Image
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            :disabled="readOnly || !hasClient || loading || busy || saving || !backupDone"
            @click="emit('format')"
          >
            <v-icon start>mdi-delete-sweep</v-icon>
            Format
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="readOnly || !dirty || !backupDone || saving || loading || busy || !hasClient"
            @click="emit('save')"
          >
            <v-icon start>mdi-content-save-outline</v-icon>
            Save to Flash
          </v-btn>
        </div>
        <v-alert
          v-if="!backupDone"
          type="warning"
          variant="tonal"
          density="comfortable"
          border="start"
          class="mt-2"
        >
          Download a backup image first (use the "Backup" button once per session). "Save to Flash"
          becomes available after any successful backup made during this connection.
        </v-alert>
        <p class="text-caption text-medium-emphasis mb-0">
          Changes are staged locally until you click “Save to Flash”. A recent backup ensures you can
          recover if something goes wrong.
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="tonal">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1">Files</span>
        <v-chip v-if="dirty" color="warning" size="small" variant="elevated">
          Unsaved changes
        </v-chip>
      </v-card-title>
      <v-card-text>
        <div v-if="usage?.capacityBytes" class="spiffs-usage">
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
            <v-file-input
              v-model="uploadFile"
              density="comfortable"
              accept="*/*"
              label="Select file"
              prepend-icon="mdi-file-upload"
              :disabled="readOnly || !hasClient || loading || busy || saving"
            />
            <v-btn
              color="primary"
              variant="tonal"
              class="upload-row__cta"
              :disabled="readOnly || !uploadFile || !hasClient || loading || busy || saving || uploadBlocked"
              @click="submitUpload"
            >
              <v-icon start>mdi-upload</v-icon>
              Upload
            </v-btn>
          </div>
          <div
            class="spiffs-dropzone"
            :class="{ 'spiffs-dropzone--active': dragActive }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div class="spiffs-dropzone__hint">
              <v-icon size="32">mdi-cloud-upload-outline</v-icon>
              <div class="spiffs-dropzone__hint-text">
                <strong>Drop file to upload</strong>
                <span>Auto uploads on drop</span>
              </div>
            </div>
          </div>
        </div>

        <v-alert
          v-if="!files.length"
          type="info"
          variant="tonal"
          density="comfortable"
          border="start"
          class="mt-4"
        >
          No files detected. Upload or restore a SPIFFS image to begin.
        </v-alert>
        <template v-else>
          <div class="spiffs-table__toolbar mt-4">
            <v-text-field
              v-model="fileSearch"
              label="Filter files"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              prepend-inner-icon="mdi-magnify"
              class="spiffs-table__filter"
            />
            <v-chip size="small" variant="tonal" color="primary">
              {{ filteredCountLabel }}
            </v-chip>
          </div>
          <v-data-table
          :headers="fileTableHeaders"
          :items="filteredFiles"
          item-key="name"
          v-model:items-per-page="filesPerPage"
          v-model:page="filesPage"
          :items-per-page-options="filesPerPageOptions"
          density="comfortable"
          class="spiffs-table mt-4"
        >
          <template #item.name="{ item }">
            <code>{{ unwrapItem(item).name }}</code>
          </template>
          <template #item.size="{ item }">
            {{ formatSize(unwrapItem(item).size) }}
          </template>
          <template #item.actions="{ item }">
            <v-btn
              size="small"
              variant="text"
              color="info"
              v-if="isViewable(unwrapItem(item).name)"
              :disabled="loading || busy || saving || readOnly"
              @click="emit('view-file', unwrapItem(item).name)"
            >
              <v-icon start size="16">{{ previewIcon(unwrapItem(item).name) }}</v-icon>
              {{ previewLabel(unwrapItem(item).name) }}
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              :disabled="loading || busy || saving || readOnly"
              @click="emit('download-file', unwrapItem(item).name)"
            >
              <v-icon start size="16">mdi-download</v-icon>
              Download
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="error"
              :disabled="readOnly || loading || busy || saving"
              @click="emit('delete-file', unwrapItem(item).name)"
            >
              <v-icon start size="16">mdi-delete</v-icon>
              Delete
            </v-btn>
          </template>
        </v-data-table>
        </template>
      </v-card-text>
    </v-card>

    <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      border="start"
      class="mt-4"
    >
      {{ status }}
    </v-alert>

    <input ref="restoreInput" type="file" class="d-none" @change="handleRestoreFile" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  partitions: {
    type: Array,
    default: () => [],
  },
  selectedPartitionId: {
    type: [Number, String, null],
    default: null,
  },
  files: {
    type: Array,
    default: () => [],
  },
  status: {
    type: String,
    default: '',
  },
  loading: Boolean,
  busy: Boolean,
  saving: Boolean,
  readOnly: Boolean,
  readOnlyReason: {
    type: String,
    default: '',
  },
  dirty: Boolean,
  backupDone: Boolean,
  error: {
    type: String,
    default: null,
  },
  hasPartition: Boolean,
  hasClient: Boolean,
  usage: {
    type: Object,
    default: () => ({
      capacityBytes: 0,
      usedBytes: 0,
      freeBytes: 0,
    }),
  },
  uploadBlocked: Boolean,
  uploadBlockedReason: {
    type: String,
    default: '',
  },
  isFileViewable: {
    type: Function,
    default: () => false,
  },
  getFilePreviewInfo: {
    type: Function,
    default: null,
  },
});

const fileTableHeaders = Object.freeze([
  { title: 'Name', key: 'name', sortable: true, align: 'start' },
  { title: 'Size', key: 'size', sortable: true, align: 'start' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'start' },
]);
const filesPerPageOptions = Object.freeze([10, 25, 50, { value: -1, title: 'All' }]);

const emit = defineEmits([
  'select-partition',
  'refresh',
  'backup',
  'restore',
  'download-file',
  'view-file',
  'validate-upload',
  'upload-file',
  'delete-file',
  'format',
  'save',
]);

const uploadFile = ref(null);
const restoreInput = ref(null);
const fileSearch = ref('');
const filesPerPage = ref(10);
const filesPage = ref(1);
const usagePercent = computed(() => {
  if (!props.usage || !props.usage.capacityBytes) {
    return 0;
  }
  const ratio = props.usage.usedBytes / props.usage.capacityBytes;
  if (!Number.isFinite(ratio) || ratio < 0) {
    return 0;
  }
  return Math.min(100, Math.round(ratio * 100));
});
const dragActive = ref(false);
const autoUploadPending = ref(false);
const filteredFiles = computed(() => {
  const query = (fileSearch.value || '').trim().toLowerCase();
  if (!query) {
    return props.files;
  }
  return props.files.filter(file => file?.name?.toLowerCase().includes(query));
});
const filteredCountLabel = computed(() => {
  const total = props.files.length;
  const filtered = filteredFiles.value.length;
  const pluralize = count => (count === 1 ? 'file' : 'files');
  if (!total) {
    return 'No files';
  }
  if (filtered === total) {
    return `${total} ${pluralize(total)}`;
  }
  return `${filtered} of ${total} files`;
});
const canUpload = computed(
  () =>
    !props.readOnly &&
    props.hasClient &&
    !props.loading &&
    !props.busy &&
    !props.saving,
);

watch(uploadFile, file => {
  emit('validate-upload', file || null);
});

watch(
  () => [uploadFile.value, props.uploadBlocked, autoUploadPending.value],
  ([file, blocked, auto]) => {
    if (file && !blocked && auto) {
      submitUpload(true);
    }
  },
  { flush: 'post' },
);

watch(
  () => props.uploadBlocked,
  blocked => {
    if (blocked) {
      autoUploadPending.value = false;
    }
  },
);

watch([fileSearch, () => props.files.length], () => {
  filesPage.value = 1;
});

function submitUpload(auto = false) {
  if (!uploadFile.value || props.uploadBlocked) return;
  if (auto) {
    autoUploadPending.value = false;
  }
  emit('upload-file', { file: uploadFile.value });
  uploadFile.value = null;
  autoUploadPending.value = false;
}

function triggerRestore() {
  restoreInput.value?.click();
}

function handleRestoreFile(event) {
  const [file] = event.target.files || [];
  if (file) {
    emit('restore', file);
  }
  event.target.value = '';
}

function handleDragOver(event) {
  if (!canUpload.value) {
    event.dataTransfer.dropEffect = 'none';
    dragActive.value = false;
    return;
  }
  event.dataTransfer.dropEffect = 'copy';
  dragActive.value = true;
}

function handleDragLeave(event) {
  if (event.currentTarget && event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) {
    return;
  }
  dragActive.value = false;
}

function handleDrop(event) {
  dragActive.value = false;
  if (!canUpload.value) return;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  autoUploadPending.value = true;
  uploadFile.value = file;
}

function formatSize(size) {
  if (!Number.isFinite(size)) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function unwrapItem(item) {
  if (!item || typeof item !== 'object') {
    return {};
  }
  if ('raw' in item && item.raw && typeof item.raw === 'object') {
    return item.raw;
  }
  return item;
}

function toPreviewInfo(value) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return { mode: value };
  }
  if (value === true) {
    return { mode: 'text' };
  }
  if (typeof value === 'object' && value.mode) {
    return value;
  }
  return null;
}

function getPreviewInfo(name) {
  if (!name) {
    return null;
  }
  if (typeof props.getFilePreviewInfo === 'function') {
    const info = toPreviewInfo(props.getFilePreviewInfo(name));
    if (info) {
      return info;
    }
  }
  if (typeof props.isFileViewable === 'function') {
    return toPreviewInfo(props.isFileViewable(name));
  }
  return null;
}

function isViewable(name) {
  return Boolean(getPreviewInfo(name));
}

function previewIcon(name) {
  const info = getPreviewInfo(name);
  if (info?.mode === 'audio') {
    return 'mdi-headphones';
  }
  return 'mdi-eye';
}

function previewLabel(name) {
  const info = getPreviewInfo(name);
  if (info?.mode === 'audio') {
    return 'Listen';
  }
  return 'View';
}
</script>


<style scoped>
.spiffs-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spiffs-manager__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
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

.spiffs-table code {
  font-size: 0.85rem;
}

.spiffs-table__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spiffs-table__filter {
  flex: 1;
  max-width: 360px;
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

.spiffs-dropzone__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: color-mix(in srgb, var(--v-theme-primary) 80%, #ffffff 20%);
  pointer-events: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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
</style>
