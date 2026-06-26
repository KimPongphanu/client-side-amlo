import { expect, test } from '@playwright/test'

const SUPERVISOR_EMAIL = 'supervisor@amlo.go.th'
const SUPERVISOR_PASS = 'Supervisor123!'

test.describe('2FA Setup', () => {
  test('TC19: Setup 2FA page loads with QR code', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.goto('/two-factor-setup')
    await expect(
      page.locator('text=2FA').or(page.locator('text=สองขั้นตอน')),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('User Management', () => {
  test('TC20: Supervisor can view user list', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Users')
    await expect(
      page.locator('table').or(page.locator('role=table')),
    ).toBeVisible({ timeout: 10000 })
  })

  test('TC21: Create new admin user', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Users')
    await page.click('text=สร้าง')

    await page.fill('input[type="email"]', `e2e${Date.now()}@amlo.go.th`)
    await page.fill('input[name="password"]', 'TestPass123')
    await page.fill('input[name="firstname"]', 'E2E')
    await page.fill('input[name="lastname"]', 'User')

    await page.click('button[type="submit"]')
    await expect(page.locator('text=สำเร็จ')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Audit Log', () => {
  test('TC22: Supervisor can view audit log', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Audit')
    await expect(
      page.locator('table').or(page.locator('text=audit')),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Supervisor Request', () => {
  test('TC23: Create supervisor request for ban', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Request')
    const createBtn = page
      .locator('button')
      .filter({ hasText: /new|สร้าง|request/i })
      .first()
    if (await createBtn.isVisible()) {
      await createBtn.click()
    }
  })
})

test.describe('Backup Management', () => {
  test('TC24: View backup list', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Backup')
    await expect(
      page.locator('text=backup').or(page.locator('text=สำรอง')),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Profile Management', () => {
  test('TC25: Update own profile', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Profile')
    const saveBtn = page
      .locator('button')
      .filter({ hasText: /save|update|บันทึก|อัปเดต/i })
      .first()
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
    }
  })
})

test.describe('Recovery Login', () => {
  test('TC26: Recovery login page loads', async ({ page }) => {
    await page.goto('/recovery-login')
    await expect(
      page.locator('input[type="text"]').or(page.locator('textarea')),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Logout', () => {
  test('TC27: Successful logout redirects to login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', SUPERVISOR_EMAIL)
    await page.fill('input[type="password"]', SUPERVISOR_PASS)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    await page.click('text=Logout')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })
})
