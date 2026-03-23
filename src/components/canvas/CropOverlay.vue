<!--
  CropOverlay.vue
  Full-image overlay for the crop tool. Manages the crop bounding box,
  8 draggable handles, aspect ratio presets, lock toggle, and apply/cancel.
-->
<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { AspectPreset, CropRect } from '@/types/editor'
import { useEditorStore } from '@/stores/editorStore'

const props = defineProps<{ imgWidth: number; imgHeight: number }>()
const emit  = defineEmits<{ apply: [rect: CropRect]; cancel: [] }>()
const editor = useEditorStore()

// ── Crop box (pixels relative to displayed image) ──────────────────────────────
interface Box { left: number; top: number; right: number; bottom: number }

const box = reactive<Box>({ left: 0, top: 0, right: props.imgWidth, bottom: props.imgHeight })

watch([() => props.imgWidth, () => props.imgHeight], () => {
  box.left = 0; box.top = 0
  box.right = props.imgWidth; box.bottom = props.imgHeight
}, { immediate: true })

// ── Aspect ratio ───────────────────────────────────────────────────────────────
interface PresetOption { id: AspectPreset; label: string; ratio: number | null }
const presetOptions: PresetOption[] = [
  { id: 'free', label: 'Free',  ratio: null },
  { id: '1:1',  label: '1∶1',  ratio: 1 },
  { id: '4:5',  label: '4∶5',  ratio: 4/5 },
  { id: '16:9', label: '16∶9', ratio: 16/9 },
  { id: '4:3',  label: '4∶3',  ratio: 4/3 },
  { id: '3:2',  label: '3∶2',  ratio: 3/2 },
]

const activeRatio = computed<number | null>(() => {
  if (editor.cropPreset !== 'free') return presetOptions.find(p => p.id === editor.cropPreset)?.ratio ?? null
  if (editor.cropLocked) return (box.right - box.left) / (box.bottom - box.top)
  return null
})

function setPreset(id: AspectPreset) {
  editor.setCropPreset(id)
  const ratio = presetOptions.find(p => p.id === id)?.ratio
  if (!ratio) return
  const cx = (box.left + box.right) / 2
  const cy = (box.top + box.bottom) / 2
  const w  = box.right - box.left
  const h  = box.bottom - box.top
  let nw = w, nh = h
  if (w / h > ratio) { nw = h * ratio } else { nh = w / ratio }
  box.left   = Math.max(0,              cx - nw / 2)
  box.top    = Math.max(0,              cy - nh / 2)
  box.right  = Math.min(props.imgWidth,  box.left + nw)
  box.bottom = Math.min(props.imgHeight, box.top  + nh)
}

// ── Drag handles ───────────────────────────────────────────────────────────────
type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move'
const MIN = 30

let drag: HandleId | null = null
let origin = { x: 0, y: 0, box: { ...box } }

const handles: { id: HandleId; cursor: string; posStyle: Record<string, string> }[] = [
  { id: 'nw', cursor: 'nw-resize', posStyle: { left: '-5px', top: '-5px' } },
  { id: 'n',  cursor: 'n-resize',  posStyle: { left: 'calc(50% - 5px)', top: '-5px' } },
  { id: 'ne', cursor: 'ne-resize', posStyle: { right: '-5px', top: '-5px' } },
  { id: 'e',  cursor: 'e-resize',  posStyle: { right: '-5px', top: 'calc(50% - 5px)' } },
  { id: 'se', cursor: 'se-resize', posStyle: { right: '-5px', bottom: '-5px' } },
  { id: 's',  cursor: 's-resize',  posStyle: { left: 'calc(50% - 5px)', bottom: '-5px' } },
  { id: 'sw', cursor: 'sw-resize', posStyle: { left: '-5px', bottom: '-5px' } },
  { id: 'w',  cursor: 'w-resize',  posStyle: { left: '-5px', top: 'calc(50% - 5px)' } },
]

function startDrag(e: PointerEvent, handle: HandleId) {
  e.preventDefault()
  drag   = handle
  origin = { x: e.clientX, y: e.clientY, box: { ...box } }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function startMove(e: PointerEvent) {
  e.preventDefault()
  drag   = 'move'
  origin = { x: e.clientX, y: e.clientY, box: { ...box } }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!drag) return
  const dx = e.clientX - origin.x
  const dy = e.clientY - origin.y
  const s  = origin.box
  const W  = props.imgWidth
  const H  = props.imgHeight
  const ratio = activeRatio.value
  let { left, top, right, bottom } = s

  if (drag === 'move') {
    const w = right - left, h = bottom - top
    left   = Math.max(0, Math.min(W - w, s.left + dx))
    top    = Math.max(0, Math.min(H - h, s.top  + dy))
    right  = left + w; bottom = top + h
  } else {
    if (drag.includes('w')) left   = Math.max(0, Math.min(right  - MIN, s.left   + dx))
    if (drag.includes('e')) right  = Math.min(W, Math.max(left   + MIN, s.right  + dx))
    if (drag.includes('n')) top    = Math.max(0, Math.min(bottom - MIN, s.top    + dy))
    if (drag.includes('s')) bottom = Math.min(H, Math.max(top    + MIN, s.bottom + dy))

    if (ratio) {
      const w = right - left, h = bottom - top
      if (drag === 'n' || drag === 's') {
        const nw = h * ratio, cx = (left + right) / 2
        left  = Math.max(0, cx - nw / 2)
        right = Math.min(W, left + nw)
      } else if (drag === 'e' || drag === 'w') {
        const nh = w / ratio, cy = (top + bottom) / 2
        top    = Math.max(0, cy - nh / 2)
        bottom = Math.min(H, top + nh)
      } else {
        if (Math.abs(dy) >= Math.abs(dx)) {
          const nh = bottom - top
          const nw = nh * ratio
          if (drag.includes('e')) right = Math.min(W, left  + nw)
          else                    left  = Math.max(0, right - nw)
        } else {
          const nw = right - left
          const nh = nw / ratio
          if (drag.includes('s')) bottom = Math.min(H, top    + nh)
          else                    top    = Math.max(0, bottom - nh)
        }
      }
    }
  }

  box.left = left; box.top = top; box.right = right; box.bottom = bottom
}

function stopDrag() { drag = null }

// ── Computed styles ────────────────────────────────────────────────────────────
const W = computed(() => props.imgWidth)
const H = computed(() => props.imgHeight)

const cropBoxStyle = computed(() => ({
  left:   `${box.left}px`,
  top:    `${box.top}px`,
  width:  `${box.right  - box.left}px`,
  height: `${box.bottom - box.top}px`,
}))

const shadeStyles = computed(() => ({
  top:    { left: '0',              top: '0',                width: W.value + 'px',                height: box.top + 'px' },
  bottom: { left: '0',              top: box.bottom + 'px',  width: W.value + 'px',                height: H.value - box.bottom + 'px' },
  left:   { left: '0',              top: box.top + 'px',     width: box.left + 'px',               height: box.bottom - box.top + 'px' },
  right:  { left: box.right + 'px', top: box.top + 'px',     width: W.value - box.right + 'px',    height: box.bottom - box.top + 'px' },
}))

function applyHandler() {
  emit('apply', {
    x: box.left   / W.value,
    y: box.top    / H.value,
    w: (box.right  - box.left) / W.value,
    h: (box.bottom - box.top)  / H.value,
  })
}
</script>

<template>
  <div
    class="crop-overlay"
    :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
    @pointermove="onPointerMove"
    @pointerup="stopDrag"
    @pointercancel="stopDrag"
  >
    <!-- Dark shading outside the crop area -->
    <div class="shade" :style="shadeStyles.top" />
    <div class="shade" :style="shadeStyles.bottom" />
    <div class="shade" :style="shadeStyles.left" />
    <div class="shade" :style="shadeStyles.right" />

    <!-- Crop box -->
    <div class="crop-box" :style="cropBoxStyle">
      <!-- Rule-of-thirds grid lines -->
      <div class="grid-h" style="top: 33.33%" />
      <div class="grid-h" style="top: 66.66%" />
      <div class="grid-v" style="left: 33.33%" />
      <div class="grid-v" style="left: 66.66%" />

      <!-- Move zone (drag the whole box) -->
      <div class="move-zone" @pointerdown="startMove" />

      <!-- 8 resize handles -->
      <div
        v-for="h in handles"
        :key="h.id"
        class="handle"
        :style="{ ...h.posStyle, cursor: h.cursor }"
        @pointerdown="startDrag($event, h.id)"
      />
    </div>

    <!-- Controls bar -->
    <Teleport to="#canvas-area-host">
    <div class="crop-controls">
      <!-- Aspect ratio presets -->
      <div class="preset-group">
        <button
          v-for="p in presetOptions"
          :key="p.id"
          class="preset-btn"
          :class="{ active: editor.cropPreset === p.id }"
          @click="setPreset(p.id)"
        >{{ p.label }}</button>
      </div>

      <!-- Lock toggle -->
      <button
        class="lock-btn"
        :class="{ active: editor.cropLocked }"
        :title="editor.cropLocked ? 'Unlock aspect ratio' : 'Lock current aspect ratio'"
        @click="editor.toggleCropLock()"
      >
        {{ editor.cropLocked ? '🔒' : '🔓' }}
      </button>

      <div class="spacer" />

      <!-- Cancel / Apply -->
      <button class="btn btn-secondary btn-small" @click="emit('cancel')">Cancel</button>
      <button class="btn btn-primary  btn-small" @click="applyHandler">Apply</button>
    </div>
    </Teleport>
  </div>
</template>

<style scoped>
.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  touch-action: none;
}

.shade {
  position: absolute;
  background: rgba(0, 0, 0, 0.55);
  pointer-events: none;
}

/* Crop box */
.crop-box {
  position: absolute;
  border: 1.5px solid #fff;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0); /* needed so shade divs don't overlap */
  cursor: default;
  box-sizing: border-box;
}

/* Rule-of-thirds lines */
.grid-h, .grid-v {
  position: absolute;
  background: rgba(255, 255, 255, 0.25);
  pointer-events: none;
}
.grid-h { left: 0; right: 0; height: 1px; }
.grid-v { top: 0; bottom: 0; width: 1px; }

/* Move zone (fills the box interior, below handles) */
.move-zone {
  position: absolute;
  inset: 8px;
  cursor: move;
}

/* Resize handles */
.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1.5px solid rgba(0,0,0,0.4);
  border-radius: 2px;
  z-index: 2;
}

/* Controls bar — pinned at top of canvas-area via Teleport */
.crop-controls {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  height: 40px;
  background: rgba(22, 33, 62, 0.92);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 6px;
  backdrop-filter: blur(4px);
  white-space: nowrap;
  z-index: 200;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.preset-group {
  display: flex;
  gap: 4px;
}

.preset-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-muted);
  font-size: 0.72rem;
  padding: 3px 7px;
  cursor: pointer;
  transition: all var(--transition);
}

.preset-btn:hover  { border-color: var(--color-muted); color: var(--color-text); }
.preset-btn.active { border-color: var(--color-accent); color: var(--color-accent); }

.lock-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 3px 7px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: border-color var(--transition);
}
.lock-btn:hover  { border-color: var(--color-muted); }
.lock-btn.active { border-color: var(--color-accent); }

.spacer { flex: 1; }

@media (max-width: 639px) {
  .crop-controls {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
    height: auto;
    flex-wrap: wrap;
    gap: 4px;
    padding: 6px 8px;
  }
}
</style>
