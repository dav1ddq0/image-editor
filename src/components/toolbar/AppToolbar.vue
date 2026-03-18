<!--
  AppToolbar.vue

  Vertical left-side toolbar that lists all available editing tools.
  Responsibilities:
    - Renders two groups of ToolButton components: drawing/editing tools and
      history (undo/redo) tools, separated by a visual divider.
    - Reads `editor.selectedTool` to mark the currently active tool as highlighted.
    - Calls `editor.selectTool(id)` when a tool button is clicked.

  The toolbar does not contain any canvas logic; it is purely a UI control
  that modifies the store's `selectedTool` state, which other components
  (such as CanvasArea) observe to change interaction behaviour.
-->
<script setup>
// Import the editor store to read selectedTool and dispatch selectTool()
import { useEditorStore } from '@/stores/editorStore'

// ToolButton is the individual icon-button component rendered for each tool
import ToolButton from './ToolButton.vue'

// Obtain the reactive editor store instance
const editor = useEditorStore()

/*
 * drawingTools – ordered list of the primary editing/drawing tools.
 * Each entry contains:
 *   id    : unique string identifier used in the store and as the Vue :key
 *   icon  : emoji or Unicode character displayed on the button face
 *   label : human-readable tooltip text shown on hover
 */
const drawingTools = [
  { id: 'select', icon: '↖', label: 'Select' },  // pointer/selection mode
  { id: 'crop',   icon: '⊡', label: 'Crop' },    // crop / trim the canvas
  { id: 'brush',  icon: '🖌', label: 'Brush' },   // free-hand painting
  { id: 'eraser', icon: '◻', label: 'Eraser' },  // erase painted areas
  { id: 'text',   icon: 'T',  label: 'Text' },    // add text annotations
  { id: 'shapes', icon: '◯', label: 'Shapes' },  // draw geometric shapes
  { id: 'fill',   icon: '🪣', label: 'Fill' },    // flood-fill a region
  { id: 'zoom',   icon: '🔍', label: 'Zoom In' }, // zoom into the canvas
]

/*
 * historyTools – list of history navigation actions rendered in a separate
 * group below the main drawing tools.
 * These do not have an "active" concept in the same way drawing tools do;
 * they are action triggers rather than mode selectors.
 */
const historyTools = [
  { id: 'undo', icon: '↩', label: 'Undo' }, // step backward in edit history
  { id: 'redo', icon: '↪', label: 'Redo' }, // step forward in edit history
]
</script>

<template>
  <!--
    <aside> is semantically appropriate for a supplementary UI panel.
    .toolbar provides the flex column layout with a fixed width.
  -->
  <aside class="toolbar">

    <!-- ── Drawing / editing tools group ──────────────────────────────────── -->
    <!--
      The first .tool-group contains all mode-based tools.
      v-for iterates over the drawingTools array; :key uses the tool id.
      :active compares the store's selectedTool to each tool's id to highlight
      the currently active one.
      @click calls selectTool on the store with the tool's id.
    -->
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

    <!-- ── History tools group (undo / redo) ──────────────────────────────── -->
    <!--
      The second .tool-group holds undo and redo.
      These are action-based rather than mode-based, so they have no :active
      binding – clicking them fires an action rather than entering a mode.
    -->
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
/*
 * .toolbar
 * Narrow vertical panel fixed to the left side of the editor body.
 * flex-shrink: 0 prevents it from being squashed when the canvas area is large.
 */
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

/*
 * .tool-group
 * Visually separates logical groups of tools with a bottom border.
 * Each group is a flex column centered horizontally.
 */
.tool-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border); /* divider between groups */
  width: 100%;
}

/* Remove the bottom border from the last group to avoid a double-border effect */
.tool-group:last-child {
  border-bottom: none;
}
</style>
