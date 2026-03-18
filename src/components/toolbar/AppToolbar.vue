<!--
  AppToolbar.vue
  Vertical left-side toolbar. Renders drawing tools and history tools in separate
  groups; reads selectedTool from the store to highlight the active tool.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import ToolButton from './ToolButton.vue'
import type { ToolDefinition } from '@/types/editor'

const editor = useEditorStore()

const drawingTools: ToolDefinition[] = [
  { id: 'select', icon: '↖', label: 'Select' },
  { id: 'crop',   icon: '⊡', label: 'Crop' },
  { id: 'brush',  icon: '🖌', label: 'Brush' },
  { id: 'eraser', icon: '◻', label: 'Eraser' },
  { id: 'text',   icon: 'T',  label: 'Text' },
  { id: 'shapes', icon: '◯', label: 'Shapes' },
  { id: 'fill',   icon: '🪣', label: 'Fill' },
  { id: 'zoom',   icon: '🔍', label: 'Zoom In' },
]

// Undo/redo are action triggers, not mode selectors — handled separately.
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
      <ToolButton icon="↩" label="Undo (Ctrl+Z)" :disabled="!editor.canUndo" @click="editor.undo()" />
      <ToolButton icon="↪" label="Redo (Ctrl+Y)" :disabled="!editor.canRedo" @click="editor.redo()" />
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

@media (max-width: 639px) {
  .toolbar {
    width: 100%;
    height: 52px;
    flex-direction: row;
    border-right: none;
    border-top: 1px solid var(--color-border);
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 8px;
    gap: 0;
    order: 2;           /* sits below CanvasArea */
    flex-shrink: 0;
  }

  .tool-group {
    flex-direction: row;
    border-bottom: none;
    border-right: 1px solid var(--color-border);
    padding: 0 6px;
    width: auto;
    gap: 2px;
  }

  .tool-group:last-child { border-right: none; }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .toolbar { width: 48px; }
}
</style>
