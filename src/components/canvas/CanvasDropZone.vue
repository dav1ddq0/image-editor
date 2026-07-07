<!--
  Empty-state drop target shown when no image is loaded. Provides drag-over
  feedback and validates that the dropped file is an image before loading it.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

const editor = useEditorStore()
const isDragging = ref<boolean>(false)

function onDrop(event: DragEvent): void {
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
    <span class="drop-icon-wrap">
      <v-icon class="drop-icon" icon="mdi-image-plus-outline" />
    </span>
    <p class="drop-headline">Drop an image here or click <strong>Open Image</strong></p>
    <p class="drop-hint">Supports JPG, PNG, GIF, WEBP</p>
  </div>
</template>

<style scoped>
.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in oklab, var(--color-surface) 45%, transparent);
  padding: clamp(32px, 8vw, 60px) clamp(24px, 10vw, 80px);
  text-align: center;
  color: var(--color-subtle);
  transition: border-color var(--transition), color var(--transition),
              background-color var(--transition), transform var(--transition);
  cursor: default;
}

.drop-zone.dragging {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-muted);
  transform: scale(1.02);
}

@media (hover: hover) and (pointer: fine) {
  .drop-zone:hover {
    border-color: var(--color-accent);
    color: var(--color-muted);
  }
}

/* Accent-tinted circle behind the icon */
.drop-icon-wrap {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  margin-bottom: 20px;
  transition: transform var(--transition);
}

.drop-zone.dragging .drop-icon-wrap {
  transform: scale(1.1);
}

.drop-icon {
  font-size: 36px;
  color: var(--color-accent);
}

.drop-headline {
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: var(--color-muted);
}

.drop-headline strong {
  color: var(--color-text);
}

.drop-hint {
  font-size: 0.8rem;
  color: var(--color-subtle);
}
</style>
