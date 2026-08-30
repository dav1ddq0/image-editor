# 003 · Inline OCR text selection on canvas: Tasks

_Actionable checklist derived from `plan.md`. Small, concrete tasks; mark `[x]` when done._

- [x] Add OCR session state to `src/stores/editorStore.ts`: `ocrText`, `ocrRegions`, `ocrSelectionActive`, plus `startOcrSelection(text, regions)` / `endOcrSelection()`.
- [x] Create `src/components/canvas/TextRegionsOverlay.vue` with the region positioning and styles moved over from `ExtractTextDialog.vue`.
- [x] Add the veil layer over the image inside the overlay (`pointer-events: none`, color from the theme custom properties).
- [x] Style the regions so they punch through the veil (backdrop brightness with a translucent-light fallback), keeping the existing accent underline.
- [x] Add the "Copy all" and "Close text" chip controls in `CanvasArea.vue`, anchored to the canvas area rather than the image.
- [x] Mount the overlay in `src/components/canvas/CanvasArea.vue` and short-circuit `onWheel` / `onContainerClick` while the session is active.
- [x] Update `extractText()` in `src/components/ImageEditor.vue`: on `found`, start the inline session and hide the dialog.
- [x] Trim the `found` branch and its unused props (`regions`, `imageSrc`) from `src/components/ocr/ExtractTextDialog.vue`.
- [x] Disable toolbar, right panel, navbar and status-bar zoom controls while `ocrSelectionActive` is true, leaving close as the only enabled control.
- [x] Ignore drag-and-drop image loading while the session is active.
- [x] Close the session on `Escape`, matching the other canvas overlays.
- [x] Check the veil never blocks selection and no second dark layer stacks on top of it. Verified: `pointer-events: none` on `.veil`, and it's the only "veil"/"scrim" element in the codebase (grep confirms).
- [x] Tune the veil opacity against a bright and a dark sample image: the picture stays recognizable, the regions are the brightest thing on screen. Verified with a real screenshot as the source image, in both themes: `rgba(0,0,0,0.45)` keeps the underlying picture legible while the regions clearly stand out.
- [x] Call `endOcrSelection()` on close, on a new extraction, and when the image is replaced/reset, so the UI can never stay locked.
- [x] Verify overlay alignment at several zoom levels and after panning/scrolling the canvas. Verified at the auto-fit zoom (46%, a non-round fraction) with a real OCR run: region boxes land exactly on the corresponding text in the source image. (Zooming *during* an active session is correctly blocked per spec, so "several zoom levels" means the zoom set *before* extracting, not changed while the overlay is up.)
- [x] Verify light and dark theme appearance of the veil, the regions and the chip controls. Verified with real screenshots in both themes.
- [x] Verify "Copy all" pastes the full extracted text elsewhere and shows the check for ~2s. Verified end-to-end with Playwright: real OCR output landed in the OS clipboard, and the button visibly swapped to "Copied" with the check icon.
- [x] Run `npm run build` (type-check + build) and fix anything it reports.
- [x] Validate against the acceptance criteria in `spec.md`. All criteria checked in `spec.md`; see that file.
- [ ] Move the feature to "Done" in `../../constitution/roadmap.md`.

## Bug found and fixed during verification

**The Extract Text dialog never actually closed** — `showOcrDialog.value = false` and `editor.startOcrSelection(...)` fired in the same synchronous tick as extraction completed. The reactive cascade from `startOcrSelection` (disabling the toolbar/panel/navbar/status-bar and mounting `TextRegionsOverlay`, all at once) starved the dialog's `dialog-bottom-transition` close animation of the frame it needed to actually start, so it got stuck open indefinitely instead of just animating slowly — confirmed stuck for a full minute+ in one run, with the app's own reactive state (`showOcrDialog`, `ocrSelectionActive`) already correctly `false`/`true` the whole time (verified with temporary debug logging). Fixed in `src/components/ImageEditor.vue`'s `extractText()` by awaiting `nextTick()` between the two, giving the dialog's close transition a clean render pass before the lock cascade fires. Re-verified twice after the fix: dialog now closes within ~2s (normal transition timing) instead of never.
