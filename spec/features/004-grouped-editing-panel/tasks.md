# 004 · Grouped, floating editing panels with expanded adjustments: Tasks

_Actionable checklist derived from `plan.md`. Small, concrete tasks; mark `[x]` when done._

## Panel restructuring

- [ ] `src/components/navbar/AppNavbar.vue`: replace the single `.panel-toggle` (`mdi-tune-variant`) button with two always-visible icon buttons, in that same spot right after "Extract text from image": Adjust & Filters (three-overlapping-circles icon) then Transform (perspective-transform icon), each with its own `is-active` state and tooltip.
- [ ] `src/components/navbar/AppNavbar.vue`: add `editPanelOpen: boolean` / `transformPanelOpen: boolean` props (for the `is-active` styling) and emit `toggle-edit-panel` / `toggle-transform-panel` instead of the old single `toggle-panel`.
- [ ] `src/components/navbar/AppNavbar.vue`: remove the `.panel-toggle { display: none }` desktop rule so both toggles show at every width.
- [ ] `src/components/navbar/AppNavbar.vue`: add both new actions to the ≤639px overflow menu.
- [ ] `src/components/panels/AdjustFiltersPanel.vue` (new): floating glass card (header with "ADJUST & FILTERS" title + close button, tab bar with no divider line under it, body), `v-model` for open state, tabs switch between `AdjustmentsPanel` and `FiltersPanel` without losing state.
- [ ] `src/components/panels/TransformFloatingPanel.vue` (new): floating glass card (header with "Transform" title + close button, body), `v-model` for open state, same fixed width/height as `AdjustFiltersPanel.vue`, wraps the unchanged `TransformPanel.vue`.
- [ ] `src/components/panels/AdjustmentsPanel.vue`: restructure the flat slider list into three `.adj-group` sub-cards — Light (Brightness, Contrast, Highlights, Shadows), Color (Saturation, Vibrance, Temperature, Tint), Detail (Sharpness, Blur, Vignette).
- [ ] `src/components/ImageEditor.vue`: replace `panelOpen` with `editPanelOpen` / `transformPanelOpen` refs and the mutually-exclusive toggle functions (opening one closes the other).
- [ ] `src/components/ImageEditor.vue`: swap `<RightPanel>` for `<AdjustFiltersPanel>` + `<TransformFloatingPanel>`, wire the new navbar emits, keep `.panel-backdrop` closing whichever panel is open on narrow viewports.
- [ ] Confirm neither panel auto-opens when a new image loads.

## New adjustment types

- [ ] `src/types/adjustments.ts`: add `highlights`, `shadows`, `vibrance`, `temperature`, `tint` (-100…100) and `vignette` (0…100) to `Adjustments`.
- [ ] `src/stores/editorStore.ts`: add the six new keys (default `0`) to the `adjustments` reactive object and to all four `Object.assign(adjustments, { … })` reset call sites.
- [ ] `src/stores/editorStore.ts`: extend `cssFilter` with `url(#image-tone)` (highlights/shadows), `url(#image-temp-tint)` (temperature/tint), and the vibrance `saturate()` approximation.
- [ ] `src/components/canvas/CanvasArea.vue`: add `<filter id="image-tone">` (`feComponentTransfer`) and `<filter id="image-temp-tint">` (`feColorMatrix`) SVG defs.
- [ ] `src/components/canvas/CanvasArea.vue`: add the vignette radial-gradient overlay `<div>`, opacity bound to `adjustments.vignette / 100`.
- [ ] `src/components/canvas/CanvasArea.vue`: pass the six new fields into both `RenderOptions` construction call sites.
- [ ] `src/utils/canvasRenderer.ts`: extend `RenderOptions` with the six new fields.
- [ ] `src/utils/canvasRenderer.ts`: implement `applyToneCurve` (highlights/shadows), `applyTemperatureTint`, `applyVibrance`, `applyVignette`; call all four from `buildRenderedCanvas`'s post-`ctx.filter = 'none'` pixel-ops section, alongside `applySharpen`.
- [ ] Tune `applyToneCurve`'s JS math against the live `feComponentTransfer` gamma curve until they read the same visually (same bar `applySharpen` already meets for `sharpness`).

## Manual verification

- [ ] Verify: Adjust & Filters toggle opens/closes its panel; Transform toggle opens/closes its panel; opening one while the other is open closes the other automatically.
- [ ] Verify: both toggles work at desktop, tablet and phone widths, and both show up correctly in the ≤639px overflow menu.
- [ ] Verify: switching Adjust ↔ Filters tabs preserves scroll position and in-progress slider drags.
- [ ] Verify: all 5 pre-existing adjustments (Brightness, Contrast, Saturation, Sharpness, Blur) keep their exact range, default and visual effect.
- [ ] Verify: each new adjustment (Highlights, Shadows, Vibrance, Temperature, Tint, Vignette) — live preview vs. exported/saved image match closely; each resets to 0 on new image load; each participates in undo/redo like the existing five.
- [ ] Verify: Vibrance visibly differs from Saturation on a mixed-saturation test photo.
- [ ] Verify: Vignette at 0 shows no visible effect; increasing it darkens corners/edges radially.
- [ ] Verify: the Filters tab and the Transform panel are visually/behaviorally unchanged from today's `FiltersPanel.vue` / `TransformPanel.vue`.
- [ ] Verify: both panels render as floating, fully-rounded, glass-surfaced cards inset from the viewport edges, matching Crop/Brush/Eraser's overlay toolbars, in both light and dark theme.
- [ ] Verify: loading a new image doesn't auto-open either panel.
- [ ] Run `npm run build`: type-check + build both pass clean.
- [ ] Validate against the acceptance criteria in `spec.md`.
- [ ] Propose deleting the now-unused `src/components/panels/RightPanel.vue` and get explicit approval before removing it.
- [ ] Move the feature to "Done" in `../../constitution/roadmap.md`.
