<!--
  Freehand eraser overlay. Draws opaque white strokes on a transparent canvas.
  On apply, CanvasArea uses destination-out compositing so the white pixels
  punch transparent holes in the rendered image.
-->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ imgWidth: number; imgHeight: number }>()
const emit  = defineEmits<{
  apply:  [canvas: HTMLCanvasElement]
  cancel: []
}>()

// Tool state 

const canvasRef  = ref<HTMLCanvasElement>()
const eraserSize = ref(20)
const hasStrokes = ref(false)

// Drawing

let isDrawing = false
let lastX     = 0
let lastY     = 0

function getCtx(): CanvasRenderingContext2D {
  return canvasRef.value!.getContext('2d')!
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
  const c = getCtx()
  c.globalCompositeOperation = 'source-over'
  c.fillStyle   = '#ffffff'
  c.globalAlpha = 1
  c.beginPath()
  c.arc(x, y, eraserSize.value / 2, 0, Math.PI * 2)
  c.fill()
  hasStrokes.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (!isDrawing) return
  const { x, y } = canvasPos(e)
  const c = getCtx()
  c.globalCompositeOperation = 'source-over'
  c.strokeStyle = '#ffffff'
  c.globalAlpha = 1
  c.lineWidth   = eraserSize.value
  c.lineCap     = 'round'
  c.lineJoin    = 'round'
  c.beginPath()
  c.moveTo(lastX, lastY)
  c.lineTo(x, y)
  c.stroke()
  lastX = x; lastY = y
}

function onPointerUp(): void {
  isDrawing = false
}

function clearStrokes(): void {
  getCtx().clearRect(0, 0, props.imgWidth, props.imgHeight)
  hasStrokes.value = false
}

function applyStrokes(): void {
  if (canvasRef.value) emit('apply', canvasRef.value)
}
</script>

<template>
  <div
    class="eraser-overlay"
    :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
  >
    <canvas
      ref="canvasRef"
      class="eraser-canvas"
      :width="imgWidth"
      :height="imgHeight"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />

    <Teleport to="#canvas-area-host">
    <div class="eraser-toolbar" @pointerdown.stop @click.stop>

      <v-icon class="tool-indicator" icon="mdi-eraser" size="17" aria-hidden="true" />

      <div class="ov-sep" />

      <label class="ov-label">Size</label>
      <input
        type="range"
        v-model.number="eraserSize"
        min="4" max="120" step="2"
        class="ov-range"
        title="Eraser size"
      />
      <span class="ov-value">{{ eraserSize }}</span>

      <div class="ov-sep" />

      <button class="ov-btn" :disabled="!hasStrokes" @click="clearStrokes" title="Clear strokes"><v-icon icon="mdi-restore" size="15" />Clear</button>
      <button class="ov-btn ov-btn--icon" aria-label="Cancel" @click="emit('cancel')"><v-icon icon="mdi-close" size="16" /></button>
      <button class="ov-btn ov-btn--primary" :disabled="!hasStrokes" @click="applyStrokes"><v-icon icon="mdi-check" size="15" />Apply</button>

    </div>
    </Teleport>
  </div>
</template>

<style scoped>
.eraser-overlay {
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  touch-action: none;
}

.eraser-canvas {
  position: absolute;
  inset: 0;
  cursor: cell;
  display: block;
}

/* Floating toolbar */
.eraser-toolbar {
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

.tool-indicator {
  color: var(--color-muted);
  flex-shrink: 0;
}

@media (max-width: 639px) {
  .eraser-toolbar {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
  }
}
</style>
