<!--
  ImageEditor.vue

  Root layout component of the image editor application.
  Responsible for:
    - Composing the top-level page structure (navbar → body → panels)
    - Providing the "Open Image" handler that triggers the OS file picker
    - Bridging the AppNavbar "open" event to the editor store's loadImage action

  Layout overview:
    ┌──────────────────────────────────────────┐
    │  AppNavbar  (top bar with action buttons) │
    ├──────┬──────────────────────────┬─────────┤
    │ Tool │      CanvasArea          │ Right   │
    │ bar  │  (image / drop zone)     │ Panel   │
    └──────┴──────────────────────────┴─────────┘
-->
<script setup>
// Import the Pinia editor store to access the loadImage action
import { useEditorStore } from '@/stores/editorStore'

// Child layout components that form the full editor UI
import AppNavbar  from './navbar/AppNavbar.vue'    // top navigation bar
import AppToolbar from './toolbar/AppToolbar.vue'  // left-side tool palette
import CanvasArea from './canvas/CanvasArea.vue'   // central image canvas
import RightPanel from './panels/RightPanel.vue'   // right-side adjustment panels

// Obtain the reactive editor store instance shared across all components
const editor = useEditorStore()

/*
 * openImage()
 *
 * Programmatically opens the browser's native file-picker dialog without
 * needing a visible <input type="file"> element in the DOM.
 *
 * Technique:
 *   1. A temporary <input type="file"> element is created in memory.
 *   2. The "accept" attribute restricts selection to image file types.
 *   3. .click() is called to trigger the OS file-picker dialog.
 *   4. Once the user selects a file the "change" event fires, and the
 *      selected File object is forwarded to the store's loadImage action.
 *
 * This function is passed to AppNavbar as the handler for the "open" emit.
 */
function openImage() {
  // Create a transient file input – it never gets appended to the document
  const input = document.createElement('input')
  input.type = 'file'

  // Restrict the picker to image files only (any MIME type starting with "image/")
  input.accept = 'image/*'

  // Handle the file selection; optional chaining guards against an empty selection
  input.onchange = (e) => {
    // Grab only the first selected file (single-image editor)
    const file = e.target.files?.[0]
    // Load the file into the store only if a valid file was provided
    if (file) editor.loadImage(file)
  }

  // Simulate a user click to open the OS file dialog
  input.click()
}
</script>

<template>
  <!--
    .editor-layout wraps the full viewport in a vertical flex container so
    the navbar is pinned to the top and the body fills the remaining height.
  -->
  <div class="editor-layout">
    <!--
      AppNavbar: emits "open" when the user clicks "Open Image".
      The parent handles it here with the openImage() function above.
    -->
    <AppNavbar @open="openImage" />

    <!--
      .editor-body: horizontal flex row that places toolbar, canvas, and
      right panel side-by-side, filling the remaining vertical space.
    -->
    <div class="editor-body">
      <!-- Left side: vertical tool palette -->
      <AppToolbar />

      <!-- Center: main image canvas or drop zone placeholder -->
      <CanvasArea />

      <!-- Right side: adjustments, filters, and transform panels -->
      <RightPanel />
    </div>
  </div>
</template>

<style scoped>
/*
 * .editor-layout
 * Full-viewport vertical flex column.
 * The navbar takes its natural height; the body flex-grows to fill the rest.
 */
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/*
 * .editor-body
 * Horizontal flex row that holds toolbar, canvas, and right panel.
 * overflow: hidden prevents child scroll bars from expanding the layout.
 */
.editor-body {
  display: flex;
  flex: 1;          /* Grow to fill all space below the navbar */
  overflow: hidden; /* Contain any child overflow within this row */
}
</style>
