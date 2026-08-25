export type FilterId = 'none' | 'sepia' | 'grayscale' | 'vivid' | 'cool' | 'warm'

export interface FilterDefinition {
  id: FilterId
  label: string
}
