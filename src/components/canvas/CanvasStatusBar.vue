<!--
  CanvasStatusBar.vue
  Thin read-only footer showing zoom level, file name, and image dimensions.
  Purely presentational; all data arrives via props from CanvasArea.
-->
<script setup>
defineProps({
  zoom:        { type: Number, default: 100 },
  imageWidth:  { type: Number, default: null },
  imageHeight: { type: Number, default: null },
  imageName:   { type: String, default: null },
})
</script>

<template>
  <footer class="statusbar">
    <span>Zoom: {{ zoom }}%</span>
    <span class="divider">—</span>
    <span>{{ imageName ?? 'No image loaded' }}</span>
    <span class="spacer" />
    <span v-if="imageWidth && imageHeight">W: {{ imageWidth }}px &nbsp; H: {{ imageHeight }}px</span>
    <span v-else>W: — &nbsp; H: —</span>
  </footer>
</template>

<style scoped>
.statusbar {
  height: 28px;
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

/* flex: 1 pushes the dimension readout to the right edge */
.spacer  { flex: 1; }
</style>
