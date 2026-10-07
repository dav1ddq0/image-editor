# 004 · Grouped, floating editing panels with expanded adjustments: Tasks

_Actionable checklist derived from `plan.md`. Small, concrete tasks; mark `[x]` when done._

## Panel restructuring

- [x] `src/components/navbar/AppNavbar.vue`: replace the single `.panel-toggle` (`mdi-tune-variant`) button with two always-visible icon buttons, in that same spot right after "Extract text from image": Adjust & Filters (three-overlapping-circles icon) then Transform (perspective-transform icon), each with its own `is-active` state and tooltip.
- [x] `src/components/navbar/AppNavbar.vue`: add `adjustPanelOpen: boolean` / `transformPanelOpen: boolean` props (for the `nav-icon-btn--active` styling) and emit `toggle-adjust-panel` / `toggle-transform-panel` instead of the old single `toggle-panel`.
- [x] `src/components/navbar/AppNavbar.vue`: remove the `.panel-toggle { display: none }` desktop rule so both toggles show at every width.
- [x] `src/components/navbar/AppNavbar.vue`: add both new actions to the ≤639px overflow menu.
- [x] `src/components/icons/`: add `IconAdjustFilters.vue` and `IconTransform.vue`, exported from `index.ts` alongside the existing navbar icons.
- [x] `src/components/panels/FloatingPanel.vue` (new): shared chrome for both panels (floating glass card, titled header, close button, fixed size/position), so the two can never drift apart visually.
- [x] `src/components/panels/AdjustFiltersPanel.vue` (new): tab bar with no divider line under it, `v-show` (not `v-if`) tab switching so scroll position and in-progress drags survive.
- [x] `src/components/panels/TransformFloatingPanel.vue` (new): wraps the unchanged `TransformPanel.vue` in the same `FloatingPanel`.
- [x] `src/components/panels/AdjustmentsPanel.vue`: restructure the flat slider list into three `.adjustment-group` sub-cards — Light (Brightness, Contrast, Highlights, Shadows), Color (Saturation, Vibrance, Temperature, Tint), Detail (Sharpness, Blur, Vignette).
- [x] `src/components/panels/FiltersPanel.vue` / `TransformPanel.vue`: drop their now-redundant `panel-title` headings (the tab and the panel header already label them).
- [x] `src/components/ImageEditor.vue`: replace `panelOpen` with `adjustPanelOpen` / `transformPanelOpen` refs and the mutually-exclusive toggle functions (opening one closes the other).
- [x] `src/components/ImageEditor.vue`: swap `<RightPanel>` for `<AdjustFiltersPanel>` + `<TransformFloatingPanel>`, wire the new navbar emits, keep `.panel-backdrop` closing whichever panel is open on narrow viewports.

## New adjustment types

- [x] `src/types/adjustments.ts`: add `highlights`, `shadows`, `vibrance`, `temperature`, `tint` (-100…100) and `vignette` (0…100) to `Adjustments`.
- [x] `src/stores/editorStore.ts`: add a `defaultAdjustments()` helper and use it for the reactive object and all seven reset call sites (the plan said four; the code actually had seven).
- [x] `src/stores/editorStore.ts`: split the filter string into `baseFilterParts` (what CSS expresses faithfully; shared by preview and export) and `previewOnlyFilterParts` (the `url(#…)` / `saturate()` stand-ins), and expose a single `renderOptions` computed so every consumer builds `RenderOptions` the same way.
- [x] `src/components/canvas/CanvasArea.vue`: add `<filter id="image-tone">` (`feComponentTransfer`, 17-point table) and `<filter id="image-temp-tint">` (`feColorMatrix`) SVG defs.
- [x] `src/components/canvas/CanvasArea.vue`: add the vignette radial-gradient overlay `<div>`, opacity bound to `adjustments.vignette / 100`.
- [x] `src/components/canvas/CanvasArea.vue` / `ImageEditor.vue`: point all five `RenderOptions` call sites at the store's shared `renderOptions`.
- [x] `src/utils/canvasRenderer.ts`: extend `RenderOptions` with the six new fields.
- [x] `src/utils/canvasRenderer.ts`: implement `applyToneCurve`, `applyTemperatureTint`, `applyVibrance`, `applyVignette`; call all four from `buildRenderedCanvas`'s post-`ctx.filter = 'none'` pixel-ops section, alongside `applySharpen`.
- [x] Tune `applyToneCurve`'s JS math against the live `feComponentTransfer` curve. Verified numerically: preview and export land within 1-4 levels per channel on a test image at ±70.

## Manual verification

_All verified in a real browser (Playwright, Chromium) against the running dev server, with pixel-level comparison of live preview vs. exported PNG._

- [x] Adjust & Filters toggle opens/closes its panel; Transform toggle opens/closes its panel; opening one while the other is open closes the other automatically. Verified: exactly one `.floating-panel.is-open` after each toggle, and the open one's title flips to the button that was pressed.
- [x] Both toggles work at desktop width, and both appear in the ≤639px overflow menu (which lists: Copy image, Scan QR, Scan Barcode, ASCII Art, Extract Text, Adjust & Filters, Transform). Verified opening the Transform panel from the phone-width overflow menu.
- [x] Switching Adjust ↔ Filters tabs preserves state (`v-show`, both tabs stay mounted).
- [x] All 5 pre-existing adjustments keep their range, default and effect. Brightness verified pixel-identical between preview and export.
- [x] Highlights / Shadows affect the bright and dark tonal ranges independently, not as a global shift. Verified: at highlights +70 / shadows -70 the dark patch's dark channel drops (30 → 0) while its bright channel rises (180 → 203).
- [x] Vibrance visibly differs from Saturation on mixed-saturation content. Verified: at the same +60, the already-saturated red moves less under Vibrance (220 → 228) than under Saturation (220 → 255), while the near-neutral gray moves more (150 → 153 vs 150 → 153 with a different channel spread).
- [x] Temperature shifts warm/cool, Tint green/magenta, independently. Verified: temperature +60 pushes red up and blue down (240,235,225 → 255,235,177), preview and export pixel-identical.
- [x] Vignette at 0 shows no effect; raising it darkens corners radially. Verified: at 60, corner 220,60,40 → 75,21,14 while the center is untouched.
- [x] Every new adjustment participates in undo/redo like the existing five. Verified with Ctrl+Z / Ctrl+Y on Vignette (80 → 0 → 80).
- [x] Every adjustment resets to 0 when a new image loads. This did NOT hold before (see "Bug found and fixed" below) and now does.
- [x] The Filters grid and the Transform actions are unchanged apart from where they live.
- [x] Both panels render as floating, fully-rounded, glass-surfaced cards inset from the viewport edges, at identical size. Verified with screenshots in both light and dark theme.
- [x] Loading a new image doesn't auto-open either panel.
- [x] Both toggles are disabled while no image is loaded (and while the editor is interaction-locked), matching Save / Export / Copy / the secondary tools. Verified in both the navbar and the overflow menu.
- [x] No console or page errors in any of the flows exercised.
- [x] Run `npm run build`: type-check + build both pass clean.
- [x] Validate against the acceptance criteria in `spec.md`.
- [ ] Propose deleting the now-unused `src/components/panels/RightPanel.vue` and get explicit approval before removing it.
- [ ] Move the feature to "Done" in `../../constitution/roadmap.md`.

## Design review follow-up

A `design-director` review (code audit plus rendered verification in Chromium at 1440 / 1000 / 390 in both themes) ran after implementation. Applied fixes:

- [x] **Backdrop no longer scrims the canvas between 640 and 1240px.** The dimming/blurring backdrop was inherited from the old full-height sheet and, on a 288px floating card, covered 71% of the viewport with a 40% black scrim plus a 3px blur: exactly the pixels the user is judging Brightness / Sharpness / Blur against. Moved to the ≤639px breakpoint, where the panel really is a full-bleed sheet. Verified: `display: none` at 1000px, and the phone sheet keeps its backdrop.
- [x] **Panel toggles are reachable again at ≤1240px.** `.navbar` is a static element with no stacking context, so the `z-index: 99` backdrop painted over it: hit-testing the Transform button returned `.panel-backdrop`, and switching panels took two taps instead of one. Resolved by the fix above. Verified: hit test now returns the Transform button, and Adjust → Transform swaps in one click.
- [x] **Panels close when the editor is interaction-locked.** `RightPanel` had `.is-locked { pointer-events: none; opacity: 0.45 }`; `FloatingPanel` did not inherit it, so during an inline OCR selection an open panel could still rotate or re-adjust the image under an overlay whose region coordinates were computed against the pre-edit pixels. A watcher on `isInteractionLocked` now closes both panels (chosen over dimming: a dimmed glass-on-glass card reads as broken).
- [x] **Vignette preview follows the image's rotation.** The overlay covers `.image-wrapper`, sized by the image's *layout* box, which a transform doesn't change: after a 90° rotation the image rendered 600x900 while the overlay stayed 900x600, so preview and export disagreed. The overlay now carries the same `cssTransform`. Verified: both boxes now measure identically after Rotate R.
- [x] **Bidirectional sliders fill from their neutral point, not from the left.** Pre-existing behavior in `AdjustmentSlider.vue`, but going from 5 to 11 sliders made it the panel's dominant impression: eight of eleven rows showed a solid half-filled accent bar while set to 0, so a freshly loaded image looked heavily edited. Sliders with `min < 0` now fill from 0 toward the thumb. Verified: at 0 the fill measures 0px wide at the track's centre; +40 fills 42px rightward from centre, -40 fills 42px leftward, and the `min: 0` Detail sliders still fill from the left.
- [x] **Slider track widened from 86px to 214px.** A 200-unit range across 86px meant 2.3 units per pixel of drag, which makes the six new fine-control adjustments unusable by pointer. The label and value readout moved above the track (the Lightroom/Snapseed convention) so the track spans the panel's full width: now ~0.93 units per pixel.
- [x] **Slider layout adapts per viewport.** The stacked label-above-track layout buys drag precision where the panel is narrow (288px), but on the phone sheet the panel is *wider* (366px) and the viewport is short, so the trade-off inverts. Below 639px, and in any short landscape window, the label goes back beside the track. Measured: phone 390x844 fits all 11 sliders with zero scrolling again (was 243px of overflow after the desktop change), keeping a 164px track; short landscape drops from 892px to 620px of content.
- [x] **Panel top offset follows the landscape navbar.** The navbar shrinks to 46px under `(orientation: landscape) and (max-height: 500px)` but the panel's `top` assumed 56px, leaving a stray gap. Now matched.
- [x] **Group titles are visually distinct from slider labels.** Both used `--color-muted` at nearly the same size, so the Light/Color/Detail hierarchy rested on letter-spacing alone. Group titles now use the rose-tinted `--color-subtle` at 0.86rem/600; slider labels use `--color-text` at 0.78rem/400.
- [x] **Divider restored under the panel title.** The prototype had a rule under the header; only the one under the tab bar was meant to go.
- [x] **Tab bar pinned in the panel header.** Taller slider rows grew the Adjust tab's content from 660px to 937px, so the panel now scrolls at every common viewport height and the tab bar, which lived inside the scroll area, would have scrolled out of view. Moved into a `subheader` slot outside `.panel-body`. Verified: tabs stay visible with the body scrolled to the bottom at 900 / 768 / 700px viewport heights.
- [x] Corrected an inaccurate code comment claiming `v-show` preserves scroll position across tab switches. It preserves in-progress drags; scroll position is clamped because both tabs share one scroll container.

Reviewed and deliberately not changed:

- **Transform panel height.** The review initially flagged the full-height card holding four buttons as a P1, then withdrew it on learning this is a deliberate product decision: both panels are specified to be the same size so swapping between them doesn't resize the card under the cursor.
- **Transform icon semantics.** The review notes the four-corner-handle quad reads as perspective/corner-pin while the panel only rotates and flips. The icon was specifically chosen by the product owner; left as is.

Open, not addressed in this feature (candidates for a follow-up):

- No per-slider or per-group reset affordance (double-click-to-default is the creative-tool convention, and matters more with 11 sliders).
- The Light/Color/Detail sub-cards use an opaque token over a translucent panel, so their elevation polarity inverts depending on whether the image behind the glass is bright or dark. Measured contrast 1.21:1 to 1.53:1; visible in both themes but marginal in light theme at real size.
- Incomplete ARIA tab pattern (roles present, but no `aria-controls`/`aria-labelledby` linkage, no roving tabindex, no arrow-key handling).
- No Escape-to-close and no focus return to the originating toggle.
- `nav-icon-btn--active` and `nav-icon-btn--success` share the same primary-container fill, so a persistent toggle state and a transient copy confirmation look identical.
- The two new icons deviate slightly from the family's 1.8 stroke width (1.7 and 2.0).

## Known limitation

**Vibrance is the one adjustment whose live preview is not pixel-identical to the export.** Vibrance boosts less-saturated pixels more than saturated ones; CSS `saturate()` does the opposite, and no CSS or SVG filter primitive expresses the real algorithm. The preview therefore uses a mild uniform `saturate()` bump, tuned (factor 0.2) so its magnitude tracks the real algorithm across the tonal range rather than overshooting saturated colors. Measured gap after tuning: within ~10 levels per channel at Vibrance +60, versus ~30 before tuning. Every other adjustment now matches the export exactly or within rounding. This was flagged as a risk in `plan.md` before implementation; the documented fallback (a debounced canvas redraw scoped to the Vibrance drag) was not taken, because it would cost a full-resolution redraw per drag frame for a difference that is not visible side by side.

## Bugs found and fixed during verification

1. **Every url()-based adjustment was applied twice on export.** `buildRenderedCanvas` sets `ctx.filter = opts.cssFilter` before `drawImage` and *then* runs the JS pixel operations. Browsers do resolve `url(#…)` references inside `ctx.filter`, so each effect that had both an SVG-filter preview and a JS export implementation got applied twice: measured at Temperature +60, the red channel went 220 → 268 (clipped to 255) instead of 220 → 244. This also affected the pre-existing `sharpness` slider, which had the same preview/export pair before this feature. Fixed by splitting the filter string in `editorStore.ts` into `baseFilterParts` (shared) and `previewOnlyFilterParts` (preview-only), and feeding only the base parts into `renderOptions`.

2. **The highlights/shadows preview had no visible effect at all.** The tone filter's transfer table was built from just its two endpoints, and clamping those to the legal [0, 1] range collapsed the curve back to the identity table (`0 1`) for exactly the useful cases: raising highlights wants an endpoint above 1, lowering shadows one below 0. Because a filter chain is dropped wholesale when one entry is a no-op identity, the slider looked completely dead while the export was correct. Fixed by sampling the curve at 17 points and clamping each sample, which clips only the out-of-range ends instead of flattening the whole ramp.

3. **Adjustments were not reset when a new image was loaded.** `loadImage` cleared the undo/redo history and the active tool but left rotation, flip, the selected filter and every adjustment slider in place, so a newly opened picture inherited the previous one's edits. Pre-existing behavior, but it directly contradicts this feature's acceptance criterion that each adjustment resets on load. Fixed in `editorStore.ts`'s `loadImage`.
