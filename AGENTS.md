# Repictum

A fully browser-based image editor built for privacy and speed. Crop, draw, adjust colors, apply filters, scan QR/barcodes, etc. All with undo/redo history. Your photos stay local; nothing is uploaded to a server. Export to any image format or PDF instantly.

## Stack
- Language: TypeScript
- Framework / runtime: Vue 3 (Composition API, `<script setup>`) + Vite + Pinia + Vuetify
- Database: not applicable 
- Tests: no test suite is configured in this project right now

## Commands
- `npm run dev` — starts the local dev server
- `npm run build` — type-checks (`vue-tsc -b`) then production build; there's no separate test command, so this is the pre-PR check
- `npm run preview` — serves the production build locally

## Project structure

- `src/components/` — All Vue components for the UI, organized into subfolders by feature (canvas/, navbar/, panels/, toolbar/, qr/, barcode/, ocr/, ascii/, properties/, export/). Each subfolder groups that feature's main component together with its related overlays or dialogs; ImageEditor.vue, at the root of components/, is the layout that assembles them all.
- `src/stores/` — The app's global state, managed with Pinia. It contains a single file, editorStore.ts, which centralizes the loaded image, the active tool, zoom, adjustments, filters, and the undo/redo stacks — it's the source of truth that almost every component reads directly.
- `src/utils/` — Pure logic, decoupled from Vue: the canvas rendering engine, the QR and barcode scanners, the ASCII-art converter, etc. These are functions that take data in and return results, with no dependency on a component's lifecycle.
- `src/composables/` — Reusable, stateful logic in the Vue `hooks` style.
- `src/plugins/` — Third-party library setup that gets registered globally in the app.
- `src/assets` — bundled & processed (styles, imported images, fonts).
- `src/public/` = static files served as-is (accessed by direct URL).
- `src/types/` — TypeScript type definitions shared across the whole project (editor.ts): tool, filter, adjustments, crop, text-layer types, and so on.
- public/ — Static files served as-is, bypassing Vite: the favicon, the icon sprite, and the fish ASCII art used by the ASCII Art feature.
- `index.html` — The HTML entry point; mounts the app and loads the Google Fonts.
- `vite.config.ts` — Vite configuration: the `@` alias pointing to src/, and the /image-editor/ base path for the GitHub Pages deployment.

## Conventions
- Composition API with `<script setup lang="ts">` in every `.vue` component.
- Editor state is centralized in `editorStore.ts` via Pinia.
- Colors always go through the custom properties in `main.css` (`--color-*`, etc.), never hardcoded, so both light and dark theme stay correct.

## Don'ts
- Do not commit without the user's explicit approval.
- Do not create `Pull Requests` without the user's explicit approval.
- Do not delete any files, code, or configuration. First propose deletions and explain the rationale and expected impact.
- Do not make unsolicited changes, even improvements or refinements.
- Do not install dependencies or modify `package.json`, `lockfiles`, or dependency manifests without confirmation.

## Workflow
- Before a non-trivial task (multiple files, an architecture or design decision), propose a plan and wait for the OK before touching code.
- One task at a time; when done, summarize what changed so it can be reviewed.
- If you're not at least 80% sure, ask. Never invent.
