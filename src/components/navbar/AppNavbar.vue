<!--
  AppNavbar.vue
  Top navigation bar. Renders the brand and action buttons; emits events upward
  so that ImageEditor.vue owns all business logic responses.
-->
<script setup lang="ts">
const emit = defineEmits<{ open: []; save: []; export: []; 'toggle-panel': [] }>()
</script>

<template>
  <header class="navbar">

    <div class="navbar-brand">
      <span class="brand-icon">🖼️</span>
      <span class="brand-name">Image Editor</span>
    </div>

    <nav class="navbar-actions">
      <button class="btn btn-secondary" @click="emit('open')">Open Image</button>
      <button class="btn btn-primary"   @click="emit('save')">Save</button>
      <button class="btn btn-secondary" @click="emit('export')">Export</button>
      <button class="btn btn-secondary panel-toggle" @click="emit('toggle-panel')" title="Toggle panel">⊞</button>
    </nav>

  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-accent);
}

/* Slightly larger so the emoji visually balances the text */
.brand-icon { font-size: 1.4rem; }

.navbar-actions {
  display: flex;
  gap: 10px;
}

/* Only show on mobile */
.panel-toggle { display: none; }

@media (max-width: 639px) {
  .navbar { height: 48px; padding: 0 12px; }
  .brand-name { display: none; }
  .navbar-actions { gap: 6px; }
  .btn { padding: 5px 10px; font-size: 0.75rem; }
  .panel-toggle { display: flex; align-items: center; justify-content: center; }
}

@media (max-width: 360px) {
  /* Extra small: hide Save label, keep Export as icon-only */
  .navbar-actions .btn:not(.panel-toggle) { padding: 5px 8px; }
}
</style>
