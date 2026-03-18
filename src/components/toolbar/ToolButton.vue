<!--
  ToolButton.vue
  Single reusable icon button for the toolbar palette. Highlights when active
  and emits 'click' upward, staying decoupled from the store.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  icon:   string
  label:  string
  active?: boolean
}>(), { active: false })

// Re-emit rather than calling the store directly so this component stays
// decoupled from any specific store implementation.
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="tool-btn"
    :class="{ active }"
    :title="label"
    @click="emit('click')"
  >
    <span>{{ icon }}</span>
  </button>
</template>

<style scoped>
.tool-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.tool-btn:hover {
  background: var(--color-border);
  color: #fff;
  border-color: var(--color-accent);
}

.tool-btn.active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}
</style>
