<!--
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

    <span class="filename">{{ imageName ?? 'No image loaded' }}</span>

    <div v-if="!editor.zoomLocked" class="zoom-controls">
      <button class="zoom-btn" title="Zoom out" :disabled="!editor.hasImage || editor.zoom <= 10" @click="stepZoomOut">−</button>
      <button class="zoom-value" title="Reset zoom to 100%" :disabled="!editor.hasImage" @click="editor.zoomReset">{{ editor.zoom }}%</button>
      <button class="zoom-btn" title="Zoom in"  :disabled="!editor.hasImage || editor.zoom >= 500" @click="stepZoomIn">+</button>
    </div>

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

.filename {
  grid-column: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: start;
}

.dimensions {
  grid-column: 3;
  justify-self: end;
  white-space: nowrap;
}

.zoom-controls {
  grid-column: 2;
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.zoom-btn {
  width: 26px;
  height: 22px;
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

.zoom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-value {
  min-width: 48px;
  height: 22px;
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
  .statusbar { padding: 0 10px; font-size: 0.72rem; }
  .dimensions { display: none; }
}

@media (min-width: 640px) {
  .statusbar { padding-bottom: env(safe-area-inset-bottom); }
}

@media (orientation: landscape) and (max-height: 500px) {
  .statusbar { display: none; }
}

/* Touch devices: larger zoom controls in a taller status bar */
@media (hover: none), (pointer: coarse) {
  .statusbar { min-height: 48px; }
  .zoom-btn  { width: 44px; height: 40px; }
  .zoom-value { height: 40px; }
}

/* Touch + tablet/desktop: min-height must absorb the safe-area padding (border-box) */
@media (hover: none) and (min-width: 640px), (pointer: coarse) and (min-width: 640px) {
  .statusbar { min-height: calc(48px + env(safe-area-inset-bottom)); }
}
</style>
