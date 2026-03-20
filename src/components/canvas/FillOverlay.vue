<!--
  FillOverlay.vue
  Paint-bucket fill tool. Click anywhere to flood-fill that colour region.
  Emits 'fill' with normalised click coords + settings on every click.
  The tool stays active so the user can fill multiple regions; 'cancel' exits.
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
    <!-- Floating toolbar -->
    <div class="fill-toolbar" @pointerdown.stop @click.stop>

      <!-- Bucket icon -->
      <span class="fill-icon" aria-hidden="true">🪣</span>

      <div class="sep" />

      <!-- Fill colour -->
      <label class="ctrl-label">Color</label>
      <input type="color" v-model="color" class="color-picker" title="Fill color" />

      <div class="sep" />

      <!-- Tolerance -->
      <label class="ctrl-label">Tolerance</label>
      <input
        type="range"
        v-model.number="tolerance"
        min="0" max="100" step="1"
        class="range-input"
        title="Colour tolerance"
      />
      <span class="ctrl-value">{{ tolerance }}</span>

      <div class="sep" />

      <button class="tool-btn" @click="emit('cancel')">✕ Done</button>

    </div>
  </div>
</template>

<style scoped>
.fill-overlay {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  user-select: none;
  touch-action: none;
}

/* ── Floating toolbar ── */
.fill-toolbar {
  position: absolute;
  top: -52px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  z-index: 10;
}

.fill-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.sep {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  flex-shrink: 0;
}

.ctrl-label {
  font-size: 0.72rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.color-picker {
  width: 28px;
  height: 26px;
  padding: 1px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: none;
  flex-shrink: 0;
}

.range-input {
  width: 80px;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.ctrl-value {
  font-size: 0.75rem;
  color: var(--color-text);
  min-width: 26px;
  text-align: right;
}

.tool-btn {
  height: 26px;
  padding: 0 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}
.tool-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

@media (max-width: 639px) {
  .fill-toolbar {
    top: auto;
    bottom: -52px;
    left: 0;
    transform: none;
    max-width: 100%;
    overflow-x: auto;
    border-radius: var(--radius-sm);
  }
}
</style>
