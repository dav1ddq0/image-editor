<!--
  Freehand brush drawing overlay. Renders a transparent canvas over the image;
  pointer events draw strokes in real time. Apply bakes the strokes into the image.
-->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ imgWidth: number; imgHeight: number }>()
const emit  = defineEmits<{
  apply:  [canvas: HTMLCanvasElement]
  cancel: []
}>()

// ── Tool state ─────────────────────────────────────────────────────────────

const canvasRef  = ref<HTMLCanvasElement>()
const color      = ref('#ff0000')
const brushSize  = ref(16)
const opacity    = ref(100)
const hasStrokes = ref(false)

// ── Drawing ────────────────────────────────────────────────────────────────

let isDrawing = false
let lastX     = 0
let lastY     = 0

function ctx(): CanvasRenderingContext2D {
  return canvasRef.value!.getContext('2d')!
}

function applyCtxStyle(c: CanvasRenderingContext2D): void {
  c.strokeStyle    = color.value
  c.fillStyle      = color.value
  c.lineWidth      = brushSize.value
  c.lineCap        = 'round'
  c.lineJoin       = 'round'
  c.globalAlpha    = opacity.value / 100
  c.globalCompositeOperation = 'source-over'
}

function canvasPos(e: PointerEvent): { x: number; y: number } {
  const r = canvasRef.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function onPointerDown(e: PointerEvent): void {
  e.preventDefault()
  isDrawing = true
  const { x, y } = canvasPos(e)
  lastX = x; lastY = y
  const c = ctx()
  applyCtxStyle(c)
  // Paint a dot at the click point
  c.beginPath()
  c.arc(x, y, brushSize.value / 2, 0, Math.PI * 2)
  c.fill()
  hasStrokes.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (!isDrawing) return
  const { x, y } = canvasPos(e)
  const c = ctx()
  applyCtxStyle(c)
  c.beginPath()
  c.moveTo(lastX, lastY)
  c.lineTo(x, y)
  c.stroke()
  lastX = x; lastY = y
}

function onPointerUp(): void {
  isDrawing = false
}

// ── Actions ────────────────────────────────────────────────────────────────

function clearStrokes(): void {
  ctx().clearRect(0, 0, props.imgWidth, props.imgHeight)
  hasStrokes.value = false
}

function applyStrokes(): void {
  if (canvasRef.value) emit('apply', canvasRef.value)
}
</script>

<template>
  <div
    class="brush-overlay"
    :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
  >
    <canvas
      ref="canvasRef"
      class="brush-canvas"
      :width="imgWidth"
      :height="imgHeight"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />

    <Teleport to="#canvas-area-host">
    <div class="brush-toolbar" @pointerdown.stop @click.stop>

      <input
        type="color"
        v-model="color"
        class="ov-swatch"
        title="Brush color"
      />

      <div class="ov-sep" />

      <label class="ov-label">Size</label>
      <input
        type="range"
        v-model.number="brushSize"
        min="2" max="80" step="1"
        class="ov-range"
        title="Brush size"
      />
      <span class="ov-value">{{ brushSize }}</span>

      <div class="ov-sep" />

      <label class="ov-label">Opacity</label>
      <input
        type="range"
        v-model.number="opacity"
        min="10" max="100" step="5"
        class="ov-range"
        title="Opacity"
      />
      <span class="ov-value">{{ opacity }}%</span>

      <div class="ov-sep" />

      <button class="ov-btn" :disabled="!hasStrokes" @click="clearStrokes" title="Clear strokes"><v-icon icon="mdi-restore" size="15" />Clear</button>
      <button class="ov-btn ov-btn--icon" aria-label="Cancel" @click="emit('cancel')"><v-icon icon="mdi-close" size="16" /></button>
      <button class="ov-btn ov-btn--primary" :disabled="!hasStrokes" @click="applyStrokes"><v-icon icon="mdi-check" size="15" />Apply</button>

    </div>
    </Teleport>
  </div>
</template>

<style scoped>
.brush-overlay {
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  touch-action: none;
}

.brush-canvas {
  position: absolute;
  inset: 0;
  cursor: crosshair;
  display: block;
}

/* ── Floating toolbar ── */
.brush-toolbar {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 12px;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
  z-index: 200;
}

@media (max-width: 639px) {
  .brush-toolbar {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
  }
}
</style>
