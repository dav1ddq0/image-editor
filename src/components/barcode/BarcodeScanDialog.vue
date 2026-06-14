<!--
  BarcodeScanDialog.vue
  Modal dialog for the barcode scanner. Shows a spinner while processing,
  then displays either the decoded text (with a copy button) or a not-found message.
-->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  visible: boolean
  state:   'scanning' | 'found' | 'not-found'
  text:    string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const copied = ref(false)

async function copyToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    copied.value = false
  }
}

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="bc-backdrop" @click.self="close">
      <div class="bc-dialog" role="dialog" aria-modal="true" aria-label="Barcode Scanner">

        <!-- Header -->
        <div class="bc-header">
          <span class="bc-title">Barcode Scanner</span>
          <button class="bc-close" @click="close" aria-label="Close">✕</button>
        </div>

        <!-- Scanning -->
        <div v-if="state === 'scanning'" class="bc-body bc-center">
          <div class="bc-spinner" aria-label="Scanning…" />
          <p class="bc-status-text">Scanning image…</p>
        </div>

        <!-- Found -->
        <div v-else-if="state === 'found'" class="bc-body">
          <p class="bc-label">Decoded content</p>
          <textarea
            class="bc-textarea"
            readonly
            :value="text"
            rows="4"
            aria-label="Decoded barcode content"
          />
          <button class="btn btn-primary bc-copy-btn" @click="copyToClipboard">
            {{ copied ? '✓ Copied!' : 'Copy to clipboard' }}
          </button>
        </div>

        <!-- Not found -->
        <div v-else class="bc-body bc-center">
          <svg class="bc-warn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <p class="bc-status-text">No barcode found in this image.</p>
          <button class="btn btn-secondary" style="margin-top: 8px;" @click="close">Close</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.bc-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
           max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

.bc-dialog {
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden auto;
}

/* ── Header ── */
.bc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}

.bc-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.bc-close {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: color var(--transition);
}
@media (hover: hover) and (pointer: fine) {
  .bc-close:hover { color: var(--color-text); }
}

/* ── Body ── */
.bc-body {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bc-center {
  align-items: center;
  text-align: center;
  padding: 32px 18px;
}

.bc-label {
  font-size: 0.78rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.bc-textarea {
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.85rem;
  padding: 8px 10px;
  resize: vertical;
  outline: none;
  font-family: monospace;
  box-sizing: border-box;
}

.bc-copy-btn {
  align-self: flex-end;
}

/* ── Spinner ── */
.bc-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Status text ── */
.bc-status-text {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 8px 0 0;
}

/* ── Warning icon ── */
.bc-warn-icon {
  width: 40px;
  height: 40px;
  color: var(--color-accent);
  opacity: 0.7;
}
</style>
