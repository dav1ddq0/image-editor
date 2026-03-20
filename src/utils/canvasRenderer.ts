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

export interface RenderOptions {
  cssFilter: string
  rotation:  number
  flipH:     boolean
  flipV:     boolean
  sharpness: number
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
  // Reset filter before pixel-level operations so getImageData/putImageData
  // never run under an active CSS filter (some browsers taint the canvas or
  // throw a SecurityError when a url() filter is active during those calls).
  ctx.filter = 'none'
  applySharpen(ctx, opts.sharpness)
  return canvas
}
