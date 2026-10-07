<!--
  Reusable labeled slider.
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
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

const isBidirectional = computed(() => props.min < 0)

const fillGeometry = computed(() => {
  const span     = props.max - props.min
  const valuePct = ((props.modelValue - props.min) / span) * 100
  const zeroPct  = ((0 - props.min) / span) * 100
  return {
    '--fill-start': `${Math.min(valuePct, zeroPct)}%`,
    '--fill-size':  `${Math.abs(valuePct - zeroPct)}%`,
  }
})
</script>

<template>
  <div class="adjustment-row" :class="{ 'is-bidirectional': isBidirectional }" :style="fillGeometry">
    <div class="adjustment-head">
      <label class="adjustment-label">{{ label }}</label>
      <span class="value-label">{{ modelValue }}</span>
    </div>

    <v-slider
      class="adjustment-slider"
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="1"
      :disabled="disabled"
      density="compact"
      hide-details
      @start="emit('dragstart')"
      @update:model-value="emit('update:modelValue', Math.round($event))"
    />
  </div>
</template>

<style scoped>
.adjustment-row {
  margin-bottom: 10px;
}

.adjustment-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.adjustment-label {
  font-size: 0.78rem;
  color: var(--color-text);
}

.adjustment-slider {
  margin: 0;
}

.value-label {
  font-size: 0.75rem;
  color: var(--color-subtle);
  font-variant-numeric: tabular-nums;
}

.is-bidirectional :deep(.v-slider-track__fill) {
  inset-inline-start: var(--fill-start) !important;
  inline-size: var(--fill-size) !important;
}

@media (max-width: 639px), (max-height: 500px) {
  .adjustment-row {
    display: grid;
    grid-template-columns: 78px 1fr 34px;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .adjustment-head {
    display: contents;
  }

  .adjustment-label  { grid-column: 1; grid-row: 1; }
  .adjustment-slider { grid-column: 2; grid-row: 1; }

  .value-label {
    grid-column: 3;
    grid-row: 1;
    text-align: right;
  }
}
</style>
