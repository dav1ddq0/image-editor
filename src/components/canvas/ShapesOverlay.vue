<!--
  ShapesOverlay.vue
  Draw shapes (rectangle, ellipse, line, arrow) on a canvas overlay.
  Each drag commits a shape; Apply composites the overlay onto the image.
-->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ imgWidth: number; imgHeight: number }>()
const emit  = defineEmits<{ apply: [canvas: HTMLCanvasElement]; cancel: [] }>()

type ShapeType = 'rect' | 'ellipse' | 'line' | 'arrow'

const canvasRef   = ref<HTMLCanvasElement>()
const shapeType   = ref<ShapeType>('rect')
const strokeColor = ref('#ff0000')
const fillEnabled = ref(false)
const fillColor   = ref('#ff0000')
const lineWidth   = ref(3)
const hasShapes   = ref(false)

let isDrawing    = false
let startX       = 0
let startY       = 0
let snapshotData: ImageData | null = null

function getCtx(): CanvasRenderingContext2D {
  return canvasRef.value!.getContext('2d')!
}

function canvasPos(e: PointerEvent): { x: number; y: number } {
  const r = canvasRef.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function drawShape(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.lineWidth   = lineWidth.value
  ctx.strokeStyle = strokeColor.value
  ctx.fillStyle   = fillColor.value
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'

  const w = x2 - x1
  const h = y2 - y1

  ctx.beginPath()
  if (shapeType.value === 'rect') {
    ctx.rect(x1, y1, w, h)
    if (fillEnabled.value) ctx.fill()
    ctx.stroke()
  } else if (shapeType.value === 'ellipse') {
    ctx.ellipse(x1 + w / 2, y1 + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2)
    if (fillEnabled.value) ctx.fill()
    ctx.stroke()
  } else if (shapeType.value === 'line') {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  } else if (shapeType.value === 'arrow') {
    const angle   = Math.atan2(y2 - y1, x2 - x1)
    const headLen = Math.max(16, lineWidth.value * 5)

    // Shaft — stop short of tip so it doesn't poke through the arrowhead
    const shaftEndX = x2 - (headLen * 0.6) * Math.cos(angle)
    const shaftEndY = y2 - (headLen * 0.6) * Math.sin(angle)
    ctx.moveTo(x1, y1)
    ctx.lineTo(shaftEndX, shaftEndY)
    ctx.stroke()

    // Filled triangular arrowhead
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fillStyle = strokeColor.value
    ctx.fill()
  }
}

function onPointerDown(e: PointerEvent): void {
  e.preventDefault()
  isDrawing = true
  const { x, y } = canvasPos(e)
  startX = x; startY = y
  snapshotData = getCtx().getImageData(0, 0, props.imgWidth, props.imgHeight)
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (!isDrawing || !snapshotData) return
  const { x, y } = canvasPos(e)
  const ctx = getCtx()
  ctx.putImageData(snapshotData, 0, 0)
  drawShape(ctx, startX, startY, x, y)
}

function onPointerUp(e: PointerEvent): void {
  if (!isDrawing) return
  isDrawing = false
  const { x, y } = canvasPos(e)
  const ctx = getCtx()
  if (snapshotData) ctx.putImageData(snapshotData, 0, 0)
  drawShape(ctx, startX, startY, x, y)
  snapshotData    = null
  hasShapes.value = true
}

function clearShapes(): void {
  getCtx().clearRect(0, 0, props.imgWidth, props.imgHeight)
  hasShapes.value = false
  snapshotData    = null
}

</script>

<template>
  <div
    class="shapes-overlay"
    :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
  >
    <!-- Drawing canvas -->
    <canvas
      ref="canvasRef"
      class="shapes-canvas"
      :width="imgWidth"
      :height="imgHeight"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />

    <!-- Floating toolbar -->
    <div class="shapes-toolbar" @pointerdown.stop @click.stop>

      <!-- Shape type buttons -->
      <div class="shape-type-group">
        <button
          v-for="s in (['rect', 'ellipse', 'line', 'arrow'] as const)"
          :key="s"
          class="shape-btn"
          :class="{ 'shape-btn--active': shapeType === s }"
          :title="s.charAt(0).toUpperCase() + s.slice(1)"
          @click="shapeType = s"
        >
          <svg v-if="s === 'rect'"    width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          <svg v-if="s === 'ellipse'" width="16" height="16" viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="7" ry="5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          <svg v-if="s === 'line'"    width="16" height="16" viewBox="0 0 16 16"><line x1="1" y1="15" x2="15" y2="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <svg v-if="s === 'arrow'"   width="16" height="16" viewBox="0 0 16 16"><line x1="2" y1="14" x2="12" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="5,2 14,2 14,11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="sep" />

      <!-- Stroke colour -->
      <label class="ctrl-label">Stroke</label>
      <input type="color" v-model="strokeColor" class="color-picker" title="Stroke color" />

      <div class="sep" />

      <!-- Fill -->
      <label class="ctrl-label">
        <input type="checkbox" v-model="fillEnabled" class="fill-check" />
        Fill
      </label>
      <input type="color" v-model="fillColor" class="color-picker" :disabled="!fillEnabled" title="Fill color" />

      <div class="sep" />

      <!-- Line width -->
      <label class="ctrl-label">Width</label>
      <input
        type="range"
        v-model.number="lineWidth"
        min="1" max="40" step="1"
        class="range-input"
        title="Stroke width"
      />
      <span class="ctrl-value">{{ lineWidth }}</span>

      <div class="sep" />

      <!-- Actions -->
      <button class="tool-btn" :disabled="!hasShapes" @click="clearShapes">⟳ Clear</button>
      <button class="tool-btn" @click="emit('cancel')">✕</button>
      <button class="tool-btn tool-btn--primary" :disabled="!hasShapes" @click="canvasRef && emit('apply', canvasRef)">Apply</button>

    </div>
  </div>
</template>

<style scoped>
.shapes-overlay {
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  touch-action: none;
}

.shapes-canvas {
  position: absolute;
  inset: 0;
  cursor: crosshair;
  display: block;
}

/* ── Floating toolbar ── */
.shapes-toolbar {
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

/* Shape type selector */
.shape-type-group {
  display: flex;
  gap: 2px;
}

.shape-btn {
  width: 28px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--transition);
  padding: 0;
  flex-shrink: 0;
}
.shape-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
.shape-btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.fill-check {
  width: 12px;
  height: 12px;
  accent-color: var(--color-accent);
  cursor: pointer;
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
.color-picker:disabled { opacity: 0.35; cursor: not-allowed; }

.range-input {
  width: 70px;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.ctrl-value {
  font-size: 0.75rem;
  color: var(--color-text);
  min-width: 22px;
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
  .shapes-toolbar {
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
