<!--
  TextOverlay.vue
  Text insertion overlay. The user clicks to place an anchor point, types in a
  styled textarea, then confirms to bake the text into the image via applyText.
  The text box has a drag handle so it can be repositioned while focused.
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

// ── State ──────────────────────────────────────────────────────────────────

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

// ── Styles ─────────────────────────────────────────────────────────────────

// The text-box wrapper carries the position; the textarea itself is unstyled.
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

// ── Drag-to-reposition ─────────────────────────────────────────────────────

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

// ── Interactions ───────────────────────────────────────────────────────────

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
    <!-- Floating toolbar -->
    <div class="text-toolbar" @click.stop>

      <select v-model="fontFamily" class="font-select">
        <option v-for="f in FONT_FAMILIES" :key="f" :value="f">{{ f }}</option>
      </select>

      <div class="size-control">
        <button class="size-btn" @click="fontSize = Math.max(8, fontSize - 2)">−</button>
        <span class="size-value">{{ fontSize }}</span>
        <button class="size-btn" @click="fontSize = Math.min(200, fontSize + 2)">+</button>
      </div>

      <button class="fmt-btn" :class="{ active: bold }"   @click="bold = !bold">B</button>
      <button class="fmt-btn" :class="{ active: italic }" @click="italic = !italic"><em>I</em></button>

      <input type="color" v-model="color" class="color-picker" title="Text color" />

      <div class="toolbar-sep" />

      <button class="action-btn cancel"  @click="emit('cancel')">✕</button>
      <button class="action-btn confirm" :disabled="!text.trim()" @click="confirm">✓</button>

    </div>

    <!-- Hint before placement -->
    <div v-if="!placed" class="placement-hint">
      <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8"  y1="12" x2="16" y2="12"/>
      </svg>
      <span>Click anywhere to place text</span>
    </div>

    <!--
      Text box: wrapper positioned at (posX, posY).
      The drag handle at the top can be grabbed at any time — even while the
      textarea is focused — without interfering with text selection.
    -->
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
        <span class="drag-icon">⠿</span>
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

/* Dashed inset border signals that the whole image area is clickable */
.text-overlay.cursor-crosshair {
  cursor: crosshair;
  outline: 2px dashed rgba(255, 255, 255, 0.35);
  outline-offset: -6px;
}

/* ── Toolbar ─────────────────────────────────────── */
.text-toolbar {
  position: absolute;
  top: -48px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,.5);
  white-space: nowrap;
  z-index: 10;
}

.font-select {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.78rem;
  padding: 3px 6px;
  cursor: pointer;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 3px;
}

.size-btn {
  width: 20px;
  height: 20px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

.size-value {
  min-width: 28px;
  font-size: 0.78rem;
  color: var(--color-text);
  text-align: center;
}

.fmt-btn {
  width: 26px;
  height: 26px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.fmt-btn.active { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }
.fmt-btn:hover:not(.active) { border-color: var(--color-accent); color: var(--color-accent); }

.color-picker {
  width: 28px;
  height: 26px;
  padding: 1px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: none;
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--color-border);
}

.action-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition);
}

.action-btn.cancel  { background: var(--color-border); color: var(--color-text); }
.action-btn.confirm { background: var(--color-accent); color: #fff; }
.action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.action-btn:hover:not(:disabled) { opacity: 0.8; }

/* ── Placement hint ──────────────────────────────── */
.placement-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  animation: hint-fade-in 0.18s ease;
}

.hint-icon {
  width: 18px;
  height: 18px;
  opacity: 0.85;
  flex-shrink: 0;
}

@keyframes hint-fade-in {
  from { opacity: 0; transform: translate(-50%, -46%); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}

/* ── Text box (wrapper + drag handle + textarea) ─── */
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
  background: rgba(255, 255, 255, 0.15);
  border: 1px dashed rgba(255, 255, 255, 0.5);
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  cursor: move;
  user-select: none;
}

.drag-icon {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
}

.text-input {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.6);
  border-radius: 0 0 3px 3px;
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

.text-input::placeholder { color: rgba(255,255,255,0.4); }
</style>
