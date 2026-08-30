# 004 · Grouped, floating editing panels with expanded adjustments

**Status:** proposed

## What it does

Reorganizes the right-side editing panel (`RightPanel.vue`), which today stacks Adjustments, Filters and Transform as one continuous scroll, permanently docked on desktop/tablet. This feature has four parts:

1. **Split into two independent panels, each opened by its own navbar button.**
   - **Adjust & Filters**: one panel with two tabs (Adjust / Filters), opened by a dedicated toggle button using a three-overlapping-circles (Venn) icon, reading as "blend/adjust."
   - **Transform**: its own panel holding just the existing rotate/flip actions, opened by a separate toggle button using a perspective-transform icon (four corner handles joined by straight edges into an irregular quad) rather than reusing the edit icon.

   Transform gets pulled out on its own because it's a fundamentally different kind of tool — four one-shot actions, not sliders with a live preview — and doesn't belong grouped with Adjust/Filters just because they happened to share a sidebar before.

2. **Adjustments regrouped by type, with new adjustment types added.** Inside the "Adjust" tab, sliders split into semantic groups matching what comparable editors (Lightroom, Snapseed) use:
   - **Light**: Brightness, Contrast, Highlights, Shadows (existing: Brightness, Contrast; new: Highlights, Shadows)
   - **Color**: Saturation, Vibrance, Temperature, Tint (existing: Saturation; new: Vibrance, Temperature, Tint)
   - **Detail**: Sharpness, Blur, Vignette (existing: Sharpness, Blur; new: Vignette)

   The "Filters" tab keeps its current grid of presets unchanged.

3. **Both panels are opt-in at every screen size, not just on mobile**, and both float instead of docking. Today the panel is a permanently-docked, flush-to-edge 240px column on desktop/tablet (≥1240px) and only becomes a hidden, toggle-opened overlay below that width. This feature removes that split: at **every** width, both panels start hidden and only appear when their navbar button is clicked. Each has its own close button, so opening/closing never depends on window size.

4. **Both panels use the app's existing floating-toolbar treatment**, not a flat sidebar rectangle. Today's panel is a flush rectangle touching the viewport's top/right/bottom edges with square corners and an opaque `--color-surface` background. The floating overlay toolbars this app already has for its canvas tools (Crop, Brush, Eraser, …) look different: inset from the edges, fully rounded, with the frosted-glass surface (`--color-surface-glass` + `--blur-glass`) and `--shadow-lg`. Both new panels adopt that same look, so a floating panel reads as visually consistent with the rest of the app instead of introducing a second "panel" visual language.

## Why

The panel doesn't scale: today it's 5 adjustment sliders, 6 filter tiles and 4 transform buttons all visible and scrolling together, with no indication that these are three different *kinds* of tool — and Transform in particular doesn't belong conceptually next to Adjust/Filters at all. Splitting it into its own single-purpose panel, and grouping the remaining two (which do belong together — both are "how the pixels look" tools with a live preview) under tabs, matches how the tools actually relate to each other instead of how they happened to be laid out in one file.

The specific new adjustments (temperature/tint, vignette, highlights/shadows, vibrance) are standard in every comparable editor and are the most commonly-reached-for tools this app doesn't yet have.

Making both panels opt-in everywhere (not just on mobile) gives the canvas the full width by default on every screen size, which matters more now that Adjust alone is growing to 11 sliders — a permanently-docked panel that size eats into canvas space on every screen, not just small ones.

Floating, rounded panels instead of a flat docked sidebar bring the panel in line with the visual language every other floating control in this app already uses, rather than being the one UI surface that looks like a leftover pre-M3 sidebar.

## Acceptance criteria

- [ ] Two separate navbar toggle buttons exist: one opens the **Adjust & Filters** panel, the other opens the **Transform** panel. They're mutually exclusive: opening one closes the other if it was open.
- [ ] The Transform toggle uses a distinct icon from the Adjust/Filters toggle: a perspective-transform icon (four corner handles joined by straight edges into an irregular quad), reading as "transform," not a reuse of the Adjust/Filters icon.
- [ ] The Adjust/Filters toggle uses a three-overlapping-circles (Venn) icon, reading as "blend/adjust."
- [ ] The **Adjust & Filters** panel header shows the "ADJUST & FILTERS" title, with the two tabs below it and no divider line between the tab bar and the panel body. Switching tabs doesn't lose scroll position or any in-progress edit. The tab switcher follows the app's existing M3 tonal/segmented pattern.
- [ ] Inside **Adjust**, sliders are visually grouped under three labeled sub-sections: **Light**, **Color**, **Detail** (as listed above), styled consistently with how `panel-title` groups already look elsewhere in this app.
- [ ] All 5 existing adjustments (Brightness, Contrast, Saturation, Sharpness, Blur) keep their exact current range, default value, and effect on the image — this is a reorganization of 3 of them plus new additions, not a rewrite of the ones that already exist.
- [ ] **Highlights** and **Shadows** independently affect only the bright and dark tonal ranges of the image respectively (not a global brightness shift), with a live preview matching the export/save output exactly, like every other adjustment.
- [ ] **Vibrance** boosts less-saturated colors more than already-saturated ones (as opposed to Saturation's uniform boost), with a visibly different result from Saturation on a photo with mixed-saturation content.
- [ ] **Temperature** shifts the image toward warm (amber) or cool (blue) along a single slider; **Tint** shifts toward green or magenta along a single slider — the two are independent controls.
- [ ] **Vignette** darkens the image's corners/edges radially, strength controlled by a single slider, with 0 producing no visible effect.
- [ ] Every new adjustment: has a slider matching the existing `AdjustmentSlider.vue` component's look and interaction (same drag/keyboard behavior, same disabled-when-no-image state), is included in undo/redo exactly like the existing 5 (i.e. `beginAdjustment()` fires on drag-start, same as today), and is reset to a sensible default (0 / no effect) when a new image loads.
- [ ] The **Filters** tab shows exactly what `FiltersPanel.vue` shows today — no visual or behavioral change to the filter grid itself, only where it lives.
- [ ] The **Transform** panel shows exactly what `TransformPanel.vue` shows today (Rotate L, Rotate R, Flip H, Flip V) — no visual or behavioral change to the actions themselves, only where they live and that they now have their own dedicated panel and close control.
- [ ] Both panels start closed on every screen size (desktop included) and reserve no layout space while closed — the canvas gets the full remaining width.
- [ ] Both panels' navbar toggle buttons work at every screen size, not only below the current 1240px breakpoint.
- [ ] Both panels have a visible close control at every screen size (today's mobile-only `panel-close-btn` pattern becomes each panel's permanent close control, not a mobile-specific one).
- [ ] Both panels render as floating, fully-rounded cards inset from the viewport edges (not flush/square-cornered), using the app's existing floating-toolbar surface treatment (`--color-surface-glass`, `--blur-glass`, `--shadow-lg`) — matching how Crop/Brush/Eraser/etc.'s overlay toolbars already look, not the current flat `--color-surface` sidebar.
- [ ] The Transform panel is the same width and height as the Adjust & Filters panel (not a smaller, content-hugging card) — its shorter content (4 buttons) just leaves empty space below rather than the panel shrinking to fit it.
- [ ] Opening either panel doesn't require re-deriving anything about the current edit — it reflects whatever tab and adjustment values were already in effect from before it was closed.
- [ ] Behavior and appearance are consistent in both light and dark theme, and at both narrow and wide viewports.
- [ ] Loading a new image does not auto-open either panel; each stays exactly as the user left it (open or closed).
- [ ] The two panels are mutually exclusive: opening one automatically closes the other if it was open. Since both panels are the same size and position, this also prevents them from ever visually overlapping.

## Out of scope

- Filter tiles previewing the user's actual photo instead of a generic swatch (a separate idea raised and explicitly deferred, not part of this feature).
- Any change to the Filters or Transform tools themselves (new filters, new transform actions) — this feature only relocates their existing UI.
- Curves, per-channel HSL, or any other advanced color-grading tool beyond the specific adjustments listed above.
- Presets/favorites for adjustment combinations.
- Changing how adjustments are stored in `editorStore.ts` beyond adding the new keys — the existing `Adjustments` type, undo/redo mechanism, and `cssFilter`/render pipeline shape are extended, not redesigned.
