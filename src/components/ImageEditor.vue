<script setup>
import { useEditor } from '@/composables/useEditor'
import AppNavbar    from './navbar/AppNavbar.vue'
import AppToolbar   from './toolbar/AppToolbar.vue'
import CanvasArea   from './canvas/CanvasArea.vue'
import RightPanel   from './panels/RightPanel.vue'

const { loadImage } = useEditor()

// Hidden file input trick to open the OS file picker
function openImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (file) loadImage(file)
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
