<!--
  AdjustmentsPanel.vue
  Sliders for tone and color adjustments, grouped into Light / Color / Detail
  sub-cards.
-->
<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import AdjustmentSlider from './AdjustmentSlider.vue'
import type { SliderGroup } from '@/types/adjustments'

const editor = useEditorStore()

const groups: SliderGroup[] = [
  {
    title: 'Light',
    sliders: [
      { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
      { key: 'contrast',   label: 'Contrast',   min: -100, max: 100 },
      { key: 'highlights', label: 'Highlights', min: -100, max: 100 },
      { key: 'shadows',    label: 'Shadows',    min: -100, max: 100 },
    ],
  },
  {
    title: 'Color',
    sliders: [
      { key: 'saturation',  label: 'Saturation',  min: -100, max: 100 },
      { key: 'vibrance',    label: 'Vibrance',    min: -100, max: 100 },
      { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
      { key: 'tint',        label: 'Tint',        min: -100, max: 100 },
    ],
  },
  {
    title: 'Detail',
    sliders: [
      { key: 'sharpness', label: 'Sharpness', min: 0, max: 100 },
      { key: 'blur',      label: 'Blur',      min: 0, max: 100 },
      { key: 'vignette',  label: 'Vignette',  min: 0, max: 100 },
    ],
  },
]
</script>

<template>
  <section class="panel-section">

    <div v-for="group in groups" :key="group.title" class="adjustment-group">
      <h4 class="group-title">{{ group.title }}</h4>

      <AdjustmentSlider
        v-for="slider in group.sliders"
        :key="slider.key"
        :label="slider.label"
        :min="slider.min"
        :max="slider.max"
        :model-value="editor.adjustments[slider.key]"
        :disabled="!editor.hasImage"
        @dragstart="editor.beginAdjustment()"
        @update:model-value="editor.updateAdjustment(slider.key, $event)"
      />
    </div>

  </section>
</template>

<style scoped>

.adjustment-group {
  background: var(--color-surface-container-high);
  border-radius: var(--radius-lg);
  padding: 12px 12px 6px;
  margin-bottom: 12px;
}

.adjustment-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 0.86rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-subtle);
  margin-bottom: 10px;
}
</style>
