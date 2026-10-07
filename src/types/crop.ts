export type AspectPreset = 'free' | '1:1' | '4:5' | '16:9' | '4:3' | '3:2'

export interface CropBox {
  left:   number
  top:    number
  right:  number
  bottom: number
}

export interface CropPresetOption {
  id:    AspectPreset
  label: string
  ratio: number | null
}

export type CropHandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move'

export interface CropRect {
  x: number  // normalized 0-1 left edge
  y: number  // normalized 0-1 top edge
  w: number  // normalized 0-1 width
  h: number  // normalized 0-1 height
}
