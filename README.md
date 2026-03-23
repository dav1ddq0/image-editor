# Image Editor

A fully-featured, browser-based image editor built with Vue 3, TypeScript, and the Canvas 2D API. All effects are non-destructive until committed, with full undo/redo support.

![App preview](https://github.com/user-attachments/assets/1095c313-dc60-49d2-94f1-66100fc4fbe9)

---

## Features

### Tools
| Tool | Description |
|------|-------------|
| **Select** | Default tool — drag to select areas for crop or clear |
| **Crop** | Crop with aspect ratio presets (Free, 1:1, 4:5, 16:9, 4:3, 3:2) and lock toggle |
| **Brush** | Freehand drawing with color, size, and opacity controls |
| **Eraser** | Freehand eraser that cuts to transparency |
| **Text** | Add styled text — font family, size, bold/italic, color, draggable position |
| **Shapes** | Draw rectangles, ellipses, lines, and arrows with stroke/fill control |
| **Fill** | Paint-bucket flood fill with color and tolerance slider |
| **Zoom** | Click to zoom in · Shift+click to zoom out · scroll wheel supported |

### Adjustments
- **Brightness** · **Contrast** · **Saturation** — classic image corrections
- **Sharpness** — unsharp-mask via SVG `feConvolveMatrix` kernel (real-time preview)
- **Blur** — CSS filter blur

### Filters
`None` · `Sepia` · `Grayscale` · `Vivid` · `Cool` · `Warm`

### Transform
Rotate Left / Right · Flip Horizontal / Vertical

### Scanning
- **Scan QR** — detects and decodes QR codes embedded in the current image
- **Scan Barcode** — detects 1D barcodes (Code128, EAN, UPC, Code39, ITF)

### Export
Export as **PNG**, **JPEG**, **WebP**, or **PDF** with adjustable quality and filename.

### History
- Up to **50 undo steps** (Ctrl+Z / Ctrl+Y)
- Redo stack clears automatically on any new edit

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Language | TypeScript |
| Build tool | Vite |
| State | Pinia |
| QR scanning | jsqr |
| Barcode scanning | @zxing/library |
| PDF export | jsPDF |

---

## Project Structure

```
image-editor/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css          # Design tokens, reset, shared styles
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasArea.vue    # Central workspace, compositing logic
│   │   │   ├── CanvasDropZone.vue
│   │   │   ├── CanvasStatusBar.vue
│   │   │   ├── BrushOverlay.vue
│   │   │   ├── CropOverlay.vue
│   │   │   ├── EraserOverlay.vue
│   │   │   ├── FillOverlay.vue
│   │   │   ├── SelectionOverlay.vue
│   │   │   ├── ShapesOverlay.vue
│   │   │   └── TextOverlay.vue
│   │   ├── navbar/
│   │   │   └── AppNavbar.vue
│   │   ├── panels/               # Right-side adjustments, filters, transform
│   │   ├── toolbar/              # Left-side tool selector
│   │   ├── export/               # Export dialog
│   │   ├── qr/                   # QR scanner dialog
│   │   ├── barcode/              # Barcode scanner dialog
│   │   └── ImageEditor.vue       # Root layout
│   ├── stores/
│   │   └── editorStore.ts        # Pinia store — all editor state & actions
│   ├── types/
│   │   └── editor.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── canvasRenderer.ts     # Renders image + effects to an offscreen canvas
│   │   ├── colorAnalysis.ts      # WCAG contrast analysis for auto text color
│   │   ├── floodFill.ts          # BFS flood-fill on ImageData
│   │   ├── qrScanner.ts          # QR decode via jsqr
│   │   └── barcodeScanner.ts     # Barcode decode via @zxing
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## How It Works

### Non-destructive editing
Adjustments (brightness, contrast, saturation, sharpness, blur, filters, rotation, flip) are stored as state values and applied as **CSS filters + SVG kernel** in real time. They are only baked into the pixel data when a destructive operation runs (crop, brush, eraser, fill, shapes, text, save, export).

### Compositing pipeline
When a drawing tool is applied, `CanvasArea` calls `buildRenderedCanvas()` which:
1. Draws the current `<img>` onto an offscreen canvas at its natural resolution
2. Applies the sharpness convolution kernel to the pixel data
3. Composites the overlay (brush strokes, shapes, fill) using `globalCompositeOperation`
4. Converts the result to a data URL and saves it as the new image state

### Flood fill
The fill tool uses a **breadth-first search** directly on `ImageData` pixel bytes. A tolerance parameter (0–100) controls how similar a pixel's color must be to the seed color to be replaced.

### Undo / redo
Every destructive action calls `pushHistory()` before mutating state. History stores full image snapshots (data URL + dimensions) up to a cap of 50 entries. Continuous slider adjustments are batched — only the state at `pointerdown` is pushed, not every intermediate value.

### Zoom & scroll
The image is displayed at `naturalWidth × (zoom / 100)` px with height following the aspect ratio. The canvas container scrolls when the image is larger than the viewport. Tool toolbars are rendered outside the scroll container via Vue `<Teleport>` so they stay visible regardless of scroll position or zoom level.

### Auto text color
When the text tool activates, the image is downscaled to 64×64 and the average WCAG relative luminance is computed. The initial text color is automatically set to `#ffffff` or `#000000` depending on which achieves the higher contrast ratio (target ≥ 4.5:1 AA).

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & run

```bash
# Clone the repository
git clone <repo-url>
cd image-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Scroll wheel` | Zoom in / out |
| `Shift + click` | Zoom out (zoom tool) |
| `Ctrl + Enter` | Confirm text (text tool) |
| `Escape` | Cancel current tool / clear selection |
