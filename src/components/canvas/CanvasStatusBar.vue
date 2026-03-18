<!--
  CanvasStatusBar.vue

  Thin informational footer bar rendered at the bottom of the canvas area.
  Displays read-only metadata about the current editing session:
    - Current zoom level (percentage)
    - Loaded image file name (or a fallback if no image is open)
    - Image dimensions in pixels (width × height)

  This component is purely presentational; it receives all its data via props
  and emits no events. State changes flow from the editor store through the
  parent (CanvasArea.vue), which passes the relevant values down as props.

  Props:
    - zoom        (Number)  : current zoom level in percent (default 100)
    - imageWidth  (Number)  : natural pixel width of the loaded image
    - imageHeight (Number)  : natural pixel height of the loaded image
    - imageName   (String)  : original file name of the loaded image
-->
<script setup>
/*
 * Props definition for the status bar display values.
 * All props default to null / 100 so the bar renders gracefully
 * before an image is loaded.
 */
defineProps({
  // Current canvas zoom percentage; shown as "Zoom: X%"
  zoom:        { type: Number, default: 100 },

  // Natural (original) pixel width of the loaded image; null when no image
  imageWidth:  { type: Number, default: null },

  // Natural (original) pixel height of the loaded image; null when no image
  imageHeight: { type: Number, default: null },

  // Original file name of the loaded image (e.g. "photo.jpg"); null when no image
  imageName:   { type: String, default: null },
})
</script>

<template>
  <!--
    <footer> is semantically appropriate as a supplementary section at the
    bottom of the canvas work area.
    .statusbar is a horizontal flex row with small text.
  -->
  <footer class="statusbar">

    <!-- Current zoom level; always shown regardless of image state -->
    <span>Zoom: {{ zoom }}%</span>

    <!-- Visual separator between zoom and file name sections -->
    <span class="divider">—</span>

    <!--
      File name section: uses the nullish coalescing operator (??) to display
      a friendly fallback message when no image is currently loaded.
    -->
    <span>{{ imageName ?? 'No image loaded' }}</span>

    <!-- Flexible spacer that pushes the dimension info to the right side -->
    <span class="spacer" />

    <!--
      Dimension display: only rendered when both width and height are available,
      i.e. when an image has been loaded and its natural size is known.
      The &nbsp; entity adds non-breaking space between W and H values.
    -->
    <span v-if="imageWidth && imageHeight">W: {{ imageWidth }}px &nbsp; H: {{ imageHeight }}px</span>

    <!--
      Fallback dimension display: shown when no image dimensions are available.
      Em dashes signal that the values are intentionally absent.
    -->
    <span v-else>W: — &nbsp; H: —</span>

  </footer>
</template>

<style scoped>
/*
 * .statusbar
 * Full-width flex row with a fixed small height.
 * flex-shrink: 0 ensures the bar never collapses under the canvas container.
 * Small font size keeps it unobtrusive.
 */
.statusbar {
  height: 28px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  font-size: 0.78rem;
  color: var(--color-subtle);
  flex-shrink: 0; /* prevent shrinking when vertical space is constrained */
}

/* The divider character is made semi-transparent so it recedes visually */
.divider { opacity: 0.4; }

/* The spacer grows to consume available space, right-aligning the dimensions */
.spacer  { flex: 1; }
</style>
