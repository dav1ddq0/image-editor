<!--
  CanvasArea.vue
  Central workspace. Shows CanvasDropZone when no image is loaded, the image
  itself once one is available, and CanvasStatusBar at the bottom.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import CanvasDropZone  from './CanvasDropZone.vue'
import CanvasStatusBar from './CanvasStatusBar.vue'

const editor = useEditorStore()
</script>

<template>
  <main class="canvas-area">

    <div class="canvas-container">
      <CanvasDropZone v-if="!editor.hasImage" />

      <img
        v-else
        :src="editor.image.src"
        :alt="editor.image.name"
        :style="{ filter: editor.cssFilter }"
        class="canvas-image"
      />
    </div>

    <!--
      Optional chaining on editor.image because image is null before any file is
      loaded; CanvasStatusBar accepts null props and renders fallback text.
    -->
    <CanvasStatusBar
      :zoom="editor.zoom"
      :image-width="editor.image?.width"
      :image-height="editor.image?.height"
      :image-name="editor.image?.name"
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
