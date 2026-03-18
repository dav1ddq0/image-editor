<!--
  FiltersPanel.vue
  Right-panel section with a grid of filter preset thumbnails. Reads
  selectedFilter from the store to highlight the active tile.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import FilterThumb from './FilterThumb.vue'
import type { FilterDefinition } from '@/types/editor'

const editor = useEditorStore()

// id doubles as a CSS class on FilterThumb to apply each filter's preview style
const filters: FilterDefinition[] = [
  { id: 'none',      label: 'None' },
  { id: 'sepia',     label: 'Sepia' },
  { id: 'grayscale', label: 'B&W' },
  { id: 'vivid',     label: 'Vivid' },
  { id: 'cool',      label: 'Cool' },
  { id: 'warm',      label: 'Warm' },
]
</script>

<template>
  <section class="panel-section">

    <h3 class="panel-title">Filters</h3>

    <div class="filters-grid">
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
.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
</style>
