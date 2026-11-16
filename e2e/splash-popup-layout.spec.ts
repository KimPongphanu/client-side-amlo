import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const POPUP_API = '**/splash-popups/active'
const POPUP_IMAGE = '**/_e2e-popup.svg'
const IMAGE_URL = 'http://localhost:5173/_e2e-popup.svg'
const ENTER_BUTTON = 'button:has-text("เข้าสู่เว็บไซต์")'

const SHAPES = {
  tall: { width: 720, height: 1280 },
  portrait: { width: 620, height: 820 },
  square: { width: 800, height: 800 },
  landscape: { width: 1440, height: 600 },
  extremeTall: { width: 400, height: 2400 },
}

const VIEWPORTS = {
  se: { width: 320, height: 568 },
  iphone: { width: 375, height: 667 },
  laptop: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 },
}

const svgFor = (width: number, height: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#e2e8f0"/><rect x="0" y="${height - 80}" width="${width}" height="80" fill="#1d4ed8"/></svg>`

const openPopupWith = async (
  page: Page,
  shape: { width: number; height: number },
) => {
  await page.route(POPUP_API, (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          id: 1,
          image_url: IMAGE_URL,
          title: 'ประกาศทดสอบ',
          bg_color: '#f8fafc',
          isActive: true,
        },
      },
    }),
  )
  await page.route(POPUP_IMAGE, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: svgFor(shape.width, shape.height),
    }),
  )

  await page.goto('/')
  await expect(page.locator(ENTER_BUTTON)).toBeVisible()
}

const measure = (page: Page) =>
  page.evaluate(() => {
    const box = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }
    }

    const dialog = document.querySelector('[role="dialog"]')
    const button = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('เข้าสู่เว็บไซต์'),
    )
    const image = document.querySelector(
      '[role="dialog"] img',
    ) as HTMLImageElement | null
    const card = dialog?.querySelector(':scope > div:last-child > div') as HTMLElement | null

    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      card: card ? box(card) : null,
      button: button ? box(button) : null,
      image: image
        ? {
            ...box(image),
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          }
        : null,
      documentCanScroll: dialog
        ? dialog.scrollHeight > dialog.clientHeight
        : false,
    }
  })

const overflow = (bottom: number, viewportHeight: number) =>
  Math.max(0, Math.round(bottom - viewportHeight))

test.describe('Splash popup — layout ต้องพอดีทุกจอ ทุกรูปทรงรูป', () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const shapeName of ['tall', 'landscape'] as const) {
      test(`ปุ่มอยู่ในจอเสมอ @ ${viewportName} × รูป ${shapeName}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport)
        await openPopupWith(page, SHAPES[shapeName])

        await expect
          .poll(async () => overflow((await measure(page)).button!.bottom, viewport.height), {
            message: 'ปุ่มต้องไม่ตกขอบล่างของจอ',
          })
          .toBe(0)

        await expect
          .poll(async () => (await measure(page)).image?.width ?? 0, {
            message: 'รูปต้องโหลดและแสดงผล',
          })
          .toBeGreaterThan(0)

        const metrics = await measure(page)

        expect(metrics.button!.top).toBeGreaterThanOrEqual(0)
        expect(metrics.button!.height).toBeGreaterThanOrEqual(44)
        expect(metrics.card!.top).toBeGreaterThanOrEqual(0)
        expect(overflow(metrics.card!.bottom, viewport.height)).toBe(0)
        expect(metrics.image!.naturalWidth).toBe(SHAPES[shapeName].width)
        expect(metrics.image!.naturalHeight).toBe(SHAPES[shapeName].height)
        expect(metrics.image!.width).toBe(metrics.card!.width)
        expect(metrics.image!.height).toBeLessThanOrEqual(641)
      })
    }
  }

  test('รูปทรงสุดขั้ว (400x2400) ก็ยังกดปุ่มได้ที่จอ 320px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.se)
    await openPopupWith(page, SHAPES.extremeTall)

    await expect
      .poll(async () => overflow((await measure(page)).button!.bottom, VIEWPORTS.se.height))
      .toBe(0)

    await page.locator(ENTER_BUTTON).click()
    await expect(page.locator(ENTER_BUTTON)).toBeHidden()
  })

  test('ทุกทรงรูปต้องไม่มีขอบข้าง ภาพกว้างเท่ากับการ์ด', async ({ page }) => {
    const realisticShapes = ['portrait', 'tall', 'landscape', 'square'] as const

    for (const shapeName of realisticShapes) {
      const shape = SHAPES[shapeName]
      await page.setViewportSize(VIEWPORTS.desktop)
      await openPopupWith(page, shape)

      await expect
        .poll(
          async () =>
            overflow(
              (await measure(page)).button!.bottom,
              VIEWPORTS.desktop.height,
            ),
          { message: `ปุ่มต้องอยู่ในจอ (รูป ${shapeName})` },
        )
        .toBe(0)

      await expect
        .poll(async () => (await measure(page)).image?.width ?? 0, {
          message: `รูปต้องโหลดก่อนวัด (รูป ${shapeName})`,
        })
        .toBeGreaterThan(0)

      const metrics = await measure(page)
      const imageWidth = metrics.image!.width
      const imageHeight = metrics.image!.height

      expect(imageWidth, `ขอบข้างต้องเป็น 0 (รูป ${shapeName})`).toBe(
        metrics.card!.width,
      )
      expect(
        imageWidth / imageHeight,
        `ห้ามบิดสัดส่วน (รูป ${shapeName})`,
      ).toBeCloseTo(shape.width / shape.height, 2)
    }
  })
})
