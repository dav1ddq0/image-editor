<script setup>
const emit = defineEmits(['open', 'save', 'export'])
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

.brand-icon { font-size: 1.4rem; }

.navbar-actions {
  display: flex;
  gap: 10px;
}
</style>
