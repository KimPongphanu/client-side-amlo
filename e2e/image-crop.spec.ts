import { expect, test } from '@playwright/test'
import {
  CROP_ASPECT_HEIGHT,
  CROP_ASPECT_WIDTH,
  CROP_OUTPUT_HEIGHT,
  CROP_OUTPUT_WIDTH,
  clampTransform,
  coverScale,
  frameSize,
  identityTransform,
  outputSizeFor,
  renderedPosition,
  renderedSize,
  sourceRect,
  type CropTransform,
  type Size,
} from '../src/utils/imageCrop'

const FRAME: Size = { width: 200, height: 250 }

const SHAPES: Record<string, Size> = {
  poster45: { width: 1200, height: 1500 },
  tall: { width: 720, height: 1280 },
  landscape: { width: 1440, height: 600 },
  square: { width: 800, height: 800 },
  extremeTall: { width: 400, height: 2400 },
  extremeWide: { width: 2400, height: 400 },
}

test.describe('imageCrop — ค่าคงที่และกรอบ', () => {
  test('ผลลัพธ์เป็น 1200x1500 อัตราส่วน 4:5', () => {
    expect(CROP_OUTPUT_WIDTH).toBe(1200)
    expect(CROP_OUTPUT_HEIGHT).toBe(1500)
    expect(CROP_OUTPUT_WIDTH / CROP_OUTPUT_HEIGHT).toBeCloseTo(
      CROP_ASPECT_WIDTH / CROP_ASPECT_HEIGHT,
      5,
    )
  })

  test('frameSize ได้กรอบ 4:5 ที่พอดีกับกล่องเสมอ', () => {
    const containers: Size[] = [
      { width: 464, height: 320 },
      { width: 300, height: 500 },
      { width: 1200, height: 200 },
      { width: 200, height: 200 },
    ]

    for (const container of containers) {
      const frame = frameSize(container)
      expect(frame.width / frame.height).toBeCloseTo(4 / 5, 5)
      expect(frame.width).toBeLessThanOrEqual(container.width)
      expect(frame.height).toBeLessThanOrEqual(container.height)
    }
  })
})

test.describe('imageCrop — สเกลและตำแหน่ง', () => {
  test('coverScale ครอบกรอบพอดีทุกทรงรูป', () => {
    expect(coverScale(SHAPES.poster45, FRAME)).toBeCloseTo(200 / 1200, 6)
    expect(coverScale(SHAPES.tall, FRAME)).toBeCloseTo(200 / 720, 6)
    expect(coverScale(SHAPES.landscape, FRAME)).toBeCloseTo(250 / 600, 6)
    expect(coverScale(SHAPES.square, FRAME)).toBeCloseTo(250 / 800, 6)
  })

  test('รูป 4:5 ที่ซูม 100% ได้รูปเต็มพอดีกรอบ', () => {
    const rect = sourceRect({
      image: SHAPES.poster45,
      frame: FRAME,
      transform: identityTransform,
    })

    expect(rect).toEqual({ sx: 0, sy: 0, sw: 1200, sh: 1500 })
  })

  test('รูปแนวตั้งถูกตัดกลางภาพเป็น 4:5', () => {
    const rect = sourceRect({
      image: SHAPES.tall,
      frame: FRAME,
      transform: identityTransform,
    })

    expect(rect).toEqual({ sx: 0, sy: 190, sw: 720, sh: 900 })
  })

  test('รูปแนวนอนถูกตัดกลางภาพเป็น 4:5', () => {
    const rect = sourceRect({
      image: SHAPES.landscape,
      frame: FRAME,
      transform: identityTransform,
    })

    expect(rect).toEqual({ sx: 480, sy: 0, sw: 480, sh: 600 })
  })

  test('ซูมเข้าแล้วพื้นที่ที่เลือกเล็กลงตามสัดส่วน', () => {
    const base = sourceRect({
      image: SHAPES.tall,
      frame: FRAME,
      transform: identityTransform,
    })
    const zoomed = sourceRect({
      image: SHAPES.tall,
      frame: FRAME,
      transform: { zoom: 2, offsetX: 0, offsetY: 0 },
    })

    expect(zoomed.sw).toBeCloseTo(base.sw / 2, -1)
    expect(zoomed.sh).toBeCloseTo(base.sh / 2, -1)
  })
})

test.describe('imageCrop — ขนาดไฟล์ผลลัพธ์', () => {
  test('ไม่ขยายเกินต้นฉบับ และไม่เกิน 1200x1500', () => {
    expect(outputSizeFor({ sx: 0, sy: 0, sw: 720, sh: 900 })).toEqual({
      width: 720,
      height: 900,
    })
    expect(outputSizeFor({ sx: 0, sy: 0, sw: 1200, sh: 1500 })).toEqual({
      width: 1200,
      height: 1500,
    })
    expect(outputSizeFor({ sx: 0, sy: 0, sw: 2000, sh: 2500 })).toEqual({
      width: 1200,
      height: 1500,
    })
  })

  test('ผลลัพธ์คงอัตราส่วน 4:5 เสมอ', () => {
    for (const width of [300, 720, 1000, 1200, 4000]) {
      const output = outputSizeFor({
        sx: 0,
        sy: 0,
        sw: width,
        sh: Math.round(width * 1.25),
      })
      expect(output.width / output.height).toBeCloseTo(0.8, 2)
    }
  })
})

test.describe('imageCrop — ความปลอดภัยของขอบเขต', () => {
  const zooms = [1, 1.5, 2.5, 4]
  const offsets = [-9999, -400, 0, 400, 9999]

  test('clamp ทำให้รูปคลุมกรอบเสมอ ไม่มีช่องว่าง', () => {
    for (const shape of Object.values(SHAPES)) {
      for (const zoom of zooms) {
        for (const offset of offsets) {
          const transform = clampTransform(
            { zoom, offsetX: offset, offsetY: offset },
            shape,
            FRAME,
          )
          const rendered = renderedSize(shape, FRAME, transform)
          const position = renderedPosition(shape, FRAME, transform)

          expect(position.left).toBeLessThanOrEqual(0.0001)
          expect(position.top).toBeLessThanOrEqual(0.0001)
          expect(position.left + rendered.width).toBeGreaterThanOrEqual(
            FRAME.width - 0.0001,
          )
          expect(position.top + rendered.height).toBeGreaterThanOrEqual(
            FRAME.height - 0.0001,
          )
        }
      }
    }
  })

  test('sourceRect ไม่หลุดขอบรูปทุกทรงรูป ทุกซูม ทุกการลาก', () => {
    const zoomsToTest: number[] = [1, 2, 4]

    for (const shape of Object.values(SHAPES)) {
      for (const zoom of zoomsToTest) {
        for (const offset of offsets) {
          const transform = clampTransform(
            { zoom, offsetX: offset, offsetY: offset },
            shape,
            FRAME,
          )
          const rect = sourceRect({ image: shape, frame: FRAME, transform })

          expect(rect.sw).toBeGreaterThan(0)
          expect(rect.sh).toBeGreaterThan(0)
          expect(rect.sx).toBeGreaterThanOrEqual(0)
          expect(rect.sy).toBeGreaterThanOrEqual(0)
          expect(rect.sx + rect.sw).toBeLessThanOrEqual(shape.width)
          expect(rect.sy + rect.sh).toBeLessThanOrEqual(shape.height)
          expect(rect.sw / rect.sh).toBeCloseTo(4 / 5, 1)
        }
      }
    }
  })

  test('ค่าที่ clamp ได้ต้องไม่ขยับอีกเมื่อ clamp ซ้ำ', () => {
    const transform: CropTransform = { zoom: 2, offsetX: 500, offsetY: -500 }
    const once = clampTransform(transform, SHAPES.tall, FRAME)
    const twice = clampTransform(once, SHAPES.tall, FRAME)

    expect(twice).toEqual(once)
  })
})
