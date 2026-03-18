<script setup>
const props = defineProps({
  label:    { type: String,  required: true },
  modelValue: { type: Number, default: 0 },
  min:      { type: Number,  default: -100 },
  max:      { type: Number,  default: 100 },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="adjustment-row">
    <label>{{ label }}</label>
    <input
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      :disabled="disabled"
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
