export interface Adjustments {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  blur: number
}

export type AdjustmentKey = keyof Adjustments
