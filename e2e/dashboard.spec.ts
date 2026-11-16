import { expect, test } from '@playwright/test'
import { ADMIN_EMAIL, loginAsAdmin } from './helpers/auth'

test.describe('Dashboard Authentication', () => {
  test('TC10: Redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('TC11: Login as ADMIN shows dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  })

  test('TC12: ADMIN cannot see supervisor features', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.locator('text=Audit Logs')).not.toBeVisible()
    await expect(page.locator('text=Backup')).not.toBeVisible()
  })
})

test.describe('News Management', () => {
  test('TC13: เปิดหน้าจัดการกิจกรรมและประกาศ', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=กิจกรรมและประกาศ')
    await expect(page.locator('text=กิจกรรมและประกาศ').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Banner Management', () => {
  test('TC14: เปิดหน้าจัดการประชาสัมพันธ์', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=ประชาสัมพันธ์')
    await expect(page.locator('text=ประชาสัมพันธ์').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Contact Requests', () => {
  test('TC15: เปิดหน้าการติดต่อ', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=การติดต่อ')
    await expect(page.locator('text=การติดต่อ').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Comments Moderation', () => {
  test('TC16: เปิดหน้ารีวิว/ความคิดเห็น', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=รีวิว/ความคิดเห็น')
    await expect(page.locator('text=รีวิว').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Site Settings', () => {
  test('TC17: เปิดหน้าจัดการ Footer', async ({ page }) => {
    await loginAsAdmin(page)

    await page.click('text=จัดการ Footer')
    await expect(page.locator('text=ข้อมูลติดต่อ')).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Password Management', () => {
  test('TC18: Forgot password offers 2FA / Recovery Key (ไม่มี email OTP)', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.click('text=ลืมรหัสผ่าน')
    await expect(page).toHaveURL(/forgot/i)

    // พิมพ์ทีละตัวอักษรเพื่อให้ React รับ onChange (ปุ่ม "ถัดไป" จะ enabled)
    const emailInput = page.locator('#email')
    await emailInput.click()
    await emailInput.pressSequentially(ADMIN_EMAIL, { delay: 30 })
    await expect(emailInput).toHaveValue(ADMIN_EMAIL)

    const nextBtn = page.getByRole('button', { name: 'ถัดไป' })
    await expect(nextBtn).toBeEnabled({ timeout: 10000 })
    await nextBtn.click()

    // บัญชีที่เปิด 2FA → ต้องเห็นตัวเลือก 2FA และ Recovery Key (เจาะจงที่ปุ่ม)
    await expect(
      page.getByRole('button', { name: 'รหัส 2FA' }),
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByRole('button', { name: 'Recovery Key' }),
    ).toBeVisible()

    // ต้องไม่มีข้อความเกี่ยวกับการส่งรหัสทางอีเมลแล้ว
    const body = await page.locator('body').innerText()
    expect(body).not.toMatch(/ส่งรหัส.*อีเมล/)
  })
})
