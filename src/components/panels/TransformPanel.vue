<!--
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
      <v-btn
        class="transform-btn"
        variant="tonal"
        size="small"
        prepend-icon="mdi-rotate-left"
        :disabled="!editor.hasImage"
        @click="editor.rotateLeft()"
      >Rotate L</v-btn>

      <v-btn
        class="transform-btn"
        variant="tonal"
        size="small"
        prepend-icon="mdi-rotate-right"
        :disabled="!editor.hasImage"
        @click="editor.rotateRight()"
      >Rotate R</v-btn>

      <v-btn
        class="transform-btn"
        variant="tonal"
        size="small"
        prepend-icon="mdi-flip-horizontal"
        :disabled="!editor.hasImage"
        @click="editor.flipHorizontal()"
      >Flip H</v-btn>

      <v-btn
        class="transform-btn"
        variant="tonal"
        size="small"
        prepend-icon="mdi-flip-vertical"
        :disabled="!editor.hasImage"
        @click="editor.flipVertical()"
      >Flip V</v-btn>
    </div>

  </section>
</template>

<style scoped>
.transform-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.transform-btn {
  text-transform: none;
  letter-spacing: 0.01em;
}
</style>
