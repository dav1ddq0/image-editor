<!--
  Transient states of the Extract Text flow: model download/preparation,
  extraction progress, and the empty result. When text IS found the result is
  shown inline on the canvas (TextRegionsOverlay), not here.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay, useTheme } from 'vuetify'

const props = defineProps<{
  visible:  boolean
  state:    'loading-model' | 'extracting' | 'not-found'
  progress: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { smAndDown } = useDisplay()
const theme = useTheme()
const dialog = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="580" :fullscreen="smAndDown" :theme="theme.name.value" scrollable aria-label="Extract Text">
    <v-card>

      <v-card-title>
        <span>Extract Text</span>
        <v-btn variant="text" icon="mdi-close" size="small" density="comfortable" aria-label="Close" @click="close" />
      </v-card-title>

      <v-card-text v-if="state === 'loading-model'" class="state-center py-8">
        <template v-if="progress <= 0">
          <v-progress-circular color="primary" indeterminate size="44" width="3" aria-label="Loading AI model…" />
          <p class="status-text">Loading AI model…</p>
        </template>
        <template v-else-if="progress < 100">
          <v-progress-linear
            :model-value="progress"
            color="primary"
            height="6"
            rounded
            class="progress-bar"
          />
          <p class="status-text">Downloading AI model… {{ progress }}%</p>
        </template>
        <template v-else>
          <v-progress-circular color="primary" indeterminate size="44" width="3" aria-label="Preparing model…" />
          <p class="status-text">Preparing model…</p>
        </template>
      </v-card-text>

      <v-card-text v-else-if="state === 'extracting'" class="state-center py-8">
        <v-progress-circular color="primary" indeterminate size="44" width="3" />
        <p class="status-text">Extracting text…</p>
      </v-card-text>

      <v-card-text v-else class="state-center py-8">
        <v-icon icon="mdi-alert-circle-outline" color="primary" size="44" />
        <p class="status-text">No text found in this image.</p>
        <v-btn variant="tonal" class="mt-2" @click="close">Close</v-btn>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<style scoped>
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

.progress-bar {
  max-width: 280px;
}
</style>
