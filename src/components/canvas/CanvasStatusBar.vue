<!--
  Floating canvas info layer. Reset-to-original, zoom controls and undo/redo
  float as frosted-glass chips over the bottom of the canvas.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'

const editor = useEditorStore()

const ZOOM_STEPS = [10, 25, 33, 50, 67, 75, 100, 125, 150, 200, 300, 400, 500]

// Jump to the nearest step above/below the current zoom level.
function stepZoomIn(): void {
  const next = ZOOM_STEPS.find(z => z > editor.zoom)
  if (next) editor.setZoom(next)
}

function stepZoomOut(): void {
  const prev = [...ZOOM_STEPS].reverse().find(z => z < editor.zoom)
  if (prev) editor.setZoom(prev)
}
</script>

<template>

  <div
    v-if="editor.hasImage"
    class="floating-info"
    :class="{ 'is-dimmed': editor.zoomLocked }"
  >
    <div class="chip reset-control">
      <button class="zoom-btn" title="Reset to original" :disabled="!editor.hasImage" @click="editor.resetImage()">
        <v-icon icon="mdi-backup-restore" size="18" />
      </button>
    </div>

    <div v-if="!editor.zoomLocked" class="chip zoom-controls">
      <button class="zoom-btn" title="Zoom out" :disabled="editor.zoom <= 10" @click="stepZoomOut">−</button>
      <button class="zoom-value" title="Reset zoom to 100%" @click="editor.zoomReset">{{ editor.zoom }}%</button>
      <button class="zoom-btn" title="Zoom in" :disabled="editor.zoom >= 500" @click="stepZoomIn">+</button>
    </div>

    <div class="chip undo-redo-controls">
      <button class="zoom-btn" title="Undo (Ctrl+Z)" :disabled="!editor.canUndo" @click="editor.undo()">
        <v-icon icon="mdi-undo" size="18" />
      </button>
      <button class="zoom-btn" title="Redo (Ctrl+Y)" :disabled="!editor.canRedo" @click="editor.redo()">
        <v-icon icon="mdi-redo" size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.floating-info {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 8px;
  padding: 12px max(12px, env(safe-area-inset-right))
           max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  pointer-events: none;
  z-index: 5;
}

.chip {
  pointer-events: auto;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  box-shadow: var(--shadow-md);
  font-size: 0.78rem;
  color: var(--color-subtle);
  transition: opacity var(--transition);
}

.reset-control {
  grid-column: 1;
  justify-self: start;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  padding: 0;
}

.undo-redo-controls {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  padding: 0;
}

.undo-redo-controls .zoom-btn:first-child {
  border-inline-end: 1px solid var(--color-border);
}

.floating-info.is-dimmed .reset-control,
.floating-info.is-dimmed .undo-redo-controls {
  opacity: 0;
  pointer-events: none;
}

.zoom-controls {
  grid-column: 2;
  justify-self: center;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  padding: 0;
}

.zoom-btn {
  width: 30px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

@media (hover: hover) and (pointer: fine) {
  .zoom-btn:hover:not(:disabled) {
    background: var(--color-accent-soft);
    color: var(--color-accent);
  }
}

.zoom-btn:disabled,
.zoom-value:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-value {
  min-width: 52px;
  height: 28px;
  padding: 0 6px;
  background: none;
  border: none;
  border-inline: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
  text-align: center;
}

@media (hover: hover) and (pointer: fine) {
  .zoom-value:hover:not(:disabled) {
    background: var(--color-accent-soft);
    color: var(--color-accent);
  }
}

@media (max-width: 639px) {
  .floating-info { padding: 10px; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .floating-info { display: none; }
}

/* Touch devices */
@media (hover: none), (pointer: coarse) {
  .zoom-btn   { width: 44px; height: 40px; }
  .zoom-value { height: 40px; }
}
</style>
