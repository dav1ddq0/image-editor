<!--
  TransformPanel.vue
  Right-panel section with rotate and flip action buttons.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'

const editor = useEditorStore()
</script>

<template>
  <section class="panel-section">

    <h3 class="panel-title">Transform</h3>

    <div class="transform-actions">
      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="editor.rotateLeft()"
      >Rotate L</button>

      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="editor.rotateRight()"
      >Rotate R</button>

      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="editor.flipHorizontal()"
      >Flip H</button>

      <button
        class="btn btn-small btn-secondary"
        :disabled="!editor.hasImage"
        @click="editor.flipVertical()"
      >Flip V</button>
    </div>

  </section>
</template>

<style scoped>
.transform-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
</style>
