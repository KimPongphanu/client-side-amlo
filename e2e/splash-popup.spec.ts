import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { getSplashSeenKey } from '../src/utils/splashPopup'

const POPUP_API = '**/splash-popups/active'
const POPUP_IMAGE = '**/_e2e-popup.png'
const ENTER_BUTTON = 'button:has-text("เข้าสู่เว็บไซต์")'
const POPUP_IMAGE_URL = 'http://localhost:5173/_e2e-popup.png'

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64',
)

const ACTIVE_POPUP = {
  id: 1,
  image_url: POPUP_IMAGE_URL,
  title: 'E2E Splash Popup',
  isActive: true,
}

const mockPopupApi = async (page: Page, data: unknown = ACTIVE_POPUP) => {
  await page.route(POPUP_API, (route) =>
    route.fulfill({ json: { success: true, data } }),
  )
  await page.route(POPUP_IMAGE, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1X1 }),
  )
}

const seedSeenKey = async (page: Page, date: Date) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, 'true'),
    getSplashSeenKey(date),
  )
}

const storedSeenKeys = (page: Page) =>
  page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.startsWith('splash_seen_')),
  )

test.describe('Splash popup — แสดงวันละครั้ง', () => {
  test('แสดง popup ครั้งแรกของวัน — ไม่มีหัวข้อ และชิดรูป', async ({
    page,
  }) => {
    await mockPopupApi(page)

    await page.goto('/')

    await expect(page.locator(ENTER_BUTTON)).toBeVisible()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAccessibleName('E2E Splash Popup')

    const layout = await page.evaluate(() => {
      const card = document
        .querySelector('[role="dialog"]')
        ?.querySelector(':scope > div:last-child > div')
      const image = document.querySelector('[role="dialog"] img')
      const heading = document.querySelector('[role="dialog"] h2')
      if (!card || !image || !heading) return null

      const cardBox = card.getBoundingClientRect()
      const imageBox = image.getBoundingClientRect()
      const headingBox = heading.getBoundingClientRect()

      return {
        gapBelowImage: Math.round(cardBox.bottom - imageBox.bottom),
        headingWidth: Math.round(headingBox.width),
        headingHeight: Math.round(headingBox.height),
      }
    })

    expect(layout).not.toBeNull()
    expect(layout!.headingWidth).toBeLessThanOrEqual(2)
    expect(layout!.headingHeight).toBeLessThanOrEqual(2)
    expect(layout!.gapBelowImage).toBeLessThanOrEqual(80)
  })

  test('กดเข้าสู่เว็บไซต์ → ปิด popup และบันทึกว่าเห็นแล้ววันนี้', async ({
    page,
  }) => {
    await mockPopupApi(page)

    await page.goto('/')
    await page.locator(ENTER_BUTTON).click()

    await expect(page.locator(ENTER_BUTTON)).toBeHidden()
    expect(await storedSeenKeys(page)).toEqual([getSplashSeenKey()])
  })

  test('เข้าเว็บซ้ำในวันเดียวกัน → ไม่แสดงอีก', async ({ page }) => {
    await mockPopupApi(page)

    await page.goto('/')
    await page.locator(ENTER_BUTTON).click()
    await expect(page.locator(ENTER_BUTTON)).toBeHidden()

    await page.reload()

    await expect(page.locator(ENTER_BUTTON)).toBeHidden()
  })

  test('มี key ของวันนี้อยู่ก่อน → ไม่แสดง', async ({ page }) => {
    await mockPopupApi(page)
    await seedSeenKey(page, new Date())

    await page.goto('/')

    await expect(page.locator(ENTER_BUTTON)).toBeHidden()
  })

  test('เมื่อวานเคยกดปิด → วันนี้ต้องแสดงอีกครั้ง', async ({ page }) => {
    await mockPopupApi(page)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    await seedSeenKey(page, yesterday)

    await page.goto('/')

    await expect(page.locator(ENTER_BUTTON)).toBeVisible()
  })

  test('ข้ามวันด้วยนาฬิกาจำลอง → แสดงอีกครั้ง', async ({ page }) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    await page.clock.setFixedTime(tomorrow)
    await mockPopupApi(page)
    await seedSeenKey(page, new Date())

    await page.goto('/')

    await expect(page.locator(ENTER_BUTTON)).toBeVisible()
  })

  test('ไม่มี popup ที่ active อยู่ → ไม่แสดง', async ({ page }) => {
    await mockPopupApi(page, null)

    await page.goto('/')

    await expect(page.locator(ENTER_BUTTON)).toBeHidden()
  })
})

test.describe('Splash popup — รองรับรูป WebP', () => {
  test('แสดงรูป .webp ได้จริง', async ({ page }) => {
    await page.route(POPUP_API, (route) =>
      route.fulfill({
        json: {
          success: true,
          data: {
            id: 9,
            image_url: 'http://localhost:5173/Logo.webp',
            title: 'WebP Popup',
            bg_color: '#ffffff',
            isActive: true,
          },
        },
      }),
    )

    await page.goto('/')

    const image = page.locator('[role="dialog"] img')
    await expect(image).toBeVisible()
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0)

    const metrics = await page.evaluate(() => {
      const card = document
        .querySelector('[role="dialog"]')
        ?.querySelector(':scope > div:last-child > div')
      const img = document.querySelector('[role="dialog"] img')
      if (!card || !img) return null
      return {
        cardWidth: Math.round(card.getBoundingClientRect().width),
        imageWidth: Math.round(img.getBoundingClientRect().width),
      }
    })

    expect(metrics).not.toBeNull()
    expect(metrics!.imageWidth).toBe(metrics!.cardWidth)
  })
})
