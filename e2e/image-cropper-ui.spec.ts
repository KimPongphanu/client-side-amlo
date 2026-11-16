import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { makeSolidPng } from './helpers/png'

const HARNESS_URL = '/e2e/harness/cropper.html'
const TALL_POSTER = { name: 'poster-720x1280.png', mimeType: 'image/png' }

const cropBox = (page: Page) =>
  page.getByRole('group', { name: /พื้นที่ตัดรูป/ })

const selectPoster = (page: Page) =>
  page.locator('#harness-file').setInputFiles({
    ...TALL_POSTER,
    buffer: makeSolidPng(720, 1280, [180, 190, 200]),
  })

const setRangeValue = (element: Element, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set
  setter?.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

const imageLeft = (page: Page) =>
  page
    .locator('[role="group"] img')
    .evaluate((element) => (element as HTMLElement).style.left)

test.describe('ImageCropper UI — กรอบ 4:5, grid, พื้นที่ตัดทิ้ง', () => {
  test('แสดงผลครบและตัดออกมาเป็นไฟล์ 1200x1500 JPEG', async ({ page }) => {
    await page.goto(HARNESS_URL)
    await selectPoster(page)

    await expect(cropBox(page)).toBeVisible()

    const frame = page.getByTestId('crop-frame')
    await expect(frame).toBeVisible()
    const frameBox = await frame.boundingBox()
    expect(frameBox).not.toBeNull()
    expect(frameBox!.width / frameBox!.height).toBeCloseTo(0.8, 2)

    await expect(page.getByTestId('crop-grid')).toHaveCount(4)
    await expect(page.getByTestId('crop-dim')).toHaveCount(4)
    await expect(page.getByText(/ไฟล์ที่ได้: 720 × 900 px/)).toBeVisible()

    await page
      .getByRole('slider', { name: 'ซูม' })
      .evaluate(setRangeValue, '200')
    await expect(page.getByText('200%')).toBeVisible()

    const before = await imageLeft(page)
    const box = await cropBox(page).boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      box!.x + box!.width / 2 + 40,
      box!.y + box!.height / 2 + 60,
      { steps: 8 },
    )
    await page.mouse.up()
    expect(await imageLeft(page)).not.toBe(before)

    const promised = await page.getByText(/ไฟล์ที่ได้:/).innerText()
    const match = promised.match(/(\d+) × (\d+) px/)
    expect(match).not.toBeNull()

    await page.getByRole('button', { name: 'ใช้รูปนี้' }).click()
    await expect(page.locator('body[data-applied="true"]')).toHaveCount(1, {
      timeout: 20000,
    })

    const data = await page.evaluate(() => ({ ...document.body.dataset }))
    expect(data.appliedWidth).toBe(match![1])
    expect(data.appliedHeight).toBe(match![2])
    expect(Number(match![1])).toBeLessThanOrEqual(1200)
    expect(Number(match![1]) / Number(match![2])).toBeCloseTo(0.8, 2)
    expect(data.appliedType).toBe('image/webp')
    expect(Number(data.appliedBytes)).toBeGreaterThan(0)
    expect(promised).toContain('WebP')
  })

  test('ปุ่มใช้รูปเต็ม (ไม่ตัด) ข้ามการตัด', async ({ page }) => {
    await page.goto(HARNESS_URL)
    await selectPoster(page)

    await expect(cropBox(page)).toBeVisible()
    await page.getByRole('button', { name: 'ใช้รูปเต็ม (ไม่ตัด)' }).click()

    await expect(page.locator('body[data-original="true"]')).toHaveCount(1)
    await expect(page.locator('body[data-applied="true"]')).toHaveCount(0)
  })

  test('ปุ่มยกเลิกออกจากโหมดตัดรูป', async ({ page }) => {
    await page.goto(HARNESS_URL)
    await selectPoster(page)

    await expect(cropBox(page)).toBeVisible()
    await page.getByRole('button', { name: 'ยกเลิก' }).click()

    await expect(cropBox(page)).toBeHidden()
    await expect(page.locator('body[data-cancelled="true"]')).toHaveCount(1)
  })
})
