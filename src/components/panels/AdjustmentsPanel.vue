<script setup>
import { computed } from 'vue'
import { useEditor } from '@/composables/useEditor'
import AdjustmentSlider from './AdjustmentSlider.vue'

const { state, updateAdjustment } = useEditor()

const disabled = computed(() => !state.image)

const sliders = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
  { key: 'contrast',   label: 'Contrast',   min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'sharpness',  label: 'Sharpness',  min: 0,    max: 100 },
  { key: 'blur',       label: 'Blur',       min: 0,    max: 100 },
]
</script>

<template>
  <section class="panel-section">
    <h3 class="panel-title">Adjustments</h3>
    <AdjustmentSlider
      v-for="slider in sliders"
      :key="slider.key"
      :label="slider.label"
      :min="slider.min"
      :max="slider.max"
      :model-value="state.adjustments[slider.key]"
      :disabled="disabled"
      @update:model-value="updateAdjustment(slider.key, $event)"
    />
  </section>
</template>
