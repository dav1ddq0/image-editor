<!--
  RightPanel.vue
  Scrollable right-side wrapper that composes the three editing sub-panels.
  Each sub-panel manages its own store interactions independently.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import AdjustmentsPanel from './AdjustmentsPanel.vue'
import FiltersPanel from './FiltersPanel.vue'
import TransformPanel from './TransformPanel.vue'

defineProps<{ panelOpen?: boolean }>()
defineEmits<{ 'close-panel': [] }>()

const editor = useEditorStore()
</script>

<template>
  <aside class="right-panel" :class="{ 'is-open': panelOpen }">
    <div class="panel-mobile-header">
      <span class="panel-mobile-title">Settings</span>
      <button class="panel-close-btn" @click="$emit('close-panel')">✕</button>
    </div>
    <AdjustmentsPanel />
    <FiltersPanel />
    <TransformPanel />

    <div class="reset-section">
      <button
        class="btn btn-danger reset-btn"
        :disabled="!editor.hasImage"
        @click="editor.resetImage()"
      >
        Reset to Original
      </button>
    </div>
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

.reset-section {
  padding: 16px;
}

.reset-btn {
  width: 100%;
}

/* Mobile header shown only when the panel is a sheet */
.panel-mobile-header { display: none; }

/* Slide-in sheet on phones AND tablets (≤1240px, covers iPad Pro 11" landscape
   at ≈1194px); docked on desktop / iPad Pro 13" landscape (≈1376px). */
@media (max-width: 1240px) {
  .right-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(320px, 85vw);
    z-index: 100;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.6);
    border-left: 1px solid var(--color-border);
    /* Keep content clear of the home indicator / side notch in landscape */
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

  .panel-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--color-muted);
    font-size: 1.1rem;
    cursor: pointer;
    transition: background var(--transition), color var(--transition);
  }
}

/* Hover (desktop): fill into a red circle */
@media (hover: hover) and (pointer: fine) {
  .panel-close-btn:hover {
    background: var(--color-accent);
    color: #fff;
  }
}

/* Press feedback on touch (no hover available) */
.panel-close-btn:active {
  background: var(--color-accent);
  color: #fff;
}
</style>
