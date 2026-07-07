<!--
  Paint-bucket fill tool. Click anywhere to flood-fill that colour region.
-->
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ imgWidth: number; imgHeight: number }>()
const emit = defineEmits<{
  fill:   [nx: number, ny: number, color: string, tolerance: number]
  cancel: []
}>()

const color     = ref('#000000')
const tolerance = ref(20)

function onClick(e: MouseEvent): void {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const nx = (e.clientX - rect.left)  / rect.width
  const ny = (e.clientY - rect.top)   / rect.height
  emit('fill', nx, ny, color.value, tolerance.value)
}
</script>

<template>
  <div
    class="fill-overlay"
    :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
    @click="onClick"
  >
    <Teleport to="#canvas-area-host">
    <div class="fill-toolbar" @pointerdown.stop @click.stop>

      <v-icon class="tool-indicator" icon="mdi-format-color-fill" size="17" aria-hidden="true" />

      <div class="ov-sep" />

      <label class="ov-label">Color</label>
      <input type="color" v-model="color" class="ov-swatch" title="Fill color" />

      <div class="ov-sep" />

      <label class="ov-label">Tolerance</label>
      <input
        type="range"
        v-model.number="tolerance"
        min="0" max="100" step="1"
        class="ov-range"
        title="Colour tolerance"
      />
      <span class="ov-value">{{ tolerance }}</span>

      <div class="ov-sep" />

      <button class="ov-btn ov-btn--primary" @click="emit('cancel')"><v-icon icon="mdi-check" size="15" />Done</button>

    </div>
    </Teleport>
  </div>
</template>

<style scoped>
.fill-overlay {
  position: absolute;
  top: 0;
  left: 0;
  cursor: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZD0iTTUgNSBROSAxIDEzIDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg4OCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zIDUgTDEgMTkgTDE3IDE5IEwxNSA1IFoiIGZpbGw9IiM0YTkwZDkiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHJlY3QgeD0iMiIgeT0iMy41IiB3aWR0aD0iMTQiIGhlaWdodD0iMi41IiByeD0iMS4yNSIgZmlsbD0iIzJhNmFhYSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTUgMTMgUTIyIDEzIDI1IDE5IFEyNyAyNSAyNCAyOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNGE5MGQ5IiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iMjQiIGN5PSIyOCIgcj0iMi41IiBmaWxsPSIjNGE5MGQ5IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=') 24 28, crosshair;
  user-select: none;
  touch-action: none;
}

.fill-toolbar {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 12px;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
  z-index: 200;
}

.tool-indicator {
  color: var(--color-accent);
  flex-shrink: 0;
}

@media (max-width: 639px) {
  .fill-toolbar {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
  }
}
</style>
