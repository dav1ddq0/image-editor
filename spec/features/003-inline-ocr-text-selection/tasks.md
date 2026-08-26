# 003 · Inline OCR text selection on canvas: Tasks

_Actionable checklist derived from `plan.md`. Small, concrete tasks; mark `[x]` when done._

- [ ] Add OCR session state to `src/stores/editorStore.ts`: `ocrText`, `ocrRegions`, `ocrSelectionActive`, plus `startOcrSelection()` / `endOcrSelection()`.
- [ ] Create `src/components/canvas/TextRegionsOverlay.vue` with the region positioning and styles moved over from `ExtractTextDialog.vue`.
- [ ] Add the veil layer over the image inside the overlay (`pointer-events: none`, color from the theme custom properties).
- [ ] Style the regions so they punch through the veil (backdrop brightness with a translucent-light fallback), keeping the existing accent underline.
- [ ] Add the single discreet close control to the overlay, `aria-label`ed, emitting `close`.
- [ ] Mount the overlay in `src/components/canvas/CanvasArea.vue` and short-circuit `onWheel` / `onContainerClick` while the session is active.
- [ ] Update `extractText()` in `src/components/ImageEditor.vue`: on `found`, start the inline session and hide the dialog.
- [ ] Trim the `found` branch and its unused props (`regions`, `imageSrc`) from `src/components/ocr/ExtractTextDialog.vue`.
- [ ] Disable toolbar, right panel, navbar and status-bar zoom controls while `ocrSelectionActive` is true, leaving close as the only enabled control.
- [ ] Ignore drag-and-drop image loading while the session is active.
- [ ] Close the session on `Escape`, matching the other canvas overlays.
- [ ] Check the veil never blocks selection and no second dark layer stacks on top of it.
- [ ] Tune the veil opacity against a bright and a dark sample image: the picture stays recognizable, the regions are the brightest thing on screen.
- [ ] Call `endOcrSelection()` on close, on a new extraction, and when the image is replaced/reset, so the UI can never stay locked.
- [ ] Verify overlay alignment at several zoom levels and after panning/scrolling the canvas.
- [ ] Verify light and dark theme appearance of the veil, the regions and the close control.
- [ ] Run `npm run build` (type-check + build) and fix anything it reports.
- [ ] Validate against the acceptance criteria in `spec.md`.
- [ ] Move the feature to "Done" in `../../constitution/roadmap.md`.
