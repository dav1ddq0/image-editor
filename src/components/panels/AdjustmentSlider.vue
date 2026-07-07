<!--
  Reusable labeled slider row (label | track | value readout).
-->
<script setup lang="ts">
withDefaults(defineProps<{
  label:       string
  modelValue?: number
  min?:        number
  max?:        number
  disabled?:   boolean
}>(), {
  modelValue: 0,
  min:        -100,
  max:        100,
  disabled:   false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'dragstart': []
}>()
</script>

<template>
  <div class="adjustment-row">
    <label class="adjustment-label">{{ label }}</label>

    <v-slider
      class="adjustment-slider"
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="1"
      :disabled="disabled"
      color="primary"
      density="compact"
      hide-details
      thumb-size="14"
      track-size="3"
      @start="emit('dragstart')"
      @update:model-value="emit('update:modelValue', Math.round($event))"
    />

    <span class="value-label">{{ modelValue }}</span>
  </div>
</template>

<style scoped>
.adjustment-row {
  display: grid;
  grid-template-columns: 78px 1fr 34px;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.adjustment-label {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.adjustment-slider {
  margin: 0;
}

.value-label {
  font-size: 0.78rem;
  color: var(--color-subtle);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
