<!--
  Clickable filter preset tile
-->
<script setup lang="ts">
import type { FilterId } from '@/types/editor'

withDefaults(defineProps<{
  id:        FilterId
  label:     string
  active?:   boolean
  disabled?: boolean
}>(), { active: false, disabled: false })

const emit = defineEmits<{ select: [id: FilterId] }>()
</script>

<template>
  <button
    type="button"
    class="filter-thumb"
    :class="[id, { active }]"
    :disabled="disabled"
    :title="label"
    @click="emit('select', id)"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.filter-thumb {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--color-subtle);
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition),
              transform var(--transition), box-shadow var(--transition);
}

.filter-thumb.active {
  border-color: var(--color-accent);
  color: var(--color-text);
  font-weight: 600;
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.filter-thumb:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (hover: hover) and (pointer: fine) {
  .filter-thumb:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-text);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  .filter-thumb.active:hover:not(:disabled) {
    box-shadow: 0 0 0 3px var(--color-accent-soft), var(--shadow-sm);
  }
}

/* Filter preview styles */

.filter-thumb.sepia     { filter: sepia(0.8);  background: #3d2b1f; }
.filter-thumb.grayscale { filter: grayscale(1); background: #2a2a2a; }

/* Gradient tiles use white text because the dark gradient backgrounds need contrast */
.filter-thumb.vivid     { background: linear-gradient(135deg, #e94560, #0f3460); color: #fff; }
.filter-thumb.cool      { background: linear-gradient(135deg, #1a6b8a, #0f3460); color: #fff; }
.filter-thumb.warm      { background: linear-gradient(135deg, #c96a1a, #e94560); color: #fff; }
</style>
