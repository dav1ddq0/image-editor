<!--
  BrushOverlay.vue
  Freehand brush drawing overlay. Renders a transparent canvas over the image;
  pointer events draw strokes in real time. Apply bakes the strokes into the image.
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
    <!-- Drawing canvas -->
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

    <!-- Floating toolbar -->
    <div class="brush-toolbar" @pointerdown.stop @click.stop>

      <!-- Color -->
      <input
        type="color"
        v-model="color"
        class="color-picker"
        title="Brush color"
      />

      <div class="sep" />

      <!-- Size -->
      <label class="ctrl-label">Size</label>
      <input
        type="range"
        v-model.number="brushSize"
        min="2" max="80" step="1"
        class="range-input"
        title="Brush size"
      />
      <span class="ctrl-value">{{ brushSize }}</span>

      <div class="sep" />

      <!-- Opacity -->
      <label class="ctrl-label">Opacity</label>
      <input
        type="range"
        v-model.number="opacity"
        min="10" max="100" step="5"
        class="range-input"
        title="Opacity"
      />
      <span class="ctrl-value">{{ opacity }}%</span>

      <div class="sep" />

      <!-- Actions -->
      <button class="tool-btn" :disabled="!hasStrokes" @click="clearStrokes" title="Clear strokes">⟳ Clear</button>
      <button class="tool-btn" @click="emit('cancel')">✕</button>
      <button class="tool-btn tool-btn--primary" :disabled="!hasStrokes" @click="applyStrokes">Apply</button>

    </div>
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

.color-picker {
  width: 28px;
  height: 26px;
  padding: 1px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: none;
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
  width: 72px;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.ctrl-value {
  font-size: 0.75rem;
  color: var(--color-text);
  min-width: 30px;
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
  .brush-toolbar {
    top: auto;
    bottom: -56px;
    left: 0;
    transform: none;
    max-width: 100%;
    overflow-x: auto;
    border-radius: var(--radius-sm);
  }
}
</style>
