import {
  Florence2ForConditionalGeneration,
  AutoProcessor,
  AutoTokenizer,
  RawImage,
} from '@huggingface/transformers'

const MODEL_ID = 'onnx-community/Florence-2-base-ft'
// Florence-2 processes images at 768×768 internally, so sending anything larger
// just wastes time in preprocessing. Cap at 1024px on the longest side.
const MAX_DIM = 1024

// Cached after first load — shared across all calls in the session
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _model:     any = null
let _processor: any = null
let _tokenizer: any = null

export interface TextRegion {
  label: string
  // Normalized 0-1 coordinates (scale-invariant — work on any display size)
  box:   [number, number, number, number]   // x1, y1, x2, y2
}

export interface OcrResult {
  text:    string        // all labels joined — used for "copy all"
  regions: TextRegion[]  // individual text blocks with normalized positions
}

export function isModelLoaded(): boolean {
  return _model !== null
}

async function isWebGPUAvailable(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) return false
  try {
    const adapter = await (navigator as any).gpu.requestAdapter()
    return adapter !== null
  } catch {
    return false
  }
}

export async function loadModel(onProgress?: (pct: number) => void): Promise<void> {
  if (_model) return

  const progressCb = (info: any) => {
    if (info.status === 'progress' && typeof info.progress === 'number') {
      onProgress?.(Math.round(info.progress))
    }
  }

  // Try WebGPU first — 5-10× faster than WASM when the browser supports it.
  if (await isWebGPUAvailable()) {
    try {
      ;[_model, _processor, _tokenizer] = await Promise.all([
        Florence2ForConditionalGeneration.from_pretrained(MODEL_ID, {
          dtype: 'fp32',
          device: 'webgpu',
          progress_callback: progressCb,
        }),
        AutoProcessor.from_pretrained(MODEL_ID),
        AutoTokenizer.from_pretrained(MODEL_ID),
      ])
      return
    } catch {
      // WebGPU failed at load time — reset and fall through to WASM
      _model = _processor = _tokenizer = null
    }
  }

  // WASM fallback: quantized weights keep memory and inference time reasonable
  const dtype = {
    embed_tokens:   'fp32' as const,
    vision_encoder: 'fp32' as const,
    encoder:        'q8'   as const,
    decoder:        'q8'   as const,
    lm_head:        'fp32' as const,
  }

  ;[_model, _processor, _tokenizer] = await Promise.all([
    Florence2ForConditionalGeneration.from_pretrained(MODEL_ID, { dtype, progress_callback: progressCb }),
    AutoProcessor.from_pretrained(MODEL_ID),
    AutoTokenizer.from_pretrained(MODEL_ID),
  ])
}

// Downscale canvas to MAX_DIM on its longest side (proportional).
// Florence-2 crops/resizes to 768×768 internally regardless of input size,
// so this only avoids expensive data-URL encoding of huge images.
function resizeCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const { width: W, height: H } = src
  if (W <= MAX_DIM && H <= MAX_DIM) return src

  const scale = MAX_DIM / Math.max(W, H)
  const w     = Math.round(W * scale)
  const h     = Math.round(H * scale)
  const out   = document.createElement('canvas')
  out.width   = w
  out.height  = h
  out.getContext('2d')!.drawImage(src, 0, 0, w, h)
  return out
}

export async function runOcr(canvas: HTMLCanvasElement): Promise<OcrResult | null> {
  if (!_model || !_processor || !_tokenizer) throw new Error('Model not loaded')

  const small   = resizeCanvas(canvas)
  const dataUrl = small.toDataURL('image/jpeg', 0.92)  // JPEG is faster to encode than PNG
  const image   = await RawImage.fromURL(dataUrl)
  const imgW    = image.width
  const imgH    = image.height

  const task      = '<OCR_WITH_REGION>'
  const prompts   = _processor.construct_prompts(task)
  const textIn    = _tokenizer(prompts)
  const imageIn   = await _processor(image)
  const ids       = await _model.generate({ ...textIn, ...imageIn, max_new_tokens: 1024 })
  const decoded   = _tokenizer.batch_decode(ids, { skip_special_tokens: false })[0]
  const parsed    = _processor.post_process_generation(decoded, task, [imgW, imgH])

  const raw = parsed[task] as { quad_boxes?: number[][], labels?: string[] } | undefined
  if (!raw?.labels?.length) return null

  const regions: TextRegion[] = raw.labels
    .map((label, i): TextRegion | null => {
      if (!label.trim()) return null
      const q = raw.quad_boxes?.[i]
      if (!q) return null

      let x1: number, y1: number, x2: number, y2: number
      if (q.length === 8) {
        // quadrilateral: [x1,y1,x2,y2,x3,y3,x4,y4]
        x1 = Math.min(q[0], q[2], q[4], q[6])
        y1 = Math.min(q[1], q[3], q[5], q[7])
        x2 = Math.max(q[0], q[2], q[4], q[6])
        y2 = Math.max(q[1], q[3], q[5], q[7])
      } else {
        // axis-aligned bbox: [x1, y1, x2, y2]
        ;[x1, y1, x2, y2] = q
      }

      // Normalize to 0-1 so coordinates work on any display size
      return { label, box: [x1 / imgW, y1 / imgH, x2 / imgW, y2 / imgH] }
    })
    .filter((r): r is TextRegion => r !== null)

  if (!regions.length) return null

  return { text: regions.map(r => r.label).join(' '), regions }
}
