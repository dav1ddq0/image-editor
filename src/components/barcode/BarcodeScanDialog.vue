<!--
  Modal dialog for the barcode scanner
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const props = defineProps<{
  visible: boolean
  state:   'scanning' | 'found' | 'not-found'
  text:    string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const theme = useTheme()

const dialog = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

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
  <v-dialog v-model="dialog" max-width="460" :theme="theme.name.value" aria-label="Barcode Scanner">
    <v-card>

      <v-card-title>
        <span>Barcode Scanner</span>
        <v-btn variant="text" icon="mdi-close" size="small" density="comfortable" aria-label="Close" @click="close" />
      </v-card-title>

      <v-card-text v-if="state === 'scanning'" class="state-center py-8">
        <v-progress-circular color="primary" indeterminate size="44" width="3" />
        <p class="status-text">Scanning image…</p>
      </v-card-text>

      <v-card-text v-else-if="state === 'found'" class="d-flex flex-column ga-3 py-5">
        <span class="field-label">Decoded content</span>
        <v-textarea
          :model-value="text"
          readonly
          rows="4"
          variant="outlined"
          hide-details
          class="mono-field"
          aria-label="Decoded barcode content"
        />
        <div class="d-flex justify-end">
          <v-btn
            color="primary"
            variant="flat"
            :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            @click="copyToClipboard"
          >{{ copied ? 'Copied!' : 'Copy to clipboard' }}</v-btn>
        </div>
      </v-card-text>

      <v-card-text v-else class="state-center py-8">
        <v-icon icon="mdi-alert-circle-outline" color="primary" size="44" />
        <p class="status-text">No barcode found in this image.</p>
        <v-btn variant="tonal" class="mt-2" @click="close">Close</v-btn>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.field-label {
  font-size: 0.78rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mono-field :deep(textarea) {
  font-family: monospace;
  font-size: 0.85rem;
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.status-text {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 8px 0 0;
}
</style>
