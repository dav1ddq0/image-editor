# 001 · Split shared types by domain — Tasks

_Actionable checklist derived from `plan.md`. Small, concrete tasks; mark `[x]` when done._

- [x] Create `src/types/tool.ts` (`ToolId`, `ToolDefinition`).
- [x] Create `src/types/filter.ts` (`FilterId`, `FilterDefinition`).
- [x] Create `src/types/image.ts` (`ImageDescriptor`, `ExifInfo`, `ImageMetadata`).
- [x] Create `src/types/adjustments.ts` (`Adjustments`, `AdjustmentKey`).
- [x] Create `src/types/export.ts` (`ExportFormat`, `ExportOptions`).
- [x] Create `src/types/crop.ts` (`AspectPreset`, `CropRect`).
- [x] Create `src/types/text.ts` (`TextLayer`).
- [x] Delete `src/types/editor.ts`.
- [x] Update imports in `src/components/canvas/TextOverlay.vue`.
- [x] Update imports in `src/components/ImageEditor.vue`.
- [x] Update imports in `src/components/panels/FilterThumb.vue`.
- [x] Update imports in `src/components/panels/FiltersPanel.vue`.
- [x] Update imports in `src/components/export/ExportDialog.vue`.
- [x] Update imports in `src/components/panels/AdjustmentsPanel.vue`.
- [x] Update imports in `src/components/canvas/SelectionOverlay.vue`.
- [x] Update imports in `src/components/canvas/CropOverlay.vue`.
- [x] Update imports in `src/components/canvas/CanvasArea.vue` (two domains: crop + text).
- [x] Update imports in `src/components/toolbar/AppToolbar.vue`.
- [x] Update imports in `src/utils/imageExifMetadata.ts` (keep its relative-path convention).
- [x] Update imports in `src/stores/editorStore.ts` (six domains).
- [x] Sweep: `grep -rn "types/editor'" src` returns zero matches.
- [x] Run `npm run build` — type-check + build both pass clean.
- [x] Validate against the acceptance criteria in `spec.md`.
- [x] Move the feature to "Done" in `../../constitution/roadmap.md`.
