<!--
  RightPanel.vue
  Scrollable right-side wrapper that composes the three editing sub-panels.
  Each sub-panel manages its own store interactions independently.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import AdjustmentsPanel from './AdjustmentsPanel.vue'
import FiltersPanel from './FiltersPanel.vue'
import TransformPanel from './TransformPanel.vue'

const editor = useEditorStore()
</script>

<template>
  <aside class="right-panel">
    <AdjustmentsPanel />
    <FiltersPanel />
    <TransformPanel />

    <div class="reset-section">
      <button
        class="btn btn-danger reset-btn"
        :disabled="!editor.hasImage"
        @click="editor.resetImage()"
      >
        Reset to Original
      </button>
    </div>
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

.reset-section {
  padding: 16px;
}

.reset-btn {
  width: 100%;
}
</style>
