export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'pdf'

export interface ExportFormatOption {
  id:    ExportFormat
  label: string
  ext:   string
  lossy: boolean
}

export interface ExportOptions {
  format:   ExportFormat
  quality:  number   // 0–100 (ignored for PNG and PDF)
  fileName: string
}
