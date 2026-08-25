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

export interface ToolDefinition {
  id: ToolId
  icon: string
  label: string
}
