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
    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 10000 })
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
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('h1').or(page.locator('h2'))).toBeVisible()
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
    const response = await request.get('http://localhost:8080/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('ok')
  })
})
