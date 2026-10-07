<!--
  AdjustFiltersPanel.vue
  Floating panel grouping the two "how the pixels look" tools behind tabs:
  the adjustment sliders and the filter presets.
-->
<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import FloatingPanel from './FloatingPanel.vue'
import AdjustmentsPanel from './AdjustmentsPanel.vue'
import FiltersPanel from './FiltersPanel.vue'
import type { PanelTabId, PanelTabDefinition } from '@/types/panel'

defineProps<{ open?: boolean }>()
defineEmits<{ close: [] }>()

const tabs: PanelTabDefinition[] = [
  { id: 'adjust',  label: 'Adjust' },
  { id: 'filters', label: 'Filters' },
]

const activeTab = shallowRef<PanelTabId>('adjust')
const tabButtons = useTemplateRef<HTMLButtonElement[]>('tabButton')

function onTabKeydown(e: KeyboardEvent): void {
  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (step === 0) return
  e.preventDefault()
  const next = (tabs.findIndex(tab => tab.id === activeTab.value) + step + tabs.length) % tabs.length
  activeTab.value = tabs[next].id
  tabButtons.value?.[next]?.focus()
}
</script>

<template>
  <FloatingPanel title="Adjust &amp; Filters" :open="open" @close="$emit('close')">
    <template #subheader>
      <div class="tab-bar" role="tablist" aria-label="Adjust &amp; Filters">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          ref="tabButton"
          class="tab-btn"
          :class="{ 'is-active': activeTab === tab.id }"
          type="button"
          role="tab"
          :id="`panel-tab-${tab.id}`"
          :aria-controls="`panel-tabpanel-${tab.id}`"
          :aria-selected="activeTab === tab.id"
          :tabindex="activeTab === tab.id ? 0 : -1"
          @click="activeTab = tab.id"
          @keydown="onTabKeydown"
        >{{ tab.label }}</button>
      </div>
    </template>

    <div
      v-show="activeTab === 'adjust'"
      id="panel-tabpanel-adjust"
      role="tabpanel"
      aria-labelledby="panel-tab-adjust"
      tabindex="0"
    >
      <AdjustmentsPanel />
    </div>
    <div
      v-show="activeTab === 'filters'"
      id="panel-tabpanel-filters"
      role="tabpanel"
      aria-labelledby="panel-tab-filters"
      tabindex="0"
    >
      <FiltersPanel />
    </div>
  </FloatingPanel>
</template>

<style scoped>
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 10px 12px 12px;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: transparent;
  color: var(--color-muted);
  transition: background-color var(--transition), color var(--transition);
}

.tab-btn.is-active {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

@media (hover: hover) {
  .tab-btn:not(.is-active):hover {
    background: color-mix(in oklab, var(--color-text) 8%, transparent);
    color: var(--color-text);
  }
}
</style>
