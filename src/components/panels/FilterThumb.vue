<!--
  FilterThumb.vue
  Clickable filter preset tile. Applies an accent border when active and emits
  'select' upward so FiltersPanel stays decoupled from the store.
-->
<script setup>
// `id` doubles as a CSS class name so scoped styles can target each preset individually
defineProps({
  id:     { type: String,  required: true },
  label:  { type: String,  required: true },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div
    class="filter-thumb"
    :class="[id, { active }]"
    :title="label"
    @click="emit('select', id)"
  >
    {{ label }}
  </div>
</template>

<style scoped>
.filter-thumb {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--color-subtle);
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
}

.filter-thumb:hover,
.filter-thumb.active {
  border-color: var(--color-accent);
  color: var(--color-text);
}

/* ── Filter preview styles ──────────────────────────────────────────────────── */

.filter-thumb.sepia     { filter: sepia(0.8);  background: #3d2b1f; }
.filter-thumb.grayscale { filter: grayscale(1); background: #2a2a2a; }

/* Gradient tiles use white text because the dark gradient backgrounds need contrast */
.filter-thumb.vivid     { background: linear-gradient(135deg, #e94560, #0f3460); color: #fff; }
.filter-thumb.cool      { background: linear-gradient(135deg, #1a6b8a, #0f3460); color: #fff; }
.filter-thumb.warm      { background: linear-gradient(135deg, #c96a1a, #e94560); color: #fff; }
</style>
