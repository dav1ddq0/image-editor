<!--
  CanvasArea.vue
  Central workspace. Shows CanvasDropZone when no image is loaded, the image
  itself once one is available, and CanvasStatusBar at the bottom.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import CanvasDropZone  from './CanvasDropZone.vue'
import CanvasStatusBar from './CanvasStatusBar.vue'

const editor = useEditorStore()

// Builds the 3×3 unsharp-mask kernel string for feConvolveMatrix.
// Kernel: [ 0  -s  0 / -s  1+4s  -s / 0  -s  0 ] (divisor = 1, sum = 1 → no brightness shift)
// At s=0 this is the identity kernel; higher s = stronger edge enhancement.
const sharpenKernel = computed<string>(() => {
  const s = editor.adjustments.sharpness / 50 // 0-100 → 0-2
  return `0 ${-s} 0 ${-s} ${1 + 4 * s} ${-s} 0 ${-s} 0`
})
</script>

<template>
  <main class="canvas-area">

    <!--
      Hidden SVG that declares the reactive sharpen filter.
      CSS filter: url(#image-sharpen) references this by ID.
      The kernel is updated reactively so the preview responds to the slider in real time.
    -->
    <svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;">
      <defs>
        <filter id="image-sharpen" x="0%" y="0%" width="100%" height="100%"
                color-interpolation-filters="linearRGB">
          <feConvolveMatrix order="3" :kernelMatrix="sharpenKernel"
                            divisor="1" bias="0" edgeMode="duplicate" />
        </filter>
      </defs>
    </svg>

    <div class="canvas-container">
      <CanvasDropZone v-if="!editor.hasImage" />

      <img
        v-else
        :src="editor.image.src"
        :alt="editor.image.name"
        :style="{ filter: editor.cssFilter, transform: editor.cssTransform }"
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
