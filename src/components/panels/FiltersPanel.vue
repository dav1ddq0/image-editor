<script setup>
import { useEditor } from '@/composables/useEditor'
import FilterThumb from './FilterThumb.vue'

const { state, selectFilter } = useEditor()

const filters = [
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
        :active="state.selectedFilter === filter.id"
        @select="selectFilter"
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
