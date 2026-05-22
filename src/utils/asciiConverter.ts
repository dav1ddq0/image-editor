const gscale1 = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
const gscale2 = '@%#*+=-:. '
// Unicode block elements for color mode — full cell coverage, no invisible spaces
const gscaleBlock = '█▓▒░ '

export interface AsciiOptions {
  cols:       number   // number of character columns (default 120)
  scale:      number   // font aspect ratio width/height (Courier New in browser ≈ 0.55)
  moreLevels: boolean  // use 70-level ramp instead of 10-level
  blockChars: boolean  // use Unicode block elements (█▓▒░) instead of ASCII ramp
}

export interface ColorChar {
  char:  string
  color: string  // css rgb() string using the block's average color
}

export interface AsciiResult {
  text:       string        // plain text for B&W display and copying
  colorLines: ColorChar[][] // per-character color data for color mode
}

export function convertImageToAscii(
  canvas: HTMLCanvasElement,
  opts: Partial<AsciiOptions> = {},
): AsciiResult {
  const { cols = 120, scale = 0.55, moreLevels = true, blockChars = false } = opts

  const W = canvas.width
  const H = canvas.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return { text: '', colorLines: [] }

  const imageData = ctx.getImageData(0, 0, W, H)
  const data      = imageData.data

  const w    = W / cols
  const h    = w / scale
  const rows = Math.floor(H / h)

  if (cols > W || rows > H) return { text: '', colorLines: [] }

  const textLines:  string[]      = []
  const colorLines: ColorChar[][] = []
  const gscale = blockChars ? gscaleBlock : moreLevels ? gscale1 : gscale2
  const levels = blockChars ? 4 : moreLevels ? 69 : 9

  for (let j = 0; j < rows; j++) {
    const y1 = Math.floor(j * h)
    const y2 = j === rows - 1 ? H : Math.floor((j + 1) * h)

    let line      = ''
    const colorRow: ColorChar[] = []

    for (let i = 0; i < cols; i++) {
      const x1 = Math.floor(i * w)
      const x2 = i === cols - 1 ? W : Math.floor((i + 1) * w)

      let sumR = 0, sumG = 0, sumB = 0, sumL = 0
      let count = 0

      for (let py = y1; py < y2; py++) {
        for (let px = x1; px < x2; px++) {
          const idx = (py * W + px) * 4
          const r   = data[idx]
          const g   = data[idx + 1]
          const b   = data[idx + 2]
          sumR += r
          sumG += g
          sumB += b
          sumL += 0.299 * r + 0.587 * g + 0.114 * b
          count++
        }
      }

      const avg     = count > 0 ? sumL / count : 0
      const charIdx = Math.floor((avg * levels) / 255)
      const char    = gscale[charIdx]

      const r = count > 0 ? Math.round(sumR / count) : 0
      const g = count > 0 ? Math.round(sumG / count) : 0
      const b = count > 0 ? Math.round(sumB / count) : 0

      line += char
      colorRow.push({ char, color: `rgb(${r},${g},${b})` })
    }

    textLines.push(line)
    colorLines.push(colorRow)
  }

  return { text: textLines.join('\n'), colorLines }
}
