export type AspectPreset = 'free' | '1:1' | '4:5' | '16:9' | '4:3' | '3:2'

export interface CropRect {
  x: number  // normalized 0-1 left edge
  y: number  // normalized 0-1 top edge
  w: number  // normalized 0-1 width
  h: number  // normalized 0-1 height
}
