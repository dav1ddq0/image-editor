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
import { scanQrCode }          from '@/utils/qrScanner'
import { scanBarcode }         from '@/utils/barcodeScanner'
import { convertImageToAscii, type ColorChar } from '@/utils/asciiConverter'
import { isModelLoaded, loadModel, runOcr, type TextRegion  } from '@/utils/textExtractor'
import AppNavbar         from './navbar/AppNavbar.vue'
import AppToolbar        from './toolbar/AppToolbar.vue'
import CanvasArea        from './canvas/CanvasArea.vue'
import RightPanel        from './panels/RightPanel.vue'
import ExportDialog      from './export/ExportDialog.vue'
import QrScanDialog      from './qr/QrScanDialog.vue'
import BarcodeScanDialog from './barcode/BarcodeScanDialog.vue'
import AsciiArtDialog    from './ascii/AsciiArtDialog.vue'
import ExtractTextDialog from './ocr/ExtractTextDialog.vue'
import type { ExportOptions } from '@/types/editor'

const editor = useEditorStore()
const showExportDialog = ref(false)
const panelOpen        = ref(false)

// ── QR Scanner ──────────────────────────────────────────────────────────────
const showQrDialog = ref(false)
const qrState      = ref<'scanning' | 'found' | 'not-found'>('scanning')
const qrText       = ref('')

async function scanQr(): Promise<void> {
  if (!editor.image) return
  qrState.value      = 'scanning'
  showQrDialog.value = true
  const result = await scanQrCode(editor.image.src, {
    cssFilter: editor.cssFilter,
    rotation:  editor.rotation,
    flipH:     editor.flipH,
    flipV:     editor.flipV,
    sharpness: editor.adjustments.sharpness,
  })
  if (result) {
    qrText.value  = result
    qrState.value = 'found'
  } else {
    qrState.value = 'not-found'
  }
}

// ── ASCII Art ────────────────────────────────────────────────────────────────
const showAsciiDialog  = ref(false)
const asciiState       = ref<'generating' | 'done'>('generating')
const asciiText        = ref('')
const asciiColorLines  = ref<ColorChar[][]>([])
const asciiCols        = ref(120)
const asciiMoreLevels  = ref(true)
const asciiBlockChars  = ref(false)

async function generateAsciiArt(cols: number, moreLevels: boolean, blockChars: boolean): Promise<void> {
  if (!editor.image) return
  asciiCols.value       = cols
  asciiMoreLevels.value = moreLevels
  asciiBlockChars.value = blockChars
  asciiState.value      = 'generating'
  showAsciiDialog.value = true

  const img = new Image()
  img.onload = () => {
    const canvas          = buildCanvas(img)
    const result          = convertImageToAscii(canvas, { cols, scale: 0.55, moreLevels, blockChars })
    asciiText.value       = result.text
    asciiColorLines.value = result.colorLines
    asciiState.value      = 'done'
  }
  img.src = editor.image.src
}

// ── Text Extractor ───────────────────────────────────────────────────────────
const showOcrDialog = ref(false)
const ocrState      = ref<'loading-model' | 'extracting' | 'found' | 'not-found'>('extracting')
const ocrText       = ref('')
const ocrRegions    = ref<TextRegion[]>([])
const ocrImageSrc   = ref('')
const ocrProgress   = ref(0)

async function extractText(): Promise<void> {
  if (!editor.image) return
  ocrState.value      = isModelLoaded() ? 'extracting' : 'loading-model'
  ocrProgress.value   = 0
  showOcrDialog.value = true

  const img = new Image()
  img.onload = async () => {
    const canvas      = buildCanvas(img)
    ocrImageSrc.value = canvas.toDataURL('image/jpeg', 0.92)

    if (!isModelLoaded()) {
      await loadModel(pct => {
        ocrProgress.value = pct
        ocrState.value    = 'loading-model'
      })
    }

    ocrState.value = 'extracting'
    const result   = await runOcr(canvas)
    if (result) {
      ocrText.value    = result.text
      ocrRegions.value = result.regions
      ocrState.value   = 'found'
    } else {
      ocrState.value = 'not-found'
    }
  }
  img.src = editor.image.src
}

// ── Barcode Scanner ─────────────────────────────────────────────────────────
const showBarcodeDialog = ref(false)
const barcodeState      = ref<'scanning' | 'found' | 'not-found'>('scanning')
const barcodeText       = ref('')

async function scanBarcodeImage(): Promise<void> {
  if (!editor.image) return
  barcodeState.value      = 'scanning'
  showBarcodeDialog.value = true
  const result = await scanBarcode(editor.image.src, {
    cssFilter: editor.cssFilter,
    rotation:  editor.rotation,
    flipH:     editor.flipH,
    flipV:     editor.flipV,
    sharpness: editor.adjustments.sharpness,
  })
  if (result) {
    barcodeText.value  = result
    barcodeState.value = 'found'
  } else {
    barcodeState.value = 'not-found'
  }
}

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
    <AppNavbar
      :has-image="editor.hasImage"
      @open="openImage"
      @save="saveImage"
      @export="showExportDialog = true"
      @scan-qr="scanQr"
      @scan-barcode="scanBarcodeImage"
      @ascii-art="generateAsciiArt(asciiCols, asciiMoreLevels, asciiBlockChars)"
      @extract-text="extractText"
      @toggle-panel="panelOpen = !panelOpen"
    />

    <div class="editor-body">
      <AppToolbar />
      <CanvasArea />
      <RightPanel :panel-open="panelOpen" @close-panel="panelOpen = false" />
    </div>

    <!-- Mobile backdrop: closes the panel when tapped -->
    <div v-if="panelOpen" class="panel-backdrop" @click="panelOpen = false" />

    <ExportDialog
      v-model:visible="showExportDialog"
      :default-name="editor.image?.name ?? 'image'"
      @export="exportImage"
    />

    <QrScanDialog
      v-model:visible="showQrDialog"
      :state="qrState"
      :text="qrText"
    />

    <BarcodeScanDialog
      v-model:visible="showBarcodeDialog"
      :state="barcodeState"
      :text="barcodeText"
    />

    <ExtractTextDialog
      v-model:visible="showOcrDialog"
      :state="ocrState"
      :text="ocrText"
      :regions="ocrRegions"
      :image-src="ocrImageSrc"
      :progress="ocrProgress"
    />

    <AsciiArtDialog
      v-model:visible="showAsciiDialog"
      :state="asciiState"
      :text="asciiText"
      :color-lines="asciiColorLines"
      :cols="asciiCols"
      :more-levels="asciiMoreLevels"
      @regenerate="(cols, moreLevels, blockChars) => generateAsciiArt(cols, moreLevels, blockChars)"
    />
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Backdrop behind the right-panel overlay (phone + tablet-portrait) */
.panel-backdrop {
  display: none;
}

/* Panel is a slide-in sheet up to 1024px (phones + iPad portrait) */
@media (max-width: 1024px) {
  .panel-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
}

/* Phones only: stack the toolbar below the canvas */
@media (max-width: 639px) {
  .editor-body {
    flex-direction: column;
  }
}
</style>
