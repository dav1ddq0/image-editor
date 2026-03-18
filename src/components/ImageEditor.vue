<!--
  ImageEditor.vue
  Root layout component. Composes the top-level page structure and bridges the
  AppNavbar "open" event to the store's loadImage action via a transient file input.
-->
<script setup>
import { useEditorStore } from '@/stores/editorStore'
import AppNavbar  from './navbar/AppNavbar.vue'
import AppToolbar from './toolbar/AppToolbar.vue'
import CanvasArea from './canvas/CanvasArea.vue'
import RightPanel from './panels/RightPanel.vue'

const editor = useEditorStore()

function openImage() {
  // A transient <input type="file"> is created in memory and never appended to
  // the DOM — this is the standard technique for triggering the OS file picker
  // programmatically without a persistent element in the template.
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (file) editor.loadImage(file)
  }

  input.click()
}
</script>

<template>
  <div class="editor-layout">
    <AppNavbar @open="openImage" />

    <div class="editor-body">
      <AppToolbar />
      <CanvasArea />
      <RightPanel />
    </div>
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
