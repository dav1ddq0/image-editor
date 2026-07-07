<!--
  Modal that displays the ASCII art generated from the current image.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
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

const { smAndDown } = useDisplay()
const theme = useTheme()

const dialog = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

const localCols       = ref(props.cols)
const localMoreLevels = ref(props.moreLevels)
const localFontSize   = ref(5)
const colorMode       = ref(false)
const blockChars      = ref(false)
const copied          = ref(false)

watch(() => props.cols,       (v) => { localCols.value       = v })
watch(() => props.moreLevels, (v) => { localMoreLevels.value = v })

// Pre-render color HTML once when colorLines changes instead of tracking
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

async function copyRich(): Promise<boolean> {
  try {
    const htmlBlob = new Blob([buildHtmlPayload()], { type: 'text/html' })
    const textBlob = new Blob([props.text],         { type: 'text/plain' })
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })])
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

async function copyPlain(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(props.text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

async function copyToClipboard(): Promise<void> {
  const success = await copyRich() || await copyPlain()
  copied.value = success
  if (success) setTimeout(() => { copied.value = false }, 2000)
}

function regenerate(): void {
  emit('regenerate', localCols.value, localMoreLevels.value, blockChars.value)
}

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="640" :fullscreen="smAndDown" :theme="theme.name.value" scrollable aria-label="ASCII Art Generator">
    <v-card class="ascii-card">

      <v-card-title class="d-flex align-center justify-space-between">
        <span>ASCII Art</span>
        <v-btn variant="text" icon="mdi-close" size="small" density="comfortable" aria-label="Close" @click="close" />
      </v-card-title>

      <v-card-text v-if="state === 'generating'" class="state-center py-10">
        <v-progress-circular color="primary" indeterminate size="44" width="3" />
        <p class="status-text">Generating ASCII art…</p>
      </v-card-text>

      <v-card-text v-else class="d-flex flex-column ga-4 py-4">
        <pre
          v-if="!colorMode"
          class="ascii-output"
          :style="{ fontSize: localFontSize + 'px', lineHeight: '1.1' }"
          aria-label="ASCII art output"
        >{{ text }}</pre>

        <pre
          v-else
          class="ascii-output"
          :style="{ fontSize: localFontSize + 'px', lineHeight: '1.1' }"
          aria-label="ASCII art color output"
          v-html="colorHtml"
        />

        <div class="ascii-controls">
          <div class="control-row">
            <span class="control-label">Font size <span class="control-value">{{ localFontSize }}px</span></span>
            <v-slider
              v-model="localFontSize"
              :min="3" :max="14" :step="1"
              color="primary" density="compact" hide-details thumb-size="14"
            />
          </div>

          <div class="control-row">
            <span class="control-label">Columns <span class="control-value">{{ localCols }}</span></span>
            <v-slider
              v-model="localCols"
              :min="40" :max="240" :step="5"
              color="primary" density="compact" hide-details thumb-size="14"
            />
          </div>

          <div class="toggles-row">
            <v-checkbox
              v-model="localMoreLevels"
              :disabled="blockChars"
              label="70-level ramp"
              color="primary" density="compact" hide-details
            />
            <v-checkbox
              v-model="blockChars"
              label="Block chars (█▓▒░)"
              color="primary" density="compact" hide-details
            />
            <v-checkbox
              v-model="colorMode"
              label="Color"
              color="primary" density="compact" hide-details
            />
          </div>
        </div>
      </v-card-text>

      <template v-if="state === 'done'">
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="regenerate">Regenerate</v-btn>
          <v-btn
            color="primary" variant="flat"
            :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            @click="copyToClipboard"
          >{{ copied ? 'Copied!' : 'Copy to clipboard' }}</v-btn>
        </v-card-actions>
      </template>

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

.ascii-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
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

.toggles-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
}

.toggles-row :deep(.v-selection-control) {
  flex: 0 0 auto;
}

.toggles-row :deep(.v-label) {
  font-size: 0.82rem;
  opacity: 1;
}

@media (max-width: 639px) {
  .ascii-output { max-height: 45vh; }
  .control-label { min-width: 96px; }
}
</style>
