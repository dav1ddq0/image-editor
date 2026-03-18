<!--
  ToolButton.vue

  A single, reusable icon button used in the toolbar palette.
  Responsibilities:
    - Renders an icon (emoji or text character) inside a square button.
    - Visually highlights itself when the `active` prop is true, indicating
      that the corresponding tool is currently selected.
    - Displays the tool label as a native browser tooltip via the `title` attribute.
    - Emits a 'click' event upward so the parent (AppToolbar) can call
      the store's selectTool() action.

  Props:
    - icon   (String, required) : The character or emoji to display (e.g. '🖌')
    - label  (String, required) : Accessible tooltip text for the button
    - active (Boolean, default false) : Whether this tool is currently active

  Emits:
    - click : fired when the user clicks the button
-->
<script setup>
/*
 * Props definition:
 *   icon   – the visual symbol shown inside the button (emoji or Unicode character)
 *   label  – human-readable tool name used as the native `title` tooltip
 *   active – controls the `.active` CSS class that highlights the selected tool
 */
defineProps({
  // The icon character rendered inside the button face
  icon:    { type: String, required: true },

  // The tool name displayed as a tooltip on hover; also used for accessibility
  label:   { type: String, required: true },

  // When true, the button renders with an accent-colored background
  // to indicate it is the currently selected tool
  active:  { type: Boolean, default: false },
})

/*
 * Emit 'click' when the button is pressed so the parent can call selectTool().
 * We re-emit rather than call the store directly to keep this component
 * decoupled from any specific store implementation.
 */
const emit = defineEmits(['click'])
</script>

<template>
  <!--
    The <button> element is used for correct keyboard accessibility.
    :class binds the 'active' class conditionally based on the prop value.
    :title renders a native browser tooltip with the tool's label.
    @click re-emits the click event to the parent component.
  -->
  <button
    class="tool-btn"
    :class="{ active }"
    :title="label"
    @click="emit('click')"
  >
    <!-- The icon is wrapped in a <span> so it can be styled independently -->
    <span>{{ icon }}</span>
  </button>
</template>

<style scoped>
/*
 * .tool-btn
 * Square button with a transparent background and rounded corners.
 * The transition property animates color and border changes smoothly.
 */
.tool-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition); /* smooth hover/active state changes */
}

/*
 * Hover state: subtle fill + white text + accent border
 * to indicate the button is interactive.
 */
.tool-btn:hover {
  background: var(--color-border);
  color: #fff;
  border-color: var(--color-accent);
}

/*
 * Active state: solid accent background + white text.
 * Mirrors the hover style but persists while the tool is selected.
 */
.tool-btn.active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}
</style>
