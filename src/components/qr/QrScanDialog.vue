<!--
  QrScanDialog.vue
  Modal dialog for the QR code scanner. Shows a scanning spinner while processing,
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
    <div v-if="visible" class="qr-backdrop" @click.self="close">
      <div class="qr-dialog" role="dialog" aria-modal="true" aria-label="QR Code Scanner">

        <!-- Header -->
        <div class="qr-header">
          <span class="qr-title">QR Code Scanner</span>
          <button class="qr-close" @click="close" aria-label="Close">✕</button>
        </div>

        <!-- Scanning state -->
        <div v-if="state === 'scanning'" class="qr-body qr-center">
          <div class="qr-spinner" aria-label="Scanning…" />
          <p class="qr-status-text">Scanning image…</p>
        </div>

        <!-- Found state -->
        <div v-else-if="state === 'found'" class="qr-body">
          <p class="qr-label">Decoded content</p>
          <textarea
            class="qr-textarea"
            readonly
            :value="text"
            rows="5"
            aria-label="Decoded QR content"
          />
          <button class="btn btn-primary qr-copy-btn" @click="copyToClipboard">
            {{ copied ? '✓ Copied!' : 'Copy to clipboard' }}
          </button>
        </div>

        <!-- Not found state -->
        <div v-else class="qr-body qr-center">
          <svg class="qr-warn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <p class="qr-status-text">No QR code found in this image.</p>
          <button class="btn btn-secondary" style="margin-top: 8px;" @click="close">Close</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.qr-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  /* Keep the dialog clear of notches / home indicator */
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
           max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

.qr-dialog {
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
.qr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}

.qr-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.qr-close {
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
  .qr-close:hover { color: var(--color-text); }
}

/* ── Body ── */
.qr-body {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qr-center {
  align-items: center;
  text-align: center;
  padding: 32px 18px;
}

.qr-label {
  font-size: 0.78rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.qr-textarea {
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

.qr-copy-btn {
  align-self: flex-end;
}

/* ── Spinner ── */
.qr-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Status text ── */
.qr-status-text {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 8px 0 0;
}

/* ── Warning icon ── */
.qr-warn-icon {
  width: 40px;
  height: 40px;
  color: var(--color-accent);
  opacity: 0.7;
}
</style>
