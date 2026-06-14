<!--
  CanvasStatusBar.vue
  Footer bar: zoom controls on the left, file name in the middle, dimensions on the right.
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

    <!-- Zoom controls -->
    <div class="zoom-controls">
      <button class="zoom-btn" title="Zoom out" :disabled="editor.zoom <= 10" @click="stepZoomOut">−</button>
      <button class="zoom-value" title="Reset zoom to 100%" @click="editor.zoomReset">{{ editor.zoom }}%</button>
      <button class="zoom-btn" title="Zoom in"  :disabled="editor.zoom >= 500" @click="stepZoomIn">+</button>
    </div>

    <span class="divider">—</span>
    <span class="filename">{{ imageName ?? 'No image loaded' }}</span>

    <span class="spacer" />
    <span v-if="imageWidth && imageHeight">W: {{ imageWidth }}px &nbsp; H: {{ imageHeight }}px</span>
    <span v-else>W: — &nbsp; H: —</span>

  </footer>
</template>

<style scoped>
.statusbar {
  height: 32px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  font-size: 0.78rem;
  color: var(--color-subtle);
  flex-shrink: 0;
}

.divider { opacity: 0.4; }
.spacer  { flex: 1; }

/* Truncate long file names instead of letting them break the row */
.filename {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
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

.zoom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Zoom percentage — acts as a reset button */
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
  .zoom-value:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
}

@media (max-width: 639px) {
  .statusbar { gap: 10px; padding: 0 10px; font-size: 0.72rem; }
  .divider   { display: none; }
  /* Hide the dimensions readout on small screens */
  .statusbar > span:last-child { display: none; }
}

/* Tablet/desktop: the status bar is the bottom-most chrome, so honor the inset */
@media (min-width: 640px) {
  .statusbar { padding-bottom: env(safe-area-inset-bottom); }
}

/* Landscape phones: drop the status bar to reclaim vertical space */
@media (orientation: landscape) and (max-height: 500px) {
  .statusbar { display: none; }
}

/* Touch devices: larger zoom controls in a taller status bar */
@media (hover: none), (pointer: coarse) {
  .statusbar { min-height: 48px; }
  .zoom-btn  { width: 40px; height: 40px; }
  .zoom-value { height: 40px; }
}
</style>
