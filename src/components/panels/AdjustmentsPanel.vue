<!--
  AdjustmentsPanel.vue
  Right-panel section with sliders for tone and color adjustments. Disables all
  sliders when no image is loaded to prevent meaningless edits.
-->
<script setup>
import { useEditorStore } from '@/stores/editorStore'
import AdjustmentSlider from './AdjustmentSlider.vue'

const editor = useEditorStore()

// brightness/contrast/saturation allow negative values; sharpness/blur do not
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
      :model-value="editor.adjustments[slider.key]"
      :disabled="!editor.hasImage"
      @update:model-value="editor.updateAdjustment(slider.key, $event)"
    />

  </section>
</template>
