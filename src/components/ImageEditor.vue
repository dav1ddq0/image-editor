<!--
  ImageEditor.vue
  Root layout component. Composes the top-level page structure and handles
  file open and save/export operations on behalf of the child components.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { jsPDF } from 'jspdf'
import { useEditorStore } from '@/stores/editorStore'
import AppNavbar    from './navbar/AppNavbar.vue'
import AppToolbar   from './toolbar/AppToolbar.vue'
import CanvasArea   from './canvas/CanvasArea.vue'
import RightPanel   from './panels/RightPanel.vue'
import ExportDialog from './export/ExportDialog.vue'
import type { ExportOptions } from '@/types/editor'

const editor = useEditorStore()
const showExportDialog = ref(false)

function openImage(): void {
  // A transient <input type="file"> is created in memory and never appended to
  // the DOM — this is the standard technique for triggering the OS file picker
  // programmatically without a persistent element in the template.
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) editor.loadImage(file)
  }

  input.click()
}

// Applies a 3×3 sharpen convolution to the canvas in-place.
// Mirrors the SVG feConvolveMatrix kernel used for the live preview.
function applySharpen(ctx: CanvasRenderingContext2D, amount: number): void {
  if (amount <= 0) return

  const s      = amount / 50
  const kernel = [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0]
  const { width, height } = ctx.canvas
  const src    = ctx.getImageData(0, 0, width, height)
  const dst    = ctx.createImageData(width, height)
  const s0     = src.data
  const d0     = dst.data

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4
      for (let c = 0; c < 3; c++) {
        let v = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            v += s0[((y + ky) * width + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        d0[i + c] = Math.min(255, Math.max(0, v))
      }
      d0[i + 3] = s0[i + 3] // preserve alpha
    }
  }

  ctx.putImageData(dst, 0, 0)
}

// Builds the fully composited canvas (filters + transform + sharpness).
// Used by both Save and Export so the output is always identical.
function buildCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const w        = img.naturalWidth
  const h        = img.naturalHeight
  const rotation = editor.rotation
  const isOdd    = rotation === 90 || rotation === 270

  const canvas  = document.createElement('canvas')
  canvas.width  = isOdd ? h : w
  canvas.height = isOdd ? w : h

  const ctx = canvas.getContext('2d')!

  ctx.filter = editor.cssFilter || 'none'
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(editor.flipH ? -1 : 1, editor.flipV ? -1 : 1)
  ctx.drawImage(img, -w / 2, -h / 2)

  // ctx.filter does not support url() SVG references, so sharpness is
  // applied via a JS convolution pass after the image is drawn
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  applySharpen(ctx, editor.adjustments.sharpness)

  return canvas
}

function saveImage(): void {
  if (!editor.image) return
  const source = editor.image
  const img    = new Image()

  img.onload = () => {
    const canvas = buildCanvas(img)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = source.name
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  img.src = source.src
}

function exportImage(options: ExportOptions): void {
  if (!editor.image) return
  const img = new Image()

  img.onload = () => {
    const canvas = buildCanvas(img)

    if (options.format === 'pdf') {
      const dataUrl    = canvas.toDataURL('image/jpeg', 0.92)
      const isLandscape = canvas.width > canvas.height
      const pdf        = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit:        'px',
        format:      [canvas.width, canvas.height],
      })
      pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height)
      pdf.save(options.fileName)
      return
    }

    const mimeType = `image/${options.format}`
    // quality must be in 0–1 range for canvas API
    const quality  = options.format === 'png' ? undefined : options.quality / 100

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = options.fileName
      a.click()
      URL.revokeObjectURL(url)
    }, mimeType, quality)
  }

  img.src = editor.image.src
}
</script>

<template>
  <div class="editor-layout">
    <AppNavbar @open="openImage" @save="saveImage" @export="showExportDialog = true" />

    <div class="editor-body">
      <AppToolbar />
      <CanvasArea />
      <RightPanel />
    </div>

    <ExportDialog
      v-model:visible="showExportDialog"
      :default-name="editor.image?.name ?? 'image'"
      @export="exportImage"
    />
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
