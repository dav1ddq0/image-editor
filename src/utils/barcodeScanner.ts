/**
 * barcodeScanner.ts
 * Scans a loaded image for 1D barcodes only (Code128, EAN, UPC, Code39, ITF…)
 * using @zxing/library. QR codes and all 2D formats are excluded because
 * MultiFormatOneDReader only contains 1D readers by design.
 * Returns the decoded string, or null if no barcode was found.
 */

import {
  MultiFormatOneDReader,
  HTMLCanvasElementLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  NotFoundException,
  DecodeHintType,
} from '@zxing/library'
import { buildRenderedCanvas } from './canvasRenderer'
import type { RenderOptions } from './canvasRenderer'

const hints = new Map<DecodeHintType, unknown>()
const reader = new MultiFormatOneDReader(hints)

export async function scanBarcode(
  src: string,
  renderOpts: RenderOptions,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = buildRenderedCanvas(img, renderOpts)
      try {
        const source   = new HTMLCanvasElementLuminanceSource(canvas)
        const bitmap   = new BinaryBitmap(new HybridBinarizer(source))
        const result   = reader.decode(bitmap)
        resolve(result.getText())
      } catch (e) {
        if (e instanceof NotFoundException) resolve(null)
        else resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}
