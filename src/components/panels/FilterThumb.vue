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
  background: var(--color-surface-container-high);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--color-subtle);
  cursor: pointer;
  transition: background-color var(--transition), border-color var(--transition),
              color var(--transition), transform var(--transition), box-shadow var(--transition);
}

.filter-thumb.active {
  border-color: transparent;
  box-shadow: 0 0 0 3px var(--color-accent);
  font-weight: 600;
}

.filter-thumb.active:focus-visible {
  outline-offset: 5px;
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
    border-color: transparent;
    box-shadow: 0 0 0 3px var(--color-accent), var(--shadow-sm);
  }
}

/* Filter preview styles */
.filter-thumb.sepia     { background: color-mix(in oklab, var(--swatch-tertiary) 55%, black); color: #fff; }
.filter-thumb.grayscale { background: linear-gradient(135deg, var(--swatch-neutral-1), var(--swatch-neutral-2)); color: #fff; }
.filter-thumb.vivid     { background: linear-gradient(135deg, var(--swatch-primary), var(--swatch-tertiary)); color: #fff; }
.filter-thumb.cool      { background: linear-gradient(135deg, var(--swatch-primary), color-mix(in oklab, var(--swatch-primary) 55%, black)); color: #fff; }
.filter-thumb.warm      { background: linear-gradient(135deg, color-mix(in oklab, var(--swatch-tertiary) 95%, white 5%), var(--swatch-primary)); color: #fff; }
</style>
