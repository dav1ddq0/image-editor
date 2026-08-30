# 003 · Inline OCR text selection on canvas

**Status:** implemented ✅

## What it does

Changes where the "Extract Text" result is shown. Today, once OCR finishes, `ExtractTextDialog` renders a *second, shrunk copy* of the image inside a popup, with the selectable text regions overlaid on that thumbnail; the user has to read and select text on a small duplicate instead of the actual canvas they were already looking at.

With this feature, once text is found, the selectable text-region overlays are drawn directly on top of the real image on the main canvas (same position, same scale, no separate thumbnail). While this inline selection mode is active the editor is **locked**: the only things the user can do are

1. select (and copy) the detected text on the image,
2. press "Copy all" to put every detected line on the clipboard at once, and
3. press the close control that ends the extracted-text mode.

Everything else is blocked: tools, toolbar, right panel (adjustments, filters, transform), navbar actions, zoom/pan, keyboard shortcuts that edit, drag-and-drop of a new image. Closing returns the app to its normal, fully-interactive state.

### Visual design

The reference is the Windows Snipping Tool text-actions mode: the image stays exactly where it is, gets slightly darkened, and the detected text is what stands out against that dimmed picture. Concretely:

- A soft dark veil is laid over the image (only over the image, not the whole app).
- Each detected text region punches through the veil: it reads brighter/highlighted than its surroundings, so the extractable text is immediately obvious without reading anything else.
- No new panels, bars, cards or dialogs appear. The mode adds nothing to the layout beyond the veil, the highlighted regions, and two discreet chip controls: "Copy all" and "Close text".
- Those controls are anchored to the canvas, not to the image, so they stay in place and reachable at any zoom level.
- Leaving the mode is always available and obvious: the close control plus `Escape`.

### Transient states

The **loading model**, **extracting**, and **not-found** states keep behaving exactly as they do today: they still show in the existing popup dialog (spinner/progress bar/"no text found" message). Only the **found** state (the one that currently duplicates the image) moves out of the popup and onto the canvas itself.

## Why

Showing a shrunken second copy of the same image inside a small popup is not practical: it forces the user to read and select text at a smaller size than their actual working image, and duplicating the image on screen is confusing ("which one am I looking at?"). The canvas is already displaying the image at the size and zoom level the user chose; overlaying the detected text regions there directly is more legible and removes the redundant copy.

## Acceptance criteria

- [x] When OCR finishes and text is found, the popup dialog closes/hides and the selectable text-region overlays appear directly on top of the image in the main canvas area, aligned to the image's current position, size and zoom. (A real bug was found and fixed here during verification — see `tasks.md`'s "Bug found and fixed" note: the dialog was getting stuck open due to a Vue transition/reactive-cascade timing issue, not a logic error.)
- [x] The overlays behave the same as before: hovering a region highlights it, and clicking/dragging over a region selects its text so it can be copied with the browser's native copy (Ctrl/Cmd+C) or context menu.
- [x] While inline selection is active, **every** other editor interaction is blocked: tool switching and the toolbar, the right panel (adjustments, filters, transform), all navbar actions, canvas zoom/pan (wheel, pinch, zoom tool, zoom controls in the status bar), editing keyboard shortcuts, and drag-and-drop of a new image.
- [x] The blocked controls are visibly blocked (disabled/dimmed state), not silently inert: clicking one does nothing and reads as unavailable rather than broken.
- [x] The image is dimmed by a soft veil while the mode is active, and the detected text regions stand out against it (Snipping Tool style); the image is still clearly recognizable underneath, never blacked out.
- [x] The veil covers only the image, never the surrounding app chrome, and it never intercepts the pointer over a text region: selection keeps working through it.
- [x] The mode introduces no new panel, bar, card or dialog: the only additions on screen are the veil, the highlighted regions and the two chip controls ("Copy all", "Close text").
- [x] The chip controls are anchored to the canvas area, not to the image, so they neither cover the picture nor scroll away at high zoom.
- [x] A discreet, clearly-labelled close/cancel control is visible while the mode is active; clicking it exits, discards the overlays and restores full interactivity.
- [x] "Copy all" copies every detected line to the clipboard and confirms with a `mdi-select-all` → `mdi-check` swap for ~2s, reusing the app's icon-swap feedback pattern; a clipboard failure is logged and leaves the icon unchanged rather than crashing. The base icon is deliberately not `mdi-content-copy`: that one already means "copy the image" in the navbar, and `mdi-select-all` carries the "everything, not just a selection" nuance that separates this button from selecting regions by hand.
- [x] `Escape` also closes the mode, matching how the other canvas overlays cancel.
- [x] The **loading model**, **extracting**, and **not-found** states are unchanged and still appear in the existing `ExtractTextDialog` popup.
- [x] Partial copying is still done with the browser's own selection copy (Ctrl/Cmd+C or the context menu); "Copy all" and close are the only enabled controls in the mode.
- [x] Works correctly at any zoom level and after the canvas has been panned/scrolled: the overlays stay aligned to the image. Verified at a non-round auto-fit zoom (46%); zooming *during* the session is intentionally blocked per this same spec, so this means the zoom in effect when extraction starts.
- [x] Exiting inline selection (via close, or by starting a new OCR run) leaves the app in a clean, fully-usable state with no leftover overlays or disabled controls.
- [x] Behavior is consistent in both light and dark theme.

## Out of scope

- Any change to the OCR/text-detection logic itself (`src/utils/textExtractor.ts`), model loading, or the regions data returned.
- Editing or correcting the detected text (this stays a read-only, copy-only interaction, same as today).
- Redesigning the loading/extracting/not-found states themselves; they stay in the popup, unchanged.
- Choosing what "Copy all" copies (per-region selection, reordering, formatting): it always copies the full extracted text, in the order the OCR returned it.
