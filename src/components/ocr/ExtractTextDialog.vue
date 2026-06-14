<!--
  ExtractTextDialog.vue
  Shows the image with Florence-2 OCR text regions overlaid — similar to
  Windows Snipping Tool "Text Actions". Each detected text block has a
  transparent selectable span positioned over the image, with a blue
  underline highlight. Users can select and copy text directly from the image.
-->
<script setup lang="ts">
import { ref } from 'vue'
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
  <Teleport to="body">
    <div v-if="visible" class="ocr-backdrop" @click.self="close">
      <div class="ocr-dialog" role="dialog" aria-modal="true" aria-label="Extract Text">

        <!-- Header -->
        <div class="ocr-header">
          <span class="ocr-title">Extract Text</span>
          <button class="ocr-close" @click="close" aria-label="Close">✕</button>
        </div>

        <!-- Loading model (first run) -->
        <div v-if="state === 'loading-model'" class="ocr-body ocr-center">
          <!-- Before any bytes arrive (resolving file metadata, or reading from
                cache) show an indeterminate sliding bar -->
          <template v-if="progress <= 0">
            <div class="ocr-spinner" aria-label="Loading AI model…" />
            <p class="ocr-status-text">Loading AI model…</p>
          </template>
          <template v-else-if="progress < 100">
            <div class="ocr-progress-wrap" role="progressbar" :aria-valuenow="progress">
              <div class="ocr-progress-bar" :style="{ width: progress + '%' }" />
            </div>
            <p class="ocr-status-text">Downloading AI model… {{ progress }}%</p>
          </template>
          <!-- Once downloaded, ONNX compiles the model into a runnable session.
               That step emits no progress events, so show a spinner instead of a
               bar frozen at 100% -->
          <template v-else>
            <div class="ocr-spinner" aria-label="Preparing model…" />
            <p class="ocr-status-text">Preparing model…</p>
          </template>
        </div>

        <!-- Extracting -->
        <div v-else-if="state === 'extracting'" class="ocr-body ocr-center">
          <div class="ocr-spinner" aria-label="Extracting…" />
          <p class="ocr-status-text">Extracting text…</p>
        </div>

        <!-- Found: image with text overlays -->
        <div v-else-if="state === 'found'" class="ocr-body ocr-body--found">
          <p class="ocr-hint-top">Click or drag over the highlighted text to select it.</p>

          <div class="image-wrap">
            <img :src="imageSrc" class="preview-img" alt="Image with detected text" draggable="false" />

            <!-- Text region overlays — transparent selectable spans positioned over image text -->
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

          <div class="ocr-actions">
            <button class="btn btn-primary" @click="copyAll">
              {{ copied ? '✓ Copied!' : 'Copy all text' }}
            </button>
          </div>
        </div>

        <!-- Not found -->
        <div v-else class="ocr-body ocr-center">
          <svg class="ocr-warn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <p class="ocr-status-text">No text found in this image.</p>
          <button class="btn btn-secondary" style="margin-top: 8px;" @click="close">Close</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ocr-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
           max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

.ocr-dialog {
  width: 560px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.ocr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.ocr-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.ocr-close {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: color var(--transition);
}
@media (hover: hover) and (pointer: fine) {
  .ocr-close:hover { color: var(--color-text); }
}

/* ── Body (shared) ── */
.ocr-body {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
}

.ocr-center {
  align-items: center;
  text-align: center;
  padding: 32px 18px;
}

/* ── Found layout ── */
.ocr-body--found {
  padding: 14px 16px;
  gap: 10px;
}

.ocr-hint-top {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0;
}

/* ── Image + overlays ── */
.image-wrap {
  position: relative;
  width: 100%;
  line-height: 0; /* remove inline gap below image */
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
  user-select: none;  /* prevent accidental selection outside regions */
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

/* The actual text — transparent so it doesn't obscure the image, but in DOM so it's selectable */
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

/* ── Actions ── */
.ocr-actions {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* ── Progress bar ── */
.ocr-progress-wrap {
  width: 100%;
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.ocr-progress-bar {
  height: 100%;
  background: var(--color-accent);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Indeterminate variant: a short segment slides left→right on a loop, used
   while we don't yet have a real percentage (metadata / cache read). */
.ocr-progress-bar--indeterminate {
  width: 40%;
  transition: none;
  animation: ocr-indeterminate 1.1s ease-in-out infinite;
}

@keyframes ocr-indeterminate {
  0%   { transform: translateX(-110%); }
  100% { transform: translateX(260%); }
}

.ocr-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0;
  opacity: 0.7;
}

/* ── Spinner ── */
.ocr-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.ocr-status-text {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 8px 0 0;
}

/* ── Warning icon ── */
.ocr-warn-icon {
  width: 40px;
  height: 40px;
  color: var(--color-accent);
  opacity: 0.7;
}

/* ── Mobile ── */
@media (max-width: 639px) {
  .ocr-dialog {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    max-height: 92dvh;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
