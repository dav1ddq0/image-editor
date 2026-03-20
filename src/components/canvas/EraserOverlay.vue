<!--
  EraserOverlay.vue
  Freehand eraser overlay. Draws opaque white strokes on a transparent canvas.
  On apply, CanvasArea uses destination-out compositing so the white pixels
  punch transparent holes in the rendered image.
-->
<script setup lang="ts">
import { ref, defineExpose } from 'vue'

const props = defineProps<{ imgWidth: number; imgHeight: number }>()
const emit  = defineEmits<{
  apply:  [canvas: HTMLCanvasElement]
  cancel: []
}>()

// ── Tool state ─────────────────────────────────────────────────────────────

const canvasRef  = ref<HTMLCanvasElement>()
const eraserSize = ref(20)
const hasStrokes = ref(false)

// ── Drawing ────────────────────────────────────────────────────────────────

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

// ── Actions ────────────────────────────────────────────────────────────────

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
    <!-- Drawing canvas -->
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

    <!-- Floating toolbar -->
    <div class="eraser-toolbar" @pointerdown.stop @click.stop>

      <!-- Eraser icon indicator -->
      <span class="eraser-icon" aria-hidden="true">◻</span>

      <div class="sep" />

      <!-- Size -->
      <label class="ctrl-label">Size</label>
      <input
        type="range"
        v-model.number="eraserSize"
        min="4" max="120" step="2"
        class="range-input"
        title="Eraser size"
      />
      <span class="ctrl-value">{{ eraserSize }}</span>

      <div class="sep" />

      <!-- Actions -->
      <button class="tool-btn" :disabled="!hasStrokes" @click="clearStrokes" title="Clear strokes">⟳ Clear</button>
      <button class="tool-btn" @click="emit('cancel')">✕</button>
      <button class="tool-btn tool-btn--primary" :disabled="!hasStrokes" @click="applyStrokes">Apply</button>

    </div>
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

/* ── Floating toolbar ── */
.eraser-toolbar {
  position: absolute;
  top: -52px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  z-index: 10;
}

.eraser-icon {
  font-size: 1.1rem;
  color: var(--color-muted);
  flex-shrink: 0;
}

.sep {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  flex-shrink: 0;
}

.ctrl-label {
  font-size: 0.72rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.range-input {
  width: 80px;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.ctrl-value {
  font-size: 0.75rem;
  color: var(--color-text);
  min-width: 28px;
  text-align: right;
}

.tool-btn {
  height: 26px;
  padding: 0 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}
.tool-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
.tool-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.tool-btn--primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
.tool-btn--primary:hover:not(:disabled) { opacity: 0.85; }

@media (max-width: 639px) {
  .eraser-toolbar {
    top: auto;
    bottom: -52px;
    left: 0;
    transform: none;
    max-width: 100%;
    overflow-x: auto;
    border-radius: var(--radius-sm);
  }
}
</style>
