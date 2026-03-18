<!--
  FilterThumb.vue

  Individual filter preset thumbnail tile rendered inside FiltersPanel.
  Responsibilities:
    - Renders a square, clickable tile that visually previews what a filter
      looks like using CSS filter properties and/or gradient backgrounds.
    - Applies an accent border highlight when `active` is true to indicate
      the filter is currently selected.
    - Emits a 'select' event carrying the filter `id` when the tile is clicked,
      allowing the parent (FiltersPanel) to call the store's selectFilter action.

  Props:
    - id     (String,  required)     : filter identifier (e.g. 'sepia', 'grayscale')
    - label  (String,  required)     : short display name shown inside the tile
    - active (Boolean, default false): true when this is the currently active filter

  Emits:
    - select : emitted with the filter `id` value when the tile is clicked
-->
<script setup>
/*
 * Props definition.
 * `id` doubles as a CSS class name so that the scoped styles below can target
 * each filter tile individually to apply its unique visual preview.
 */
defineProps({
  // Unique identifier for the filter; used as the CSS class and emit payload
  id:     { type: String, required: true },

  // Short display name rendered as text inside the tile (e.g. "B&W", "Warm")
  label:  { type: String, required: true },

  // When true, applies the '.active' CSS class which adds an accent border
  active: { type: Boolean, default: false },
})

/*
 * Emit 'select' upward so the parent can call editor.selectFilter().
 * This keeps the component decoupled from the store.
 */
const emit = defineEmits(['select'])
</script>

<template>
  <!--
    The tile is a <div> (not a <button>) because it has rich visual styling.
    :class applies both the filter-specific CSS class (for preview styles)
    and the 'active' class conditionally for the selection highlight.
    :title provides a tooltip using the full label for accessibility.
    @click emits 'select' with the filter id so the parent can update the store.
  -->
  <div
    class="filter-thumb"
    :class="[id, { active }]"
    :title="label"
    @click="emit('select', id)"
  >
    <!-- The label text is rendered inside the tile as a short descriptive caption -->
    {{ label }}
  </div>
</template>

<style scoped>
/*
 * .filter-thumb
 * Square tile with a 1:1 aspect ratio that acts as both a preview and a button.
 * The base style uses the app background so that the "None" tile shows through
 * unmodified. transition animates the border and text changes on hover/active.
 */
.filter-thumb {
  aspect-ratio: 1;              /* enforce square shape */
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--color-subtle);
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
}

/*
 * Hover and active states both apply an accent-colored border and brighter text
 * so the selected / hovered tile is clearly distinguishable from inactive ones.
 */
.filter-thumb:hover,
.filter-thumb.active {
  border-color: var(--color-accent);
  color: var(--color-text);
}

/* ── Filter preview styles ──────────────────────────────────────────────────── */
/* Each class below visually represents the corresponding filter effect          */

/* Sepia: warm brown antique look using CSS sepia() + a matching background */
.filter-thumb.sepia     { filter: sepia(0.8);  background: #3d2b1f; }

/* Grayscale: monochrome black-and-white using CSS grayscale() + dark background */
.filter-thumb.grayscale { filter: grayscale(1); background: #2a2a2a; }

/* Vivid: high-contrast warm-to-cool diagonal gradient; text is white for contrast */
.filter-thumb.vivid     { background: linear-gradient(135deg, #e94560, #0f3460); color: #fff; }

/* Cool: blue-toned cool-shift diagonal gradient; text is white for contrast */
.filter-thumb.cool      { background: linear-gradient(135deg, #1a6b8a, #0f3460); color: #fff; }

/* Warm: orange-to-red warm-shift diagonal gradient; text is white for contrast */
.filter-thumb.warm      { background: linear-gradient(135deg, #c96a1a, #e94560); color: #fff; }
</style>
