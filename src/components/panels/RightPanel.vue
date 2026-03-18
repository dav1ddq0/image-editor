<!--
  RightPanel.vue

  Scrollable right-side panel that groups all image editing sub-panels
  into a single vertical container.

  Responsibilities:
    - Acts as a layout wrapper for the three editing panels:
        1. AdjustmentsPanel – sliders for brightness, contrast, saturation, etc.
        2. FiltersPanel      – filter preset thumbnails (sepia, B&W, vivid, etc.)
        3. TransformPanel    – rotate and flip action buttons
    - Provides scrollability (overflow-y: auto) so that all panel content
      remains reachable even on shorter screens.
    - Does not contain business logic or store access; each sub-panel manages
      its own store interactions independently.
-->
<script setup>
// Import the three panel sub-components composed inside this wrapper
import AdjustmentsPanel from './AdjustmentsPanel.vue' // tone and color sliders
import FiltersPanel from './FiltersPanel.vue'         // visual filter preset grid
import TransformPanel from './TransformPanel.vue'     // rotate / flip buttons
</script>

<template>
  <!--
    <aside> is semantically correct for a supplementary side panel.
    .right-panel provides the fixed width, background, and scroll behaviour.
  -->
  <aside class="right-panel">

    <!-- Image adjustment sliders (brightness, contrast, saturation, etc.) -->
    <AdjustmentsPanel />

    <!-- Filter preset thumbnails (none, sepia, grayscale, vivid, cool, warm) -->
    <FiltersPanel />

    <!-- Transform actions (rotate left/right, flip horizontal/vertical) -->
    <TransformPanel />

  </aside>
</template>

<style scoped>
/*
 * .right-panel
 * Fixed-width vertical column on the right side of the editor body.
 * overflow-y: auto adds a scroll bar when the combined height of all
 * sub-panels exceeds the available viewport height.
 * flex-shrink: 0 prevents the panel from narrowing under layout pressure.
 */
.right-panel {
  width: 240px;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;   /* scroll when content overflows vertically */
  flex-shrink: 0;     /* maintain fixed width regardless of canvas size */
}
</style>
