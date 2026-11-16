import { expect, test } from '@playwright/test'

const expectColorClose = (
  actual: number[],
  expected: number[],
  tolerance = 16,
) => {
  expect(actual).toHaveLength(expected.length)
  expected.forEach((channel, index) => {
    expect(Math.abs(actual[index] - channel)).toBeLessThanOrEqual(tolerance)
  })
}

test.describe('imageCrop — ตัดรูปจริงด้วย canvas', () => {
  test('ได้ไฟล์ขนาดตามโซนที่เลือก และตรงกับโซนนั้นจริง', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async () => {
      const mod = await import('/src/utils/imageCrop.ts')

      const source = document.createElement('canvas')
      source.width = 800
      source.height = 1000
      const ctx = source.getContext('2d')!
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 400, 500)
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(400, 0, 400, 500)
      ctx.fillStyle = '#0000ff'
      ctx.fillRect(0, 500, 400, 500)
      ctx.fillStyle = '#ffff00'
      ctx.fillRect(400, 500, 400, 500)

      const blob = await new Promise<Blob | null>((resolve) =>
        source.toBlob(resolve, 'image/png'),
      )
      const file = new File([blob!], 'quadrants.png', { type: 'image/png' })

      const frame = { width: 200, height: 250 }
      const transform = { zoom: 2, offsetX: -100, offsetY: -125 }
      const rect = mod.sourceRect({
        image: { width: 800, height: 1000 },
        frame,
        transform,
      })

      const cropped = await mod.cropFileToImage(
        file,
        rect,
        mod.outputSizeFor(rect),
      )

      const bitmap = await createImageBitmap(cropped)
      const out = document.createElement('canvas')
      out.width = bitmap.width
      out.height = bitmap.height
      const outCtx = out.getContext('2d')!
      outCtx.drawImage(bitmap, 0, 0)

      return {
        rect,
        output: mod.outputSizeFor(rect),
        size: { width: bitmap.width, height: bitmap.height },
        type: cropped.type,
        sizeInBytes: cropped.size,
        centerPixel: Array.from(
          outCtx.getImageData(
            Math.floor(bitmap.width / 2),
            Math.floor(bitmap.height / 2),
            1,
            1,
          ).data,
        ).slice(0, 3),
      }
    })

    expect(result.rect).toEqual({ sx: 400, sy: 500, sw: 400, sh: 500 })
    expect(result.output).toEqual({ width: 400, height: 500 })
    expect(result.size).toEqual({ width: 400, height: 500 })
    expect(result.type).toBe('image/webp')
    expect(result.sizeInBytes).toBeGreaterThan(0)
    expectColorClose(result.centerPixel, [255, 255, 0])
  })

  test('พื้นที่ที่ถูกตัดออกไม่ติดมาบนไฟล์ผลลัพธ์', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async () => {
      const mod = await import('/src/utils/imageCrop.ts')

      const source = document.createElement('canvas')
      source.width = 720
      source.height = 1280
      const ctx = source.getContext('2d')!
      ctx.fillStyle = '#cccccc'
      ctx.fillRect(0, 0, 720, 1280)
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 80, 720, 60)
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(0, 600, 720, 80)

      const blob = await new Promise<Blob | null>((resolve) =>
        source.toBlob(resolve, 'image/png'),
      )
      const file = new File([blob!], 'poster.png', { type: 'image/png' })

      const frame = { width: 200, height: 250 }
      const rect = mod.sourceRect({
        image: { width: 720, height: 1280 },
        frame,
        transform: { zoom: 1, offsetX: 0, offsetY: 0 },
      })

      const cropped = await mod.cropFileToImage(
        file,
        rect,
        mod.outputSizeFor(rect),
      )

      const bitmap = await createImageBitmap(cropped)
      const out = document.createElement('canvas')
      out.width = bitmap.width
      out.height = bitmap.height
      const outCtx = out.getContext('2d')!
      outCtx.drawImage(bitmap, 0, 0)

      const pixelAt = (x: number, y: number) =>
        Array.from(outCtx.getImageData(x, y, 1, 1).data).slice(0, 3)

      return {
        rect,
        size: { width: bitmap.width, height: bitmap.height },
        topPixel: pixelAt(Math.floor(bitmap.width / 2), 4),
        centerPixel: pixelAt(
          Math.floor(bitmap.width / 2),
          Math.floor(bitmap.height / 2),
        ),
      }
    })

    expect(result.rect).toEqual({ sx: 0, sy: 190, sw: 720, sh: 900 })
    expect(result.size).toEqual({ width: 720, height: 900 })
    expectColorClose(result.centerPixel, [0, 255, 0])
    expectColorClose(result.topPixel, [204, 204, 204])
  })

  test('รูปใหญ่ถูกย่อไม่เกิน 1200x1500 แต่ไม่ถูกขยายเกินต้นฉบับ', async ({
    page,
  }) => {
    await page.goto('/')

    const result = await page.evaluate(async () => {
      const mod = await import('/src/utils/imageCrop.ts')

      const source = document.createElement('canvas')
      source.width = 2000
      source.height = 2500
      const ctx = source.getContext('2d')!
      ctx.fillStyle = '#123456'
      ctx.fillRect(0, 0, 2000, 2500)

      const blob = await new Promise<Blob | null>((resolve) =>
        source.toBlob(resolve, 'image/png'),
      )
      const file = new File([blob!], 'big.png', { type: 'image/png' })

      const frame = { width: 200, height: 250 }
      const transform = { zoom: 1, offsetX: 0, offsetY: 0 }
      const rect = mod.sourceRect({
        image: { width: 2000, height: 2500 },
        frame,
        transform,
      })
      const output = mod.outputSizeFor(rect)

      const cropped = await mod.cropFileToImage(file, rect, output)
      const bitmap = await createImageBitmap(cropped)

      const zoomedRect = mod.sourceRect({
        image: { width: 2000, height: 2500 },
        frame,
        transform: { zoom: 3, offsetX: 0, offsetY: 0 },
      })

      return {
        rect,
        output,
        size: { width: bitmap.width, height: bitmap.height },
        bytes: cropped.size,
        zoomedOutput: mod.outputSizeFor(zoomedRect),
      }
    })

    expect(result.rect).toEqual({ sx: 0, sy: 0, sw: 2000, sh: 2500 })
    expect(result.output).toEqual({ width: 1200, height: 1500 })
    expect(result.size).toEqual({ width: 1200, height: 1500 })
    expect(result.bytes).toBeGreaterThan(0)
    expect(result.zoomedOutput.width).toBeLessThan(1200)
    expect(result.zoomedOutput.width).toBeGreaterThan(0)
  })

  test('เบราว์เซอร์ encode WebP ไม่ได้ → ถอยไปใช้ JPEG ให้อัตโนมัติ', async ({
    page,
  }) => {
    await page.goto('/')

    const result = await page.evaluate(async () => {
      // จำลอง Safari บางเวอร์ชัน: toBlob คืน PNG แทน WebP
      const originalToBlob = HTMLCanvasElement.prototype.toBlob
      HTMLCanvasElement.prototype.toBlob = function (
        callback: BlobCallback,
        type?: string,
        quality?: number,
      ) {
        if (type === 'image/webp') {
          return originalToBlob.call(this, callback, 'image/png', quality)
        }
        return originalToBlob.call(this, callback, type, quality)
      }

      const mod = await import('/src/utils/imageCrop.ts')

      const canvas = document.createElement('canvas')
      canvas.width = 720
      canvas.height = 1280
      const context = canvas.getContext('2d')!
      context.fillStyle = '#3366cc'
      context.fillRect(0, 0, 720, 1280)

      const sourceBlob = await new Promise<Blob | null>((resolve) =>
        originalToBlob.call(canvas, resolve, 'image/png'),
      )
      const file = new File([sourceBlob!], 'poster.png', {
        type: 'image/png',
      })

      const frame = { width: 200, height: 250 }
      const rect = mod.sourceRect({
        image: { width: 720, height: 1280 },
        frame,
        transform: { zoom: 1, offsetX: 0, offsetY: 0 },
      })

      const supportsWebp = await mod.canEncodeWebp()
      const cropped = await mod.cropFileToImage(
        file,
        rect,
        mod.outputSizeFor(rect),
      )

      return {
        supportsWebp,
        type: cropped.type,
        name: cropped.name,
        bytes: cropped.size,
      }
    })

    expect(result.supportsWebp).toBe(false)
    expect(result.type).toBe('image/jpeg')
    expect(result.name.endsWith('.jpg')).toBe(true)
    expect(result.bytes).toBeGreaterThan(0)
  })

  test('เทียบ WebP กับ JPEG จากรูปถ่ายจริง (พิกเซลเดียวกัน)', async ({
    page,
  }) => {
    await page.goto('/')

    const result = await page.evaluate(async () => {
      const response = await fetch('/amlo1.jpg')
      const original = await response.blob()
      const bitmap = await createImageBitmap(original)

      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d')!
      context.drawImage(bitmap, 0, 0)

      const encode = (type: string, quality: number) =>
        new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, type, quality),
        )

      const webp = await encode('image/webp', 0.85)
      const jpeg = await encode('image/jpeg', 0.92)

      return {
        dimensions: `${bitmap.width}x${bitmap.height}`,
        originalSize: original.size,
        webpSize: webp?.size ?? 0,
        jpegSize: jpeg?.size ?? 0,
      }
    })

    console.log('PHOTO_COMPARE', JSON.stringify(result))
    expect(result.webpSize).toBeGreaterThan(0)
    expect(result.jpegSize).toBeGreaterThan(0)
    expect(result.webpSize).toBeLessThan(result.jpegSize)
  })
})
