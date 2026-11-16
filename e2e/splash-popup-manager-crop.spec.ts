import zlib from 'node:zlib'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@amlo.go.th'
const ADMIN_PASS = process.env.SEED_ADMIN_PASSWORD ?? ''

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value
  }
  return table
})()

const crc32 = (buffer: Buffer): number => {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const pngChunk = (type: string, data: Buffer): Buffer => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

const makeSolidPng = (
  width: number,
  height: number,
  rgb: [number, number, number],
): Buffer => {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 2

  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x += 1) {
    row[1 + x * 3] = rgb[0]
    row[2 + x * 3] = rgb[1]
    row[3 + x * 3] = rgb[2]
  }

  const raw = Buffer.concat(Array.from({ length: height }, () => row))

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const TALL_POSTER = { name: 'poster-720x1280.png', mimeType: 'image/png' }

const setRangeValue = (element: Element, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set
  setter?.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

const cropBox = (page: Page) =>
  page.getByRole('group', { name: /พื้นที่ตัดรูป/ })

const openAddPopupModal = async (page: Page) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASS)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/dashboard/, { timeout: 25000 })

  await page.goto('/dashboard')
  await page.getByRole('button', { name: /Popup เปิดหน้า/ }).click()
  await page.getByRole('button', { name: 'เพิ่ม Popup', exact: true }).click()
}

const selectImage = (page: Page) =>
  page.locator('input[type="file"]').setInputFiles({
    ...TALL_POSTER,
    buffer: makeSolidPng(720, 1280, [180, 190, 200]),
  })

test.describe('Dashboard — เพิ่ม Popup พร้อมเครื่องมือตัดรูป', () => {
  test.skip(
    process.env.E2E_RUN_DASHBOARD !== '1' || !ADMIN_PASS,
    'ต้องมีบัญชีที่ล็อกอินเข้า Dashboard ได้ (ไม่ติด force-password-reset): ตั้ง SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD และ E2E_RUN_DASHBOARD=1',
  )

  test('กรอบ 4:5 + เส้น grid + พื้นที่ตัดทิ้ง และตัดได้ไฟล์ 1200x1500', async ({
    page,
  }) => {
    await openAddPopupModal(page)

    await expect(page.getByText(/แนะนำอัตราส่วน 4:5/)).toBeVisible()

    await selectImage(page)
    await expect(cropBox(page)).toBeVisible()

    const frame = page.getByTestId('crop-frame')
    await expect(frame).toBeVisible()
    const frameBox = await frame.boundingBox()
    expect(frameBox).not.toBeNull()
    expect(frameBox!.width / frameBox!.height).toBeCloseTo(0.8, 2)

    await expect(page.getByTestId('crop-grid')).toHaveCount(4)
    await expect(page.getByTestId('crop-dim')).toHaveCount(4)
    await expect(page.getByText(/ไฟล์ที่ได้: 720 × 900 px/)).toBeVisible()

    const zoom = page.getByRole('slider', { name: 'ซูม' })
    await zoom.evaluate(setRangeValue, '250')
    await expect(page.getByText('250%')).toBeVisible()

    await zoom.evaluate(setRangeValue, '100')
    await expect(page.getByText('100%')).toBeVisible()

    await page.getByRole('button', { name: 'ใช้รูปนี้' }).click()

    await expect(page.getByText(/ตัดเป็น 4:5 แล้ว/)).toBeVisible({
      timeout: 20000,
    })
    await expect(page.getByRole('button', { name: 'ตัดใหม่' })).toBeVisible()
    await expect(cropBox(page)).toBeHidden()

    await page.getByRole('button', { name: 'ยกเลิก' }).click()
    await expect(page.getByText('เพิ่ม Popup ใหม่')).toBeHidden()
  })

  test('เลือกใช้รูปเต็มโดยไม่ตัดได้ (ข้ามการตัด)', async ({ page }) => {
    await openAddPopupModal(page)

    await selectImage(page)
    await expect(cropBox(page)).toBeVisible()

    await page.getByRole('button', { name: 'ใช้รูปเต็ม (ไม่ตัด)' }).click()

    await expect(cropBox(page)).toBeHidden()
    await expect(page.getByText('ใช้รูปเต็ม (ไม่ตัด)')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ตัดเป็น 4:5' })).toBeVisible()

    await page.getByRole('button', { name: 'ยกเลิก' }).click()
  })
})
