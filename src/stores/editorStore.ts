/*
 * editorStore.ts
 * Single source of truth for the image editor: active tool, zoom, loaded image,
 * filter preset, and all adjustment values.
 */

import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ToolId, FilterId, ImageDescriptor, Adjustments, AdjustmentKey, AspectPreset, CropRect, TextLayer } from '@/types/editor'
import { buildRenderedCanvas } from '@/utils/canvasRenderer'

// Internal snapshot type — not part of the public API
interface HistorySnapshot {
  image:          ImageDescriptor
  rotation:       number
  flipH:          boolean
  flipV:          boolean
  selectedFilter: FilterId
  adjustments:    Adjustments
}

const MAX_HISTORY = 50

export const useEditorStore = defineStore('editor', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  const selectedTool   = ref<ToolId>('select')
  const zoom           = ref<number>(100)
  const image          = ref<ImageDescriptor | null>(null)
  const originalImage  = ref<ImageDescriptor | null>(null)
  const selectedFilter = ref<FilterId>('none')

  // rotation is always a multiple of 90, stored in degrees (0 | 90 | 180 | 270)
  const rotation = ref<number>(0)
  const flipH    = ref<boolean>(false)
  const flipV    = ref<boolean>(false)

  const cropPreset = ref<AspectPreset>('free')
  const cropLocked = ref<boolean>(false)

  const adjustments = reactive<Adjustments>({
    brightness: 0,
    contrast:   0,
    saturation: 0,
    sharpness:  0,
    blur:       0,
  })

  // ── History ────────────────────────────────────────────────────────────────

  const undoStack = ref<HistorySnapshot[]>([])
  const redoStack = ref<HistorySnapshot[]>([])

  const canUndo = computed<boolean>(() => undoStack.value.length > 0)
  const canRedo = computed<boolean>(() => redoStack.value.length > 0)

  function captureSnapshot(): HistorySnapshot {
    return {
      image:          { ...image.value! },
      rotation:       rotation.value,
      flipH:          flipH.value,
      flipV:          flipV.value,
      selectedFilter: selectedFilter.value,
      adjustments:    { ...adjustments },
    }
  }

  // Pushes current state onto the undo stack and clears redo.
  // Called at the START of every mutating action (before the change).
  function pushHistory(): void {
    if (!image.value) return
    undoStack.value.push(captureSnapshot())
    if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift()
    redoStack.value = []
  }

  function applySnapshot(s: HistorySnapshot): void {
    image.value          = s.image
    rotation.value       = s.rotation
    flipH.value          = s.flipH
    flipV.value          = s.flipV
    selectedFilter.value = s.selectedFilter
    Object.assign(adjustments, s.adjustments)
  }

  function undo(): void {
    if (!canUndo.value) return
    redoStack.value.push(captureSnapshot())
    applySnapshot(undoStack.value.pop()!)
  }

  function redo(): void {
    if (!canRedo.value) return
    undoStack.value.push(captureSnapshot())
    applySnapshot(redoStack.value.pop()!)
  }

  // Called by AdjustmentSlider on pointerdown — takes ONE snapshot per drag
  // gesture so continuous slider moves don't flood the undo stack.
  function beginAdjustment(): void {
    pushHistory()
  }

  // ── Getters (computed) ─────────────────────────────────────────────────────

  const hasImage = computed<boolean>(() => !!image.value)

  // Combines rotation and flip into a single CSS transform string
  const cssTransform = computed<string>(() => {
    const parts: string[] = []
    if (rotation.value !== 0)  parts.push(`rotate(${rotation.value}deg)`)
    if (flipH.value)           parts.push('scaleX(-1)')
    if (flipV.value)           parts.push('scaleY(-1)')
    return parts.join(' ')
  })

  // Builds the CSS filter string applied to the canvas image.
  // Preset filters are combined with the numeric adjustment sliders so both
  // work simultaneously and react to each other in real time.
  const cssFilter = computed<string>(() => {
    const parts: string[] = []

    const presetMap: Record<FilterId, string> = {
      none:      '',
      sepia:     'sepia(1)',
      grayscale: 'grayscale(1)',
      // vivid/cool/warm simulate the effect with saturation + hue shifts
      vivid:     'saturate(1.8) contrast(1.1)',
      cool:      'hue-rotate(200deg) saturate(1.1)',
      warm:      'sepia(0.3) saturate(1.4)',
    }

    const preset = presetMap[selectedFilter.value]
    if (preset) parts.push(preset)

    // Store range is -100…100; CSS expects a multiplier around 1.0
    if (adjustments.brightness !== 0)
      parts.push(`brightness(${1 + adjustments.brightness / 100})`)
    if (adjustments.contrast !== 0)
      parts.push(`contrast(${1 + adjustments.contrast / 100})`)
    if (adjustments.saturation !== 0)
      parts.push(`saturate(${1 + adjustments.saturation / 100})`)
    if (adjustments.blur !== 0)
      parts.push(`blur(${(adjustments.blur / 10).toFixed(1)}px)`)

    // url() references the SVG feConvolveMatrix filter defined in CanvasArea.vue
    if (adjustments.sharpness > 0)
      parts.push('url(#image-sharpen)')

    return parts.join(' ')
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  function selectTool(tool: ToolId): void {
    selectedTool.value = tool
  }

  function loadImage(file: File): void {
    const url = URL.createObjectURL(file)
    // Blob URL is intentionally never revoked — it is the canonical image source
    // for the lifetime of the session and must remain valid for the <img> element.

    const img = new Image()

    img.onload = () => {
      // Clear history when a new image is loaded — undo/redo is per-image.
      undoStack.value = []
      redoStack.value = []

      const descriptor: ImageDescriptor = {
        src:    url,
        width:  img.naturalWidth,
        height: img.naturalHeight,
        name:   file.name,
      }
      image.value         = descriptor
      originalImage.value = descriptor
    }

    img.src = url
  }

  function updateAdjustment(key: AdjustmentKey, value: number): void {
    // Number() cast guards against string values emitted by HTML range inputs.
    // History is NOT pushed here; beginAdjustment() handles that on pointerdown.
    adjustments[key] = Number(value)
  }

  function rotateLeft(): void {
    pushHistory()
    rotation.value = (rotation.value - 90 + 360) % 360
  }

  function rotateRight(): void {
    pushHistory()
    rotation.value = (rotation.value + 90) % 360
  }

  function flipHorizontal(): void {
    pushHistory()
    flipH.value = !flipH.value
  }

  function flipVertical(): void {
    pushHistory()
    flipV.value = !flipV.value
  }

  function selectFilter(filter: FilterId): void {
    pushHistory()
    selectedFilter.value = filter
  }

  function setZoom(value: number): void {
    zoom.value = Math.min(500, Math.max(10, Math.round(value)))
  }

  function zoomIn(): void  { setZoom(zoom.value + 25) }
  function zoomOut(): void { setZoom(zoom.value - 25) }
  function zoomReset(): void { zoom.value = 100 }

  function applyCrop(normalizedRect: CropRect): void {
    if (!image.value) return
    // Snapshot before the async crop so it can be undone.
    pushHistory()
    const source = image.value
    const renderOpts = {
      cssFilter: cssFilter.value,
      rotation:  rotation.value,
      flipH:     flipH.value,
      flipV:     flipV.value,
      sharpness: adjustments.sharpness,
    }
    const img = new Image()
    img.onload = () => {
      const rendered = buildRenderedCanvas(img, renderOpts)
      const cropX = Math.round(normalizedRect.x * rendered.width)
      const cropY = Math.round(normalizedRect.y * rendered.height)
      const cropW = Math.round(normalizedRect.w * rendered.width)
      const cropH = Math.round(normalizedRect.h * rendered.height)
      const output = document.createElement('canvas')
      output.width  = cropW
      output.height = cropH
      output.getContext('2d')!.drawImage(rendered, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
      output.toBlob((blob) => {
        if (!blob) return
        // Do NOT revoke source.src — it may still be referenced by a history entry.
        image.value = { src: URL.createObjectURL(blob), width: cropW, height: cropH, name: source.name }
        // Reset all effects since they are now baked into the new image
        rotation.value = 0
        flipH.value    = false
        flipV.value    = false
        Object.assign(adjustments, { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, blur: 0 })
        selectedFilter.value = 'none'
        selectedTool.value   = 'select'
      }, 'image/png')
    }
    img.src = source.src
  }

  function setCropPreset(p: AspectPreset): void { cropPreset.value = p }
  function toggleCropLock(): void { cropLocked.value = !cropLocked.value }

  // Fills the selected region with transparency (alpha = 0) and bakes all effects.
  function applyClearSelection(normalizedRect: CropRect): void {
    if (!image.value) return
    pushHistory()
    const source = image.value
    const renderOpts = {
      cssFilter: cssFilter.value,
      rotation:  rotation.value,
      flipH:     flipH.value,
      flipV:     flipV.value,
      sharpness: adjustments.sharpness,
    }
    const img = new Image()
    img.onload = () => {
      const canvas = buildRenderedCanvas(img, renderOpts)
      const ctx    = canvas.getContext('2d')!
      const x = Math.round(normalizedRect.x * canvas.width)
      const y = Math.round(normalizedRect.y * canvas.height)
      const w = Math.round(normalizedRect.w * canvas.width)
      const h = Math.round(normalizedRect.h * canvas.height)
      ctx.clearRect(x, y, w, h)
      canvas.toBlob((blob) => {
        if (!blob) return
        image.value = { src: URL.createObjectURL(blob), width: canvas.width, height: canvas.height, name: source.name }
        rotation.value       = 0
        flipH.value          = false
        flipV.value          = false
        selectedFilter.value = 'none'
        selectedTool.value   = 'select'
        Object.assign(adjustments, { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, blur: 0 })
      }, 'image/png')
    }
    img.src = source.src
  }

  // Restores the original loaded image and resets every non-destructive edit.
  function resetImage(): void {
    if (!originalImage.value) return
    pushHistory()
    // Spread into a new object so CanvasArea's image watcher always fires and re-fits zoom.
    image.value          = { ...originalImage.value }
    rotation.value       = 0
    flipH.value          = false
    flipV.value          = false
    selectedFilter.value = 'none'
    selectedTool.value   = 'select'
    Object.assign(adjustments, { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, blur: 0 })
  }

  // Maps a normalized display-space click (nx, ny) to canvas pixel coordinates,
  // accounting for the same rotation/flip sequence used in buildRenderedCanvas.
  function mapDisplayToCanvas(
    nx: number, ny: number,
    rot: number, fH: boolean, fV: boolean,
    w: number, h: number,
  ): [number, number] {
    const isOdd = rot === 90 || rot === 270
    const cw = isOdd ? h : w
    const ch = isOdd ? w : h
    const dx = w * (nx - 0.5)
    const dy = h * (ny - 0.5)
    const dxs = fH ? -dx : dx
    const dys = fV ? -dy : dy
    let rx: number, ry: number
    if      (rot === 0)   { rx =  dxs; ry =  dys }
    else if (rot === 90)  { rx =  dys; ry = -dxs }
    else if (rot === 180) { rx = -dxs; ry = -dys }
    else                  { rx = -dys; ry =  dxs }
    return [cw / 2 + rx, ch / 2 + ry]
  }

  function applyText(layer: TextLayer): void {
    if (!image.value) return
    pushHistory()
    const source = image.value
    const renderOpts = {
      cssFilter: cssFilter.value,
      rotation:  rotation.value,
      flipH:     flipH.value,
      flipV:     flipV.value,
      sharpness: adjustments.sharpness,
    }
    const img = new Image()
    img.onload = () => {
      const canvas = buildRenderedCanvas(img, renderOpts)
      const ctx    = canvas.getContext('2d')!

      const [cx, cy] = mapDisplayToCanvas(
        layer.nx, layer.ny,
        renderOpts.rotation, renderOpts.flipH, renderOpts.flipV,
        img.naturalWidth, img.naturalHeight,
      )

      // Scale font from display pixels to canvas pixels
      const canvasFontSize = Math.round(layer.fontSize * img.naturalWidth / layer.displayW)
      const parts = [
        layer.italic ? 'italic' : '',
        layer.bold   ? 'bold'   : '',
        `${canvasFontSize}px`,
        layer.fontFamily,
      ].filter(Boolean).join(' ')

      ctx.font         = parts
      ctx.fillStyle    = layer.color
      ctx.textBaseline = 'top'

      // Support multiline text
      const lines     = layer.text.split('\n')
      const lineHeight = canvasFontSize * 1.2
      lines.forEach((line, i) => ctx.fillText(line, cx, cy + i * lineHeight))

      canvas.toBlob((blob) => {
        if (!blob) return
        image.value = { src: URL.createObjectURL(blob), width: canvas.width, height: canvas.height, name: source.name }
        rotation.value       = 0
        flipH.value          = false
        flipV.value          = false
        selectedFilter.value = 'none'
        selectedTool.value   = 'select'
        Object.assign(adjustments, { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, blur: 0 })
      }, 'image/png')
    }
    img.src = source.src
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    selectedTool,
    zoom,
    image,
    selectedFilter,
    rotation,
    flipH,
    flipV,
    adjustments,
    hasImage,
    canUndo,
    canRedo,
    cssFilter,
    cssTransform,
    cropPreset,
    cropLocked,
    selectTool,
    loadImage,
    updateAdjustment,
    beginAdjustment,
    selectFilter,
    setZoom,
    zoomIn,
    zoomOut,
    zoomReset,
    undo,
    redo,
    rotateLeft,
    rotateRight,
    flipHorizontal,
    flipVertical,
    applyCrop,
    setCropPreset,
    toggleCropLock,
    resetImage,
    applyText,
    applyClearSelection,
  }
})
