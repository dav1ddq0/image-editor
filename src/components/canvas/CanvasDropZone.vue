<!--
  CanvasDropZone.vue

  Empty-state placeholder shown in the canvas area when no image has been loaded.
  Responsibilities:
    - Provides a styled drag-and-drop target that accepts image files.
    - Gives visual feedback (highlighted border + text color) while a file
      is being dragged over the zone.
    - Validates that the dropped item is an image file before passing it to
      the editor store's loadImage action.
    - Informs the user of the alternative method (clicking "Open Image" in
      the navbar) for loading an image.

  Note: this component only handles file drops. The file-picker (button)
  path is handled by the openImage() function in ImageEditor.vue.
-->
<script setup>
// ref is used to create a reactive boolean tracking the drag-over state
import { ref } from 'vue'

// Import the editor store so we can call loadImage when a file is dropped
import { useEditorStore } from '@/stores/editorStore'

// Get the shared reactive editor store instance
const editor = useEditorStore()

/*
 * isDragging – reactive boolean that is true while a drag operation
 * is occurring over this drop zone.
 * Toggled by dragover/dragleave events to drive the :class binding.
 */
const isDragging = ref(false)

/*
 * onDrop(event)
 *
 * Handles the 'drop' DOM event when the user releases a dragged file
 * onto this component.
 *
 * Steps:
 *   1. Reset the dragging indicator so the hover style is removed.
 *   2. Extract the first file from the DataTransfer object.
 *   3. Confirm the file is an image (MIME type check) before loading.
 *   4. Call editor.loadImage() to process and store the image.
 *
 * The @drop.prevent modifier on the template element prevents the
 * browser's default behaviour of navigating to the dropped file URL.
 *
 * @param {DragEvent} event - The native browser drop event
 */
function onDrop(event) {
  // Reset the visual drag-over highlight immediately on drop
  isDragging.value = false

  // Safely extract the first dropped file; optional chaining handles cases
  // where dataTransfer or files may be undefined (e.g. dragging non-file items)
  const file = event.dataTransfer?.files?.[0]

  // Only load the file if it exists and its MIME type begins with "image/"
  // This guards against non-image files (PDFs, ZIPs, etc.) being dropped
  if (file && file.type.startsWith('image/')) editor.loadImage(file)
}
</script>

<template>
  <!--
    The drop zone <div> handles three drag-related events:
      @dragover.prevent  – prevents the default "no-drop" cursor and sets isDragging
      @dragleave         – removes the dragging highlight when the cursor leaves
      @drop.prevent      – calls onDrop and prevents browser default navigation

    :class dynamically adds the 'dragging' class while a file hovers over the zone
    to provide visual feedback via CSS.
  -->
  <div
    class="drop-zone"
    :class="{ dragging: isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <!-- Large folder icon that draws attention to the drop target -->
    <span class="drop-icon">📂</span>

    <!-- Primary instruction message; "Open Image" refers to the navbar button -->
    <p>Drop an image here or click <strong>Open Image</strong></p>

    <!-- Secondary hint listing supported image formats -->
    <p class="drop-hint">Supports JPG, PNG, GIF, WEBP</p>
  </div>
</template>

<style scoped>
/*
 * .drop-zone
 * Dashed border container that communicates "you can drop files here".
 * transition animates the border color and text color on hover/drag.
 */
.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 60px 80px;
  text-align: center;
  color: var(--color-subtle);
  transition: border-color 0.2s, color 0.2s; /* smooth highlight on drag-over */
  cursor: default;
}

/*
 * Hover and drag-over states both use the same accent highlight to signal
 * that the zone is interactive and ready to accept a drop.
 */
.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--color-accent);
  color: var(--color-muted);
}

/* Oversized folder icon acts as a visual focal point in the empty state */
.drop-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
}

/* Standard paragraph spacing for instruction lines */
.drop-zone p {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

/* Subdued hint text for the supported formats line */
.drop-hint {
  font-size: 0.8rem;
  color: #404060;
}
</style>
