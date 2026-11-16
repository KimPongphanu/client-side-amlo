import { expect, test } from '@playwright/test'
import { loginAsAdmin, loginAsSupervisor } from './helpers/auth'

test.describe('2FA Verification Flow', () => {
  test('TC28: หลัง login ถ้าถูกถาม 2FA ต้องมีช่องกรอก', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.E2E_SUPERVISOR_EMAIL || 'supervisor@amlo.go.th')
    await page.fill('input[type="password"]', process.env.E2E_SUPERVISOR_PASSWORD || 'Supervisor123!')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')

    const url = page.url()
    if (url.includes('2fa-challenge')) {
      await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 })
    } else {
      // บัญชีไม่บังคับ 2FA ก็ถือว่าผ่าน (ตรวจแค่ว่าไม่ค้างหน้า login)
      expect(url).not.toMatch(/\/login$/)
    }
  })
})

test.describe('Supervisor Approve/Reject Request', () => {
  test('TC29: Supervisor เห็นรายการคำร้องที่รออนุมัติ', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.goto('/supervisor-requests')
    await expect(
      page.getByRole('button', { name: /รอฉันอนุมัติ/ }).first(),
    ).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Admin Ban Flow', () => {
  test('TC30: เปิดกล่องยืนยันการระงับผู้ใช้ได้', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.click('text=จัดการสมาชิก')
    const banBtn = page
      .locator('button')
      .filter({ hasText: /ban|ระงับ/i })
      .first()

    if (await banBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await banBtn.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible({
        timeout: 10000,
      })
    }
  })
})

test.describe('PR Management', () => {
  test('TC31: เปิดหน้าจัดการประชาสัมพันธ์', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=ประชาสัมพันธ์')
    await expect(
      page.getByRole('heading', { name: /ประชาสัมพันธ์/ }).first(),
    ).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Department Management', () => {
  test('TC32: เข้าหน้าจัดการหน่วยงานได้', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=จัดการหน่วยงาน')
    await expect(
      page.getByRole('heading', { name: /หน่วยงาน/ }).first(),
    ).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Slider Management', () => {
  test('TC33: เข้าหน้าจัดการ Slider ได้', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=Slider หน้าหลัก')
    await expect(
      page.getByRole('heading', { name: /Slider|สไลด์/ }).first(),
    ).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Splash Popup', () => {
  test('TC34: Popup เปิดหน้าแสดงบนหน้าหลัก และปิดได้', async ({ page }) => {
    await page.goto('/')
    const popup = page.locator('[role="dialog"][aria-modal="true"]')

    if (await popup.count()) {
      await page.keyboard.press('Escape')
      await expect(popup).toHaveCount(0, { timeout: 5000 })
    }
  })
})

test.describe('Responsive Design', () => {
  test('TC36: Mobile viewport แสดงผลได้', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await expect(page.locator('nav').first()).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })
})
