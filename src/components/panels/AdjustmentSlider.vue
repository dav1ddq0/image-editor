<!--
  AdjustmentSlider.vue

  Reusable labeled range-input row used inside AdjustmentsPanel.
  Responsibilities:
    - Renders a text label, an HTML range input (slider track), and a
      numeric value readout in a fixed three-column grid layout.
    - Implements the v-model contract by accepting a `modelValue` prop and
      emitting `update:modelValue` when the slider is moved.
    - Supports a `disabled` prop to prevent interaction when no image is loaded.
    - Coerces the emitted value to a Number to avoid string/number type drift
      that can arise from HTML input events.

  Props:
    - label      (String,  required)     : display label shown left of the slider
    - modelValue (Number,  default 0)    : current slider value (v-model binding)
    - min        (Number,  default -100) : minimum value for the range input
    - max        (Number,  default 100)  : maximum value for the range input
    - disabled   (Boolean, default false): disables the slider when true

  Emits:
    - update:modelValue : emitted with the new numeric value on every input event
-->
<script setup>
/*
 * Props definition.
 * Note: `props` is assigned the return value of defineProps so that individual
 * prop values can be referenced in script logic if needed in the future.
 */
const props = defineProps({
  // Text label displayed in the left column of the row (e.g. "Brightness")
  label:    { type: String,  required: true },

  // Current numeric value of this adjustment; forms the v-model contract
  modelValue: { type: Number, default: 0 },

  // Minimum allowed value; negative values let users reduce a property below default
  min:      { type: Number,  default: -100 },

  // Maximum allowed value; caps how far above default the property can be pushed
  max:      { type: Number,  default: 100 },

  // When true, the range input is grayed out and cannot be interacted with
  disabled: { type: Boolean, default: false },
})

/*
 * Emit 'update:modelValue' to participate in Vue's v-model two-way binding.
 * The parent (AdjustmentsPanel) listens for this event and calls
 * editor.updateAdjustment() in response.
 */
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <!--
    .adjustment-row uses a three-column CSS grid:
      Column 1 (80px)  – label text
      Column 2 (1fr)   – range input track (fills remaining space)
      Column 3 (32px)  – numeric value readout
  -->
  <div class="adjustment-row">

    <!-- Label column: identifies which property this slider controls -->
    <label>{{ label }}</label>

    <!--
      Range input column: the core interactive element.
        :min / :max  – bound from props to define the allowed numeric range
        :value       – one-way binding to modelValue; Vue does not use v-model
                       here because we want to emit a typed Number, not a string
        :disabled    – grays out the slider and prevents input when no image exists
        @input       – fires on every slider movement; Number() converts the string
                       value from $event.target.value to a numeric type before emitting
    -->
    <input
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      :disabled="disabled"
      @input="emit('update:modelValue', Number($event.target.value))"
    />

    <!-- Numeric readout column: shows the current raw value alongside the slider -->
    <span class="value-label">{{ modelValue }}</span>

  </div>
</template>

<style scoped>
/*
 * .adjustment-row
 * Three-column grid that aligns label, slider, and value on a single line.
 * margin-bottom spaces successive sliders in the adjustments list.
 */
.adjustment-row {
  display: grid;
  grid-template-columns: 80px 1fr 32px; /* label | track | value */
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

/* Muted color for the label so it does not compete with the slider itself */
.adjustment-row label {
  font-size: 0.82rem;
  color: var(--color-muted);
}

/* Use the design-token accent color for the slider thumb and filled track */
input[type="range"] {
  accent-color: var(--color-accent);
  width: 100%;
}

/*
 * .value-label
 * Right-aligned numeric display; kept small and subtle so it is readable
 * but does not distract from the slider control.
 */
.value-label {
  font-size: 0.78rem;
  color: var(--color-subtle);
  text-align: right;
}
</style>
