export interface ImageDescriptor {
  src: string
  width: number
  height: number
  name: string
}

export interface ExifInfo {
  make?:         string
  model?:        string
  lens?:         string
  dateTaken?:    Date
  iso?:          number
  fNumber?:      number
  exposureTime?: number
  focalLength?:  number
  orientation?:  number
  latitude?:     number
  longitude?:    number
}

export interface ImageMetadata {
  name:         string
  size:         number  // bytes on disk
  type:         string  // MIME type, e.g. "image/png"
  lastModified: number  // epoch ms
  exifInfo: ExifInfo //
}
