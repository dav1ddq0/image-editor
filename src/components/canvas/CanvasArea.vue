<script setup>
import { computed } from 'vue'
import { useEditor } from '@/composables/useEditor'
import CanvasDropZone from './CanvasDropZone.vue'
import CanvasStatusBar from './CanvasStatusBar.vue'

const { state } = useEditor()

const hasImage = computed(() => !!state.image)
</script>

<template>
  <main class="canvas-area">
    <div class="canvas-container">
      <CanvasDropZone v-if="!hasImage" />
      <img
        v-else
        :src="state.image.src"
        :alt="state.image.name"
        class="canvas-image"
      />
    </div>
    <CanvasStatusBar
      :zoom="state.zoom"
      :image-width="state.image?.width"
      :image-height="state.image?.height"
      :image-name="state.image?.name"
    />
  </main>
</template>

<style scoped>
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 20px;
}

.canvas-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6);
}
</style>
