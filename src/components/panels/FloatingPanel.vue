<!--
  FloatingPanel.vue
  Shared chrome for the editing panels: a floating, fully-rounded glass card
  inset from the viewport edges, with a titled header and a close button.
-->
<script setup lang="ts">
defineProps<{ title: string; open?: boolean }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <aside class="floating-panel" :class="{ 'is-open': open }" :aria-hidden="!open">
    <header class="panel-header">
      <span class="panel-header-title">{{ title }}</span>
      <v-btn
        class="panel-close-btn"
        variant="text"
        icon="mdi-close"
        size="small"
        :aria-label="`Close ${title}`"
        @click="$emit('close')"
      />
    </header>

    <slot name="subheader" />

    <div class="panel-body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.floating-panel {
  position: fixed;
  top: calc(56px + env(safe-area-inset-top) + 16px);
  right: max(16px, env(safe-area-inset-right));
  bottom: max(16px, env(safe-area-inset-bottom));
  width: 288px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transform: translateX(calc(100% + 24px));
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transition:
    transform  0.3s var(--ease-emphasized),
    opacity    0.2s var(--ease-standard),
    visibility 0s linear 0.3s;
}

.floating-panel.is-open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
  transition:
    transform  0.3s var(--ease-emphasized),
    opacity    0.2s var(--ease-standard),
    visibility 0s;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
  padding: 10px 8px 10px 16px;
  border-bottom: 1px solid var(--color-border);
}

.panel-header-title {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  white-space: nowrap;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.panel-body :deep(.panel-section) {
  border-bottom: none;
}

@media (orientation: landscape) and (max-height: 500px) {
  .floating-panel {
    top: calc(46px + env(safe-area-inset-top) + 10px);
    bottom: max(10px, env(safe-area-inset-bottom));
  }
}

@media (max-width: 639px) {
  .floating-panel {
    top: calc(52px + env(safe-area-inset-top) + 12px);
    right: max(12px, env(safe-area-inset-right));
    bottom: max(12px, env(safe-area-inset-bottom));
    left: max(12px, env(safe-area-inset-left));
    width: auto;
    transform: translateY(calc(100% + 24px));
  }

  .floating-panel.is-open {
    transform: translateY(0);
  }
}
</style>
