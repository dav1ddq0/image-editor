<!--
  Inline OCR result: a soft veil dims the image and the
  detected text regions punch through it, brighter than their surroundings.
  Each region is a transparent but selectable span, so the text can be selected
  and copied with the browser's native copy.
-->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { TextRegion } from '@/utils/textExtractor'

defineProps<{
  imgWidth:  number
  imgHeight: number
  regions:   TextRegion[]
}>()

const emit = defineEmits<{ close: [] }>()

function regionStyle(r: TextRegion): Record<string, string> {
  const [x1, y1, x2, y2] = r.box  // already 0-1 normalized
  return {
    left:   `${(x1 * 100).toFixed(3)}%`,
    top:    `${(y1 * 100).toFixed(3)}%`,
    width:  `${((x2 - x1) * 100).toFixed(3)}%`,
    height: `${((y2 - y1) * 100).toFixed(3)}%`,
  }
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close')
}

onMounted(()   => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="text-regions-overlay" :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }">

    <!-- Dims the image so the detected text is what stands out -->
    <div class="veil" />

    <div
      v-for="(region, idx) in regions"
      :key="idx"
      class="text-region"
      :style="regionStyle(region)"
      :title="region.label"
    >
      <span class="region-text" :aria-label="region.label">{{ region.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.text-regions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 4;
}

/* Veil covers the image only, never the app chrome, and never the pointer:
   selection has to keep working straight through it. */
.veil {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

/* Each region: invisible selectable text, lifted above the veil so it reads
   as punched through it. */
.text-region {
  position: absolute;
  box-sizing: border-box;
  border-bottom: 2px solid var(--color-accent);
  border-radius: 2px;
  cursor: text;
  /* Fallback for browsers without backdrop-filter: a translucent light wash */
  background: rgba(255, 255, 255, 0.22);
}

@supports (backdrop-filter: brightness(1)) or (-webkit-backdrop-filter: brightness(1)) {
  .text-region {
    background: transparent;
    backdrop-filter: brightness(2.1) saturate(1.1);
    -webkit-backdrop-filter: brightness(2.1) saturate(1.1);
  }
}

.text-region:hover {
  background: var(--color-accent-soft);
}

.region-text {
  display: block;
  width: 100%;
  height: 100%;
  color: transparent;
  user-select: text;
  white-space: nowrap;
  overflow: hidden;
  font-size: 0.8em;
  line-height: 1;
  cursor: text;
}

</style>
