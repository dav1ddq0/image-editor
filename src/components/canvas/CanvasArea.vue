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
import CropOverlay from './CropOverlay.vue'
import type { CropRect } from '@/types/editor'

const editor = useEditorStore()

const isCropping   = computed(() => editor.selectedTool === 'crop' && editor.hasImage)
const isZooming    = computed(() => editor.selectedTool === 'zoom' && editor.hasImage)
const containerRef = ref<HTMLDivElement>()
const imgRef       = ref<HTMLImageElement>()
const displayW     = ref(0)
const displayH     = ref(0)
let resizeObs: ResizeObserver | null = null

// When a new image is loaded, auto-calculate a zoom level that fits it in the
// container (never upscaling beyond 100%).
watch(() => editor.image, async (img) => {
  if (!img) return
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

watch(isCropping, (active) => {
  if (active && imgRef.value) {
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
</style>
