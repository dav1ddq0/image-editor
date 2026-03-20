<!--
  CanvasArea.vue
  Central workspace. Shows CanvasDropZone when no image is loaded, the image
  itself once one is available, and CanvasStatusBar at the bottom.
-->
<script setup lang="ts">
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import CanvasDropZone  from './CanvasDropZone.vue'
import CanvasStatusBar from './CanvasStatusBar.vue'
import CropOverlay      from './CropOverlay.vue'
import TextOverlay      from './TextOverlay.vue'
import SelectionOverlay from './SelectionOverlay.vue'
import BrushOverlay     from './BrushOverlay.vue'
import EraserOverlay    from './EraserOverlay.vue'
import FillOverlay      from './FillOverlay.vue'
import ShapesOverlay    from './ShapesOverlay.vue'
import type { CropRect, TextLayer } from '@/types/editor'
import { getAutoTextColor } from '@/utils/colorAnalysis'
import { buildRenderedCanvas } from '@/utils/canvasRenderer'
import { floodFill, hexToRgba } from '@/utils/floodFill'

const editor = useEditorStore()

const isCropping   = computed(() => editor.selectedTool === 'crop'   && editor.hasImage)
const isZooming    = computed(() => editor.selectedTool === 'zoom'   && editor.hasImage)
const isTexting    = computed(() => editor.selectedTool === 'text'   && editor.hasImage)
const isSelecting  = computed(() => editor.selectedTool === 'select' && editor.hasImage)
const isBrushing   = computed(() => editor.selectedTool === 'brush'  && editor.hasImage)
const isErasing    = computed(() => editor.selectedTool === 'eraser' && editor.hasImage)
const isFilling    = computed(() => editor.selectedTool === 'fill'   && editor.hasImage)
const isShaping    = computed(() => editor.selectedTool === 'shapes' && editor.hasImage)
const containerRef = ref<HTMLDivElement>()
const imgRef       = ref<HTMLImageElement>()
const displayW     = ref(0)
const displayH     = ref(0)
let resizeObs: ResizeObserver | null = null

// Auto-calculate zoom-to-fit only on initial image load or when image dimensions
// change (e.g. after crop). Skips the reset for brush/eraser/shapes/text/fill
// operations where dimensions stay the same, so the user's current zoom is preserved.
watch(() => editor.image, async (img, prevImg) => {
  if (!img) return
  // If dimensions are unchanged this is a paint/filter operation — keep current zoom.
  if (prevImg && img.width === prevImg.width && img.height === prevImg.height) return
  await nextTick()
  if (!containerRef.value) return
  const { clientWidth: cw, clientHeight: ch } = containerRef.value
  const padding = 40
  const fitScale = Math.min((cw - padding) / img.width, (ch - padding) / img.height, 1)
  editor.setZoom(Math.round(fitScale * 100))
})

// Drives the explicit pixel width set on <img>. Height follows via auto.
const imgPixelWidth = computed(() =>
  editor.image ? Math.round(editor.image.width * editor.zoom / 100) : 0
)

function updateDisplaySize(): void {
  if (imgRef.value) {
    displayW.value = imgRef.value.offsetWidth
    displayH.value = imgRef.value.offsetHeight
  }
}

watch([isCropping, isTexting, isSelecting, isBrushing, isErasing, isFilling, isShaping], ([cropping, texting, selecting, brushing, erasing, filling, shaping]) => {
  if ((cropping || texting || selecting || brushing || erasing || filling || shaping) && imgRef.value) {
    resizeObs = new ResizeObserver(updateDisplaySize)
    resizeObs.observe(imgRef.value)
    updateDisplaySize()
  } else {
    resizeObs?.disconnect()
    resizeObs = null
  }
})

onUnmounted(() => resizeObs?.disconnect())

function handleCropApply(rect: CropRect): void {
  editor.applyCrop(rect)
}

function handleTextApply(layer: TextLayer): void {
  editor.applyText(layer)
}

function handleSelectionCrop(rect: CropRect): void {
  editor.applyCrop(rect)
}

function handleSelectionClear(rect: CropRect): void {
  editor.applyClearSelection(rect)
}


// Shared compositing helper. Draws the overlay canvas synchronously onto the
// rendered image. Fully synchronous — toDataURL is used instead of toBlob so
// there is no async callback that can silently fail.
function compositeOverlay(
  overlayCanvas: HTMLCanvasElement,
  mode: GlobalCompositeOperation,
  save: (src: string, w: number, h: number) => void,
): void {
  if (!editor.image || !imgRef.value) return
  const rendered = buildRenderedCanvas(imgRef.value, {
    cssFilter: editor.cssFilter,
    rotation:  editor.rotation,
    flipH:     editor.flipH,
    flipV:     editor.flipV,
    sharpness: editor.adjustments.sharpness,
  })
  const output = document.createElement('canvas')
  output.width  = rendered.width
  output.height = rendered.height
  const ctx = output.getContext('2d')!
  ctx.drawImage(rendered, 0, 0)
  ctx.globalCompositeOperation = mode
  ctx.drawImage(overlayCanvas, 0, 0, output.width, output.height)
  ctx.globalCompositeOperation = 'source-over'
  // toDataURL is synchronous — no async callback, no silent null-blob failure.
  const dataUrl = output.toDataURL('image/png')
  save(dataUrl, output.width, output.height)
}

function handleBrushApply(canvas: HTMLCanvasElement): void {
  compositeOverlay(canvas, 'source-over', editor.saveBrushResult)
}

function handleEraserApply(canvas: HTMLCanvasElement): void {
  compositeOverlay(canvas, 'destination-out', editor.saveBrushResult)
}

function handleShapesApply(canvas: HTMLCanvasElement): void {
  compositeOverlay(canvas, 'source-over', editor.saveShapesResult)
}

function handleFill(nx: number, ny: number, color: string, tolerance: number): void {
  if (!editor.image || !imgRef.value) return
  const rendered = buildRenderedCanvas(imgRef.value, {
    cssFilter: editor.cssFilter,
    rotation:  editor.rotation,
    flipH:     editor.flipH,
    flipV:     editor.flipV,
    sharpness: editor.adjustments.sharpness,
  })
  const ctx       = rendered.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, rendered.width, rendered.height)
  const [cx, cy]  = editor.mapDisplayToCanvas(
    nx, ny,
    editor.rotation, editor.flipH, editor.flipV,
    editor.image.width, editor.image.height,
  )
  floodFill(imageData.data, rendered.width, rendered.height, cx, cy, hexToRgba(color), tolerance)
  ctx.putImageData(imageData, 0, 0)
  const dataUrl = rendered.toDataURL('image/png')
  editor.saveFillResult(dataUrl, rendered.width, rendered.height)
}

// Resolved auto-contrast color; computed before TextOverlay mounts so the
// initial color is correct without a visible flicker.
const autoTextColor  = ref<'#ffffff' | '#000000'>('#ffffff')
const textColorReady = ref(false)

watch(isTexting, async (active) => {
  if (active && editor.image) {
    textColorReady.value = false
    autoTextColor.value  = await getAutoTextColor(editor.image.src)
    textColorReady.value = true
  } else {
    textColorReady.value = false
  }
})

// Mouse-wheel zooms the image; each notch = 10 pp, clamped in the store.
function onWheel(e: WheelEvent): void {
  if (!editor.hasImage) return
  e.preventDefault()
  editor.setZoom(editor.zoom + (e.deltaY < 0 ? 10 : -10))
}

// Left-click with the zoom tool zooms in; Shift+click zooms out.
function onContainerClick(e: MouseEvent): void {
  if (!isZooming.value) return
  if (e.shiftKey) editor.zoomOut()
  else            editor.zoomIn()
}

// Builds the 3×3 unsharp-mask kernel string for feConvolveMatrix.
// Kernel: [ 0  -s  0 / -s  1+4s  -s / 0  -s  0 ] (divisor = 1, sum = 1 → no brightness shift)
// At s=0 this is the identity kernel; higher s = stronger edge enhancement.
const sharpenKernel = computed<string>(() => {
  const s = editor.adjustments.sharpness / 50 // 0-100 → 0-2
  return `0 ${-s} 0 ${-s} ${1 + 4 * s} ${-s} 0 ${-s} 0`
})
</script>

<template>
  <main class="canvas-area">

    <!--
      Hidden SVG that declares the reactive sharpen filter.
      CSS filter: url(#image-sharpen) references this by ID.
      The kernel is updated reactively so the preview responds to the slider in real time.
    -->
    <svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;">
      <defs>
        <filter id="image-sharpen" x="0%" y="0%" width="100%" height="100%"
                color-interpolation-filters="linearRGB">
          <feConvolveMatrix order="3" :kernelMatrix="sharpenKernel"
                            divisor="1" bias="0" edgeMode="duplicate" />
        </filter>
      </defs>
    </svg>

    <div
      ref="containerRef"
      class="canvas-container"
      :class="{ 'cursor-zoom-in': isZooming }"
      @wheel.prevent="onWheel"
      @click="onContainerClick"
    >
      <CanvasDropZone v-if="!editor.hasImage" />

      <!--
        .image-center stretches to fill the scrollable container and centers the
        image when it is smaller than the viewport; when larger the container scrolls.
      -->
      <div v-else class="image-center">
        <div class="image-wrapper">
          <img
            ref="imgRef"
            :src="editor.image.src"
            :alt="editor.image.name"
            :style="{
              width:     imgPixelWidth + 'px',
              filter:    editor.cssFilter,
              transform: editor.cssTransform,
            }"
            class="canvas-image"
            @load="updateDisplaySize"
          />
          <CropOverlay
            v-if="isCropping && displayW > 0"
            :img-width="displayW"
            :img-height="displayH"
            @apply="handleCropApply"
            @cancel="editor.selectTool('select')"
          />
          <TextOverlay
            v-if="isTexting && displayW > 0 && textColorReady"
            :img-width="displayW"
            :img-height="displayH"
            :default-color="autoTextColor"
            @apply="handleTextApply"
            @cancel="editor.selectTool('select')"
          />
          <SelectionOverlay
            v-if="isSelecting && displayW > 0"
            :img-width="displayW"
            :img-height="displayH"
            @crop="handleSelectionCrop"
            @clear="handleSelectionClear"
            @cancel="editor.selectTool('select')"
          />
          <BrushOverlay
            v-if="isBrushing && displayW > 0"
            :img-width="displayW"
            :img-height="displayH"
            @apply="handleBrushApply"
            @cancel="editor.selectTool('select')"
          />
          <EraserOverlay
            v-if="isErasing && displayW > 0"
            :img-width="displayW"
            :img-height="displayH"
            @apply="handleEraserApply"
            @cancel="editor.selectTool('select')"
          />
          <FillOverlay
            v-if="isFilling && displayW > 0"
            :img-width="displayW"
            :img-height="displayH"
            @fill="handleFill"
            @cancel="editor.selectTool('select')"
          />
          <ShapesOverlay
            v-if="isShaping && displayW > 0"
            :img-width="displayW"
            :img-height="displayH"
            @apply="handleShapesApply"
            @cancel="editor.selectTool('select')"
          />
        </div>
      </div>
    </div>

    <!--
      Optional chaining on editor.image because image is null before any file is
      loaded; CanvasStatusBar accepts null props and renders fallback text.
    -->
    <CanvasStatusBar
      :image-width="editor.image?.width"
      :image-height="editor.image?.height"
      :image-name="editor.image?.name"
    />

  </main>
</template>

<style scoped>
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.cursor-zoom-in { cursor: zoom-in; }

/* Fills the scrollable area and centers the image when smaller than the viewport */
.image-center {
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-image {
  display: block;
  /* Width is set explicitly via inline style; height follows aspect ratio */
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6);
}

.image-wrapper {
  position: relative;
  display: inline-block;
  line-height: 0;
}

@media (max-width: 639px) {
  .canvas-area { order: 1; }
  .canvas-container { padding: 12px; }
}
</style>
