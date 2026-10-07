export type PanelId = 'adjust' | 'transform'

export type PanelTabId = 'adjust' | 'filters'

export interface PanelTabDefinition {
  id: PanelTabId
  label: string
}
