<!--
  ImageEditor.vue
  Root layout component. Composes the top-level page structure and handles
  file open and save/export operations on behalf of the child components.
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { jsPDF } from 'jspdf'
import { useEditorStore } from '@/stores/editorStore'
import { buildRenderedCanvas } from '@/utils/canvasRenderer'
import AppNavbar    from './navbar/AppNavbar.vue'
import AppToolbar   from './toolbar/AppToolbar.vue'
import CanvasArea   from './canvas/CanvasArea.vue'
import RightPanel   from './panels/RightPanel.vue'
import ExportDialog from './export/ExportDialog.vue'
import type { ExportOptions } from '@/types/editor'

const editor = useEditorStore()
const showExportDialog = ref(false)

function onKeyDown(e: KeyboardEvent): void {
  if (!e.ctrlKey && !e.metaKey) return
  if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); editor.undo() }
  if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); editor.redo() }
}

onMounted(()   => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

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

// Builds the fully composited canvas (filters + transform + sharpness).
// Used by both Save and Export so the output is always identical.
function buildCanvas(img: HTMLImageElement): HTMLCanvasElement {
  return buildRenderedCanvas(img, {
    cssFilter: editor.cssFilter,
    rotation:  editor.rotation,
    flipH:     editor.flipH,
    flipV:     editor.flipV,
    sharpness: editor.adjustments.sharpness,
  })
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
