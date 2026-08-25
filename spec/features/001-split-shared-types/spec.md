# 001 · Split shared types by domain

**Status:** implemented ✅

## What it does

Replaces the single flat `src/types/editor.ts` (96 lines, 7 unrelated domains in one file: tool, filter, image/EXIF metadata, adjustments, export, crop, text layer) with several domain-scoped files under `src/types/`, one per concern. Every import site updates to pull from the specific domain file instead of one catch-all module.

## Why

`src/types/editor.ts` currently mixes types for completely unrelated features (the toolbar's tool list, the filters panel, EXIF metadata, the export dialog, the crop overlay, the text tool) in one file. 12 files across `canvas/`, `export/`, `panels/`, `toolbar/`, `utils/`, and the store already import from it — as the app grows, this file becomes a dumping ground where an unrelated change (e.g. adding a text-layer field) shows up in the diff of a component that only cares about tool IDs, and it's hard to tell at a glance which types a given file actually depends on.

This matches `constitution/tech-stack.md`'s own guidance in spirit (shared types belong in a global location when several modules need them) but the current single-file shape doesn't get the benefit: it should be a folder split by domain, not one file.

## Acceptance criteria

- [x] `src/types/editor.ts` no longer exists as a single flat file; its contents are split into domain files under `src/types/` (grouping: tool, filter, image/EXIF, adjustments, export, crop, text — exact file boundaries decided in `plan.md`).
- [x] Every one of the 12 current import sites (`grep -rl "types/editor'" src`, including the one relative-path import in `src/utils/`) is updated to import from the correct new domain file(s); no file imports more domains than it actually uses.
- [x] No type, interface, or field is renamed, removed, or changed in shape — this is a pure reorganization, not a refactor of the types themselves.
- [x] `npm run build` (`vue-tsc -b && vite build`) passes clean, same as before the change.
- [x] No runtime behavior changes — this is a types-only, compile-time reorganization.

## Out of scope

- Changing the shape, naming, or semantics of any existing type.
- Introducing new types or removing unused ones (even if some are found to be dead code — that's a separate concern).
- Touching non-type code in the 12 consumer files beyond updating their import statements.
