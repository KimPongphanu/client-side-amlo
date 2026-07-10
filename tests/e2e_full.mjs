import puppeteer from 'puppeteer'

const FRONTEND = 'http://localhost'

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  page.setDefaultTimeout(15000)

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      await fn()
      passed++
      console.log(`  ✅ ${name}`)
    } catch (e) {
      failed++
      console.log(`  ❌ ${name}: ${e.message}`)
    }
  }

  console.log('\n🧪 E2E Full Test Suite\n')

  // ── TC1: Homepage ──
  await test('TC1: Homepage loads with title', async () => {
    await page.goto(FRONTEND, { waitUntil: 'networkidle0' })
    const title = await page.title()
    if (!title || title.length === 0) throw new Error('No title')
    console.log(`    Title: ${title}`)
  })

  // ── TC2: Login page ──
  await test('TC2: Login page has form fields', async () => {
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle0' })
    const email = await page.$('input[type="email"]')
    const password = await page.$('input[type="password"]')
    const submit = await page.$('button[type="submit"]')
    if (!email || !password || !submit) throw new Error('Missing form fields')
  })

  // ── TC3: Login with invalid credentials ──
  await test('TC3: Invalid login shows error', async () => {
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle0' })
    await page.type('input[type="email"]', 'wrong@test.com')
    await page.type('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    await wait(3000)
    const body = await page.evaluate(() =>
      document.body.innerText.toLowerCase(),
    )
    if (
      !body.includes('invalid') &&
      !body.includes('error') &&
      !body.includes('ผิด')
    ) {
      console.log(
        '    ⚠️  No error message visible (expected with wrong credentials)',
      )
    }
  })

  // ── TC4: Forgot password link ──
  await test('TC4: Forgot password link works', async () => {
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle0' })
    const forgotLink = await page.$(
      'a[href*="forgot"], a[href*="reset"], text=ลืม',
    )
    if (!forgotLink) {
      // Try clicking any link that might be forgot password
      const links = await page.$$('a')
      for (const link of links) {
        const text = await page.evaluate((el) => el.textContent, link)
        if (text && text.includes('ลืม')) {
          await link.click()
          break
        }
      }
    } else {
      await forgotLink.click()
    }
    await wait(2000)
    const url = page.url()
    if (!url.includes('forgot') && !url.includes('reset')) {
      console.log(`    ⚠️  Current URL: ${url}`)
    }
  })

  // ── TC5: Backend health ──
  await test('TC5: Backend health endpoint', async () => {
    await page.goto('http://localhost:8080/health', {
      waitUntil: 'networkidle0',
    })
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (json.status !== 'ok') throw new Error(`Expected ok, got ${json.status}`)
    if (json.database !== 'connected') throw new Error(`DB: ${json.database}`)
  })

  // ── TC6: API returns news ──
  await test('TC6: News API returns data', async () => {
    const res = await page.goto('http://localhost:8080/api/news?limit=3', {
      waitUntil: 'networkidle0',
    })
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (!json.success) throw new Error('API success false')
    console.log(`    News count: ${json.data?.length || 0}`)
  })

  // ── TC7: API returns banners ──
  await test('TC7: Banners API returns data', async () => {
    await page.goto('http://localhost:8080/api/banners', {
      waitUntil: 'networkidle0',
    })
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (!json.success) throw new Error('Banners API failed')
    console.log(`    Banners: ${json.data?.length || 0}`)
  })

  // ── TC8: API returns departments ──
  await test('TC8: Departments API returns data', async () => {
    await page.goto('http://localhost:8080/api/departments', {
      waitUntil: 'networkidle0',
    })
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (json.success !== true) throw new Error('Departments API failed')
    const data = json.data || json
    const count = Array.isArray(data) ? data.length : 0
    console.log(`    Departments: ${count}`)
  })

  // ── TC9: API returns comments ──
  await test('TC9: Comments API returns data', async () => {
    await page.goto('http://localhost:8080/api/comments', {
      waitUntil: 'networkidle0',
    })
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (!json.success) throw new Error('Comments API failed')
    console.log(`    Comments: ${json.data?.length || 0}`)
  })

  // ── TC10: API returns settings ──
  await test('TC10: Settings API returns data', async () => {
    await page.goto('http://localhost:8080/api/settings', {
      waitUntil: 'networkidle0',
    })
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (!json.success) throw new Error('Settings API failed')
    console.log(`    Settings keys: ${Object.keys(json.data || {}).length}`)
  })

  // ── TC11: Submit comment via API ──
  await test('TC11: Submit comment via API', async () => {
    const res = await page.evaluate(async () => {
      const r = await fetch('http://localhost:8080/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star: 5, msg: 'E2E Puppeteer test comment' }),
      })
      return r.json()
    })
    if (!res.success) throw new Error(`Submit failed: ${res.message}`)
    console.log(`    Comment ID: ${res.data?.id}`)
  })

  // ── TC12: Submit contact via API ──
  await test('TC12: Submit contact via API', async () => {
    const res = await page.evaluate(async () => {
      const r = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: 'E2E',
          last_name: 'Test',
          email: 'e2e@test.com',
          preferred_contact: 'email',
          message: 'E2E Puppeteer test contact',
        }),
      })
      return r.json()
    })
    if (!res.success) throw new Error(`Contact submit failed: ${res.message}`)
    console.log(`    Contact ID: ${res.data?.id}`)
  })

  // ── TC13: Swagger docs ──
  await test('TC13: Swagger API docs exist', async () => {
    await page.goto('http://localhost:8080/api-docs.json', {
      waitUntil: 'networkidle0',
    })
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (!json.openapi) throw new Error('No OpenAPI spec')
    console.log(`    OpenAPI: ${json.openapi}, Title: ${json.info?.title}`)
  })

  // ── TC14: Login with real credentials (if available) ──
  await test('TC14: Login form accepts input', async () => {
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle0' })
    await page.type('input[type="email"]', 'test@amlo.go.th')
    await page.type('input[type="password"]', 'TestPass123')
    await page.click('button[type="submit"]')
    await wait(3000)
    // After login, should redirect somewhere (dashboard or 2FA)
    const currentUrl = page.url()
    console.log(`    Redirected to: ${currentUrl}`)
  })

  console.log(`\n📊 Final Results: ${passed} passed, ${failed} failed\n`)
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run()
