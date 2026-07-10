/*
 * Helpers for the Image Properties dialog: human-friendly formatting of the
 * file-level metadata the browser exposes (size, type, modified date), plus
 * EXIF extraction (camera, capture date, exposure and GPS location) via exifr.
 */
import exifr from 'exifr'
import type { ExifInfo } from '../types/editor'

// Reads EXIF/GPS from the original file.
export async function readImageExif(file: File): Promise<ExifInfo> {
  try {
    const tags = await exifr.parse(file, { tiff: true, exif: true, gps: true })
    if (!tags) return {}

    return {
      make:         tags.Make?.trim(),
      model:        tags.Model?.trim(),
      lens:         tags.LensModel?.trim() || tags.LensInfo,
      dateTaken:    tags.DateTimeOriginal ?? tags.CreateDate,
      iso:          tags.ISO,
      fNumber:      tags.FNumber,
      exposureTime: tags.ExposureTime,
      focalLength:  tags.FocalLength,
      orientation:  tags.Orientation,
      latitude:     tags.latitude,
      longitude:    tags.longitude,
    }
  } catch {
    return {}
  }
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} kB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function formatDateTime(input: number | Date | undefined | null): string {
  if (input == null) return '—'
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export function formatFormat(mime: string | undefined, name: string): string {
  const fromMime = mime?.split('/')[1]
  const raw = fromMime || name.split('.').pop() || ''
  const map: Record<string, string> = { jpeg: 'JPEG', jpg: 'JPEG', png: 'PNG', webp: 'WebP', gif: 'GIF', svg: 'SVG', 'svg+xml': 'SVG', avif: 'AVIF', bmp: 'BMP' }
  return map[raw.toLowerCase()] ?? raw.toUpperCase()
}

export function formatExposure(seconds: number | undefined): string | undefined {
  if (seconds == null) return undefined
  if (seconds >= 1) return `${seconds} s`
  return `1/${Math.round(1 / seconds)} s`
}

export function formatAperture(fNumber: number | undefined): string | undefined {
  return fNumber == null ? undefined : `f/${fNumber}`
}

export function formatFocalLength(mm: number | undefined): string | undefined {
  return mm == null ? undefined : `${Math.round(mm)} mm`
}

export function formatCamera(make?: string, model?: string): string | undefined {
  if (!make)  return model || undefined
  if (!model) return make
  return model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`
}

export function formatCoords(lat: number, lng: number): string {
  const fmt = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(5)}° ${v >= 0 ? pos : neg}`
  return `${fmt(lat, 'N', 'S')}, ${fmt(lng, 'E', 'W')}`
}

export function mapLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`
}
