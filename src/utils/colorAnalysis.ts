/**
 * WCAG 2.1-compliant contrast helpers.
 *
 * Relative luminance formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * Contrast ratio formula:     https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

function sRGBToLinear(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * sRGBToLinear(r) + 0.7152 * sRGBToLinear(g) + 0.0722 * sRGBToLinear(b)
}

function contrastRatio(l1: number, l2: number): number {
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Samples the image at reduced resolution, computes the average background
 * luminance, then returns '#ffffff' or '#000000' — whichever achieves the
 * higher WCAG 2.1 contrast ratio (target: 4.5:1 AA for normal text).
 * One of the two will always satisfy the standard for any background color.
 */
export function getAutoTextColor(imageSrc: string): Promise<'#ffffff' | '#000000'> {
  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      const SIZE   = 64
      const canvas = document.createElement('canvas')
      canvas.width  = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, SIZE, SIZE)

      const { data } = ctx.getImageData(0, 0, SIZE, SIZE)
      let rSum = 0, gSum = 0, bSum = 0
      const count = SIZE * SIZE

      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i]
        gSum += data[i + 1]
        bSum += data[i + 2]
      }

      const bgLuminance    = relativeLuminance(rSum / count, gSum / count, bSum / count)
      const whiteContrast  = contrastRatio(1.0, bgLuminance)   // white: L = 1
      const blackContrast  = contrastRatio(0.0, bgLuminance)   // black: L = 0

      resolve(whiteContrast >= blackContrast ? '#ffffff' : '#000000')
    }

    img.onerror = () => resolve('#ffffff') // safe fallback
    img.src = imageSrc
  })
}
