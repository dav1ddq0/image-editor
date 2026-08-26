# 002 · Copy image to clipboard: Plan

_How what's described in `spec.md` gets implemented. Must respect `constitution/`._

## Approach

Reuse the exact same image-compositing path Save/Export already use (`buildCanvas()` in `ImageEditor.vue`, which wraps `buildRenderedCanvas` from `@/utils/canvasRenderer`), so "copy" is guaranteed to produce the same pixels as Save/Export: no separate rendering logic to maintain or drift out of sync. Reuse the same `navigator.clipboard.write([new ClipboardItem(...)])` pattern already proven in `AsciiArtDialog.vue`, just with an `image/png` blob instead of `text/html`+`text/plain`.

The button lives in `AppNavbar.vue` (new icon button + emit) and the click handler lives in `ImageEditor.vue` (where `saveImage`/`exportImage` already live), following the existing Open/Save/Export/Properties wiring pattern exactly.

## Implementation

1. `src/components/navbar/AppNavbar.vue`:
   - Add `copyImage: () => Promise<boolean>` to `defineProps` (a function prop, not an emit; see Decisions below).
   - Add a new `<v-btn>` between the Export and Image properties buttons: icon toggles between `mdi-content-copy` (rest) and `mdi-check` (just copied); `:disabled="!hasImage"`; `aria-label="Copy image to clipboard"`; tooltip text `"Copy to clipboard"` (rest) / `"Copied!"` (after copy); same label-swap convention as the ASCII Art dialog's button.
   - The "just copied" boolean lives as local state in `AppNavbar.vue` itself (a `copied` ref + `setTimeout` reset, mirroring `AsciiArtDialog.vue`'s pattern): an `async onCopyImage()` handler calls `await props.copyImage()` and sets `copied` from the result, exactly like `AsciiArtDialog.vue`'s `copyToClipboard` owns its own `copied` state.
2. `src/components/ImageEditor.vue`:
   - Add `:copy-image="copyImageToClipboard"` to the `<AppNavbar>` usage, alongside the existing `@open`/`@save`/`@export`/`@image-properties` emits (this one line is a prop binding, not an emit; see Decisions).
   - Add `copyImageToClipboard(): Promise<boolean>`: mirrors `saveImage()`'s shape (build an `Image`, `.onload` → `buildCanvas(img)`) but instead of `canvas.toBlob(...)` → download link, it does `canvas.toBlob(...)` → wrap the PNG blob in `new ClipboardItem({ 'image/png': blob })` → `await navigator.clipboard.write([...])`, wrapped in try/catch (mirrors `AsciiArtDialog.vue`'s `copyToClipboard`), resolving `true`/`false`.
3. No changes to `editorStore.ts`, `canvasRenderer.ts`, or any type file: this feature only composes existing building blocks.

## Decisions

- **Always PNG, never the last-selected export format**: per `spec.md`'s scope cut. `ClipboardItem` support for `image/jpeg` or `image/webp` is inconsistent across browsers (Safari in particular); PNG is the one format guaranteed to work everywhere the Clipboard API itself is supported, so hardcoding it avoids a class of "copy silently failed in browser X" bugs the user would have no way to diagnose.
- **Reuse `buildCanvas()` instead of a new render path**: considered building a lighter-weight "just for clipboard" render, discarded because Save/Export/Copy must visually agree (same filters/adjustments/transform baked in), and the existing function already is that single source of truth.
- **Copy-feedback state lives in `AppNavbar.vue`, not the store**: this is transient, purely-visual, single-component UI state (a 2-second icon swap), not editor state; putting it in `editorStore.ts` would pollute the store with something no other component needs to read.
- **`copy-image` is a function prop (`:copy-image`), not an emit like the rest of `AppNavbar`'s actions**: every other action (`open`, `save`, `export`, …) is a pure notification; the parent doesn't need to report anything back, so a void `emit` fits. Copy is a request/response: the button's own icon depends on whether the write actually succeeded, and a Vue `emit` has no return channel for that. The alternatives considered were (a) passing a `done(success)` callback inside the emit payload, which works but is an unusual shape for an event and was the first draft of this feature, and (b) keeping a void emit plus a second reactive prop the child watches, which keeps the `@` visual pattern but adds a second channel and makes the parent responsible for resetting state it doesn't render. A function prop returning `Promise<boolean>` is the standard Vue shape for "ask the parent to do something and await the result," and lets `AppNavbar.vue` own its `copied` state exactly like `AsciiArtDialog.vue` does. This is a deliberate, single-line exception to the `@event` convention used elsewhere in this file, not an inconsistency to "fix" later.

## Risks

- **`navigator.clipboard.write` requires a secure context (HTTPS) and, in some browsers, a user-activation gesture.** Since the call happens synchronously inside the button's `@click` handler (same as the ASCII Art dialog's working copy button), the user-activation requirement is already satisfied. GitHub Pages (this project's deploy target) serves over HTTPS, so the secure-context requirement is met in production; local dev over `http://localhost` also counts as a secure context per spec.
- **`ClipboardItem` / `navigator.clipboard.write` isn't available in every browser** (older Safari/Firefox versions gate it further). Mitigated per the acceptance criteria: wrap in try/catch, fail silently without crashing; same standard already accepted for the existing clipboard calls in this codebase, so no new risk class is introduced.
