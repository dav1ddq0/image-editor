<script setup>
defineProps({
  id:     { type: String, required: true },
  label:  { type: String, required: true },
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

/* Filter previews */
.filter-thumb.sepia     { filter: sepia(0.8);  background: #3d2b1f; }
.filter-thumb.grayscale { filter: grayscale(1); background: #2a2a2a; }
.filter-thumb.vivid     { background: linear-gradient(135deg, #e94560, #0f3460); color: #fff; }
.filter-thumb.cool      { background: linear-gradient(135deg, #1a6b8a, #0f3460); color: #fff; }
.filter-thumb.warm      { background: linear-gradient(135deg, #c96a1a, #e94560); color: #fff; }
</style>
