export interface Adjustments {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  blur: number
  highlights: number
  shadows: number
  vibrance: number
  temperature: number
  tint: number
  vignette: number
}

export type AdjustmentKey = keyof Adjustments

export interface SliderConfig {
  key:   AdjustmentKey
  label: string
  min:   number
  max:   number
}

export interface SliderGroup {
  title:   string
  sliders: SliderConfig[]
}
