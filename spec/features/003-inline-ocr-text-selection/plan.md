# 003 · Inline OCR text selection on canvas: Plan

_How what's described in `spec.md` gets implemented. Must respect `constitution/`._

## Approach

The canvas already has an established pattern for this exact shape of interaction: `CanvasArea.vue` renders overlay components (`CropOverlay`, `SelectionOverlay`, `TextOverlay`, `BrushOverlay`, …) inside `.image-wrapper`, each mounted conditionally from state and each receiving `:img-width="displayW"` / `:img-height="displayH"` so it aligns with the displayed image at the current zoom. The OCR result becomes one more overlay of that family: `TextRegionsOverlay`, mounted when an inline OCR session is active, positioning the same normalized `TextRegion` boxes the dialog renders today.

The regions' box coordinates are already 0-1 normalized (see `regionStyle()` in `ExtractTextDialog.vue`), so they map to percentage offsets inside the wrapper with no extra math; the overlay stays aligned at any zoom for free, because the wrapper is sized by the image.

The OCR session state moves from local refs in `ImageEditor.vue` into `editorStore`, so both the canvas overlay and the parts of the UI that must be blocked can read one source of truth, consistent with the project convention that editor state lives in Pinia.

## Implementation

1. **`src/types/`** (OCR-related types file, per the 001 split): add the inline-session shape if needed; keep reusing `TextRegion` from `@/utils/textExtractor`.
2. **`src/stores/editorStore.ts`**: add OCR session state (`ocrRegions`, `ocrText`, and an `ocrSelectionActive` flag) plus actions `startOcrSelection(text, regions)` and `endOcrSelection()`. `endOcrSelection()` clears regions and text. Expose a computed like `isInteractionLocked` that is true while `ocrSelectionActive` is set.
3. **`src/components/canvas/TextRegionsOverlay.vue`** (new): props `imgWidth` / `imgHeight`; emits `close`. Structure, from bottom to top:
   - a **veil** layer covering the image only (absolutely positioned, inset 0 inside `.image-wrapper`), a semi-transparent dark fill from the theme's custom properties; `pointer-events: none` so it never eats clicks;
   - one absolutely-positioned, transparent-but-selectable `<span>` per region, stacked above the veil (`regionStyle()` and the `.text-region` / `.region-text` rules move over from `ExtractTextDialog.vue`). To make regions read as "punched through" the veil, each gets a light backdrop treatment (e.g. `backdrop-filter: brightness(…)`, with a plain translucent-light background as the fallback) plus the accent underline it already has, so the extractable text is the bright part of a dimmed picture;
   The overlay owns only what is tied to the image (veil, regions, `Escape` listener). Its chip controls live in `CanvasArea.vue` instead: see step 4.
4. **`src/components/canvas/CanvasArea.vue`**: mount `<TextRegionsOverlay v-if="isOcrSelecting && displayW > 0" … @close="editor.endOcrSelection()" />` alongside the existing overlays; short-circuit `onWheel`, `onContainerClick` and `onTouchStart` while the session is active so zoom/pan don't fight text selection. Also render the mode's two chip controls here, as siblings of `CanvasStatusBar` and anchored to `.canvas-area` (already `position: relative`), not to the image: "Copy all" (`navigator.clipboard.writeText(editor.ocrText)` with the `mdi-content-copy` → `mdi-check` swap, in try/catch) and "Close text". Anchoring them to the canvas keeps them fixed and reachable at any zoom, and off the picture itself.
5. **`src/components/ImageEditor.vue`**: in `extractText()`, on a `found` result call `editor.startOcrSelection(result.text, result.regions)` and set `showOcrDialog = false` instead of switching the dialog to the `found` state; `not-found`, `loading-model` and `extracting` keep using the dialog exactly as today. `ocrImageSrc` is no longer needed for the found state (only kept if the dialog still uses it).
6. **`src/components/ocr/ExtractTextDialog.vue`**: drop the `found` branch (image preview, overlays, copy button) and the now-unused `regions` / `imageSrc` props; the dialog keeps only `loading-model`, `extracting` and `not-found`.
7. **Locking the rest of the UI**: while `editor.ocrSelectionActive` is true,
   - `AppToolbar`, `RightPanel` and `AppNavbar` disable their controls (reusing the existing `:disabled` conventions already used for "no image loaded"), so they read as unavailable rather than inert;
   - `CanvasStatusBar`'s zoom controls are disabled too, and the wheel/pinch/zoom-tool handlers in `CanvasArea` are short-circuited;
   - the drop zone / drag-and-drop image loading is ignored.
   The lock is per-control `disabled` plus handler short-circuits, never an app-wide modal scrim; the only veil on screen is the design one over the image, and the only enabled control is close.
8. **Escape to close**: add a `keydown` listener in `TextRegionsOverlay.vue` (or reuse whatever the existing overlays do to cancel) that calls the same close path.
9. Type-check and build with `npm run build`.

## Decisions

- **Overlay component inside `.image-wrapper`, not a floating layer over the whole canvas**: it inherits the image's exact position and size at any zoom, matching every other overlay in the app; a separately positioned layer would need manual re-syncing on zoom, pan and resize.
- **Session state in Pinia rather than props drilled from `ImageEditor.vue`**: `CanvasArea`, the toolbar, the panel and the navbar all need to react to it; the project convention is that shared editor state lives in `editorStore.ts`.
- **Keep the dialog for the transient states**: the user explicitly wants progress and the other messages to stay in the popup; only the "found" state (the redundant thumbnail) moves inline.
- **Snipping Tool visual language: veil over the image, regions punched through it**: dimming the picture is what makes the detected text pop without adding any chrome. The veil is scoped to the image, so it reads as "this picture is in text mode", not as an app-wide modal.
- **Blocking via disabled controls rather than an app-wide modal scrim**: a full-app scrim would be a second, competing dark layer on top of the design veil, and would cover the image the user is selecting text on. Disabling controls keeps the veil the only dark layer.
- **"Copy all" kept as a chip, not dropped**: the first draft of this design cut it as unnecessary chrome, but selecting many scattered regions by hand is tedious for the common "grab everything" case. As a frosted chip next to close, it costs one control and no layout, so the Snipping Tool feel survives.
- **Both chips anchored to `.canvas-area`, not to the image**: anchored to the image they covered the picture and scrolled out of reach once the image was larger than the viewport. On the canvas they stay fixed at any zoom.
- **Reusing the normalized box math as-is**: no coordinate rework, so no risk of regressing alignment relative to what OCR returns today.

## Risks

- **Region alignment at high zoom or after transforms**: the regions come from the *composited* canvas (`buildCanvas`), which already includes rotation/flip/crop, while the canvas `<img>` applies `editor.cssTransform` at display time. If a transform is applied the coordinates can desync; mitigation is to end the OCR session whenever an image-mutating action occurs (transform, crop, undo/redo, new image loaded) and require a fresh extraction.
- **Text selection vs. canvas drag/zoom handlers**: pointer handlers on the container can swallow selection. Mitigation is the explicit short-circuit in step 4, plus `user-select` scoped so only region spans are selectable.
- **Forgetting to unlock the UI**: an error path leaving `ocrSelectionActive` true would soft-lock the editor. Mitigation is a single `endOcrSelection()` action called from close, from a new extraction, and from image load/reset.
- **Small regions being hard to hit at low zoom**: unchanged from today's behavior, but the overlay is now at least as large as the dialog thumbnail was, so this is strictly an improvement.
- **Veil strength across images**: one fixed opacity that looks right on a bright photo can wash out a dark one, or hide the picture entirely. Mitigation is to tune a single token-based value against both a light and a dark sample image, keeping the picture recognizable in each; the veil is decoration, not a mask.
- **Region highlight legibility over a dimmed image**: if the highlight is too subtle the mode looks like a plain dark filter with no result. Mitigation is to verify against a real OCR run that the regions read as the brightest thing on the canvas in both themes.
- **`backdrop-filter` support**: not uniform across browsers/GPUs. Mitigation is the translucent-light background fallback noted in step 3, so the regions still stand out where the filter doesn't apply.
