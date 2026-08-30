<!--
  Top navigation bar, laid out in three zones:
  - left:   brand
  - center: the primary actions (Open, Save, Export, Copy, Properties) as
  - right:  secondary tools (Scan QR, Barcode, ASCII, Extract Text),
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import NavbarOverflowMenu from './NavbarOverflowMenu.vue'
import { IconBrand, IconQrScan, IconBarcode, IconExtractText, IconAsciiArt } from '@/components/icons'

const props = defineProps<{ hasImage?: boolean; locked?: boolean; copyImage: () => Promise<boolean> }>()
const emit = defineEmits<{ open: []; save: []; export: []; 'scan-qr': []; 'scan-barcode': []; 'ascii-art': []; 'extract-text': []; 'image-properties': []; 'toggle-panel': [] }>()
const { isDark, toggle: toggleTheme } = useAppTheme()
const actionsDisabled = computed(() => !props.hasImage || !!props.locked)
type CopyState = 'idle' | 'busy' | 'success' | 'error'
const copyState = ref<CopyState>('idle')
let copyResetTimer: ReturnType<typeof setTimeout> | undefined

const copyIcon = computed(() => {
  if (copyState.value === 'success') return 'mdi-check'
  if (copyState.value === 'error')   return 'mdi-alert-circle-outline'
  return 'mdi-content-copy'
})

const copyLabel = computed(() => {
  if (copyState.value === 'success') return 'Copied!'
  if (copyState.value === 'error')   return 'Copy failed'
  return 'Copy image'
})

async function performCopy(): Promise<void> {
  if (copyState.value === 'busy') return
  clearTimeout(copyResetTimer)
  copyState.value = 'busy'
  const ok = await props.copyImage()
  copyState.value = ok ? 'success' : 'error'
  copyResetTimer = setTimeout(() => { copyState.value = 'idle' }, ok ? 2000 : 3000)
}

const overflowItems = computed(() => [
  { key: 'copy-image',   label: copyLabel.value, disabled: actionsDisabled.value || copyState.value === 'busy' },
  { key: 'scan-qr',      label: 'Scan QR',      disabled: actionsDisabled.value },
  { key: 'scan-barcode', label: 'Scan Barcode', disabled: actionsDisabled.value },
  { key: 'ascii-art',    label: 'ASCII Art',    disabled: actionsDisabled.value },
  { key: 'extract-text', label: 'Extract Text', disabled: actionsDisabled.value },
])

function onOverflowSelect(key: string): void {
  switch (key) {
    case 'copy-image':    performCopy();         break
    case 'scan-qr':       emit('scan-qr');       break
    case 'scan-barcode':  emit('scan-barcode');  break
    case 'ascii-art':     emit('ascii-art');     break
    case 'extract-text':  emit('extract-text');  break
  }
}

async function onCopyImage(e: MouseEvent): Promise<void> {
  blurActivator(e)
  await performCopy()
}

function blurActivator(e: MouseEvent): void {
  if (e.detail > 0) (e.currentTarget as HTMLElement | null)?.blur()
}

</script>

<template>
  <header class="navbar">

    <div class="navbar-zone navbar-left">
      <div class="navbar-brand" role="img" aria-label="Repictum">
        <span class="brand-badge">
        <IconBrand class="brand-icon" />
        </span>
        <span class="brand-name" aria-hidden="true">Repictum</span>
      </div>

    </div>

    <!-- primary actions -->
    <nav class="navbar-zone navbar-center" aria-label="Primary actions">
      <v-btn class="nav-icon-btn" variant="text" icon :disabled="locked" aria-label="Open image" @click="blurActivator($event); emit('open')">
        <v-icon icon="mdi-folder-image" size="22" />
        <v-tooltip activator="parent" location="bottom" text="Open image" />
      </v-btn>

      <v-btn class="nav-icon-btn" variant="text" icon :disabled="actionsDisabled" aria-label="Save" @click="blurActivator($event); emit('save')">
        <v-icon icon="mdi-content-save-outline" size="22" />
        <v-tooltip activator="parent" location="bottom" text="Save" />
      </v-btn>

      <v-btn class="nav-icon-btn" variant="text" icon :disabled="actionsDisabled" aria-label="Export" @click="blurActivator($event); emit('export')">
        <v-icon icon="mdi-export-variant" size="22" />
        <v-tooltip activator="parent" location="bottom" text="Export" />
      </v-btn>

      <v-btn
        class="nav-icon-btn copy-action"
        :class="{ 'nav-icon-btn--success': copyState === 'success', 'nav-icon-btn--error': copyState === 'error' }"
        variant="text" icon
        :disabled="actionsDisabled || copyState === 'busy'"
        :aria-label="copyLabel"
        @click="onCopyImage"
      >
        <v-icon :icon="copyIcon" size="22" />
        <v-tooltip activator="parent" location="bottom" :text="copyLabel" />
      </v-btn>

      <v-btn class="nav-icon-btn" variant="text" icon :disabled="actionsDisabled" aria-label="Image properties" @click="blurActivator($event); emit('image-properties')">
        <v-icon icon="mdi-information-outline" size="22" />
        <v-tooltip activator="parent" location="bottom" text="Image properties" />
      </v-btn>
    </nav>

    <div class="navbar-zone navbar-right">
      <v-btn class="nav-icon-btn secondary-action" variant="text" icon :disabled="actionsDisabled" aria-label="Scan QR code" @click="blurActivator($event); emit('scan-qr')">
        <IconQrScan class="act-icon" />
        <v-tooltip activator="parent" location="bottom" text="Scan QR code" />
      </v-btn>

      <v-btn class="nav-icon-btn secondary-action" variant="text" icon :disabled="actionsDisabled" aria-label="Scan barcode" @click="blurActivator($event); emit('scan-barcode')">
        <IconBarcode class="act-icon" />
        <v-tooltip activator="parent" location="bottom" text="Scan barcode" />
      </v-btn>

      <v-btn class="nav-icon-btn secondary-action" variant="text" icon :disabled="actionsDisabled" aria-label="Generate ASCII art" @click="blurActivator($event); emit('ascii-art')">
        <IconAsciiArt class="act-icon" />
        <v-tooltip activator="parent" location="bottom" text="Generate ASCII art" />
      </v-btn>

      <v-btn class="nav-icon-btn secondary-action" variant="text" icon :disabled="actionsDisabled" aria-label="Extract text from image" @click="blurActivator($event); emit('extract-text')">
        <IconExtractText class="act-icon" />
        <v-tooltip activator="parent" location="bottom" text="Extract text from image" />
      </v-btn>

      <div class="overflow-only">
        <NavbarOverflowMenu
          :items="overflowItems"
          @select="onOverflowSelect"
        />
      </div>

      <!-- Theme toggle (light / dark) -->
      <v-btn class="nav-icon-btn" variant="text" icon :disabled="locked" @click="blurActivator($event); toggleTheme()">
        <v-icon :icon="isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" />
        <v-tooltip activator="parent" location="bottom" :text="isDark ? 'Switch to light theme' : 'Switch to dark theme'" />
      </v-btn>

      <!-- Tablet/phone: toggle the right settings panel -->
      <v-btn class="nav-icon-btn panel-toggle" variant="text" icon :disabled="locked" @click="blurActivator($event); emit('toggle-panel')">
        <v-icon icon="mdi-tune-variant" />
        <v-tooltip activator="parent" location="bottom" text="Toggle settings panel" />
      </v-btn>
    </div>

  </header>
</template>

<style scoped>
.navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  min-height: 56px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  padding-top: env(safe-area-inset-top);
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
}

.navbar-zone {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.navbar-left  { justify-self: start; }
.navbar-center { justify-self: center; }
.navbar-right { justify-self: end; }

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
}

.brand-name {
  color: var(--color-text);
  font-family: 'Press Start 2P', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
  text-transform: uppercase;
}

.brand-badge {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
  color: var(--color-on-accent);
  background: linear-gradient(
    135deg,
    var(--color-accent),
    color-mix(in oklab, var(--color-accent) 55%, var(--brand-ink))
  );
  box-shadow: var(--shadow-sm);
}

.brand-icon {
  width: 20px;
  height: 20px;
}

.act-icon { width: 20px; height: 20px; flex-shrink: 0; }

.nav-icon-btn.v-btn--disabled { opacity: 0.45; }

.nav-icon-btn {
  transition: background-color var(--transition), color var(--transition);
}

.nav-icon-btn--success {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

.nav-icon-btn--error {
  color: var(--color-error);
}

.panel-toggle { display: none; }

.overflow-only { display: none; }

@media (max-width: 1240px) {
  .panel-toggle { display: inline-flex; }
}

@media (max-width: 639px) {
  .navbar {
    grid-template-columns: auto 1fr auto;
    min-height: 52px;
    gap: 4px;
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }
  .brand-name { display: none; }
  .secondary-action { display: none; }
  .copy-action { display: none; }
  .overflow-only { display: inline-flex; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .navbar { min-height: 46px; }
}
</style>
