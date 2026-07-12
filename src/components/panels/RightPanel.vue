<!--
  Scrollable right-side wrapper that composes the three editing sub-panels.
  Each sub-panel manages its own store interactions independently.
-->
<script setup lang="ts">
import AdjustmentsPanel from './AdjustmentsPanel.vue'
import FiltersPanel from './FiltersPanel.vue'
import TransformPanel from './TransformPanel.vue'

defineProps<{ panelOpen?: boolean }>()
defineEmits<{ 'close-panel': [] }>()
</script>

<template>
  <aside class="right-panel" :class="{ 'is-open': panelOpen }">
    <div class="panel-mobile-header">
      <span class="panel-mobile-title">Settings</span>
      <v-btn
        class="panel-close-btn"
        variant="text"
        icon="mdi-close"
        size="small"
        aria-label="Close settings"
        @click="$emit('close-panel')"
      />
    </div>
    <AdjustmentsPanel />
    <FiltersPanel />
    <TransformPanel />
  </aside>
</template>

<style scoped>
.right-panel {
  width: 240px;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  flex-shrink: 0;
}

.panel-mobile-header { display: none; }

@media (max-width: 1240px) {
  .right-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(320px, 85vw);
    z-index: 100;
    transform: translateX(100%);
    transition: transform 0.3s var(--ease-emphasized);
    box-shadow: var(--shadow-lg);
    border-left: 1px solid var(--color-border);
    padding-bottom: env(safe-area-inset-bottom);
    padding-right: env(safe-area-inset-right);
  }

  .right-panel.is-open {
    transform: translateX(0);
  }

  .panel-mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    padding-top: max(14px, env(safe-area-inset-top));
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    background: var(--color-surface);
    z-index: 1;
  }

  .panel-mobile-title {
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-accent);
  }
}
</style>
