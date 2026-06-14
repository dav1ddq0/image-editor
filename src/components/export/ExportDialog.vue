<!--
  ExportDialog.vue
  Modal dialog that lets the user choose export format, quality, and file name
  before downloading the edited image.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ExportFormat, ExportOptions } from '@/types/editor'

const props = defineProps<{ visible: boolean; defaultName: string }>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'export': [options: ExportOptions]
}>()

// ── Local state ────────────────────────────────────────────────────────────────

const format   = ref<ExportFormat>('png')
const quality  = ref<number>(90)
const fileName = ref<string>('')

// Pre-fill file name (strip extension) when the dialog opens
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

const selected   = computed(() => formats.find(f => f.id === format.value)!)
const showQuality = computed(() => selected.value.lossy)

const outputName = computed(() =>
  `${fileName.value || 'image'}.${selected.value.ext}`
)

// ── Actions ────────────────────────────────────────────────────────────────────

function submit(): void {
  emit('export', { format: format.value, quality: quality.value, fileName: outputName.value })
  emit('update:visible', false)
}

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="close">
      <div class="dialog">

        <header class="dialog-header">
          <h2>Export Image</h2>
          <button class="close-btn" @click="close">✕</button>
        </header>

        <div class="dialog-body">

          <!-- Format selector -->
          <div class="field">
            <label class="field-label">Format</label>
            <div class="format-grid">
              <button
                v-for="f in formats"
                :key="f.id"
                class="format-btn"
                :class="{ active: format === f.id }"
                @click="format = f.id"
              >
                <span class="format-ext">.{{ f.ext }}</span>
                <span class="format-name">{{ f.label }}</span>
              </button>
            </div>
          </div>

          <!-- Quality slider — only for lossy formats -->
          <div v-if="showQuality" class="field">
            <label class="field-label">
              Quality
              <span class="quality-value">{{ quality }}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              v-model.number="quality"
              class="quality-slider"
            />
            <div class="quality-hints">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          <!-- File name -->
          <div class="field">
            <label class="field-label">File name</label>
            <div class="filename-row">
              <input
                type="text"
                v-model="fileName"
                class="filename-input"
                placeholder="image"
              />
              <span class="filename-ext">.{{ selected.ext }}</span>
            </div>
          </div>

        </div>

        <footer class="dialog-footer">
          <button class="btn btn-secondary" @click="close">Cancel</button>
          <button class="btn btn-primary" @click="submit">
            Export {{ outputName }}
          </button>
        </footer>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
           max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

.dialog {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 420px;
  max-width: 95vw;
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

/* Header */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
}

.dialog-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: color var(--transition);
}

@media (hover: hover) and (pointer: fine) {
  .close-btn:hover { color: var(--color-accent); }
}

/* Body */
.dialog-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-accent);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Format grid */
.format-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.format-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--transition);
}

@media (hover: hover) and (pointer: fine) {
  .format-btn:hover { border-color: var(--color-muted); }
}
.format-btn.active  { border-color: var(--color-accent); }

.format-ext {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.format-name {
  font-size: 0.7rem;
  color: var(--color-subtle);
}

/* Quality */
.quality-value { color: var(--color-text); font-weight: 600; }

.quality-slider {
  accent-color: var(--color-accent);
  width: 100%;
  cursor: pointer;
}

.quality-hints {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--color-subtle);
}

/* File name */
.filename-row {
  display: flex;
  align-items: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.filename-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 0.88rem;
  padding: 8px 12px;
}

.filename-ext {
  padding: 8px 12px;
  background: var(--color-border);
  color: var(--color-muted);
  font-size: 0.82rem;
  border-left: 1px solid var(--color-border);
  white-space: nowrap;
}

/* Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 639px) {
  .overlay { align-items: flex-end; }

  .dialog {
    width: 100%;
    max-width: 100%;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    max-height: 90dvh;
    overflow-y: auto;
  }
}
</style>
