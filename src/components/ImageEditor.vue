<!--
  ImageEditor.vue
  Root layout component. Composes the top-level page structure and handles
  file open and save/export operations on behalf of the child components.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import AppNavbar  from './navbar/AppNavbar.vue'
import AppToolbar from './toolbar/AppToolbar.vue'
import CanvasArea from './canvas/CanvasArea.vue'
import RightPanel from './panels/RightPanel.vue'

const editor = useEditorStore()

function openImage(): void {
  // A transient <input type="file"> is created in memory and never appended to
  // the DOM — this is the standard technique for triggering the OS file picker
  // programmatically without a persistent element in the template.
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) editor.loadImage(file)
  }

  input.click()
}

function saveImage(): void {
  if (!editor.image) return

  const source = editor.image
  const img = new Image()

  img.onload = () => {
    // Draw at the original resolution so no quality is lost
    const canvas = document.createElement('canvas')
    canvas.width  = img.naturalWidth
    canvas.height = img.naturalHeight

    const ctx = canvas.getContext('2d')!

    // ctx.filter mirrors the CSS filter API, so the saved file exactly
    // matches what the user sees on screen
    ctx.filter = editor.cssFilter || 'none'
    ctx.drawImage(img, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = source.name
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  img.src = source.src
}
</script>

<template>
  <div class="editor-layout">
    <AppNavbar @open="openImage" @save="saveImage" />

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
