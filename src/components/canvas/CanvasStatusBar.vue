<!--
  CanvasStatusBar.vue
  Footer bar: file name on the left, zoom controls centred, dimensions on the right.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'

withDefaults(defineProps<{
  imageWidth?:  number | null
  imageHeight?: number | null
  imageName?:   string | null
}>(), {
  imageWidth:  null,
  imageHeight: null,
  imageName:   null,
})

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
  <footer class="statusbar">

    <!-- Left: file name -->
    <span class="filename">{{ imageName ?? 'No image loaded' }}</span>

    <!-- Center: zoom controls -->
    <div class="zoom-controls">
      <button class="zoom-btn" title="Zoom out" :disabled="!editor.hasImage || editor.zoom <= 10" @click="stepZoomOut">−</button>
      <button class="zoom-value" title="Reset zoom to 100%" :disabled="!editor.hasImage" @click="editor.zoomReset">{{ editor.zoom }}%</button>
      <button class="zoom-btn" title="Zoom in"  :disabled="!editor.hasImage || editor.zoom >= 500" @click="stepZoomIn">+</button>
    </div>

    <!-- Right: dimensions -->
    <span class="dimensions">
      <template v-if="imageWidth && imageHeight">W: {{ imageWidth }}px &nbsp; H: {{ imageHeight }}px</template>
      <template v-else>W: — &nbsp; H: —</template>
    </span>

  </footer>
</template>

<style scoped>
.statusbar {
  height: 32px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--color-subtle);
  flex-shrink: 0;
}

/* Left column */
.filename {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: start;
}

/* Right column */
.dimensions {
  justify-self: end;
  white-space: nowrap;
}

/* Zoom cluster */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 2px;
}

.zoom-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
}

@media (hover: hover) and (pointer: fine) {
  .zoom-btn:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
}

.zoom-btn:disabled,
.zoom-value:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Zoom percentage */
.zoom-value {
  min-width: 48px;
  height: 22px;
  padding: 0 6px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
  text-align: center;
}

@media (hover: hover) and (pointer: fine) {
  .zoom-value:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
}

@media (max-width: 639px) {
  .statusbar { padding: 0 10px; font-size: 0.72rem; }
  .dimensions { display: none; }
}

/* Tablet/desktop */
@media (min-width: 640px) {
  .statusbar { padding-bottom: env(safe-area-inset-bottom); }
}

/* Landscape phones */
@media (orientation: landscape) and (max-height: 500px) {
  .statusbar { display: none; }
}

/* Touch devices */
@media (hover: none), (pointer: coarse) {
  .statusbar { min-height: 48px; }
  .zoom-btn  { width: 40px; height: 40px; }
  .zoom-value { height: 40px; }
}

/* Touch + tablet/desktop */
@media (hover: none) and (min-width: 640px), (pointer: coarse) and (min-width: 640px) {
  .statusbar { min-height: calc(48px + env(safe-area-inset-bottom)); }
}
</style>
