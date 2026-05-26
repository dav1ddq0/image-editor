<!--
  AppNavbar.vue
  Top navigation bar. Renders the brand and action buttons; emits events upward
  so that ImageEditor.vue owns all business logic responses.
-->
<script setup lang="ts">
defineProps<{ hasImage?: boolean }>()
const emit = defineEmits<{ open: []; save: []; export: []; 'scan-qr': []; 'scan-barcode': []; 'ascii-art': []; 'extract-text': []; 'toggle-panel': [] }>()
</script>

<template>
  <header class="navbar">

    <div class="navbar-brand">
      <svg class="brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <!-- Photo frame -->
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/>
        <!-- Sun -->
        <circle cx="5.5" cy="6.5" r="1.6" fill="currentColor"/>
        <!-- Mountain silhouette -->
        <path d="M2.5 14.5 L7 9.5 L10 12 L12.5 9.5 L15.5 14.5"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Brush shaft -->
        <line x1="16.5" y1="13.5" x2="22" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <!-- Brush tip / bristles -->
        <path d="M15 15 Q13 18.5 14.2 20 Q15.8 21.2 17.2 19.2 L16.5 13.5 Z" fill="currentColor"/>
      </svg>
      <span class="brand-name">Image Editor</span>
    </div>

    <nav class="navbar-actions">
      <button class="btn btn-secondary" @click="emit('open')">Open Image</button>
      <button class="btn btn-primary"   @click="emit('save')">Save</button>
      <button class="btn btn-secondary" @click="emit('export')">Export</button>
      <button
        class="btn btn-secondary qr-btn"
        :disabled="!hasImage"
        title="Scan QR code"
        @click="emit('scan-qr')"
      >
        <svg class="qr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3"  y="3"  width="7" height="7" rx="1" />
          <rect x="14" y="3"  width="7" height="7" rx="1" />
          <rect x="3"  y="14" width="7" height="7" rx="1" />
          <rect x="5"  y="5"  width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="16" y="5"  width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="5"  y="16" width="3" height="3" fill="currentColor" stroke="none" />
          <path d="M14 14h3v3M17 17h3M14 20h3" />
        </svg>
        <span class="qr-label">Scan QR</span>
      </button>
      <button
        class="btn btn-secondary bc-btn"
        :disabled="!hasImage"
        title="Scan barcode"
        @click="emit('scan-barcode')"
      >
        <svg class="bc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <line x1="4"  y1="4" x2="4"  y2="20" />
          <line x1="7"  y1="4" x2="7"  y2="20" stroke-width="2.5" />
          <line x1="10" y1="4" x2="10" y2="20" />
          <line x1="13" y1="4" x2="13" y2="20" stroke-width="2.5" />
          <line x1="16" y1="4" x2="16" y2="20" />
          <line x1="19" y1="4" x2="19" y2="20" stroke-width="2.5" />
          <line x1="2"  y1="21" x2="22" y2="21" stroke-width="1" />
        </svg>
        <span class="bc-label">Scan Barcode</span>
      </button>
      <button
        class="btn btn-secondary ascii-btn"
        :disabled="!hasImage"
        title="Generate ASCII art"
        @click="emit('ascii-art')"
      >
        <img src="/fish-ascii.svg" class="ascii-icon" alt="" aria-hidden="true" />
        <span class="ascii-label">ASCII Art</span>
      </button>
      <button
        class="btn btn-secondary ocr-btn"
        :disabled="!hasImage"
        title="Extract text from image"
        @click="emit('extract-text')"
      >
        <svg class="ocr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <!-- Document outline -->
          <rect x="4" y="2" width="13" height="18" rx="2" />
          <!-- Folded corner -->
          <path d="M14 2v5h5" stroke-width="1.4" />
          <!-- Text lines -->
          <line x1="7" y1="11" x2="15" y2="11" />
          <line x1="7" y1="14" x2="15" y2="14" />
          <line x1="7" y1="17" x2="11" y2="17" />
        </svg>
        <span class="ocr-label">Extract Text</span>
      </button>
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

.brand-name {
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.06em;
}

.brand-icon {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: var(--color-accent);
}

.navbar-actions {
  display: flex;
  gap: 10px;
}

/* QR scan button */
.qr-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
.qr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qr-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Barcode scan button */
.bc-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.bc-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* ASCII art button */
.ascii-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ascii-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ascii-icon { width: 24px; height: 18px; flex-shrink: 0; }

/* Extract Text button */
.ocr-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ocr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ocr-icon { width: 16px; height: 16px; flex-shrink: 0; }

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
