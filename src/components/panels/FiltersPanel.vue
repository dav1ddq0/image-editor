<!--
  FiltersPanel.vue

  Right-panel section that presents a grid of visual filter preset thumbnails.
  Responsibilities:
    - Defines the available filter presets with their identifiers and display labels.
    - Renders a FilterThumb component for each preset in a 3-column grid.
    - Reads `editor.selectedFilter` to highlight the currently active filter.
    - Calls `editor.selectFilter()` when the user clicks a filter thumbnail.

  Available filters:
    - none      : no filter applied (the image displays with default adjustments only)
    - sepia     : warm brownish antique tone
    - grayscale : black and white (desaturated)
    - vivid     : high-contrast, saturated color boost (gradient preview)
    - cool      : blue-toned cool color shift (gradient preview)
    - warm      : orange-to-red warm color shift (gradient preview)
-->
<script setup>
// Import the editor store to read the selected filter and dispatch selectFilter()
import { useEditorStore } from '@/stores/editorStore'

// FilterThumb: a single clickable thumbnail tile representing one filter preset
import FilterThumb from './FilterThumb.vue'

// Obtain the shared reactive editor store instance
const editor = useEditorStore()

/*
 * filters – ordered array of filter preset descriptors used to drive the v-for.
 * Each entry contains:
 *   id    : unique string identifier stored in the editor store; also used as
 *           a CSS class on FilterThumb to apply the corresponding preview style
 *   label : short human-readable name displayed inside the thumbnail tile
 */
const filters = [
  { id: 'none',      label: 'None' },      // baseline – no CSS filter
  { id: 'sepia',     label: 'Sepia' },     // CSS sepia() filter
  { id: 'grayscale', label: 'B&W' },       // CSS grayscale() filter
  { id: 'vivid',     label: 'Vivid' },     // high-saturation gradient preview
  { id: 'cool',      label: 'Cool' },      // blue-tone gradient preview
  { id: 'warm',      label: 'Warm' },      // warm-tone gradient preview
]
</script>

<template>
  <!--
    <section> groups the filter controls as a distinct block within the right panel.
    Global .panel-section and .panel-title classes provide consistent styling.
  -->
  <section class="panel-section">

    <!-- Section heading displayed above the filter thumbnail grid -->
    <h3 class="panel-title">Filters</h3>

    <!--
      .filters-grid: 3-column CSS grid that arranges the filter thumbnails
      in equal-width square tiles.
    -->
    <div class="filters-grid">

      <!--
        Render one FilterThumb for each preset in the filters array.
        :key uses the filter id for efficient Vue DOM diffing.

        Props:
          :id     – the filter identifier; used as a CSS class for preview styles
          :label  – the display label rendered inside the tile
          :active – true when this filter's id matches the store's selectedFilter,
                    causing the tile to render with an accent border highlight

        @select – called with the filter id when the tile is clicked;
                  passed directly to editor.selectFilter to update the store
      -->
      <FilterThumb
        v-for="filter in filters"
        :key="filter.id"
        :id="filter.id"
        :label="filter.label"
        :active="editor.selectedFilter === filter.id"
        @select="editor.selectFilter"
      />

    </div>
  </section>
</template>

<style scoped>
/*
 * .filters-grid
 * Three-column equal-width grid for the filter thumbnail tiles.
 * gap provides uniform spacing between all tiles.
 */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* three equal columns */
  gap: 8px;
}
</style>
