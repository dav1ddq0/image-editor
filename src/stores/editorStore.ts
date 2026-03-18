/*
 * editorStore.ts
 * Single source of truth for the image editor: active tool, zoom, loaded image,
 * filter preset, and all adjustment values.
 */

import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ToolId, FilterId, ImageDescriptor, Adjustments, AdjustmentKey } from '@/types/editor'

export const useEditorStore = defineStore('editor', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  const selectedTool   = ref<ToolId>('select')
  const zoom           = ref<number>(100)
  const image          = ref<ImageDescriptor | null>(null)
  const selectedFilter = ref<FilterId>('none')

  // rotation is always a multiple of 90, stored in degrees (0 | 90 | 180 | 270)
  const rotation = ref<number>(0)
  const flipH    = ref<boolean>(false)
  const flipV    = ref<boolean>(false)

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
      image.value = {
        src:    url,
        width:  img.naturalWidth,
        height: img.naturalHeight,
        name:   file.name,
      }
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
    zoom.value = value
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
    selectTool,
    loadImage,
    updateAdjustment,
    selectFilter,
    setZoom,
    rotateLeft,
    rotateRight,
    flipHorizontal,
    flipVertical,
  }
})
