<!--
  CanvasDropZone.vue
  Empty-state drop target shown when no image is loaded. Provides drag-over
  feedback and validates that the dropped file is an image before loading it.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

const editor = useEditorStore()
const isDragging = ref<boolean>(false)

function onDrop(event: DragEvent): void {
  // isDragging must be reset here — dragleave does not fire on a successful drop,
  // so the hover style would otherwise stay on permanently after a file is dropped.
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]

  // Guard against non-image files (PDFs, ZIPs, etc.) being dropped
  if (file && file.type.startsWith('image/')) editor.loadImage(file)
}
</script>

<template>
  <div
    class="drop-zone"
    :class="{ dragging: isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <span class="drop-icon">📂</span>
    <p>Drop an image here or click <strong>Open Image</strong></p>
    <p class="drop-hint">Supports JPG, PNG, GIF, WEBP</p>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 60px 80px;
  text-align: center;
  color: var(--color-subtle);
  transition: border-color 0.2s, color 0.2s;
  cursor: default;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--color-accent);
  color: var(--color-muted);
}

.drop-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
}

.drop-zone p {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.drop-hint {
  font-size: 0.8rem;
  color: #404060;
}
</style>
