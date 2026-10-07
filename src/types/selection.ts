export type SelectionPhase = 'idle' | 'drawing' | 'ready'

export interface SelectionBox {
  left:   number
  top:    number
  right:  number
  bottom: number
}

export type SelectionDragMode = 'none' | 'drawing' | 'moving' | 'nw' | 'ne' | 'se' | 'sw'
