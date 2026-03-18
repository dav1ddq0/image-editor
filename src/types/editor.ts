export type ToolId =
  | 'select'
  | 'crop'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'shapes'
  | 'fill'
  | 'zoom'
  | 'undo'
  | 'redo'

export type FilterId = 'none' | 'sepia' | 'grayscale' | 'vivid' | 'cool' | 'warm'

export interface ImageDescriptor {
  src: string
  width: number
  height: number
  name: string
}

export interface Adjustments {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  blur: number
}

export type AdjustmentKey = keyof Adjustments

export interface ToolDefinition {
  id: ToolId
  icon: string
  label: string
}

export interface FilterDefinition {
  id: FilterId
  label: string
}

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'pdf'

export interface ExportOptions {
  format:   ExportFormat
  quality:  number   // 0–100 (ignored for PNG and PDF)
  fileName: string
}
