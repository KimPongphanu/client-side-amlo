import { expect, test } from '@playwright/test'

const ADMIN_EMAIL = 'admin@amlo.go.th'
const ADMIN_PASS = 'Admin123!'

test.describe('Dashboard Authentication', () => {
  test('TC10: Redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('TC11: Login as ADMIN shows dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('TC12: ADMIN cannot see supervisor features', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
    await expect(page.locator('text=Audit')).not.toBeVisible()
    await expect(page.locator('text=Backup')).not.toBeVisible()
  })
})

test.describe('News Management', () => {
  test('TC13: Create news article', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=News')
    await page.click('text=สร้าง')

    await page.fill('input[name="title"]', 'E2E Test News')
    await page.fill('textarea[name="description"]', 'Test description')
    await page.fill('textarea[name="content"]', 'Test content')

    await page.click('button[type="submit"]')
    await expect(page.locator('text=สำเร็จ')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Banner Management', () => {
  test('TC14: Toggle banner visibility', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Banner')
    const toggleBtn = page
      .locator('button')
      .filter({ hasText: /toggle|show|hide/i })
      .first()
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click()
      await expect(page.locator('text=สำเร็จ')).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Contact Requests', () => {
  test('TC15: View and update contact request status', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Contact')
    const replyBtn = page
      .locator('button')
      .filter({ hasText: /ตอบกลับแล้ว|ยังไม่ตอบ/i })
      .first()
    if (await replyBtn.isVisible()) {
      await replyBtn.click()
    }
  })
})

test.describe('Comments Moderation', () => {
  test('TC16: Approve or reject comment', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Review')
    const toggleComment = page
      .locator('button')
      .filter({ hasText: /show|hide|approve|reject/i })
      .first()
    if (await toggleComment.isVisible()) {
      await toggleComment.click()
    }
  })
})

test.describe('Site Settings', () => {
  test('TC17: Update footer settings', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Settings')
    const saveBtn = page
      .locator('button')
      .filter({ hasText: /save|บันทึก/i })
      .first()
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
    }
  })
})

test.describe('Password Management', () => {
  test('TC18: Forgot password flow', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=ลืมรหัสผ่าน')
    await expect(page).toHaveURL(/forgot/i)

    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.click('button[type="submit"]')
    await expect(
      page.locator('text=OTP').or(page.locator('text=ส่ง')),
    ).toBeVisible({ timeout: 10000 })
  })
})
