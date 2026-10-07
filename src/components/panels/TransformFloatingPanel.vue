<!--
  Floating panel holding the rotate/flip actions. Same size and position as
  AdjustFiltersPanel; its shorter content just leaves space below.
-->
<script setup lang="ts">
import FloatingPanel from './FloatingPanel.vue'
import TransformPanel from './TransformPanel.vue'

defineProps<{ open?: boolean }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <FloatingPanel title="Transform" :open="open" @close="$emit('close')">
    <TransformPanel />
  </FloatingPanel>
</template>
