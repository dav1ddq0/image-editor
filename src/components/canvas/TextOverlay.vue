<!--
  Text insertion overlay. The user clicks to place an anchor point, types in a
  styled textarea, then confirms to bake the text into the image via apply text.
-->
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { TextLayer } from '@/types/editor'

const props = defineProps<{
  imgWidth:      number
  imgHeight:     number
  defaultColor?: string
}>()

const emit = defineEmits<{
  apply:  [layer: TextLayer]
  cancel: []
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const placed      = ref(false)
const posX        = ref(0)
const posY        = ref(0)

const text       = ref('')
const fontSize   = ref(32)
const fontFamily = ref('sans-serif')
const color      = ref(props.defaultColor ?? '#ffffff')
const bold       = ref(false)
const italic     = ref(false)

const FONT_FAMILIES = ['sans-serif', 'serif', 'monospace', 'Impact', 'Arial', 'Georgia', 'Courier New']

const boxStyle = computed(() => ({
  left: posX.value + 'px',
  top:  posY.value + 'px',
}))

const inputStyle = computed(() => ({
  fontSize:   fontSize.value + 'px',
  fontFamily: fontFamily.value,
  color:      color.value,
  fontWeight: bold.value   ? 'bold'   : 'normal',
  fontStyle:  italic.value ? 'italic' : 'normal',
}))

function startDrag(e: PointerEvent): void {
  e.preventDefault()
  const handle  = e.currentTarget as HTMLElement
  const originX = e.clientX - posX.value
  const originY = e.clientY - posY.value

  handle.setPointerCapture(e.pointerId)

  function onMove(ev: PointerEvent): void {
    posX.value = ev.clientX - originX
    posY.value = ev.clientY - originY
  }

  function onUp(): void {
    handle.removeEventListener('pointermove', onMove as EventListener)
    handle.removeEventListener('pointerup',   onUp)
  }

  handle.addEventListener('pointermove', onMove as EventListener)
  handle.addEventListener('pointerup',   onUp)
}

async function onOverlayClick(e: MouseEvent): Promise<void> {
  if (placed.value) return
  const el   = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  posX.value   = e.clientX - rect.left
  posY.value   = e.clientY - rect.top
  placed.value = true
  await nextTick()
  textareaRef.value?.focus()
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') { emit('cancel'); return }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); confirm() }
}

function confirm(): void {
  if (!text.value.trim()) { emit('cancel'); return }
  emit('apply', {
    text:       text.value,
    nx:         posX.value / props.imgWidth,
    ny:         posY.value / props.imgHeight,
    fontSize:   fontSize.value,
    fontFamily: fontFamily.value,
    color:      color.value,
    bold:       bold.value,
    italic:     italic.value,
    displayW:   props.imgWidth,
  })
}
</script>

<template>
  <div
    class="text-overlay"
    :class="{ 'cursor-crosshair': !placed }"
    @click="onOverlayClick"
  >
    <Teleport to="#canvas-area-host">
    <div class="text-toolbar" @pointerdown.stop @click.stop>

      <select v-model="fontFamily" class="ov-select">
        <option v-for="f in FONT_FAMILIES" :key="f" :value="f">{{ f }}</option>
      </select>

      <div class="size-control">
        <button class="ov-btn ov-btn--icon" aria-label="Decrease font size" @click="fontSize = Math.max(8, fontSize - 2)">
          <v-icon icon="mdi-minus" size="15" />
        </button>
        <span class="ov-value size-value">{{ fontSize }}</span>
        <button class="ov-btn ov-btn--icon" aria-label="Increase font size" @click="fontSize = Math.min(200, fontSize + 2)">
          <v-icon icon="mdi-plus" size="15" />
        </button>
      </div>

      <button class="ov-btn ov-btn--icon fmt-btn" :class="{ active: bold }" aria-label="Bold" @click="bold = !bold">B</button>
      <button class="ov-btn ov-btn--icon fmt-btn" :class="{ active: italic }" aria-label="Italic" @click="italic = !italic"><em>I</em></button>

      <input type="color" v-model="color" class="ov-swatch" title="Text color" />

      <div class="ov-sep" />

      <button class="ov-btn ov-btn--icon" aria-label="Cancel" @click="emit('cancel')">
        <v-icon icon="mdi-close" size="16" />
      </button>
      <button class="ov-btn ov-btn--icon ov-btn--primary" :disabled="!text.trim()" aria-label="Apply text" @click="confirm">
        <v-icon icon="mdi-check" size="16" />
      </button>

    </div>
    </Teleport>

    <div v-if="!placed" class="placement-hint">
      <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8"  y1="12" x2="16" y2="12"/>
      </svg>
      <span>Click anywhere to place text</span>
    </div>

    <div
      v-if="placed"
      class="text-box"
      :style="boxStyle"
      @click.stop
    >
      <div
        class="drag-handle"
        title="Drag to reposition"
        @pointerdown.stop="startDrag"
      >
        <v-icon class="drag-icon" icon="mdi-drag-horizontal" size="14" />
      </div>

      <textarea
        ref="textareaRef"
        v-model="text"
        class="text-input"
        :style="inputStyle"
        placeholder="Type here…"
        rows="1"
        @keydown="onKeyDown"
      />
    </div>
  </div>
</template>

<style scoped>
.text-overlay {
  position: absolute;
  inset: 0;
  cursor: default;
  user-select: none;
}

.text-overlay.cursor-crosshair {
  cursor: crosshair;
  outline: 2px dashed var(--color-border);
  outline-offset: -6px;
}

.text-toolbar {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
  z-index: 200;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 2px;
}

.size-value {
  min-width: 28px;
  text-align: center;
}

/* B / I keep their typographic glyphs; give them serif-independent weight */
.fmt-btn {
  font-size: 0.85rem;
  font-weight: 700;
}

.placement-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: var(--shadow-lg);
  animation: hint-fade-in 0.18s ease;
}

.hint-icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
  flex-shrink: 0;
}

@keyframes hint-fade-in {
  from { opacity: 0; transform: translate(-50%, -46%); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}

.text-box {
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  min-width: 120px;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-bottom: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  cursor: move;
  user-select: none;
}

.drag-icon {
  color: var(--color-muted);
}

.text-input {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  outline: none;
  resize: none;
  width: 100%;
  min-width: 120px;
  padding: 4px 6px;
  line-height: 1.2;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  font-weight: inherit;
  font-style: inherit;
  box-sizing: border-box;
}

.text-input::placeholder { color: var(--color-subtle); }

@media (max-width: 639px) {
  .text-toolbar {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
  }
}
</style>
