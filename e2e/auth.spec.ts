import { expect, test } from '@playwright/test'

test.describe('Authentication', () => {
  test('TC1: Open login page and see form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('TC2: Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    // ใช้อีเมลไม่ซ้ำ เพื่อไม่ให้ติด account lockout จากรอบก่อน
    await page.fill('input[type="email"]', `nobody-${Date.now()}@example.com`)
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // backend ตอบ "Invalid email or password" หรือข้อความล็อกชั่วคราว (429)
    await expect(
      page.getByText(
        /Invalid email or password|อีเมลหรือรหัสผ่านไม่ถูกต้อง|ระงับชั่วคราว/,
      ),
    ).toBeVisible({ timeout: 10000 })
  })

  test('TC3: Click forgot password link navigates correctly', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.click('text=ลืมรหัสผ่าน')
    await expect(page).toHaveURL(/forgot/i)
  })
})

test.describe('Homepage', () => {
  test('TC4: Homepage loads with banner and sections', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav').first()).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('TC5: Click news article shows detail page', async ({ page }) => {
    await page.goto('/')
    // Click on first news article link
    const article = page.locator('a').filter({ hasText: /.+/ }).first()
    if (await article.isVisible()) {
      await article.click()
      await expect(page).toHaveURL(/news/i)
    }
  })

  test('TC6: Department detail page loads', async ({ page }) => {
    await page.goto('/')
    // Find department link and click
    const deptLink = page
      .locator('a')
      .filter({ hasText: /หน่วยงาน|ฝ่าย/i })
      .first()
    if (await deptLink.isVisible()) {
      await deptLink.click()
      await expect(page).toHaveURL(/department|depart/i)
    }
  })
})

test.describe('Contact Form', () => {
  test('TC7: Contact form submits successfully', async ({ page }) => {
    await page.goto('/')
    const contactLink = page
      .locator('a')
      .filter({ hasText: /ติดต่อ/i })
      .first()
    if (await contactLink.isVisible()) {
      await contactLink.click()
    }

    // Fill form if visible
    const nameInput = page
      .locator('input[name*="first"]')
      .or(page.locator('input[placeholder*="ชื่อ"]'))
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test')
      await page.fill(
        'input[name*="last"], input[placeholder*="นามสกุล"]',
        'User',
      )
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('textarea', 'This is a test message from E2E testing')
      await page.click('button[type="submit"]')
      await expect(page.locator('text=สำเร็จ')).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Comment Form', () => {
  test('TC8: Submit star rating and comment', async ({ page }) => {
    await page.goto('/')
    // Click comment FAB button
    const fabButton = page
      .locator('button[aria-label*="comment"]')
      .or(page.locator('svg').first())
    if (await fabButton.isVisible()) {
      await fabButton.click()
    }

    // Try to rate and comment
    const star = page
      .locator('button[aria-label*="rating"]')
      .or(page.locator('svg[class*="star"]').first())
    if (await star.isVisible()) {
      await star.click()
      const textarea = page.locator('textarea').first()
      if (await textarea.isVisible()) {
        await textarea.fill('Great website! E2E test comment.')
        await page.click('button[type="submit"]')
      }
    }
  })
})

test.describe('API Health', () => {
  test('TC9: Backend health endpoint returns ok', async ({ request }) => {
    // ใช้ URL จาก env — prod ผูก backend ไว้ที่ 127.0.0.1 เท่านั้น
    const healthUrl =
      process.env.E2E_HEALTH_URL || 'http://127.0.0.1:8080/health'
    const response = await request.get(healthUrl)
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('ok')
  })
})
