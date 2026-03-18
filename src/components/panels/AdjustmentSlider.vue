<!--
  AdjustmentSlider.vue
  Reusable labeled range-input row (label | track | value readout).
  Implements the v-model contract; emits a typed Number to avoid string/number
  drift that arises from native HTML input events.
-->
<script setup lang="ts">
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
</script>

<template>
  <!--
    Three-column grid: label (80px) | range track (1fr) | value readout (32px)
  -->
  <div class="adjustment-row">

    <label>{{ label }}</label>

    <!--
      :value one-way binding is used instead of v-model because we need to emit
      a Number, not the string that v-model would produce from a range input.
    -->
    <input
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      :disabled="disabled"
      @pointerdown="emit('dragstart')"
      @input="emit('update:modelValue', Number($event.target.value))"
    />

    <span class="value-label">{{ modelValue }}</span>

  </div>
</template>

<style scoped>
.adjustment-row {
  display: grid;
  grid-template-columns: 80px 1fr 32px;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.adjustment-row label {
  font-size: 0.82rem;
  color: var(--color-muted);
}

input[type="range"] {
  accent-color: var(--color-accent);
  width: 100%;
}

.value-label {
  font-size: 0.78rem;
  color: var(--color-subtle);
  text-align: right;
}
</style>
