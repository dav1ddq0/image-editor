# Roadmap

_Order and status of features. Each entry points to its folder under `features/`._

## Done ✅

_Completed before this SDD process was adopted — listed here for context, not tracked as `features/XXX-...` folders._

1. **Rebrand to Repictum** — new brand palette, logo, and pixel-style wordmark.
2. **Navbar icon refactor** — navbar icons extracted into standalone components.
3. **Material 3 restyle** — full M3 tonal color system (light/dark), shape scale, and tonal component styling (buttons, sliders, filter presets, dialogs) across the app.
4. **[001 · Split shared types by domain](../features/001-split-shared-types/spec.md)** — replaced the single flat `src/types/editor.ts` with domain-scoped files (`tool.ts`, `filter.ts`, `image.ts`, `adjustments.ts`, `export.ts`, `crop.ts`, `text.ts`) under `src/types/`, updating all 12 consumers.

## Next 🔜

<!-- Add the next feature as `XXX · <Name>` once its features/XXX-.../spec.md exists. -->

## Backlog / ideas 💡

<!-- Not committed or ordered. Add ideas here as they come up. -->

> Every new feature is created as `features/XXX-feature-name/` with `spec.md`, `plan.md`, and `tasks.md` before any code is touched.
