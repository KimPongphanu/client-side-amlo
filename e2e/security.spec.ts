import { expect, test } from '@playwright/test'
import { loginAsSupervisor } from './helpers/auth'

test.describe('2FA Setup', () => {
  test('TC19: หน้า 2FA setup โหลดได้', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.goto('/2fa-setup')
    await expect(
      page.getByRole('heading', { name: /2FA/ }).first(),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('User Management', () => {
  test('TC20: Supervisor เห็นรายชื่อผู้ใช้', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.click('text=จัดการสมาชิก')
    await expect(page.locator('table').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('TC21: dropdown กรองสิทธิ์ไม่มี "ผู้ใช้งานทั่วไป (User)"', async ({
    page,
  }) => {
    await loginAsSupervisor(page)

    await page.click('text=จัดการสมาชิก')
    const select = page.locator('select').first()
    await expect(select).toBeVisible({ timeout: 10000 })

    const labels = await select
      .locator('option')
      .evaluateAll((els) => els.map((e) => e.textContent?.trim() || ''))

    expect(labels.some((l) => l.includes('ผู้ใช้งานทั่วไป'))).toBe(false)
    expect(labels.some((l) => l.includes('Supervisor'))).toBe(true)
  })
})

test.describe('Audit Log', () => {
  test('TC22: Supervisor เห็น Audit Logs', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.click('text=Audit Logs')
    await expect(page.locator('table').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Supervisor Request', () => {
  test('TC23: Supervisor เข้าหน้าคำร้องได้', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.goto('/supervisor-requests')
    await expect(
      page.getByRole('button', { name: /รอฉันอนุมัติ/ }),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Backup Management', () => {
  test('TC24: Supervisor เห็นรายการ Backup', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.click('text=Backup')
    await expect(
      page.getByRole('heading', { name: /Backup|สำรอง/ }).first(),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Profile Management', () => {
  test('TC25: Supervisor เปิดหน้าข้อมูลส่วนตัวได้', async ({ page }) => {
    await loginAsSupervisor(page)

    await page.click('text=ข้อมูลส่วนตัว')
    await expect(
      page.getByRole('heading', { name: /ข้อมูลส่วนตัว/ }).first(),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Logout', () => {
  test('TC27: Logout แล้วกลับไปหน้า login', async ({ page }) => {
    await loginAsSupervisor(page)

    // ปุ่มออกจากระบบอยู่ใน dropdown โปรไฟล์ — ต้องเปิดก่อน
    await page.locator('header').getByText(/System Admin|SUPERVISOR/).first().click()
    await page.waitForTimeout(600)

    const logoutBtn = page.getByRole('button', { name: /ออกจากระบบ/ }).first()
    await expect(logoutBtn).toBeVisible({ timeout: 10000 })
    await logoutBtn.click({ force: true })

    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })
})
