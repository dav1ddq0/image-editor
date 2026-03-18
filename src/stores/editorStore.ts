/*
 * editorStore.ts
 * Single source of truth for the image editor: active tool, zoom, loaded image,
 * filter preset, and all adjustment values.
 */

import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ToolId, FilterId, ImageDescriptor, Adjustments, AdjustmentKey, AspectPreset, CropRect } from '@/types/editor'
import { buildRenderedCanvas } from '@/utils/canvasRenderer'

export const useEditorStore = defineStore('editor', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  const selectedTool   = ref<ToolId>('select')
  const zoom           = ref<number>(100)
  const image          = ref<ImageDescriptor | null>(null)
  // The first descriptor created by loadImage; used by resetImage to restore the original.
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

    // Temporary off-DOM image element used only to read intrinsic dimensions
    const img = new Image()

    img.onload = () => {
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
    // Number() cast guards against string values emitted by HTML range inputs
    adjustments[key] = Number(value)
  }

  function rotateLeft(): void {
    rotation.value = (rotation.value - 90 + 360) % 360
  }

  function rotateRight(): void {
    rotation.value = (rotation.value + 90) % 360
  }

  function flipHorizontal(): void {
    flipH.value = !flipH.value
  }

  function flipVertical(): void {
    flipV.value = !flipV.value
  }

  function selectFilter(filter: FilterId): void {
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
        if (source.src.startsWith('blob:')) URL.revokeObjectURL(source.src)
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

  // Restores the original loaded image and resets every non-destructive edit.
  function resetImage(): void {
    if (!originalImage.value) return
    if (image.value && image.value !== originalImage.value && image.value.src.startsWith('blob:'))
      URL.revokeObjectURL(image.value.src)
    image.value          = originalImage.value
    rotation.value       = 0
    flipH.value          = false
    flipV.value          = false
    selectedFilter.value = 'none'
    selectedTool.value   = 'select'
    zoom.value           = 100
    Object.assign(adjustments, { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, blur: 0 })
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
    cssFilter,
    cssTransform,
    cropPreset,
    cropLocked,
    selectTool,
    loadImage,
    updateAdjustment,
    selectFilter,
    setZoom,
    zoomIn,
    zoomOut,
    zoomReset,
    rotateLeft,
    rotateRight,
    flipHorizontal,
    flipVertical,
    applyCrop,
    setCropPreset,
    toggleCropLock,
    resetImage,
  }
})
