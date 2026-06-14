<!--
  AppNavbar.vue
  Top navigation bar. Renders the brand and action buttons; emits events upward
  so that ImageEditor.vue owns all business logic responses.

  Responsive behavior:
  - Desktop (≥1025px): icon + label buttons, all actions inline.
  - Tablet (640–1024px): icon-only buttons (labels hidden), all actions inline.
  - Phone (≤639px): primary actions inline; secondary actions collapse into the
    NavbarOverflowMenu so the bar never overflows.
-->
<script setup lang="ts">
import { computed } from 'vue'
import NavbarOverflowMenu from './NavbarOverflowMenu.vue'

const props = defineProps<{ hasImage?: boolean }>()
const emit = defineEmits<{ open: []; save: []; export: []; 'scan-qr': []; 'scan-barcode': []; 'ascii-art': []; 'extract-text': []; 'toggle-panel': [] }>()

// Secondary actions that move into the "⋯ More" menu on phones. Disabled until
// an image is loaded, mirroring the inline buttons.
const overflowItems = computed(() => [
  { key: 'scan-qr',      label: 'Scan QR',      disabled: !props.hasImage },
  { key: 'scan-barcode', label: 'Scan Barcode', disabled: !props.hasImage },
  { key: 'ascii-art',    label: 'ASCII Art',    disabled: !props.hasImage },
  { key: 'extract-text', label: 'Extract Text', disabled: !props.hasImage },
])

function onOverflowSelect(key: string): void {
  switch (key) {
    case 'scan-qr':      emit('scan-qr');      break
    case 'scan-barcode': emit('scan-barcode'); break
    case 'ascii-art':    emit('ascii-art');    break
    case 'extract-text': emit('extract-text'); break
  }
}
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
      <button class="btn btn-secondary icon-btn" title="Open image" @click="emit('open')">
        <svg class="act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        <span class="btn-label">Open Image</span>
      </button>

      <button class="btn btn-primary icon-btn" title="Save" @click="emit('save')">
        <svg class="act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M4 19h16" />
        </svg>
        <span class="btn-label">Save</span>
      </button>

      <button class="btn btn-secondary icon-btn" title="Export" @click="emit('export')">
        <svg class="act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 17V5" /><path d="M8 9l4-4 4 4" /><path d="M4 19h16" />
        </svg>
        <span class="btn-label">Export</span>
      </button>

      <button
        class="btn btn-secondary icon-btn secondary-action qr-btn"
        :disabled="!hasImage"
        title="Scan QR code"
        @click="emit('scan-qr')"
      >
        <svg class="act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3"  y="3"  width="7" height="7" rx="1" />
          <rect x="14" y="3"  width="7" height="7" rx="1" />
          <rect x="3"  y="14" width="7" height="7" rx="1" />
          <rect x="5"  y="5"  width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="16" y="5"  width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="5"  y="16" width="3" height="3" fill="currentColor" stroke="none" />
          <path d="M14 14h3v3M17 17h3M14 20h3" />
        </svg>
        <span class="btn-label">Scan QR</span>
      </button>

      <button
        class="btn btn-secondary icon-btn secondary-action bc-btn"
        :disabled="!hasImage"
        title="Scan barcode"
        @click="emit('scan-barcode')"
      >
        <svg class="act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <line x1="4"  y1="4" x2="4"  y2="20" />
          <line x1="7"  y1="4" x2="7"  y2="20" stroke-width="2.5" />
          <line x1="10" y1="4" x2="10" y2="20" />
          <line x1="13" y1="4" x2="13" y2="20" stroke-width="2.5" />
          <line x1="16" y1="4" x2="16" y2="20" />
          <line x1="19" y1="4" x2="19" y2="20" stroke-width="2.5" />
          <line x1="2"  y1="21" x2="22" y2="21" stroke-width="1" />
        </svg>
        <span class="btn-label">Scan Barcode</span>
      </button>

      <button
        class="btn btn-secondary icon-btn secondary-action ascii-btn"
        :disabled="!hasImage"
        title="Generate ASCII art"
        @click="emit('ascii-art')"
      >
        <img src="/fish-ascii.svg" class="act-icon ascii-icon" alt="" aria-hidden="true" />
        <span class="btn-label">ASCII Art</span>
      </button>

      <button
        class="btn btn-secondary icon-btn secondary-action ocr-btn"
        :disabled="!hasImage"
        title="Extract text from image"
        @click="emit('extract-text')"
      >
        <svg class="act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="4" y="2" width="13" height="18" rx="2" />
          <path d="M14 2v5h5" stroke-width="1.4" />
          <line x1="7" y1="11" x2="15" y2="11" />
          <line x1="7" y1="14" x2="15" y2="14" />
          <line x1="7" y1="17" x2="11" y2="17" />
        </svg>
        <span class="btn-label">Extract Text</span>
      </button>

      <!-- Phone-only: holds the secondary actions so the bar never overflows -->
      <NavbarOverflowMenu
        class="overflow-only"
        :items="overflowItems"
        @select="onOverflowSelect"
      />

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
  min-height: 52px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  /* Respect the iPhone notch / Dynamic Island and landscape side insets. */
  padding-top: env(safe-area-inset-top);
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
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
  align-items: center;
  gap: 10px;
}

/* Buttons that pair an icon with a label */
.icon-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.act-icon { width: 16px; height: 16px; flex-shrink: 0; }
.ascii-icon { width: 24px; height: 18px; }

/* Shown only when the panel is a slide-in sheet (≤1024px) */
.panel-toggle { display: none; }
/* Shown only on phones (secondary actions live in the menu there) */
.overflow-only { display: none; }

/* ── Tablet: icon-only, keep every action inline ── */
@media (max-width: 1024px) {
  .btn-label { display: none; }
  .panel-toggle { display: flex; align-items: center; justify-content: center; }
}

/* ── Phone: move secondary actions into the overflow menu ── */
@media (max-width: 639px) {
  .navbar {
    min-height: 48px;
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }
  .navbar-actions { gap: 6px; }
  .brand-name { display: none; }
  .secondary-action { display: none; }
  .overflow-only { display: flex; }
}

/* ── Landscape phones: reclaim vertical space ── */
@media (orientation: landscape) and (max-height: 500px) {
  .navbar { min-height: 44px; }
}

/* ── Touch devices: comfortable square tap targets for icon-only buttons ── */
@media (hover: none), (pointer: coarse) {
  .navbar-actions .btn { min-width: 48px; justify-content: center; }
}
</style>
