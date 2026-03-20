/**
 * floodFill.ts
 * BFS flood-fill operating directly on ImageData.
 * tolerance 0 = exact color match, 100 = ±255 per channel (fill everything).
 */

export function hexToRgba(hex: string): [number, number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    255,
  ]
}

export function floodFill(
  data:      Uint8ClampedArray,
  width:     number,
  height:    number,
  startX:    number,
  startY:    number,
  fillColor: readonly [number, number, number, number],
  tolerance: number,
): void {
  const x0 = Math.round(startX)
  const y0 = Math.round(startY)
  if (x0 < 0 || x0 >= width || y0 < 0 || y0 >= height) return

  const i0 = (y0 * width + x0) * 4
  const tR = data[i0], tG = data[i0 + 1], tB = data[i0 + 2], tA = data[i0 + 3]
  const [fR, fG, fB, fA] = fillColor
  const tol = tolerance * 2.55   // 0-100 scale → 0-255 per channel

  // Nothing to fill if the seed is already the fill colour
  if (
    Math.abs(tR - fR) <= tol && Math.abs(tG - fG) <= tol &&
    Math.abs(tB - fB) <= tol && Math.abs(tA - fA) <= tol
  ) return

  function matches(i: number): boolean {
    return (
      Math.abs(data[i]     - tR) <= tol &&
      Math.abs(data[i + 1] - tG) <= tol &&
      Math.abs(data[i + 2] - tB) <= tol &&
      Math.abs(data[i + 3] - tA) <= tol
    )
  }

  const visited = new Uint8Array(width * height)
  const stack: number[] = [y0 * width + x0]

  while (stack.length > 0) {
    const pos = stack.pop()!
    if (visited[pos]) continue

    const px = pos % width
    const py = (pos - px) / width
    const i  = pos * 4

    if (!matches(i)) continue

    visited[pos] = 1
    data[i] = fR; data[i + 1] = fG; data[i + 2] = fB; data[i + 3] = fA

    if (px > 0)          stack.push(pos - 1)
    if (px < width - 1)  stack.push(pos + 1)
    if (py > 0)          stack.push(pos - width)
    if (py < height - 1) stack.push(pos + width)
  }
}
