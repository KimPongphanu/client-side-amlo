export const CROP_ASPECT_WIDTH = 4
export const CROP_ASPECT_HEIGHT = 5
export const CROP_OUTPUT_WIDTH = 1200
export const CROP_OUTPUT_HEIGHT =
  (CROP_OUTPUT_WIDTH * CROP_ASPECT_HEIGHT) / CROP_ASPECT_WIDTH
export const CROP_JPEG_QUALITY = 0.92
export const CROP_WEBP_QUALITY = 0.85
export const MIN_RECOMMENDED_CROP_WIDTH = 800

export interface Size {
  width: number
  height: number
}

export interface CropTransform {
  zoom: number
  offsetX: number
  offsetY: number
}

export interface CropRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

export const identityTransform: CropTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const coverScale = (image: Size, frame: Size): number => {
  if (image.width <= 0 || image.height <= 0) return 1
  if (frame.width <= 0 || frame.height <= 0) return 1
  return Math.max(frame.width / image.width, frame.height / image.height)
}

export const frameSize = (container: Size, marginRatio = 0.08): Size => {
  const maxWidth = Math.max(1, container.width * (1 - marginRatio * 2))
  const maxHeight = Math.max(1, container.height * (1 - marginRatio * 2))

  let height = maxHeight
  let width = (height * CROP_ASPECT_WIDTH) / CROP_ASPECT_HEIGHT

  if (width > maxWidth) {
    width = maxWidth
    height = (width * CROP_ASPECT_HEIGHT) / CROP_ASPECT_WIDTH
  }

  return { width, height }
}

export const clampTransform = (
  transform: CropTransform,
  image: Size,
  frame: Size,
): CropTransform => {
  const scale = coverScale(image, frame) * transform.zoom
  const renderedWidth = image.width * scale
  const renderedHeight = image.height * scale
  const maxOffsetX = Math.max(0, (renderedWidth - frame.width) / 2)
  const maxOffsetY = Math.max(0, (renderedHeight - frame.height) / 2)

  return {
    zoom: transform.zoom,
    offsetX: clamp(transform.offsetX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(transform.offsetY, -maxOffsetY, maxOffsetY),
  }
}

export const renderedSize = (
  image: Size,
  frame: Size,
  transform: CropTransform,
): Size => {
  const scale = coverScale(image, frame) * transform.zoom
  return { width: image.width * scale, height: image.height * scale }
}

export const renderedPosition = (
  image: Size,
  frame: Size,
  transform: CropTransform,
): { left: number; top: number } => {
  const rendered = renderedSize(image, frame, transform)
  return {
    left: (frame.width - rendered.width) / 2 + transform.offsetX,
    top: (frame.height - rendered.height) / 2 + transform.offsetY,
  }
}

export const sourceRect = (params: {
  image: Size
  frame: Size
  transform: CropTransform
}): CropRect => {
  const { image, frame, transform } = params
  const scale = coverScale(image, frame) * transform.zoom
  const position = renderedPosition(image, frame, transform)

  const raw: CropRect = {
    sx: -position.left / scale,
    sy: -position.top / scale,
    sw: frame.width / scale,
    sh: frame.height / scale,
  }

  const sx = clamp(Math.round(raw.sx), 0, Math.max(0, image.width - 1))
  const sy = clamp(Math.round(raw.sy), 0, Math.max(0, image.height - 1))
  const sw = Math.round(clamp(raw.sw, 1, Math.max(1, image.width - sx)))
  const sh = Math.round(clamp(raw.sh, 1, Math.max(1, image.height - sy)))

  return { sx, sy, sw, sh }
}

export const outputSizeFor = (
  rect: CropRect,
  maxWidth = CROP_OUTPUT_WIDTH,
): Size => {
  const width = Math.max(1, Math.min(maxWidth, Math.round(rect.sw)))
  return {
    width,
    height: Math.round((width * CROP_ASPECT_HEIGHT) / CROP_ASPECT_WIDTH),
  }
}

export type CropOutputType = 'image/webp' | 'image/jpeg'

let webpCapability: Promise<boolean> | null = null

/**
 * ตรวจว่าเบราว์เซอร์ encode WebP ได้จริงไหม (Safari บางเวอร์ชัน encode ไม่ได้)
 * ผลลัพธ์ถูก cache ไว้ต่อการโหลดหน้า 1 ครั้ง
 */
export const canEncodeWebp = (): Promise<boolean> => {
  if (webpCapability) return webpCapability

  webpCapability = (async () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', 0.8)
      })
      return blob?.type === 'image/webp'
    } catch {
      return false
    }
  })()

  return webpCapability
}

/**
 * ตัดรูปตาม rect แล้วคืนไฟล์ WebP (ถ้าเบราว์เซอร์ทำได้) ไม่เช่นนั้นถอยไปใช้ JPEG
 */
export const cropFileToImage = async (
  file: File,
  rect: CropRect,
  output: Size = {
    width: CROP_OUTPUT_WIDTH,
    height: CROP_OUTPUT_HEIGHT,
  },
  preferredType: CropOutputType = 'image/webp',
): Promise<File> => {
  const useWebp =
    preferredType === 'image/webp' && (await canEncodeWebp())
  const type: CropOutputType = useWebp ? 'image/webp' : 'image/jpeg'
  const quality = useWebp ? CROP_WEBP_QUALITY : CROP_JPEG_QUALITY

  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  })

  try {
    const canvas = document.createElement('canvas')
    canvas.width = output.width
    canvas.height = output.height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('เบราว์เซอร์ไม่รองรับการตัดรูปภาพ')
    }

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, output.width, output.height)
    context.drawImage(
      bitmap,
      rect.sx,
      rect.sy,
      rect.sw,
      rect.sh,
      0,
      0,
      output.width,
      output.height,
    )

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, type, quality)
    })

    if (!blob) {
      throw new Error('สร้างไฟล์รูปที่ตัดแล้วไม่สำเร็จ')
    }

    const extension = useWebp ? 'webp' : 'jpg'

    return new File([blob], `popup-4x5-${Date.now()}.${extension}`, {
      type,
    })
  } finally {
    bitmap.close()
  }
}
