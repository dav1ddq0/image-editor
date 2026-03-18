<!--
  AppNavbar.vue

  Top navigation bar component displayed across the full width of the editor.
  Responsibilities:
    - Renders the application brand (icon + name) on the left side.
    - Provides action buttons (Open Image, Save, Export) on the right side.
    - Does NOT contain any business logic; it only emits events upward so that
      the parent component (ImageEditor.vue) can decide how to handle them.

  Emits:
    - open   : user clicked "Open Image" – parent should trigger the file picker
    - save   : user clicked "Save"       – parent should save the current work
    - export : user clicked "Export"     – parent should export the final image
-->
<script setup>
/*
 * defineEmits declares the events this component can emit to its parent.
 *   'open'   – request to open a new image file
 *   'save'   – request to save the current project state
 *   'export' – request to export/download the processed image
 */
const emit = defineEmits(['open', 'save', 'export'])
</script>

<template>
  <!--
    <header> is used for semantic correctness; it represents the page header.
    The .navbar class provides the flex layout and fixed height.
  -->
  <header class="navbar">

    <!-- ── Brand ──────────────────────────────────────────────────────────── -->
    <!--
      .navbar-brand displays the application identity on the left side.
      The emoji icon provides a quick visual identifier without requiring
      an external asset file.
    -->
    <div class="navbar-brand">
      <!-- Decorative icon representing the image-editing nature of the app -->
      <span class="brand-icon">🖼️</span>
      <!-- Application name label -->
      <span class="brand-name">Image Editor</span>
    </div>

    <!-- ── Action buttons ─────────────────────────────────────────────────── -->
    <!--
      .navbar-actions groups the primary CTA buttons on the right side.
      Each button emits a specific event; no handler logic lives here.
    -->
    <nav class="navbar-actions">
      <!-- Triggers the parent to open the OS file picker for loading an image -->
      <button class="btn btn-secondary" @click="emit('open')">Open Image</button>

      <!-- Triggers the parent to persist the current editing session -->
      <button class="btn btn-primary"   @click="emit('save')">Save</button>

      <!-- Triggers the parent to export / download the edited image -->
      <button class="btn btn-secondary" @click="emit('export')">Export</button>
    </nav>

  </header>
</template>

<style scoped>
/*
 * .navbar
 * Full-width flex row pinned to the top of the editor layout.
 * justify-content: space-between pushes brand to the left and actions to the right.
 * flex-shrink: 0 prevents the bar from collapsing when vertical space is tight.
 */
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

/*
 * .navbar-brand
 * Inline flex row that aligns the icon and text label side-by-side.
 * Uses the accent color to make the brand visually prominent.
 */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-accent);
}

/* Slightly larger font size for the emoji so it visually balances the text */
.brand-icon { font-size: 1.4rem; }

/*
 * .navbar-actions
 * Flex row that spaces the action buttons evenly.
 */
.navbar-actions {
  display: flex;
  gap: 10px;
}
</style>
