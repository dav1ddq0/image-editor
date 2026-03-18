/*
 * editorStore.js
 *
 * Pinia store that acts as the single source of truth for the image editor.
 * It manages:
 *   - The currently active tool (select, crop, brush, etc.)
 *   - The canvas zoom level
 *   - The loaded image (object URL, dimensions, and file name)
 *   - The active CSS filter preset (sepia, grayscale, etc.)
 *   - All image adjustment values (brightness, contrast, saturation, etc.)
 *
 * Components read from this store and dispatch actions to update it.
 * No DOM manipulation happens here – this is pure reactive state and logic.
 */

// ref – creates a reactive scalar value (replaces data properties in Options API)
// reactive – creates a reactive object where each property is individually tracked
// computed – creates a lazily evaluated, cached derived value
import { ref, reactive, computed } from 'vue'

// defineStore – Pinia helper that registers a named store and returns a composable
import { defineStore } from 'pinia'

/*
 * useEditorStore
 *
 * The setup-style store definition (composition API flavor).
 * Returns all state refs, computed getters, and action functions that
 * components need to interact with the editor.
 */
export const useEditorStore = defineStore('editor', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  /*
   * selectedTool – identifier string of the currently active toolbar tool.
   * Possible values: 'select' | 'crop' | 'brush' | 'eraser' |
   *                  'text' | 'shapes' | 'fill' | 'zoom' | 'undo' | 'redo'
   * Defaults to 'select' so the app starts in pointer / selection mode.
   */
  const selectedTool   = ref('select')

  /*
   * zoom – current canvas magnification level expressed as a percentage.
   * A value of 100 means 1:1 (no scaling). Components read this to apply
   * CSS transforms or to display the zoom readout in the status bar.
   */
  const zoom           = ref(100)

  /*
   * image – holds metadata about the currently loaded image file, or null
   * when no image has been opened yet.
   * Shape: { src: string, width: number, height: number, name: string }
   *   - src    : blob object URL created from the original File object
   *   - width  : natural (original) pixel width of the image
   *   - height : natural (original) pixel height of the image
   *   - name   : original file name (e.g. "photo.jpg")
   */
  const image          = ref(null)

  /*
   * selectedFilter – identifier of the CSS filter preset currently applied
   * to the canvas image.
   * Possible values: 'none' | 'sepia' | 'grayscale' | 'vivid' | 'cool' | 'warm'
   * Defaults to 'none' (no filter applied).
   */
  const selectedFilter = ref('none')

  /*
   * adjustments – reactive object containing all numeric image-adjustment values.
   * Each property corresponds to a dedicated slider in the Adjustments panel.
   *   - brightness : overall lightness offset  (-100 to +100, default 0)
   *   - contrast   : tonal difference boost/cut (-100 to +100, default 0)
   *   - saturation : color intensity offset     (-100 to +100, default 0)
   *   - sharpness  : edge enhancement amount    (0 to 100,     default 0)
   *   - blur       : gaussian blur radius       (0 to 100,     default 0)
   */
  const adjustments = reactive({
    brightness: 0,
    contrast:   0,
    saturation: 0,
    sharpness:  0,
    blur:       0,
  })

  // ── Getters (computed) ─────────────────────────────────────────────────────

  /*
   * hasImage – boolean computed that is true when an image has been loaded.
   * Uses a double-negation to coerce the nullable `image` ref to a boolean.
   * Components use this to conditionally enable controls and render the canvas.
   */
  const hasImage = computed(() => !!image.value)

  // ── Actions ────────────────────────────────────────────────────────────────

  /*
   * selectTool(tool)
   *
   * Sets the active toolbar tool by updating the `selectedTool` ref.
   * The toolbar highlights the matching ToolButton and canvas listeners
   * can read `selectedTool` to decide which interaction mode is active.
   *
   * @param {string} tool - The tool identifier to activate (e.g. 'brush')
   */
  function selectTool(tool) {
    selectedTool.value = tool
  }

  /*
   * loadImage(file)
   *
   * Accepts a File object (from a file-picker or drag-and-drop event),
   * creates a temporary blob URL for it, and waits for the browser to
   * decode the image so that the natural dimensions can be captured.
   *
   * Once the `<img>` element fires its `onload` callback, the `image`
   * reactive ref is populated with the URL, dimensions, and file name.
   * The blob URL is kept alive for the lifetime of the session; it does
   * not need to be revoked here because it is the canonical image source.
   *
   * @param {File} file - The image file chosen by the user
   */
  function loadImage(file) {
    // Create a short-lived object URL so the browser can load the file
    // without uploading it anywhere – it stays in local memory
    const url = URL.createObjectURL(file)

    // Create a temporary HTMLImageElement purely to read the intrinsic size;
    // this element is never inserted into the DOM
    const img = new Image()

    // onload fires once the image is fully decoded by the browser
    img.onload = () => {
      // Store the full image descriptor in the reactive ref so all
      // subscribed components re-render with the new image data
      image.value = {
        src:    url,              // blob: URL used as <img src>
        width:  img.naturalWidth, // original pixel width (not CSS width)
        height: img.naturalHeight,// original pixel height (not CSS height)
        name:   file.name,        // display name shown in status bar
      }
    }

    // Assigning the src triggers the browser to start loading/decoding the image
    img.src = url
  }

  /*
   * updateAdjustment(key, value)
   *
   * Updates a single property of the `adjustments` reactive object.
   * Coerces the incoming value to a Number to prevent string drift
   * (HTML range inputs emit string values via their `input` events).
   *
   * @param {string} key   - The adjustment property name (e.g. 'brightness')
   * @param {number|string} value - The new numeric value for that property
   */
  function updateAdjustment(key, value) {
    // Explicit Number() cast ensures the stored value is always numeric,
    // guarding against accidental string values from event handlers
    adjustments[key] = Number(value)
  }

  /*
   * selectFilter(filter)
   *
   * Activates one of the predefined CSS filter presets.
   * FilterThumb components call this when the user clicks a filter tile.
   *
   * @param {string} filter - The filter identifier (e.g. 'sepia', 'none')
   */
  function selectFilter(filter) {
    selectedFilter.value = filter
  }

  /*
   * setZoom(value)
   *
   * Updates the canvas zoom level.
   * Called by zoom controls or keyboard shortcuts to magnify / reduce the canvas.
   *
   * @param {number} value - Zoom percentage (e.g. 50, 100, 200)
   */
  function setZoom(value) {
    zoom.value = value
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  // Expose only the state and functions that components need.
  // Anything not listed here remains internal to the store.
  return {
    // State refs
    selectedTool,   // currently active tool identifier
    zoom,           // canvas zoom percentage
    image,          // loaded image descriptor object (or null)
    selectedFilter, // active filter preset identifier
    adjustments,    // reactive object of numeric adjustment values

    // Computed getters
    hasImage,       // true when an image is currently loaded

    // Actions
    selectTool,         // activate a toolbar tool
    loadImage,          // load a File into the editor
    updateAdjustment,   // update one adjustment slider value
    selectFilter,       // activate a filter preset
    setZoom,            // change the canvas zoom level
  }
})
