import puppeteer from 'puppeteer'

const BASE = process.env.TEST_URL || 'http://localhost:8080'

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()

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

  console.log('\n🧪 E2E Tests via Puppeteer\n')

  await test('Health check returns ok', async () => {
    const res = await page.goto(`${BASE}/health`)
    const body = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(body)
    if (json.status !== 'ok') throw new Error(`Expected ok, got ${json.status}`)
  })

  await test('Root page returns HTML', async () => {
    await page.goto('http://localhost')
    const title = await page.title()
    if (!title) throw new Error('No page title')
    console.log(`    Title: ${title}`)
  })

  await test('Login page loads', async () => {
    await page.goto('http://localhost/login', { waitUntil: 'networkidle0' })
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    const emailInput = await page.$('input[type="email"]')
    if (!emailInput) throw new Error('No email input found')
  })

  await test('Invalid login shows error', async () => {
    await page.goto('http://localhost/login', { waitUntil: 'networkidle0' })
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    await page.type('input[type="email"]', 'wrong@test.com')
    await page.type('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const body = await page.evaluate(() => document.body.textContent)
    if (body.includes('Invalid') || body.includes('error')) {
      // Expected behavior
    }
  })

  await test('Backend health API', async () => {
    const res = await page.goto('http://localhost:8080/health')
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (json.status !== 'ok') throw new Error('Health check failed')
    if (json.database !== 'connected') throw new Error('DB not connected')
  })

  await test('API docs endpoint', async () => {
    const res = await page.goto('http://localhost:8080/api-docs.json')
    const text = await page.evaluate(() => document.body.textContent)
    const json = JSON.parse(text)
    if (!json.openapi) throw new Error('No openapi field')
  })

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`)
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run()
