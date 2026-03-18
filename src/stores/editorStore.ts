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

  const adjustments = reactive<Adjustments>({
    brightness: 0,
    contrast:   0,
    saturation: 0,
    sharpness:  0,
    blur:       0,
  })

  // ── Getters (computed) ─────────────────────────────────────────────────────

  const hasImage = computed<boolean>(() => !!image.value)

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
    adjustments,
    hasImage,
    cssFilter,
    selectTool,
    loadImage,
    updateAdjustment,
    selectFilter,
    setZoom,
  }
})
