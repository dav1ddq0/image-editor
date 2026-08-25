<!--
  Single reusable icon button for the toolbar palette. Highlights when active
  and emits 'click' upward, staying decoupled from the store.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  icon:      string
  label:     string
  active?:   boolean
  disabled?: boolean
}>(), { active: false, disabled: false })

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <v-btn
    class="tool-btn"
    :class="{ active }"
    :color="active ? 'primary' : undefined"
    :variant="active ? 'tonal' : 'text'"
    :disabled="disabled"
    icon
    rounded="16"
    size="small"
    @click="emit('click')"
  >
    <v-icon class="tool-icon" :icon="icon" />
    <v-tooltip activator="parent" location="end" :text="label" />
  </v-btn>
</template>

<style scoped>
.tool-btn {
  width: 42px;
  height: 42px;
}

.tool-icon {
  font-size: 21px;
}

/* Touch devices: 48px tap target (satisfies Android Material + Apple HIG) */
@media (hover: none), (pointer: coarse) {
  .tool-btn {
    width: 48px;
    height: 48px;
  }
  .tool-icon { font-size: 24px; }
}
</style>
