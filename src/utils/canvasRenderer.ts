/**
 * Applies a 3×3 unsharp-mask convolution to the canvas pixels in-place.
 * Mirrors the SVG feConvolveMatrix kernel used for the live preview.
 */
export function applySharpen(ctx: CanvasRenderingContext2D, amount: number): void {
  if (amount <= 0) return
  const s      = amount / 50
  const kernel = [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0]
  const { width, height } = ctx.canvas
  const src = ctx.getImageData(0, 0, width, height)
  const dst = ctx.createImageData(width, height)
  const s0  = src.data
  const d0  = dst.data
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4
      for (let c = 0; c < 3; c++) {
        let v = 0
        for (let ky = -1; ky <= 1; ky++)
          for (let kx = -1; kx <= 1; kx++)
            v += s0[((y + ky) * width + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)]
        d0[i + c] = Math.min(255, Math.max(0, v))
      }
      d0[i + 3] = s0[i + 3]
    }
  }
  ctx.putImageData(dst, 0, 0)
}
/*
  Applies a per-channel tone curve that brightens/darkens shadows and
  highlights independently.
*/
export function applyToneCurve(ctx: CanvasRenderingContext2D, highlights: number, shadows: number): void {
  if (highlights === 0 && shadows === 0) return
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const d = imageData.data
  const h = highlights / 100
  const s = shadows / 100
  const lut = new Uint8ClampedArray(256)
  for (let i = 0; i < 256; i++) {
    const v              = i / 255
    const shadowWeight   = 1 - v
    const highlightWeight = v
    const delta = (s * shadowWeight + h * highlightWeight) * 80
    lut[i] = v * 255 + delta
  }
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = lut[d[i]]
    d[i + 1] = lut[d[i + 1]]
    d[i + 2] = lut[d[i + 2]]
  }
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Applies linear per-channel offsets for warm/cool (temperature) and
 * green/magenta (tint) shifts. Mirrors the SVG feColorMatrix offset matrix
 * used for the live preview exactly (same offsets, same linear math), so
 * live preview and export match closely.
 */
export function applyTemperatureTint(ctx: CanvasRenderingContext2D, temperature: number, tint: number): void {
  if (temperature === 0 && tint === 0) return
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const d = imageData.data
  const t = temperature / 100
  const g = tint / 100
  const rOffset =  t * 40 + g * 20
  const gOffset = -g * 40
  const bOffset = -t * 40 + g * 20
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.min(255, Math.max(0, d[i]     + rOffset))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + gOffset))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + bOffset))
  }
  ctx.putImageData(imageData, 0, 0)
}

/*
  Boosts saturation more on less-saturated pixels than on already-saturated
  ones. 
*/
export function applyVibrance(ctx: CanvasRenderingContext2D, vibrance: number): void {
  if (vibrance === 0) return
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const d = imageData.data
  const amt = vibrance / 100
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const avg = (r + g + b) / 3
    const sat = Math.max(r, g, b) - avg
    const factor = amt * (1 - Math.min(1, sat / 128))
    d[i]     = Math.min(255, Math.max(0, r + (r - avg) * factor))
    d[i + 1] = Math.min(255, Math.max(0, g + (g - avg) * factor))
    d[i + 2] = Math.min(255, Math.max(0, b + (b - avg) * factor))
  }
  ctx.putImageData(imageData, 0, 0)
}

/*
  Darkens the canvas radially toward the corners. 
*/
export function applyVignette(ctx: CanvasRenderingContext2D, vignette: number): void {
  if (vignette <= 0) return
  const { width, height } = ctx.canvas
  const cx = width / 2
  const cy = height / 2
  const outerR = Math.sqrt(cx * cx + cy * cy)
  const innerR = outerR * 0.4
  const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.85})`)
  ctx.save()
  ctx.fillStyle = grad
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

export interface RenderOptions {
  cssFilter:   string
  rotation:    number
  flipH:       boolean
  flipV:       boolean
  sharpness:   number
  highlights:  number
  shadows:     number
  vibrance:    number
  temperature: number
  tint:        number
  vignette:    number
}

/**
 * Renders the image with all current editor effects into a new HTMLCanvasElement
 * at the original image resolution.
 */
export function buildRenderedCanvas(img: HTMLImageElement, opts: RenderOptions): HTMLCanvasElement {
  const w      = img.naturalWidth
  const h      = img.naturalHeight
  const isOdd  = opts.rotation === 90 || opts.rotation === 270
  const canvas = document.createElement('canvas')
  canvas.width  = isOdd ? h : w
  canvas.height = isOdd ? w : h
  const ctx = canvas.getContext('2d')!
  ctx.filter = opts.cssFilter || 'none'
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((opts.rotation * Math.PI) / 180)
  ctx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1)
  ctx.drawImage(img, -w / 2, -h / 2)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.filter = 'none'
  applySharpen(ctx, opts.sharpness)
  applyToneCurve(ctx, opts.highlights, opts.shadows)
  applyTemperatureTint(ctx, opts.temperature, opts.tint)
  applyVibrance(ctx, opts.vibrance)
  applyVignette(ctx, opts.vignette)
  return canvas
}
