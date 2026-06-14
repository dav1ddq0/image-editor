<!--
  NavbarOverflowMenu.vue
  Small anchored dropdown used on narrow screens to hold the navbar's secondary
  actions so they never overflow the bar. Purely presentational: it receives a
  list of items and emits `select` with the chosen item's key — the parent maps
  that key back to its own events.
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

defineProps<{
  items: { key: string; label: string; disabled?: boolean }[]
}>()

const emit = defineEmits<{ select: [key: string] }>()

const open = ref(false)
const root = ref<HTMLElement>()

function onDocPointer(e: PointerEvent): void {
  if (root.value && !root.value.contains(e.target as Node)) close()
}
function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}

function openMenu(): void {
  open.value = true
  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onKey)
}
function close(): void {
  open.value = false
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onKey)
}
function toggle(): void {
  open.value ? close() : openMenu()
}
function choose(item: { key: string; disabled?: boolean }): void {
  if (item.disabled) return
  emit('select', item.key)
  close()
}

onBeforeUnmount(close)
</script>

<template>
  <div ref="root" class="overflow-menu">
    <button
      class="btn btn-secondary more-btn"
      :aria-expanded="open"
      aria-haspopup="true"
      title="More actions"
      @click="toggle"
    >⋯</button>

    <ul v-if="open" class="menu-list" role="menu">
      <li v-for="item in items" :key="item.key" role="none">
        <button
          class="menu-item"
          role="menuitem"
          :disabled="item.disabled"
          @click="choose(item)"
        >{{ item.label }}</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.overflow-menu {
  position: relative;
  display: flex;
}

.more-btn {
  font-size: 1.1rem;
  line-height: 1;
  padding: 5px 12px;
}

.menu-list {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 180px;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  padding: 6px;
  z-index: 150;
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 0.9rem;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.menu-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (hover: hover) and (pointer: fine) {
  .menu-item:not(:disabled):hover {
    background: var(--color-border);
    color: #fff;
  }
}
</style>
