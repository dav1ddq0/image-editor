<!--
  AsciiArtDialog.vue
  Modal that displays the ASCII art generated from the current image.
  Follows the same pattern as QrScanDialog: Teleport + v-model:visible + state machine.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ColorChar } from '@/utils/asciiConverter'

const props = defineProps<{
  visible:    boolean
  state:      'generating' | 'done'
  text:       string
  colorLines: ColorChar[][]
  cols:       number
  moreLevels: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'regenerate':     [cols: number, moreLevels: boolean, blockChars: boolean]
}>()

const copied          = ref(false)
const localCols       = ref(props.cols)
const localMoreLevels = ref(props.moreLevels)
const localFontSize   = ref(5)
const colorMode       = ref(false)
const blockChars      = ref(false)

watch(() => props.cols,       (v) => { localCols.value       = v })
watch(() => props.moreLevels, (v) => { localMoreLevels.value = v })

// Pre-render color HTML once when colorLines changes instead of tracking
// thousands of reactive spans. Source is internal data — v-html is safe here.
const colorHtml = computed<string>(() => {
  if (!props.colorLines.length) return ''
  return props.colorLines
    .map(row =>
      row.map(cell =>
        `<span style="color:${cell.color}">${cell.char === ' ' ? '&nbsp;' : cell.char === '<' ? '&lt;' : cell.char === '>' ? '&gt;' : cell.char === '&' ? '&amp;' : cell.char}</span>`
      ).join('')
    )
    .join('\n')
})

function buildHtmlPayload(): string {
  const style = [
    `font-family:'Courier New',Courier,monospace`,
    `font-size:${localFontSize.value}px`,
    `line-height:1.1`,
    `color:${colorMode.value ? 'inherit' : '#e0e0e0'}`,
    `white-space:pre`,
    `display:block`,
  ].join(';')

  const body = colorMode.value ? colorHtml.value : props.text
  return `<pre style="${style}">${colorMode.value ? body : escapeHtml(body)}</pre>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function copyToClipboard(): Promise<void> {
  try {
    const htmlBlob  = new Blob([buildHtmlPayload()], { type: 'text/html' })
    const textBlob  = new Blob([props.text],         { type: 'text/plain' })
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })])
  } catch {
    // Fallback: plain text only
    try { await navigator.clipboard.writeText(props.text) } catch { /* ignore */ }
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function regenerate(): void {
  emit('regenerate', localCols.value, localMoreLevels.value, blockChars.value)
}

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="ascii-backdrop" @click.self="close">
      <div class="ascii-dialog" role="dialog" aria-modal="true" aria-label="ASCII Art Generator">

        <!-- Header -->
        <div class="ascii-header">
          <span class="ascii-title">ASCII Art</span>
          <button class="ascii-close" @click="close" aria-label="Close">✕</button>
        </div>

        <!-- Generating state -->
        <div v-if="state === 'generating'" class="ascii-body ascii-center">
          <div class="ascii-spinner" aria-label="Generating…" />
          <p class="ascii-status-text">Generating ASCII art…</p>
        </div>

        <!-- Done state -->
        <div v-else class="ascii-body">

          <!-- B&W output -->
          <pre
            v-if="!colorMode"
            class="ascii-output"
            :style="{ fontSize: localFontSize + 'px', lineHeight: '1.1' }"
            aria-label="ASCII art output"
          >{{ text }}</pre>

          <!-- Color output — HTML string injected once via v-html for performance -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <pre
            v-else
            class="ascii-output"
            :style="{ fontSize: localFontSize + 'px', lineHeight: '1.1' }"
            aria-label="ASCII art color output"
            v-html="colorHtml"
          />

          <div class="ascii-controls">
            <div class="control-row">
              <label class="control-label" for="ascii-font-size">
                Font size <span class="control-value">{{ localFontSize }}px</span>
              </label>
              <input
                id="ascii-font-size"
                v-model.number="localFontSize"
                type="range"
                min="3"
                max="14"
                step="1"
                class="ascii-slider"
              />
            </div>

            <div class="control-row">
              <label class="control-label" for="ascii-cols">
                Columns <span class="control-value">{{ localCols }}</span>
              </label>
              <input
                id="ascii-cols"
                v-model.number="localCols"
                type="range"
                min="40"
                max="240"
                step="5"
                class="ascii-slider"
              />
            </div>

            <div class="control-row toggles-row">
              <label class="control-label toggle-label">
                <input v-model="localMoreLevels" type="checkbox" class="ascii-checkbox" :disabled="blockChars" />
                70-level ramp
              </label>
              <label class="control-label toggle-label">
                <input v-model="blockChars" type="checkbox" class="ascii-checkbox" />
                Block chars (█▓▒░)
              </label>
              <label class="control-label toggle-label">
                <input v-model="colorMode" type="checkbox" class="ascii-checkbox" />
                Color
              </label>
            </div>
          </div>

          <div class="ascii-actions">
            <button class="btn btn-secondary" @click="regenerate">Regenerate</button>
            <button class="btn btn-primary" @click="copyToClipboard">
              {{ copied ? '✓ Copied!' : 'Copy to clipboard' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ascii-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.ascii-dialog {
  width: 620px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 48px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.ascii-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.ascii-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.ascii-close {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: color var(--transition);
}
.ascii-close:hover { color: var(--color-text); }

/* ── Body ── */
.ascii-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  flex: 1;
}

.ascii-center {
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 18px;
}

/* ── ASCII output ── */
.ascii-output {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: 'Courier New', Courier, monospace;
  padding: 10px 12px;
  margin: 0;
  overflow: auto;
  white-space: pre;
  max-height: 340px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) var(--color-bg);
}

/* ── Controls ── */
.ascii-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggles-row {
  gap: 20px;
}

.control-label {
  font-size: 0.78rem;
  color: var(--color-muted);
  white-space: nowrap;
  min-width: 120px;
}

.control-value {
  color: var(--color-accent);
  font-weight: 600;
}

.ascii-slider {
  flex: 1;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: unset;
}

.ascii-checkbox {
  accent-color: var(--color-accent);
  cursor: pointer;
  width: 14px;
  height: 14px;
}

/* ── Actions ── */
.ascii-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

/* ── Spinner ── */
.ascii-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.ascii-status-text {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 8px 0 0;
}

/* ── Mobile ── */
@media (max-width: 639px) {
  .ascii-dialog {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    max-height: 90vh;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .ascii-output { max-height: 240px; }

  .toggles-row { flex-wrap: wrap; gap: 10px; }
}
</style>
