<!--
  ImageEditor.vue
  Root layout component. Composes the top-level page structure and handles
  file open and save/export operations on behalf of the child components.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import AppNavbar  from './navbar/AppNavbar.vue'
import AppToolbar from './toolbar/AppToolbar.vue'
import CanvasArea from './canvas/CanvasArea.vue'
import RightPanel from './panels/RightPanel.vue'

const editor = useEditorStore()

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

function saveImage(): void {
  if (!editor.image) return

  const source   = editor.image
  const rotation = editor.rotation
  const img      = new Image()

  img.onload = () => {
    const w = img.naturalWidth
    const h = img.naturalHeight

    // When rotated 90° or 270° the output dimensions are swapped
    const isOdd    = rotation === 90 || rotation === 270
    const canvas   = document.createElement('canvas')
    canvas.width   = isOdd ? h : w
    canvas.height  = isOdd ? w : h

    const ctx = canvas.getContext('2d')!

    // Apply filter first so it is baked into the exported pixels
    ctx.filter = editor.cssFilter || 'none'

    // Translate to canvas center, rotate, then apply flip scales
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(editor.flipH ? -1 : 1, editor.flipV ? -1 : 1)

    // Draw the image centered at the (now transformed) origin
    ctx.drawImage(img, -w / 2, -h / 2)

    // ctx.filter does not support url() SVG references, so sharpness is
    // applied via a JS convolution pass after the image is drawn
    ctx.setTransform(1, 0, 0, 1, 0, 0) // reset transform before pixel manipulation
    applySharpen(ctx, editor.adjustments.sharpness)

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
</script>

<template>
  <div class="editor-layout">
    <AppNavbar @open="openImage" @save="saveImage" />

    <div class="editor-body">
      <AppToolbar />
      <CanvasArea />
      <RightPanel />
    </div>
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
