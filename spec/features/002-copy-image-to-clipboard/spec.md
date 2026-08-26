# 002 · Copy image to clipboard

**Status:** proposed

## What it does

Adds a "Copy to clipboard" button to the navbar's primary-actions group, positioned right after **Export** and before **Image properties**. Clicking it copies the currently edited image to the system clipboard: every applied change (filters, adjustments, rotation, flip, crop) is baked in, so it can be pasted into any other app (chat, document, image editor, etc.) without saving a file first.

The button icon is `mdi-content-copy` at rest, switching to `mdi-check` briefly after a successful copy: the same icon pattern already used by the "Copy to clipboard" action in the ASCII Art dialog.

## Why

Right now the only way to get the edited image out of Repictum is Save (downloads a file) or Export (downloads a file in a chosen format). For a quick "edit this screenshot and drop it into a chat" workflow, going through the filesystem is unnecessary friction: copy-paste is the faster, more expected path, and the browser Clipboard API already supports writing an image directly.

## Acceptance criteria

- [ ] A new icon button appears in the navbar's center action group, between Export and Image properties, in both light and dark theme.
- [ ] The button is disabled when no image is loaded (same rule as Save/Export/Image properties today).
- [ ] Clicking it copies the fully composited current image (same visual result as Save/Export: filters, adjustments, rotation, flip, crop all applied) to the system clipboard as PNG.
- [ ] The clipboard content can be pasted into another application (e.g. a chat app, an image editor, a document) as an actual image, not a file path or text.
- [ ] On success, the icon swaps to `mdi-check` for ~2 seconds (matching the ASCII Art dialog's existing copy-feedback pattern), then reverts to `mdi-content-copy`.
- [ ] If the browser blocks or fails the clipboard write (permission denied, unsupported browser), the failure doesn't throw an unhandled error or crash the app: same graceful-failure standard already used for the other `navigator.clipboard` calls in this codebase.
- [ ] The button has an accessible label (`aria-label`) and a tooltip, consistent with the other navbar icon buttons.
- [ ] Undo/redo history is unaffected: copying to clipboard is a read-only action on the current image state, not an edit.

## Out of scope

- Letting the user choose the copied format (JPEG/WebP/PDF): the Clipboard API only reliably guarantees image support for PNG across browsers, so this feature always copies PNG regardless of what format was last selected in the Export dialog.
- Copying anything other than the full composited image (e.g. just the crop selection, or a specific layer).
- A dedicated "copied!" toast/snackbar: the icon swap is the only feedback, matching the existing ASCII Art pattern.
