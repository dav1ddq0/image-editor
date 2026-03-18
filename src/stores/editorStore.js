/*
 * editorStore.js
 * Single source of truth for the image editor: active tool, zoom, loaded image,
 * filter preset, and all adjustment values.
 */

import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  const selectedTool   = ref('select')
  const zoom           = ref(100)

  // Shape: { src: string, width: number, height: number, name: string }
  const image          = ref(null)

  const selectedFilter = ref('none')

  const adjustments = reactive({
    brightness: 0,
    contrast:   0,
    saturation: 0,
    sharpness:  0,
    blur:       0,
  })

  // ── Getters (computed) ─────────────────────────────────────────────────────

  const hasImage = computed(() => !!image.value)

  // ── Actions ────────────────────────────────────────────────────────────────

  function selectTool(tool) {
    selectedTool.value = tool
  }

  function loadImage(file) {
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

  function updateAdjustment(key, value) {
    // Number() cast guards against string values emitted by HTML range inputs
    adjustments[key] = Number(value)
  }

  function selectFilter(filter) {
    selectedFilter.value = filter
  }

  function setZoom(value) {
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
    selectTool,
    loadImage,
    updateAdjustment,
    selectFilter,
    setZoom,
  }
})
