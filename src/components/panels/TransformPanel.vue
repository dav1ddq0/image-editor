<script setup>
import { computed } from 'vue'
import { useEditor } from '@/composables/useEditor'

const { state } = useEditor()
const disabled = computed(() => !state.image)

const emit = defineEmits(['rotate-left', 'rotate-right', 'flip-h', 'flip-v'])
</script>

<template>
  <section class="panel-section">
    <h3 class="panel-title">Transform</h3>
    <div class="transform-actions">
      <button class="btn btn-small btn-secondary" :disabled="disabled" @click="emit('rotate-left')">Rotate L</button>
      <button class="btn btn-small btn-secondary" :disabled="disabled" @click="emit('rotate-right')">Rotate R</button>
      <button class="btn btn-small btn-secondary" :disabled="disabled" @click="emit('flip-h')">Flip H</button>
      <button class="btn btn-small btn-secondary" :disabled="disabled" @click="emit('flip-v')">Flip V</button>
    </div>
  </section>
</template>

<style scoped>
.transform-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
</style>
