<!--
  Shows the image with Florence-2 OCR text regions overlaid. Each detected 
  text block has a transparent selectable span positioned over the image, with a blue
  underline highlight. Users can select and copy text directly from the image.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import type { TextRegion } from '@/utils/textExtractor'

const props = defineProps<{
  visible:  boolean
  state:    'loading-model' | 'extracting' | 'found' | 'not-found'
  text:     string
  regions:  TextRegion[]
  imageSrc: string
  progress: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { smAndDown } = useDisplay()
const theme = useTheme()
const dialog = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})
const copied = ref(false)

async function copyAll(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    copied.value = false
  }
}

function regionStyle(r: TextRegion): Record<string, string> {
  const [x1, y1, x2, y2] = r.box  // already 0-1 normalized
  return {
    left:   `${(x1 * 100).toFixed(3)}%`,
    top:    `${(y1 * 100).toFixed(3)}%`,
    width:  `${((x2 - x1) * 100).toFixed(3)}%`,
    height: `${((y2 - y1) * 100).toFixed(3)}%`,
  }
}

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="580" :fullscreen="smAndDown" :theme="theme.name.value" scrollable aria-label="Extract Text">
    <v-card>

      <v-card-title class="d-flex align-center justify-space-between">
        <span>Extract Text</span>
        <v-btn variant="text" icon="mdi-close" size="small" density="comfortable" aria-label="Close" @click="close" />
      </v-card-title>

      <v-card-text v-if="state === 'loading-model'" class="state-center py-8">
        <template v-if="progress <= 0">
          <v-progress-circular color="primary" indeterminate size="44" width="3" aria-label="Loading AI model…" />
          <p class="status-text">Loading AI model…</p>
        </template>
        <template v-else-if="progress < 100">
          <v-progress-linear
            :model-value="progress"
            color="primary"
            height="6"
            rounded
            class="progress-bar"
          />
          <p class="status-text">Downloading AI model… {{ progress }}%</p>
        </template>
        <template v-else>
          <v-progress-circular color="primary" indeterminate size="44" width="3" aria-label="Preparing model…" />
          <p class="status-text">Preparing model…</p>
        </template>
      </v-card-text>

      <v-card-text v-else-if="state === 'extracting'" class="state-center py-8">
        <v-progress-circular color="primary" indeterminate size="44" width="3" />
        <p class="status-text">Extracting text…</p>
      </v-card-text>

      <v-card-text v-else-if="state === 'found'" class="d-flex flex-column ga-3 py-4">
        <p class="hint-top">Click or drag over the highlighted text to select it.</p>

        <div class="image-wrap">
          <img :src="imageSrc" class="preview-img" alt="Image with detected text" draggable="false" />

          <!-- Text region overlays -->
          <div
            v-for="(region, idx) in regions"
            :key="idx"
            class="text-region"
            :style="regionStyle(region)"
            :title="region.label"
          >
            <span class="region-text" :aria-label="region.label">{{ region.label }}</span>
          </div>
        </div>

        <div class="d-flex justify-end">
          <v-btn
            color="primary" variant="flat"
            :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            @click="copyAll"
          >{{ copied ? 'Copied!' : 'Copy all text' }}</v-btn>
        </div>
      </v-card-text>

      <v-card-text v-else class="state-center py-8">
        <v-icon icon="mdi-alert-circle-outline" color="primary" size="44" />
        <p class="status-text">No text found in this image.</p>
        <v-btn variant="tonal" class="mt-2" @click="close">Close</v-btn>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.status-text {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 8px 0 0;
}

.progress-bar {
  max-width: 280px;
}

.hint-top {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0;
}

/* Image + overlays */
.image-wrap {
  position: relative;
  width: 100%;
  line-height: 0; 
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
  user-select: none;
}

.preview-img {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}

/* Each text region: invisible selectable text over the image */
.text-region {
  position: absolute;
  border-bottom: 2px solid rgba(66, 133, 244, 0.7);
  cursor: text;
  box-sizing: border-box;
}

.text-region:hover {
  background: rgba(66, 133, 244, 0.12);
  border-radius: 2px;
}

.region-text {
  display: block;
  width: 100%;
  height: 100%;
  color: transparent;
  user-select: text;
  white-space: nowrap;
  overflow: hidden;
  font-size: 0.8em;
  line-height: 1;
  cursor: text;
}
</style>
