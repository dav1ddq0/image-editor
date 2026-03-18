import { reactive, readonly } from 'vue'

// Singleton: estado compartido entre todos los componentes
const state = reactive({
  selectedTool: 'select',
  zoom: 100,
  image: null, // { src, width, height, name }
  adjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    blur: 0,
  },
  selectedFilter: 'none',
  canUndo: false,
  canRedo: false,
})

function selectTool(tool) {
  state.selectedTool = tool
}

function loadImage(file) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    state.image = { src: url, width: img.naturalWidth, height: img.naturalHeight, name: file.name }
  }
  img.src = url
}

function updateAdjustment(key, value) {
  state.adjustments[key] = Number(value)
}

function selectFilter(filter) {
  state.selectedFilter = filter
}

function setZoom(value) {
  state.zoom = value
}

export function useEditor() {
  return {
    state: readonly(state),
    selectTool,
    loadImage,
    updateAdjustment,
    selectFilter,
    setZoom,
  }
}
