<!--
  Vertical left-side toolbar.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import ToolButton from './ToolButton.vue'
import type { ToolDefinition } from '@/types/editor'

const editor = useEditorStore()

const drawingTools: ToolDefinition[] = [
  { id: 'select', icon: 'mdi-cursor-default-outline', label: 'Select' },
  { id: 'crop',   icon: 'mdi-crop',                   label: 'Crop' },
  { id: 'brush',  icon: 'mdi-brush-outline',          label: 'Brush' },
  { id: 'eraser', icon: 'mdi-eraser',                 label: 'Eraser' },
  { id: 'text',   icon: 'mdi-format-text',            label: 'Text' },
  { id: 'shapes', icon: 'mdi-shape-outline',          label: 'Shapes' },
  { id: 'fill',   icon: 'mdi-format-color-fill',      label: 'Fill' },
  { id: 'zoom',   icon: 'mdi-magnify-plus-outline',   label: 'Zoom In' },
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
  width: 100%;
}

.tool-group:not(:last-child)::after {
  content: '';
  width: 28px;
  height: 1px;
  background: var(--color-border);
  margin-top: 12px;
}

@media (max-width: 639px) {
  .toolbar {
    width: 100%;
    min-height: 52px;
    flex-direction: row;
    border-right: none;
    border-top: 1px solid var(--color-border);
    overflow: hidden;
    padding: 0 4px;
    padding-bottom: env(safe-area-inset-bottom);
    gap: 0;
    order: 2;           
    flex-shrink: 0;
  }

  .tool-group {
    flex-direction: row;
    align-items: center;
    padding: 0 2px;
    width: auto;
    min-width: 0;          
    gap: 0;
    justify-content: space-evenly;
  }

  .tool-group :deep(.tool-btn) {
    flex: 1 1 0;
    min-width: 0;
    max-width: 48px;
  }
}

@media (max-width: 639px) and (orientation: landscape) and (max-height: 500px) {
  .toolbar { min-height: 44px; }
}

@media (min-width: 640px) and (max-height: 500px) {
  .toolbar {
    overflow-y: auto;
    justify-content: flex-start;
    padding: 6px 0;
    scrollbar-width: none; 
  }
  .toolbar::-webkit-scrollbar { display: none; }
  .tool-group { padding: 4px 0; flex-shrink: 0; }
  .tool-group:not(:last-child)::after { margin-top: 6px; }
}
</style>
