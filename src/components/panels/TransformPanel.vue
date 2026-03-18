<!--
  TransformPanel.vue

  Right-panel section that provides geometric transformation actions for the
  loaded image: rotating left/right and flipping horizontally/vertically.

  Responsibilities:
    - Renders four action buttons arranged in a 2×2 grid.
    - Disables all buttons when no image is loaded (editor.hasImage is false)
      to prevent triggering transforms on an empty canvas.
    - Emits a specific event for each transform action so that a parent
      component higher in the tree can apply the actual canvas transformation.

  Note: this component does not perform the transformations itself. It emits
  events upward and relies on an ancestor component to implement the logic.
  This keeps the panel decoupled from canvas rendering concerns.

  Emits:
    - rotate-left  : user clicked "Rotate L" – rotate the image 90° counter-clockwise
    - rotate-right : user clicked "Rotate R" – rotate the image 90° clockwise
    - flip-h       : user clicked "Flip H"   – flip the image horizontally (mirror)
    - flip-v       : user clicked "Flip V"   – flip the image vertically (upside down)
-->
<script setup>
// Import the editor store solely to read the hasImage computed getter,
// which is used to enable/disable the transform buttons
import { useEditorStore } from '@/stores/editorStore'

// Obtain the reactive editor store instance
const editor = useEditorStore()

/*
 * Declare all events this component can emit.
 * Each event corresponds to one geometric transformation operation.
 * Parent components listen for these and perform the actual pixel manipulation.
 */
const emit = defineEmits(['rotate-left', 'rotate-right', 'flip-h', 'flip-v'])
</script>

<template>
  <!--
    <section> wraps the transform controls as a discrete block in the right panel.
    Global .panel-section and .panel-title classes ensure consistent styling
    across all panels in the right sidebar.
  -->
  <section class="panel-section">

    <!-- Section heading that labels this group of controls -->
    <h3 class="panel-title">Transform</h3>

    <!--
      .transform-actions: 2-column grid that lays out the four action buttons
      in a compact 2×2 arrangement (rotate row + flip row).
    -->
    <div class="transform-actions">

      <!--
        Rotate Left: rotates the image 90 degrees counter-clockwise.
        Disabled when no image is loaded so the button appears grayed out
        and is not interactive in the empty state.
      -->
      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="emit('rotate-left')"
      >Rotate L</button>

      <!--
        Rotate Right: rotates the image 90 degrees clockwise.
        Also disabled when no image is present.
      -->
      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="emit('rotate-right')"
      >Rotate R</button>

      <!--
        Flip Horizontal: mirrors the image along the vertical axis
        (left edge becomes right edge and vice versa).
      -->
      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="emit('flip-h')"
      >Flip H</button>

      <!--
        Flip Vertical: mirrors the image along the horizontal axis
        (top edge becomes bottom edge and vice versa).
      -->
      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="emit('flip-v')"
      >Flip V</button>

    </div>
  </section>
</template>

<style scoped>
/*
 * .transform-actions
 * 2-column CSS grid that arranges the four transform buttons into
 * a compact 2×2 matrix (rotate row on top, flip row on bottom).
 */
.transform-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* two equal-width columns */
  gap: 8px;
}
</style>
