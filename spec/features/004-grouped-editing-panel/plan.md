# 004 · Grouped, floating editing panels with expanded adjustments: Plan

_How what's described in `spec.md` gets implemented. Must respect `constitution/`._

## Approach

### Panel restructuring

`RightPanel.vue` today is a single docked/overlay `<aside>` that composes `AdjustmentsPanel.vue`, `FiltersPanel.vue` and `TransformPanel.vue` back to back. It is replaced by two independent floating panel components, each mounted directly in `ImageEditor.vue` next to `RightPanel.vue`'s current position, instead of one wrapper:

- `AdjustFiltersPanel.vue`: a floating card with a header ("ADJUST & FILTERS" title + close button), a tab bar (Adjust / Filters), and a body that renders the (regrouped) `AdjustmentsPanel.vue` or the unchanged `FiltersPanel.vue` depending on the active tab.
- `TransformFloatingPanel.vue`: a floating card with a header ("TRANSFORM" title + close button) wrapping the unchanged `TransformPanel.vue` content.

Both reuse the glass/rounded/elevated treatment already established for canvas tool overlays (`CropOverlay.vue`'s `.crop-controls`: `--color-surface-glass`, `--blur-glass`, `--shadow-lg`, `var(--radius-lg)`), positioned `fixed`, inset from the top/right/bottom edges, at a shared fixed width/height so the two are interchangeable in size and never need separate breakpoint logic. `AdjustmentsPanel.vue` and `FiltersPanel.vue`'s own markup/logic don't change shape, just their container.

`AdjustmentsPanel.vue` is restructured internally into three `.adj-group` sub-cards (Light / Color / Detail), each a `surface-container-high`-toned box with a `.group-title` label, matching the visual grouping already proven in the clickable design prototype reviewed and approved during this feature's design phase.

### Navbar

`AppNavbar.vue`'s single `mdi-tune-variant` "toggle settings panel" button (`.panel-toggle`, hidden ≥1240px today) is replaced by two always-visible icon buttons:

- **Adjust & Filters** toggle: a three-overlapping-circles (Venn) icon, emits `toggle-edit-panel`.
- **Transform** toggle: a perspective-transform icon (four corner handles joined by straight edges into an irregular quad), emits `toggle-transform-panel`.

Both follow the existing `nav-icon-btn` pattern (tooltip, `:disabled="locked"`, `is-active` tonal state while their panel is open) and both fold into the ≤639px overflow menu the same way today's other navbar actions already do. The `.panel-toggle { display: none }` desktop-hiding rule is removed: both toggles are visible at every width per the spec's "opt-in at every screen size" requirement.

Both new buttons are placed right after the "Extract text from image" button (the last of the existing secondary-action group: Scan QR, Scan Barcode, ASCII Art, Extract Text) and replace the old single `.panel-toggle` button in that same spot, in the order Adjust & Filters then Transform.

### State: two panels, mutually exclusive

`ImageEditor.vue`'s single `panelOpen` ref is replaced by two refs, `editPanelOpen` and `transformPanelOpen`, with the two navbar toggle handlers each closing the other panel when opening:

```ts
function toggleEditPanel() {
  editPanelOpen.value = !editPanelOpen.value
  if (editPanelOpen.value) transformPanelOpen.value = false
}
function toggleTransformPanel() {
  transformPanelOpen.value = !transformPanelOpen.value
  if (transformPanelOpen.value) editPanelOpen.value = false
}
```

Both start `false` on mount and are not reset when a new image loads (per spec: loading an image must not auto-open either panel). The existing `.panel-backdrop` click-outside-to-close behavior is kept for narrow viewports, now dismissing whichever of the two panels is open.

### New adjustment types

`Adjustments` (`src/types/adjustments.ts`) gains six keys: `highlights`, `shadows`, `vibrance`, `temperature`, `tint` (range -100…100, default 0) and `vignette` (range 0…100, default 0). `editorStore.ts`'s four `Object.assign(adjustments, { brightness: 0, … })` reset call sites all gain the six new keys alongside the existing five, and `AdjustmentsPanel.vue`'s `sliders` config array gains six new `SliderConfig` entries, placed in their Light/Color/Detail sub-group per the spec.

Each new adjustment follows the same two-sided pattern the existing `sharpness` slider already establishes in this codebase: a live CSS/SVG filter approximation for the on-canvas preview (`cssFilter` computed + an SVG `<filter>` def in `CanvasArea.vue`, same as today's `url(#image-sharpen)`), and a matching per-pixel implementation in `canvasRenderer.ts` that runs at export/save time, mirroring the live filter's math as closely as SVG allows (the same standard `applySharpen`'s own comment already documents: "mirrors," not bit-for-bit identical).

- **Highlights / Shadows**: a luminance-weighted tone curve. Live preview: an SVG `<filter id="image-tone">` using `feComponentTransfer` (`type="gamma"` per channel, gamma driven by the two values) referenced via `url(#image-tone)` in `cssFilter` whenever either is non-zero. Export: a new `applyToneCurve(ctx, highlights, shadows)` in `canvasRenderer.ts`, run in the same post-`ctx.filter = 'none'` pixel pass as `applySharpen`, computing per-pixel luminance and scaling highlight/shadow tonal ranges accordingly.
- **Temperature / Tint**: linear per-channel color offsets (warm/cool shifts red vs. blue; tint shifts green vs. magenta). Live preview: an SVG `<filter id="image-temp-tint">` using `feColorMatrix type="matrix"` with an offset-only matrix, referenced via `url(#image-temp-tint)`. Export: `applyTemperatureTint(ctx, temperature, tint)` in `canvasRenderer.ts` applying the identical linear offsets per pixel. Because both are literal linear channel math, live and export can match closely (not just approximate).
- **Vibrance**: a per-pixel adaptive saturation boost (weaker on already-saturated pixels) that has no exact SVG filter-primitive equivalent. Live preview approximates it with a moderate `saturate()` bump layered into `cssFilter`; export implements the real per-pixel algorithm in `canvasRenderer.ts` (`applyVibrance`). This is a known, called-out mismatch between live and export for this one adjustment; see Risks.
- **Vignette**: a radial darkening from center to edges, strength-scaled by the slider. Live preview: an absolutely-positioned overlay `<div>` in `CanvasArea.vue` with `background: radial-gradient(...)`, opacity driven by `adjustments.vignette / 100`, layered over the image element (not a CSS `filter`, since `filter` can't produce a positional radial darkening on its own). Export: `applyVignette(ctx, vignette)` in `canvasRenderer.ts` draws the same gradient with `ctx.globalCompositeOperation = 'multiply'` after `drawImage`. Both use the literal same gradient stops, so this one matches exactly.

`RenderOptions` (`canvasRenderer.ts`) and the two call sites building it (`CanvasArea.vue`, wherever export/save reads it) gain the six new fields alongside `sharpness`.

## Implementation

1. `src/types/adjustments.ts`: add `highlights`, `shadows`, `vibrance`, `temperature`, `tint`, `vignette` to `Adjustments`.
2. `src/stores/editorStore.ts`:
   - Add the six keys (default `0`) to the `adjustments` reactive object and to all four `Object.assign(adjustments, { … })` reset call sites.
   - Extend `cssFilter` computed: append `url(#image-tone)` when `highlights !== 0 || shadows !== 0`, `url(#image-temp-tint)` when `temperature !== 0 || tint !== 0`, and a `saturate()` bump for `vibrance` (approximation, see Risks). Vignette is excluded from `cssFilter` (handled as a separate overlay, not a filter).
   - Replace the single `panelOpen` concern here only if it currently lives in the store (it doesn't today — `panelOpen` lives in `ImageEditor.vue` — so no store change needed for panel open/close state itself beyond what's already there).
3. `src/utils/canvasRenderer.ts`:
   - Extend `RenderOptions` with `highlights`, `shadows`, `vibrance`, `temperature`, `tint`, `vignette`.
   - Add `applyToneCurve`, `applyTemperatureTint`, `applyVibrance`, `applyVignette`, called from `buildRenderedCanvas` in the same post-`ctx.filter = 'none'` pixel-ops section that already calls `applySharpen`.
4. `src/components/canvas/CanvasArea.vue`:
   - Add `<filter id="image-tone">` and `<filter id="image-temp-tint">` SVG defs alongside the existing `image-sharpen` filter.
   - Add the vignette overlay `<div>`, positioned over the image, opacity bound to `editor.adjustments.vignette / 100`.
   - Pass the six new fields into both `RenderOptions` construction call sites (mirroring the existing `sharpness: editor.adjustments.sharpness` lines).
5. `src/components/panels/AdjustmentsPanel.vue`:
   - Restructure `sliders` into three grouped arrays (Light / Color / Detail) and render each group as an `.adj-group` sub-card with a `.group-title`, instead of one flat list.
   - Add the six new `AdjustmentSlider` entries in their groups (Highlights/Shadows → Light; Vibrance/Temperature/Tint → Color; Vignette → Detail), each wired the same way as the existing five (`@dragstart="editor.beginAdjustment()"`, `@update:model-value="editor.updateAdjustment(...)"`, `:disabled="!editor.hasImage"`).
6. `src/components/panels/AdjustFiltersPanel.vue` (new): floating card, header with title + close button, tab bar (Adjust/Filters, local `ref` for active tab), body rendering `AdjustmentsPanel` or `FiltersPanel`. Props: `modelValue: boolean` (open state); emits `update:modelValue` / a plain `close`.
7. `src/components/panels/TransformFloatingPanel.vue` (new): floating card, header with "Transform" title + close button, body rendering the unchanged `TransformPanel.vue`. Same props/emit shape as `AdjustFiltersPanel.vue`, and the same fixed width/height so the two are visually interchangeable.
8. `src/components/navbar/AppNavbar.vue`:
   - Replace the single `.panel-toggle` button with two buttons (Venn icon / perspective-transform icon), each with its own `is-active` tonal styling driven by a new boolean prop each (`editPanelOpen`, `transformPanelOpen`), emitting `toggle-edit-panel` / `toggle-transform-panel`.
   - Remove the `.panel-toggle { display: none }` desktop rule so both are visible at every width.
   - Add both to the ≤639px overflow menu alongside the existing actions.
9. `src/components/ImageEditor.vue`:
   - Replace `panelOpen` with `editPanelOpen` / `transformPanelOpen` refs and the two mutually-exclusive toggle functions from "Approach" above.
   - Replace the `<RightPanel>` usage with `<AdjustFiltersPanel v-model="editPanelOpen">` and `<TransformFloatingPanel v-model="transformPanelOpen">`.
   - Wire the navbar's new emits to the two toggle functions.
   - Keep `.panel-backdrop` for narrow viewports, now closing whichever panel is open.
10. `RightPanel.vue` becomes unused once step 9 lands. Per this project's convention (no file deletions without explicit approval), it's left in place and flagged for removal in a follow-up the user explicitly approves, rather than deleted as part of this feature's tasks.

## Decisions

- **Two new floating-panel components instead of one `RightPanel.vue` rewrite**: `RightPanel.vue`'s whole reason to exist was gluing three sub-panels into one scrolling column; once Transform is pulled out into its own independently-toggled panel, there's no shared parent behavior left for the two panels to share (different open state, different toggle button, same size by coincidence not by relationship) — two small, single-purpose components read more clearly than one component branching on "which panel am I right now."
- **Sub-card grouping (Light/Color/Detail) lives inside `AdjustmentsPanel.vue`, not as three new components**: the groups are a pure layout/visual concern with no independent state or reuse elsewhere, so a single component with three inline blocks is simpler than three near-empty wrapper components.
- **New adjustments follow the sharpness precedent (SVG filter for live preview + matching pixel op for export) rather than moving the whole live preview to a canvas redraw-on-drag model**: switching the live preview off CSS filters entirely would fix the vibrance mismatch (see Risks) but would mean every existing adjustment's live preview also has to redraw a full-resolution canvas on every slider `input` event instead of letting the browser's GPU-accelerated `filter` do it — a real performance regression for a cosmetic accuracy gain on one slider. Accepting vibrance's live/export approximation mismatch (already flagged to the user as a risk) is the smaller cost.
- **Vignette as a separate overlay `<div>`, not a CSS `filter`**: CSS `filter` functions operate per-pixel with no positional/radial awareness (there's no `radial-darken()` filter primitive), so a vignette needs either an SVG `feImage`/`feComposite` filter graph (materially more complex than this app's existing filters) or a plain positioned overlay. The overlay is simpler, already matches how this app layers other canvas UI (veils, overlays) on top of the image element, and produces pixel-identical results to the export-time `multiply` composite since both use the same gradient stops.
