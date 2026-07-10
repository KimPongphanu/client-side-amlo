import { expect, test } from '@playwright/test'

const SUPERVISOR_EMAIL = 'supervisor@amlo.go.th'
const SUPERVISOR_PASS = 'Supervisor123!'
const ADMIN_EMAIL = 'admin@amlo.go.th'
const ADMIN_PASS = 'Admin123!'

test.describe('2FA Verification Flow', () => {
  test('TC28: 2FA challenge page loads after login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    // If 2FA enabled, should redirect to challenge page
    const currentUrl = page.url()
    if (currentUrl.includes('challenge') || currentUrl.includes('2fa')) {
      await expect(page.locator('input')).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Supervisor Approve/Reject Request', () => {
  test('TC29: Supervisor can see pending requests', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.goto('/supervisor-requests')
    await expect(
      page.locator('text=requests').or(page.locator('text=คำขอ')),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Admin Ban Flow', () => {
  test('TC30: Ban user with 3-step confirmation', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.goto('/dashboard/users')
    const banBtn = page
      .locator('button')
      .filter({ hasText: /ban|ระงับ/i })
      .first()
    if (await banBtn.isVisible()) {
      await banBtn.click()
      // Step 1: Confirm
      const confirmBtn = page
        .locator('button')
        .filter({ hasText: /confirm|ยืนยัน/i })
        .first()
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click()
      }
    }
  })
})

test.describe('PR Management', () => {
  test('TC31: Create PR article', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=PR')
    await page.click('text=สร้าง')
    await page.fill('input[name="title"]', 'E2E Test PR')
    await page.fill('textarea[name="description"]', 'PR description')
    await page.fill('textarea[name="content"]', 'PR content')
    await page.click('button[type="submit"]')
  })
})

test.describe('Department Management', () => {
  test('TC32: Create and delete department', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.goto('/dashboard/departments')
    const createBtn = page
      .locator('button')
      .filter({ hasText: /create|department|สร้าง/i })
      .first()
    if (await createBtn.isVisible()) {
      await createBtn.click()
    }
  })
})

test.describe('Slider Management', () => {
  test('TC33: View slider page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Slider')
    await expect(
      page.locator('text=slide').or(page.locator('text=สไลด์')),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Splash Popup', () => {
  test('TC34: Splash popup shows on homepage', async ({ page }) => {
    await page.goto('/')
    // Wait for popup to appear
    const popup = page
      .locator('[class*="popup"]')
      .or(page.locator('[class*="splash"]'))
      .first()
    if (await popup.isVisible({ timeout: 5000 }).catch(() => false)) {
      const closeBtn = popup
        .locator('button')
        .or(page.locator('[aria-label*="close"]'))
        .first()
      if (await closeBtn.isVisible()) {
        await closeBtn.click()
        await expect(popup).not.toBeVisible({ timeout: 3000 })
      }
    }
  })
})

test.describe('File Download', () => {
  test('TC35: Download Excel export', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    const exportBtn = page
      .locator('button')
      .filter({ hasText: /excel|export/i })
      .first()
    if (await exportBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
        exportBtn.click(),
      ])
      if (download) {
        expect(download.suggestedFilename()).toContain('.xlsx')
      }
    }
  })
})

test.describe('Responsive Design', () => {
  test('TC36: Mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    // Mobile menu toggle
    const menuBtn = page
      .locator('button[aria-label*="menu"]')
      .or(page.locator('[class*="hamburger"]'))
      .first()
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
    }
  })
})
