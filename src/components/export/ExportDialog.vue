<!--
  Modal dialog that lets the user choose export format, quality, and file name
  before downloading the edited image.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTheme } from 'vuetify'
import type { ExportFormat, ExportOptions } from '@/types/editor'

const props = defineProps<{ visible: boolean; defaultName: string }>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'export': [options: ExportOptions]
}>()

const theme = useTheme()

const dialog = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

const format   = ref<ExportFormat>('png')
const quality  = ref<number>(90)
const fileName = ref<string>('')

watch(() => props.visible, (open) => {
  if (open) fileName.value = props.defaultName.replace(/\.[^.]+$/, '')
})

interface FormatOption { id: ExportFormat; label: string; ext: string; lossy: boolean }

const formats: FormatOption[] = [
  { id: 'png',  label: 'PNG',  ext: 'png',  lossy: false },
  { id: 'jpeg', label: 'JPEG', ext: 'jpg',  lossy: true  },
  { id: 'webp', label: 'WebP', ext: 'webp', lossy: true  },
  { id: 'pdf',  label: 'PDF',  ext: 'pdf',  lossy: false },
]

const selected    = computed(() => formats.find(f => f.id === format.value)!)
const showQuality = computed(() => selected.value.lossy)

const outputName = computed(() =>
  `${fileName.value || 'image'}.${selected.value.ext}`
)

function submit(): void {
  emit('export', { format: format.value, quality: quality.value, fileName: outputName.value })
  emit('update:visible', false)
}

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="448" :theme="theme.name.value">
    <v-card>

      <v-card-title class="d-flex align-center justify-space-between">
        <span>Export Image</span>
        <v-btn variant="text" icon="mdi-close" size="small" density="comfortable" aria-label="Close" @click="close" />
      </v-card-title>

      <v-card-text>
        <v-label class="text-body-2 mb-2">Format</v-label>
        <v-btn-toggle
          v-model="format"
          mandatory
          divided
          rounded="lg"
          color="primary"
          class="format-toggle mb-6"
        >
          <v-btn v-for="f in formats" :key="f.id" :value="f.id" class="text-none">{{ f.label }}</v-btn>
        </v-btn-toggle>
        
        <template v-if="showQuality">
          <div class="d-flex justify-space-between align-center">
            <v-label class="text-body-2">Quality</v-label>
            <span class="text-body-2 font-weight-medium">{{ quality }}%</span>
          </div>
          <v-slider
            v-model="quality"
            :min="1" :max="100" :step="1"
            color="primary" density="compact" hide-details thumb-size="14" class="mb-2"
          />
          <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-6">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
        </template>

        <v-text-field
          v-model="fileName"
          label="File name"
          :suffix="`.${selected.ext}`"
          placeholder="image"
          density="comfortable"
          variant="outlined"
          persistent-placeholder
          hide-details
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-tray-arrow-down" @click="submit">Export</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.format-toggle {
  width: 100%;
  height: 44px;
}

.format-toggle :deep(.v-btn) {
  flex: 1 1 0;
}
</style>
