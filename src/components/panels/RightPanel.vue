<!--
  RightPanel.vue
  Scrollable right-side wrapper that composes the three editing sub-panels.
  Each sub-panel manages its own store interactions independently.
-->
<script setup>
import AdjustmentsPanel from './AdjustmentsPanel.vue'
import FiltersPanel from './FiltersPanel.vue'
import TransformPanel from './TransformPanel.vue'
</script>

<template>
  <aside class="right-panel">
    <AdjustmentsPanel />
    <FiltersPanel />
    <TransformPanel />
  </aside>
</template>

<style scoped>
.right-panel {
  width: 240px;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  flex-shrink: 0;
}
</style>
