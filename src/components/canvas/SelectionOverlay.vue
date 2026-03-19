<!--
  SelectionOverlay.vue
  Rectangular selection tool. Drag to draw a selection, drag corners to resize,
  drag inside to reposition. Action bar offers Crop-to-selection and Clear-area.
-->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CropRect } from '@/types/editor'

const props = defineProps<{ imgWidth: number; imgHeight: number }>()
const emit = defineEmits<{
  crop:   [rect: CropRect]
  clear:  [rect: CropRect]
  cancel: []
}>()

// ── State ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'drawing' | 'ready'
const phase = ref<Phase>('idle')

interface Box { left: number; top: number; right: number; bottom: number }
const box = ref<Box>({ left: 0, top: 0, right: 0, bottom: 0 })
const overlayRef = ref<HTMLDivElement>()

// ── Drag ─────────────────────────────────────────────────────────────────────

type DragMode = 'none' | 'drawing' | 'moving' | 'nw' | 'ne' | 'se' | 'sw'
let dragMode: DragMode = 'none'
let drawStart  = { x: 0, y: 0 }
let moveOrigin = { x: 0, y: 0, box: { left: 0, top: 0, right: 0, bottom: 0 } }

const MIN = 8

function clampedPos(e: PointerEvent): { x: number; y: number } {
  const r = overlayRef.value!.getBoundingClientRect()
  return {
    x: Math.max(0, Math.min(props.imgWidth,  e.clientX - r.left)),
    y: Math.max(0, Math.min(props.imgHeight, e.clientY - r.top)),
  }
}

// Starts a fresh selection draw from the overlay background
function onRootPointerDown(e: PointerEvent): void {
  e.preventDefault()
  const { x, y } = clampedPos(e)
  drawStart   = { x, y }
  box.value   = { left: x, top: y, right: x, bottom: y }
  dragMode    = 'drawing'
  phase.value = 'drawing'
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

// Repositions the selection box; stops event from reaching the overlay root
function onMovePointerDown(e: PointerEvent): void {
  e.preventDefault()
  e.stopPropagation()
  dragMode    = 'moving'
  moveOrigin  = { x: e.clientX, y: e.clientY, box: { ...box.value } }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

// Resizes from one of the 4 corner handles
function onHandlePointerDown(e: PointerEvent, corner: 'nw' | 'ne' | 'se' | 'sw'): void {
  e.preventDefault()
  e.stopPropagation()
  dragMode    = corner
  moveOrigin  = { x: e.clientX, y: e.clientY, box: { ...box.value } }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (dragMode === 'none') return

  if (dragMode === 'drawing') {
    const { x, y } = clampedPos(e)
    box.value = {
      left:   Math.min(drawStart.x, x),
      top:    Math.min(drawStart.y, y),
      right:  Math.max(drawStart.x, x),
      bottom: Math.max(drawStart.y, y),
    }
    return
  }

  const dx = e.clientX - moveOrigin.x
  const dy = e.clientY - moveOrigin.y
  const s  = moveOrigin.box
  const W  = props.imgWidth
  const H  = props.imgHeight
  let { left, top, right, bottom } = s

  if (dragMode === 'moving') {
    const w = right - left
    const h = bottom - top
    left   = Math.max(0, Math.min(W - w, s.left + dx))
    top    = Math.max(0, Math.min(H - h, s.top  + dy))
    right  = left + w
    bottom = top  + h
  } else {
    if (dragMode === 'nw' || dragMode === 'sw')
      left   = Math.max(0,  Math.min(right  - MIN, s.left   + dx))
    if (dragMode === 'ne' || dragMode === 'se')
      right  = Math.min(W,  Math.max(left   + MIN, s.right  + dx))
    if (dragMode === 'nw' || dragMode === 'ne')
      top    = Math.max(0,  Math.min(bottom - MIN, s.top    + dy))
    if (dragMode === 'sw' || dragMode === 'se')
      bottom = Math.min(H,  Math.max(top    + MIN, s.bottom + dy))
  }

  box.value = { left, top, right, bottom }
}

function onPointerUp(): void {
  if (dragMode === 'drawing') {
    const w = box.value.right  - box.value.left
    const h = box.value.bottom - box.value.top
    phase.value = (w >= MIN && h >= MIN) ? 'ready' : 'idle'
  }
  dragMode = 'none'
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    if (phase.value === 'ready') phase.value = 'idle'
    else emit('cancel')
  }
}

onMounted(() => overlayRef.value?.focus())

// ── Computed styles ───────────────────────────────────────────────────────────

const selW = computed(() => box.value.right  - box.value.left)
const selH = computed(() => box.value.bottom - box.value.top)

const boxStyle = computed(() => ({
  left:   box.value.left + 'px',
  top:    box.value.top  + 'px',
  width:  selW.value + 'px',
  height: selH.value + 'px',
}))

const shadeStyles = computed(() => {
  const { left, top, right, bottom } = box.value
  const W = props.imgWidth, H = props.imgHeight
  return {
    top:    { left: '0', top: '0',           width: W + 'px',        height: top + 'px' },
    bottom: { left: '0', top: bottom + 'px', width: W + 'px',        height: H - bottom + 'px' },
    left:   { left: '0', top: top + 'px',    width: left + 'px',     height: selH.value + 'px' },
    right:  { left: right + 'px', top: top + 'px', width: W - right + 'px', height: selH.value + 'px' },
  }
})

// Position the action bar in overlay-space so it always stays inside the image
// bounds and within the overlay's hit area.  Never extend outside imgHeight.
const ACTION_BAR_H = 44   // approximate bar height including shadow
const ACTION_BAR_GAP = 8

const actionBarStyle = computed(() => {
  const cx = (box.value.left + box.value.right) / 2
  // Prefer below; flip above when not enough room
  const belowFits = props.imgHeight - box.value.bottom >= ACTION_BAR_H + ACTION_BAR_GAP
  const rawTop    = belowFits
    ? box.value.bottom + ACTION_BAR_GAP
    : box.value.top - ACTION_BAR_H - ACTION_BAR_GAP
  // Clamp so the bar never exits the overlay vertically
  const top = Math.max(0, Math.min(props.imgHeight - ACTION_BAR_H, rawTop))
  return { left: cx + 'px', top: top + 'px', transform: 'translateX(-50%)' }
})

function toRect(): CropRect {
  return {
    x: box.value.left / props.imgWidth,
    y: box.value.top  / props.imgHeight,
    w: selW.value     / props.imgWidth,
    h: selH.value     / props.imgHeight,
  }
}
</script>

<template>
  <div
    ref="overlayRef"
    class="sel-overlay"
    :class="{ 'crosshair': phase !== 'ready' }"
    :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
    tabindex="0"
    @pointerdown="onRootPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeyDown"
  >
    <!-- Placement hint (idle only) -->
    <div v-if="phase === 'idle'" class="sel-hint">
      <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="3 2.5"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8"  y1="12" x2="16" y2="12"/>
      </svg>
      <span>Drag to select an area</span>
    </div>

    <!-- Shade outside selection -->
    <template v-if="phase !== 'idle'">
      <div class="shade" :style="shadeStyles.top" />
      <div class="shade" :style="shadeStyles.bottom" />
      <div class="shade" :style="shadeStyles.left" />
      <div class="shade" :style="shadeStyles.right" />
    </template>

    <!-- Selection box — stops propagation so clicks inside don't restart drawing -->
    <div
      v-if="phase !== 'idle'"
      class="sel-box"
      :style="boxStyle"
      @pointerdown.stop
    >
      <!-- Marching ants: black shadow + animated white stroke -->
      <svg class="ants-svg" :width="selW" :height="selH" aria-hidden="true">
        <rect x="0.75" y="0.75"
              :width="Math.max(0, selW - 1.5)" :height="Math.max(0, selH - 1.5)"
              fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="2"
              stroke-dasharray="6 4" />
        <rect x="0.75" y="0.75"
              :width="Math.max(0, selW - 1.5)" :height="Math.max(0, selH - 1.5)"
              fill="none" stroke="white" stroke-width="1.5"
              stroke-dasharray="6 4" class="ants" />
      </svg>

      <!-- Move zone (fills interior, cursor: move) -->
      <div class="move-zone" @pointerdown="onMovePointerDown" />

      <!-- Corner resize handles (ready only) -->
      <template v-if="phase === 'ready'">
        <div class="handle corner-nw" @pointerdown="onHandlePointerDown($event, 'nw')" />
        <div class="handle corner-ne" @pointerdown="onHandlePointerDown($event, 'ne')" />
        <div class="handle corner-se" @pointerdown="onHandlePointerDown($event, 'se')" />
        <div class="handle corner-sw" @pointerdown="onHandlePointerDown($event, 'sw')" />
      </template>

    </div>

    <!-- Action bar: sibling of sel-box, positioned in overlay space so it always
         stays within imgWidth × imgHeight and receives pointer events correctly. -->
    <div
      v-if="phase === 'ready'"
      class="sel-bar"
      :style="actionBarStyle"
      @pointerdown.stop
      @click.stop
    >
      <span class="sel-dims">{{ Math.round(selW) }} × {{ Math.round(selH) }}</span>
      <div class="sel-sep" />
      <button class="sel-btn sel-btn--primary" @click="emit('crop', toRect())">Crop</button>
      <button class="sel-btn" @click="emit('clear', toRect())">Clear</button>
      <button class="sel-btn sel-btn--cancel" @click="phase = 'idle'">✕</button>
    </div>
  </div>
</template>

<style scoped>
.sel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  touch-action: none;
  outline: none;
}
.sel-overlay.crosshair { cursor: crosshair; }

/* ── Shade ───────────────────────────────────────────────── */
.shade {
  position: absolute;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

/* ── Selection box ───────────────────────────────────────── */
.sel-box {
  position: absolute;
  overflow: visible;
}

.ants-svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: block;
  overflow: visible;
}

.ants { animation: march 0.5s linear infinite; }
@keyframes march { to { stroke-dashoffset: -20; } }

/* Move zone fills the interior */
.move-zone {
  position: absolute;
  inset: 8px;
  cursor: move;
}

/* ── Corner handles ──────────────────────────────────────── */
.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1.5px solid rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  z-index: 2;
}
.corner-nw { left: -5px;  top: -5px;    cursor: nw-resize; }
.corner-ne { right: -5px; top: -5px;    cursor: ne-resize; }
.corner-se { right: -5px; bottom: -5px; cursor: se-resize; }
.corner-sw { left: -5px;  bottom: -5px; cursor: sw-resize; }

/* ── Action bar ──────────────────────────────────────────── */
/* left/top/transform are set via inline :style so the bar stays
   inside the overlay's imgWidth × imgHeight hit area at all times. */
.sel-bar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  z-index: 10;
}

.sel-dims {
  font-size: 0.72rem;
  color: var(--color-muted);
  min-width: 64px;
}

.sel-sep {
  width: 1px;
  height: 18px;
  background: var(--color-border);
}

.sel-btn {
  height: 26px;
  padding: 0 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all var(--transition);
}
.sel-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

.sel-btn--primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
.sel-btn--primary:hover { opacity: 0.85; }

.sel-btn--cancel {
  width: 26px;
  padding: 0;
  color: var(--color-muted);
}

/* ── Placement hint ──────────────────────────────────────── */
.sel-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
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

@media (max-width: 639px) {
  .sel-bar {
    max-width: calc(100vw - 40px);
    overflow-x: auto;
  }
}
</style>
