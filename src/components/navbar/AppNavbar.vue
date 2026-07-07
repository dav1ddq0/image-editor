<!--
  Top navigation bar. Renders the brand and action buttons.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import NavbarOverflowMenu from './NavbarOverflowMenu.vue'

const props = defineProps<{ hasImage?: boolean }>()
const emit = defineEmits<{ open: []; save: []; export: []; 'scan-qr': []; 'scan-barcode': []; 'ascii-art': []; 'extract-text': []; 'toggle-panel': [] }>()

const { isDark, toggle: toggleTheme } = useAppTheme()

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
      <span class="brand-badge">
      <svg class="brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="5.5" cy="6.5" r="1.6" fill="currentColor"/>
        <path d="M2.5 14.5 L7 9.5 L10 12 L12.5 9.5 L15.5 14.5"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="16.5" y1="13.5" x2="22" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M15 15 Q13 18.5 14.2 20 Q15.8 21.2 17.2 19.2 L16.5 13.5 Z" fill="currentColor"/>
      </svg>
      </span>
      <span class="brand-name">Image Editor</span>
    </div>

    <nav class="navbar-actions">
      <v-btn class="nav-btn" variant="text" @click="emit('open')">
        <v-icon icon="mdi-folder-image" size="20" />
        <span class="btn-label">Open Image</span>
        <v-tooltip activator="parent" location="bottom" text="Open image" />
      </v-btn>

      <v-btn class="nav-btn" variant="text" @click="emit('save')">
        <v-icon icon="mdi-content-save-outline" size="20" />
        <span class="btn-label">Save</span>
        <v-tooltip activator="parent" location="bottom" text="Save" />
      </v-btn>

      <v-btn class="nav-btn" variant="text" @click="emit('export')">
        <v-icon icon="mdi-export-variant" size="20" />
        <span class="btn-label">Export</span>
        <v-tooltip activator="parent" location="bottom" text="Export" />
      </v-btn>

      <v-btn class="nav-btn secondary-action" variant="text" :disabled="!hasImage" @click="emit('scan-qr')">
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
        <v-tooltip activator="parent" location="bottom" text="Scan QR code" />
      </v-btn>

      <v-btn class="nav-btn secondary-action" variant="text" :disabled="!hasImage" @click="emit('scan-barcode')">
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
        <v-tooltip activator="parent" location="bottom" text="Scan barcode" />
      </v-btn>

      <v-btn class="nav-btn secondary-action" variant="text" :disabled="!hasImage" @click="emit('ascii-art')">
        <span class="act-icon ascii-icon" aria-hidden="true" />
        <span class="btn-label">ASCII Art</span>
        <v-tooltip activator="parent" location="bottom" text="Generate ASCII art" />
      </v-btn>

      <v-btn class="nav-btn secondary-action" variant="text" :disabled="!hasImage" @click="emit('extract-text')">
        <svg class="act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="4" y="2" width="13" height="18" rx="2" />
          <path d="M14 2v5h5" stroke-width="1.4" />
          <line x1="7" y1="11" x2="15" y2="11" />
          <line x1="7" y1="14" x2="15" y2="14" />
          <line x1="7" y1="17" x2="11" y2="17" />
        </svg>
        <span class="btn-label">Extract Text</span>
        <v-tooltip activator="parent" location="bottom" text="Extract text from image" />
      </v-btn>

      <div class="overflow-only">
        <NavbarOverflowMenu
          :items="overflowItems"
          @select="onOverflowSelect"
        />
      </div>

      <!-- Theme toggle (light / dark) -->
      <v-btn class="nav-icon-btn" variant="text" icon @click="toggleTheme">
        <v-icon :icon="isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" />
        <v-tooltip activator="parent" location="bottom" :text="isDark ? 'Switch to light theme' : 'Switch to dark theme'" />
      </v-btn>

      <!-- Tablet/phone: toggle the right settings panel -->
      <v-btn class="nav-icon-btn panel-toggle" variant="text" icon @click="emit('toggle-panel')">
        <v-icon icon="mdi-tune-variant" />
        <v-tooltip activator="parent" location="bottom" text="Toggle settings panel" />
      </v-btn>
    </nav>

  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  min-height: 56px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  padding-top: env(safe-area-inset-top);
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
}

.brand-name {
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.06em;
}

.brand-badge {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--color-accent),
    color-mix(in oklab, var(--color-accent) 55%, #16213e)
  );
  box-shadow: var(--shadow-sm);
}

.brand-icon {
  width: 20px;
  height: 20px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 500;
}

.nav-btn :deep(.v-btn__content) {
  gap: 6px;
}

.act-icon { width: 18px; height: 18px; flex-shrink: 0; }

.ascii-icon {
  width: 24px;
  height: 18px;
  background-color: currentColor;
  -webkit-mask: url('/fish-ascii.svg') no-repeat center / contain;
  mask: url('/fish-ascii.svg') no-repeat center / contain;
}

.panel-toggle { display: none; }

.overflow-only { display: none; }

@media (max-width: 1240px) {
  .btn-label { display: none; }
  .panel-toggle { display: inline-flex; }
}

@media (max-width: 639px) {
  .navbar {
    min-height: 52px;
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }
  .brand-name { display: none; }
  .secondary-action { display: none; }
  .overflow-only { display: inline-flex; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .navbar { min-height: 46px; }
}
</style>
