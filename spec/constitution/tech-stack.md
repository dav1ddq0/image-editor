# Tech stack and conventions

## Technologies

- **Language:** TypeScript
- **Framework / runtime:** Vue 3 (Composition API, `<script setup>`) + Vite + Pinia + Vuetify
- **Database:** not applicable (all state lives in memory/client)
- **Tests:** no test suite is configured; validated with `npm run build` (type-check `vue-tsc -b` + build) and, for UI/UX changes, agent-driven design/QA reviews before a feature is considered done
- **Deployment:** GitHub Pages, under the `/image-editor/` path (see `base` in `vite.config.ts`)

## Key files / modules

- `src/components/` : Vue components for the UI, organized by feature (canvas/, navbar/, panels/, toolbar/, qr/, barcode/, ocr/, ascii/, properties/, export/). `ImageEditor.vue` at the root assembles the layout.
- `src/stores/editorStore.ts` : the single Pinia store: loaded image, active tool, zoom, adjustments, filters, undo/redo stacks. Source of truth that almost every component reads directly.
- `src/utils/` : pure logic decoupled from Vue: the canvas rendering engine, QR/barcode scanners, the ASCII converter, etc.
- `src/composables/` : reusable stateful logic in the Vue `hooks` style (e.g. `useAppTheme`).
- `src/plugins/vuetify.ts` : Vuetify theme configuration (M3 color roles, component defaults).
- `src/assets/styles/main.css` : design tokens as custom properties (`--color-*`, `--radius-*`, etc.), consumed both by plain CSS and mirrored into Vuetify.
- `src/types/editor.ts` : shared types: tool, filter, adjustments, crop, text layers, etc.
- `public/` : static files served as-is (favicon, icon sprite).

## Commands

- `npm run dev` : starts the local dev server (Vite).
- `npm run build` : `vue-tsc -b && vite build`: type-check + production build. **This is the pre-PR check** : there's no separate test command.
- `npm run preview` : serves the production build locally.

## Conventions

- Composition API with `<script setup lang="ts">` in every `.vue` component.
- Editor state is centralized in `editorStore.ts` via Pinia : don't duplicate local state that belongs there.
- Colors **always** go through `main.css`'s custom properties (`--color-*`, etc.) or Vuetify's theme roles : never hardcode a hex value directly in a component, so both themes (light/dark) stay correct.

## Visual style

- **Material 3** color system: full tonal role set (primary/secondary/tertiary + container + on-* + surface-container tiers) for light and dark, derived from the brand hue. Defined in `vuetify.ts` (Vuetify theme) and mirrored as custom properties in `main.css` for non-Vuetify elements.
- M3 shape scale: `--radius-xs` (4px) → `--radius-full` (999px) in `main.css`.
- Typography: Roboto (body), Press Start 2P (the "REPICTUM" brand wordmark).
- "Tonal" surfaces: dialogs and nested containers use the `surface-container` / `surface-container-high` / `surface-container-highest` tiers instead of a flat background, following M3's "elevation by tone" rule (a nested container should read at or lighter than its parent's tone).
- Selected/active states: prefer a **tonal** treatment (container tint) over a solid fill, except for a bar's primary affirmative action (Apply/Confirm), which uses an M3 "filled" surface instead.
