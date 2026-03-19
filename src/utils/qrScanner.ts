/**
 * qrScanner.ts
 * Scans a loaded image for a QR code using jsQR.
 * Returns the decoded string, or null if no QR code was found.
 */

import jsQR from 'jsqr'
import { buildRenderedCanvas } from './canvasRenderer'
import type { RenderOptions } from './canvasRenderer'

export async function scanQrCode(
  src: string,
  renderOpts: RenderOptions,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = buildRenderedCanvas(img, renderOpts)
      const ctx    = canvas.getContext('2d')!
      const { width, height } = canvas
      const imageData = ctx.getImageData(0, 0, width, height)
      const result = jsQR(imageData.data, width, height)
      resolve(result ? result.data : null)
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}
