<!--
  AppToolbar.vue
  Vertical left-side toolbar. Renders drawing tools and history tools in separate
  groups; reads selectedTool from the store to highlight the active tool.
-->
<script setup>
import { useEditorStore } from '@/stores/editorStore'
import ToolButton from './ToolButton.vue'

const editor = useEditorStore()

const drawingTools = [
  { id: 'select', icon: '↖', label: 'Select' },
  { id: 'crop',   icon: '⊡', label: 'Crop' },
  { id: 'brush',  icon: '🖌', label: 'Brush' },
  { id: 'eraser', icon: '◻', label: 'Eraser' },
  { id: 'text',   icon: 'T',  label: 'Text' },
  { id: 'shapes', icon: '◯', label: 'Shapes' },
  { id: 'fill',   icon: '🪣', label: 'Fill' },
  { id: 'zoom',   icon: '🔍', label: 'Zoom In' },
]

// Undo/redo are action triggers, not mode selectors, so they have no :active binding
const historyTools = [
  { id: 'undo', icon: '↩', label: 'Undo' },
  { id: 'redo', icon: '↪', label: 'Redo' },
]
</script>

<template>
  <aside class="toolbar">

    <div class="tool-group">
      <ToolButton
        v-for="tool in drawingTools"
        :key="tool.id"
        :icon="tool.icon"
        :label="tool.label"
        :active="editor.selectedTool === tool.id"
        @click="editor.selectTool(tool.id)"
      />
    </div>

    <div class="tool-group">
      <ToolButton
        v-for="tool in historyTools"
        :key="tool.id"
        :icon="tool.icon"
        :label="tool.label"
        @click="editor.selectTool(tool.id)"
      />
    </div>

  </aside>
</template>

<style scoped>
.toolbar {
  width: 56px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
  flex-shrink: 0;
}

.tool-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  width: 100%;
}

/* Avoid a double-border at the bottom of the last group */
.tool-group:last-child {
  border-bottom: none;
}
</style>
