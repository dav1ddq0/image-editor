<!--
  CanvasArea.vue

  Central workspace component that occupies the main body of the editor.
  Responsibilities:
    - Displays a CanvasDropZone placeholder when no image is loaded yet,
      giving the user instructions on how to get started.
    - Renders the loaded image using a plain <img> element once an image
      is available in the store.
    - Renders the CanvasStatusBar below the image to show zoom level,
      file name, and image dimensions.

  The component reads state from the editor store but does not mutate it
  directly; mutations flow through child components (e.g. CanvasDropZone
  calls editor.loadImage after a drop event).
-->
<script setup>
// Import the editor store to access image state and the hasImage computed getter
import { useEditorStore } from '@/stores/editorStore'

// CanvasDropZone: shown when no image is loaded; handles drag-and-drop
import CanvasDropZone from './CanvasDropZone.vue'

// CanvasStatusBar: footer bar displaying zoom, file name, and dimensions
import CanvasStatusBar from './CanvasStatusBar.vue'

// Get the shared reactive editor store instance
const editor = useEditorStore()
</script>

<template>
  <!--
    <main> is semantically correct for the primary content area.
    .canvas-area is a vertical flex column: canvas-container grows to fill space,
    and CanvasStatusBar is pinned to the bottom.
  -->
  <main class="canvas-area">

    <!--
      .canvas-container is a scrollable flex cell that centers its content.
      It switches between CanvasDropZone and the actual image depending on
      whether an image has been loaded.
    -->
    <div class="canvas-container">

      <!--
        Show the drop zone placeholder only when no image is loaded.
        editor.hasImage is a computed getter that returns true once an
        image object is present in the store.
      -->
      <CanvasDropZone v-if="!editor.hasImage" />

      <!--
        Once an image is loaded, render it with the blob URL stored in the
        image descriptor. The alt attribute uses the original file name for
        accessibility. The .canvas-image styles constrain it to the container.
      -->
      <img
        v-else
        :src="editor.image.src"
        :alt="editor.image.name"
        class="canvas-image"
      />

    </div>

    <!--
      Status bar along the bottom of the canvas area.
      Props are passed using optional chaining (?.) on editor.image because
      image can be null before an image is loaded; the status bar props
      accept null/undefined and render fallback text accordingly.
    -->
    <CanvasStatusBar
      :zoom="editor.zoom"
      :image-width="editor.image?.width"
      :image-height="editor.image?.height"
      :image-name="editor.image?.name"
    />

  </main>
</template>

<style scoped>
/*
 * .canvas-area
 * Fills all remaining horizontal space between the toolbar and the right panel.
 * flex-direction: column stacks the container and status bar vertically.
 * overflow: hidden prevents the component from expanding beyond its bounds.
 */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  overflow: hidden;
}

/*
 * .canvas-container
 * Grows to fill the vertical space above the status bar.
 * overflow: auto adds scroll bars when the image is larger than the container.
 * padding provides breathing room around the image.
 */
.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;     /* vertically center the image/drop zone */
  justify-content: center; /* horizontally center the image/drop zone */
  overflow: auto;
  padding: 20px;
}

/*
 * .canvas-image
 * Constrains the displayed image to fit within the container while
 * preserving the original aspect ratio.
 * The box shadow adds depth to visually separate the image from the background.
 */
.canvas-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;      /* preserve aspect ratio without cropping */
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6); /* subtle drop shadow for depth */
}
</style>
