# 001 · Split shared types by domain : Plan

_How what's described in `spec.md` gets implemented. Must respect `constitution/`._

## Approach

Turn `src/types/editor.ts` into a `src/types/` folder with one file per domain, matching how `constitution/tech-stack.md` already groups the codebase (canvas, panels, toolbar, export, store). No barrel/`index.ts` re-export : every consumer imports directly from the domain file(s) it actually uses. This is deliberate: with `verbatimModuleSyntax`-style `import type` already used everywhere in this codebase, a direct import makes each file's real type dependencies visible at a glance (which is the whole point of this feature), whereas a barrel re-export would just recreate the current "import everything from one place" problem one level up.

## Implementation

1. Create `src/types/tool.ts` : move `ToolId`, `ToolDefinition`.
2. Create `src/types/filter.ts` : move `FilterId`, `FilterDefinition`.
3. Create `src/types/image.ts` : move `ImageDescriptor`, `ExifInfo`, `ImageMetadata`.
4. Create `src/types/adjustments.ts` : move `Adjustments`, `AdjustmentKey`.
5. Create `src/types/export.ts` : move `ExportFormat`, `ExportOptions`.
6. Create `src/types/crop.ts` : move `AspectPreset`, `CropRect`.
7. Create `src/types/text.ts` : move `TextLayer`.
8. Delete `src/types/editor.ts`.
9. Update each of the 12 consumer files' import statements to point at the specific new file(s), per the exact usage already audited:
   - `src/components/canvas/TextOverlay.vue` → `@/types/text`
   - `src/components/ImageEditor.vue` → `@/types/export`
   - `src/components/panels/FilterThumb.vue` → `@/types/filter`
   - `src/components/panels/FiltersPanel.vue` → `@/types/filter`
   - `src/components/export/ExportDialog.vue` → `@/types/export`
   - `src/components/panels/AdjustmentsPanel.vue` → `@/types/adjustments`
   - `src/components/canvas/SelectionOverlay.vue` → `@/types/crop`
   - `src/components/canvas/CropOverlay.vue` → `@/types/crop`
   - `src/components/canvas/CanvasArea.vue` → `@/types/crop` + `@/types/text` (two domains, two import statements)
   - `src/components/toolbar/AppToolbar.vue` → `@/types/tool`
   - `src/utils/imageExifMetadata.ts` → `../types/image` (relative : this file doesn't use the `@/` alias today; keep that convention, don't switch it as a drive-by change)
   - `src/stores/editorStore.ts` → `@/types/tool` + `@/types/filter` + `@/types/image` + `@/types/adjustments` + `@/types/crop` + `@/types/text` (six domains : the store is the one file expected to touch nearly everything, which is fine and exactly what this split is meant to make visible)
10. Run `npm run build` to confirm the type-check and production build are both clean.

## Decisions

- **No barrel `index.ts`** : considered re-exporting everything from `src/types/index.ts` so consumers could keep a single import path. Discarded: it would silently recreate the "one file, all domains" problem this feature exists to fix, and would hide over-broad imports (a file importing 5 domains through a barrel looks identical to one importing 1).
- **File names match domain, not original type names** : e.g. `crop.ts` (not `crop-rect.ts`) holds both `CropRect` and `AspectPreset` since they're both crop-tool concepts a consumer needs together (confirmed: every current consumer of one already imports the other, except `SelectionOverlay.vue` which only needs `CropRect`). Keeping them in one file avoids a 1:1 type-to-file split that would be excessive for types this small.
- **`ExifInfo` stays with `image.ts`, not its own file** : it's a nested field type used only inside `ImageMetadata` and by `imageExifMetadata.ts` (which constructs it); it has no independent consumers, so a separate file would be one more file to navigate for no isolation benefit.

## Risks

- **Missed import site** : mitigated by re-running the same `grep -rn "types/editor'" src` sweep after the edit; it must return zero matches, and `npm run build` will fail loudly on any remaining reference to the deleted file anyway.
- **Circular imports between new domain files** : none of the 7 domains reference each other's types (verified: no type in `editor.ts` is used inside another type's own definition across domains), so this isn't expected, but worth a quick visual check while splitting.
