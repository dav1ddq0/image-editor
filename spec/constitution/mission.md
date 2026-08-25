# Mission

## What we're building

Repictum is a fully browser-based image editor built for privacy and speed: nothing gets uploaded to a server.

1. **Canvas editing** : crop, drawing (brush/eraser), text, shapes, fill, color adjustments (brightness/contrast/saturation/sharpness/blur), and preset filters, all with undo/redo history.
2. **Scanning** : reads QR codes and barcodes directly from the loaded image.
3. **Text extraction (OCR)** : detects and lets you copy text present in the image.
4. **ASCII art** : converts the image into configurable ASCII art (columns, levels, color, block characters).
5. **Export** : to any image format or PDF, instantly.

## Who it's for

- People who need to edit or convert an image quickly, without installing software or creating an account.
- Privacy-conscious users who don't want their photo passing through a third-party server.
- Casual/one-off use (crop, filter, export) rather than advanced professional editing.

## Principles

- **Privacy by design** : all processing happens client-side; no image is ever uploaded to a server.
- **No friction** : no sign-up, no install; open the page and start editing.
- **Fast and light** : the app should feel instant; avoid dependencies/operations that block the main thread.
- **Material 3 visual consistency** : the whole UI follows the established M3 tonal color/shape system (see `tech-stack.md`).
- **Undo always available** : any destructive operation on the image must be undoable.

## What it is NOT

- Not a professional editor like Photoshop/GIMP (no layers, no advanced non-destructive editing).
- Not a collaborative platform, and has no backend/user accounts.
- Not a file/asset manager : it doesn't persist images across sessions beyond what the browser itself allows.
