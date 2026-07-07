<!--
  Small anchored dropdown used on narrow screens to hold the navbar's secondary
  actions so they never overflow the bar.
-->
<script setup lang="ts">
import { useTheme } from 'vuetify'

defineProps<{
  items: { key: string; label: string; disabled?: boolean }[]
}>()

const emit = defineEmits<{ select: [key: string] }>()

const theme = useTheme()
</script>

<template>
  <v-menu location="bottom end" :theme="theme.name.value">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        class="more-btn"
        variant="text"
        icon="mdi-dots-horizontal"
        aria-label="More actions"
      />
    </template>

    <v-list density="compact" min-width="180">
      <v-list-item
        v-for="item in items"
        :key="item.key"
        :disabled="item.disabled"
        :title="item.label"
        @click="emit('select', item.key)"
      />
    </v-list>
  </v-menu>
</template>
