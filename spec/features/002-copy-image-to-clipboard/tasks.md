# 002 · Copy image to clipboard: Tasks

_Actionable checklist derived from `plan.md`. Small, concrete tasks; mark `[x]` when done._

- [ ] `AppNavbar.vue`: add `'copy-image'` to `defineEmits`.
- [ ] `AppNavbar.vue`: add local `copied` ref + reset timeout (mirrors `AsciiArtDialog.vue`).
- [ ] `AppNavbar.vue`: add the new icon button between Export and Image properties (icon swap, disabled state, aria-label, tooltip).
- [ ] `ImageEditor.vue`: wire `@copy-image="copyImageToClipboard"` on `<AppNavbar>`.
- [ ] `ImageEditor.vue`: implement `copyImageToClipboard()` using `buildCanvas()` + `ClipboardItem({ 'image/png': blob })`, wrapped in try/catch.
- [ ] Wire the success/failure result back to `AppNavbar.vue`'s `copied` state.
- [ ] Manually verify: copy, then paste into another app (e.g. a chat window or image editor); confirm it pastes as an actual image.
- [ ] Manually verify: button is disabled with no image loaded.
- [ ] Manually verify: icon shows `mdi-check` for ~2s after a successful copy, then reverts.
- [ ] Manually verify: light and dark theme both render the button correctly.
- [ ] Run `npm run build`: type-check + build both pass clean.
- [ ] Validate against the acceptance criteria in `spec.md`.
- [ ] Move the feature to "Done" in `../../constitution/roadmap.md`.
