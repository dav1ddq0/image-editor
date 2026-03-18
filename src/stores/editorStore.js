import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', () => {
  // ── State ──────────────────────────────────────────────────
  const selectedTool   = ref('select')
  const zoom           = ref(100)
  const image          = ref(null) // { src, width, height, name }
  const selectedFilter = ref('none')

  const adjustments = reactive({
    brightness: 0,
    contrast:   0,
    saturation: 0,
    sharpness:  0,
    blur:       0,
  })

  // ── Getters ────────────────────────────────────────────────
  const hasImage = computed(() => !!image.value)

  // ── Actions ────────────────────────────────────────────────
  function selectTool(tool) {
    selectedTool.value = tool
  }

  function loadImage(file) {
    const url = URL.createObjectURL(file)
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
    adjustments[key] = Number(value)
  }

  function selectFilter(filter) {
    selectedFilter.value = filter
  }

  function setZoom(value) {
    zoom.value = value
  }

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
