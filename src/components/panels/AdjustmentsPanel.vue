<!--
  AdjustmentsPanel.vue

  Right-panel section that provides sliders for adjusting image tone and color.
  Responsibilities:
    - Defines the ordered list of adjustment controls with their metadata
      (store key, display label, and numeric range).
    - Renders one AdjustmentSlider component per adjustment entry.
    - Reads current values from the editor store and propagates changes back
      through updateAdjustment() when a slider is moved.
    - Disables all sliders when no image is loaded (editor.hasImage is false)
      to prevent meaningless adjustments in the empty state.

  Adjustments exposed:
    - Brightness : overall image lightness  (-100 to +100)
    - Contrast   : tonal difference range   (-100 to +100)
    - Saturation : color vividness          (-100 to +100)
    - Sharpness  : edge enhancement         (0 to 100)
    - Blur       : gaussian smoothing       (0 to 100)
-->
<script setup>
// Import the editor store to read current adjustment values and dispatch updates
import { useEditorStore } from '@/stores/editorStore'

// AdjustmentSlider: a single labeled range input with a live value readout
import AdjustmentSlider from './AdjustmentSlider.vue'

// Obtain the reactive editor store instance
const editor = useEditorStore()

/*
 * sliders – configuration array that drives the v-for loop in the template.
 * Each object describes one adjustment slider:
 *   key   : property name in editor.adjustments (used to read and write the value)
 *   label : human-readable label displayed next to the slider
 *   min   : minimum allowed value for the range input
 *   max   : maximum allowed value for the range input
 *
 * brightness / contrast / saturation allow negative values (darken/reduce effects).
 * sharpness / blur are always non-negative (cannot un-sharpen below zero).
 */
const sliders = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
  { key: 'contrast',   label: 'Contrast',   min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'sharpness',  label: 'Sharpness',  min: 0,    max: 100 },
  { key: 'blur',       label: 'Blur',       min: 0,    max: 100 },
]
</script>

<template>
  <!--
    <section> groups the adjustments as a distinct panel block.
    .panel-section and .panel-title are global utility classes defined in
    the main stylesheet to ensure consistent panel styling across all panels.
  -->
  <section class="panel-section">

    <!-- Section heading that labels this block within the right panel -->
    <h3 class="panel-title">Adjustments</h3>

    <!--
      Render one AdjustmentSlider for each entry in the sliders array.
      :key uses the adjustment key so Vue can efficiently track DOM nodes.

      Props passed to each slider:
        :label       – the human-readable label shown beside the track
        :min / :max  – numeric bounds for the range input
        :model-value – the current value read directly from editor.adjustments
        :disabled    – disables the slider when no image is loaded

      @update:model-value – v-model emit pattern; calls editor.updateAdjustment
        with the slider's store key and the new numeric value from the event.
        $event holds the emitted value from AdjustmentSlider.
    -->
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
