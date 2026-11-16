import { expect, test } from '@playwright/test'

const BASE = process.env.E2E_PROD_BASE_URL || 'http://localhost'

const PAGES = [
  '/',
  '/login',
  '/news',
  '/news/4',
  '/advertise',
  '/bookguide',
  '/contactform',
  '/commentform',
  '/about/history',
  '/path-that-does-not-exist',
]

const collectViolations = (page: import('@playwright/test').Page) => {
  const violations: string[] = []
  page.on('console', (message) => {
    if (message.text().includes('Content Security Policy')) {
      violations.push(`${page.url()} :: ${message.text().slice(0, 220)}`)
    }
  })
  return violations
}

const printViolations = (label: string, violations: string[]) => {
  console.log(`${label}_COUNT`, violations.length)
  violations.forEach((line, index) => console.log(`${label}_${index}`, line))
}

test('prod CSP (ของจริง): ทุกหน้าต้องไม่มี violation และไม่มี <style> ถูก inject', async ({
  page,
}) => {
  const violations = collectViolations(page)

  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`)
    await page.waitForTimeout(900)
  }

  const info = await page.evaluate(() => ({
    styleTags: document.querySelectorAll('style').length,
  }))

  console.log('PROD_STYLE_TAGS', info.styleTags)
  printViolations('PROD_VIOLATION', violations)

  expect(info.styleTags).toBe(0)
  expect(violations).toEqual([])
})

test('prod: เนื้อหาข่าวในฐานข้อมูลถูกตัด inline style ออกจริง', async ({
  page,
}) => {
  const violations = collectViolations(page)

  await page.goto(`${BASE}/news/4`)

  const container = page.locator('.ql-rendered')
  await expect(container).toBeVisible({ timeout: 25000 })

  const styleAttrs = await container.evaluate(
    (element) => element.querySelectorAll('[style]').length,
  )
  const sample = await container.evaluate((element) =>
    element.innerHTML.slice(0, 140),
  )

  console.log('PROD_ARTICLE_STYLE_ATTRS', styleAttrs)
  console.log('PROD_ARTICLE_HTML', JSON.stringify(sample))
  console.log('PROD_ARTICLE_VIOLATIONS', JSON.stringify(violations))

  expect(styleAttrs).toBe(0)
  expect(violations).toEqual([])
})

test('prod: CSS ของ SweetAlert2 มาจากไฟล์ stylesheet (ไม่ inject)', async ({
  page,
}) => {
  const violations = collectViolations(page)

  await page.goto(`${BASE}/login`)
  await page.waitForTimeout(1200)

  const info = await page.evaluate(() => {
    let swalRules = 0
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList | null = null
      try {
        rules = sheet.cssRules
      } catch {
        continue
      }
      for (const rule of Array.from(rules ?? [])) {
        if (rule.cssText.includes('.swal2-popup')) swalRules += 1
      }
    }
    return {
      styleTags: document.querySelectorAll('style').length,
      swalRules,
      sheets: document.styleSheets.length,
    }
  })

  console.log('PROD_SWAL_CSS', JSON.stringify(info))
  expect(info.styleTags).toBe(0)
  expect(info.swalRules).toBeGreaterThan(0)
  expect(violations).toEqual([])
})
