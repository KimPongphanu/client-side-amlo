/**
 * =============================================================
 *  Puppeteer Automated Test — Login Flow
 *  ระบบ AMLO Internal Management
 * =============================================================
 *
 *  วิธีรัน:
 *    1. เปิด Dev Server ก่อน: npm run dev
 *    2. รัน test:    node tests/login.test.js
 *
 *  Test Cases ที่ครอบคลุม:
 *    TC-01  ไม่กรอกข้อมูล กด Login -> แสดง Error
 *    TC-02  กรอก Email อย่างเดียว ไม่กรอก Password -> แสดง Error
 *    TC-03  กรอก Email + Password ผิด -> แสดง Error
 *    TC-04  Login Admin (ไม่มี 2FA) -> เข้า Dashboard ได้
 *    TC-05  Login Supervisor (มี 2FA) -> ไปหน้า 2FA Challenge
 * =============================================================
 */

import puppeteer from 'puppeteer'

// ============================================================
//  CONFIG — แก้ตรงนี้ก่อนรัน
// ============================================================
const CONFIG = {
  baseUrl: 'http://localhost:5173',

  // Admin Account (ไม่มี 2FA)
  admin: {
    email: '***REMOVED***',        // ← แก้เป็น Email Admin จริง
    password: 'Test1234',  // ← แก้เป็น Password จริง
  },

  // Supervisor Account (มี 2FA)
  supervisor: {
    email: '***REMOVED***',        // ← แก้เป็น Email Supervisor จริง
    password: '***REMOVED***',  // ← แก้เป็น Password จริง
  },

  // Wrong credentials สำหรับ test กรณีผิด
  wrong: {
    email: 'wrong@amlo.go.th',
    password: 'wrongpassword123',
  },
}

// ============================================================
//  Utilities
// ============================================================

/** รอให้ Animation Login Page เสร็จ (มี zoom animation ~1.6 วิ) */
const waitForLoginPageReady = async (page) => {
  await page.waitForSelector('#email', { visible: true, timeout: 10000 })
  await new Promise((r) => setTimeout(r, 1800))
}

/**
 * ล้าง Session ทั้งหมดก่อนเริ่ม Test ใหม่
 * เพื่อป้องกัน Cookie/Token จาก Test ก่อนหน้าค้างอยู่
 * และทำให้ redirect ไปหน้าอื่นโดยอัตโนมัติ
 */
const clearSession = async (page) => {
  // ไปหน้าเปล่าก่อนเพื่อให้ clearCookies ทำงานได้
  await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' })
  // ล้าง Cookies ทั้งหมด
  const client = await page.createCDPSession()
  await client.send('Network.clearBrowserCookies')
  await client.send('Network.clearBrowserCache')
  // ล้าง localStorage และ sessionStorage
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/** Print ผลลัพธ์ของแต่ละ Test Case */
const logResult = (tcId, name, passed, detail = '') => {
  const icon = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`  ${icon}  [${tcId}] ${name}`)
  if (detail) console.log(`           → ${detail}`)
}

// ============================================================
//  Test Runner
// ============================================================
const runTests = async () => {
  console.log('\n======================================================')
  console.log('   🤖 AMLO — Puppeteer Login Test Suite')
  console.log('======================================================\n')

  const browser = await puppeteer.launch({
    headless: false,   // false = เปิด Browser ให้เห็นขณะรัน, true = รันแบบเงียบ
    slowMo: 60,        // ชะลอทุก action 60ms ให้ดูตามทัน
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox'],
  })

  let passed = 0
  let failed = 0

  // ============================================================
  //  TC-01: ไม่กรอกข้อมูลใดเลย แล้วกด Login
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await clearSession(page)
      await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' })
      await waitForLoginPageReady(page)

      // คลิกปุ่ม Submit โดยไม่กรอกอะไร
      await page.click('button[type="submit"]')
      await new Promise((r) => setTimeout(r, 800))

      const url = page.url()
      const errorEl = await page.$('p.text-red-500')
      const stillOnLogin = url.includes('/login')
      const hasError = errorEl !== null

      logResult(
        'TC-01', 'Submit ว่างเปล่า → ต้องแสดง Error',
        stillOnLogin && hasError,
        stillOnLogin && hasError
          ? 'ยังอยู่หน้า Login และมีข้อความ Error ถูกต้อง'
          : `URL: ${url}, hasError: ${hasError}`
      )
      stillOnLogin && hasError ? passed++ : failed++
    } catch (e) {
      logResult('TC-01', 'Submit ว่างเปล่า → ต้องแสดง Error', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-02: กรอก Email อย่างเดียว ไม่กรอก Password
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await clearSession(page)
      await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' })
      await waitForLoginPageReady(page)

      await page.type('#email', CONFIG.admin.email)
      // ไม่กรอก #password
      await page.click('button[type="submit"]')
      await new Promise((r) => setTimeout(r, 800))

      const url = page.url()
      const errorEl = await page.$('p.text-red-500')
      const stillOnLogin = url.includes('/login')
      const hasError = errorEl !== null

      logResult(
        'TC-02', 'กรอก Email อย่างเดียว → ต้องแสดง Error',
        stillOnLogin && hasError,
        stillOnLogin && hasError
          ? 'ยังอยู่หน้า Login และมีข้อความ Error ถูกต้อง'
          : `URL: ${url}, hasError: ${hasError}`
      )
      stillOnLogin && hasError ? passed++ : failed++
    } catch (e) {
      logResult('TC-02', 'กรอก Email อย่างเดียว → ต้องแสดง Error', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-03: กรอก Email + Password ผิด
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await clearSession(page)
      await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' })
      await waitForLoginPageReady(page)

      await page.type('#email', CONFIG.wrong.email)
      await page.type('#password', CONFIG.wrong.password)
      await page.click('button[type="submit"]')

      // รอ API + SweetAlert Error popup (ให้เวลาพอ)
      await new Promise((r) => setTimeout(r, 5000))

      const url = page.url()
      const stillOnLogin = url.includes('/login')

      logResult(
        'TC-03', 'Email+Password ผิด → ต้องอยู่หน้า Login',
        stillOnLogin,
        stillOnLogin ? 'ยังอยู่หน้า Login ถูกต้อง' : `เปลี่ยนไปที่ URL: ${url}`
      )
      stillOnLogin ? passed++ : failed++
    } catch (e) {
      logResult('TC-03', 'Email+Password ผิด → ต้องอยู่หน้า Login', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-04: Login Admin (ไม่มี 2FA) → ควรไปที่ /dashboard
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await clearSession(page)
      await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' })
      await waitForLoginPageReady(page)

      await page.type('#email', CONFIG.admin.email)
      await page.type('#password', CONFIG.admin.password)
      await page.click('button[type="submit"]')

      // รอ API + SweetAlert Success + Redirect
      await new Promise((r) => setTimeout(r, 6000))

      const url = page.url()
      const onDashboard = url.includes('/dashboard')

      logResult(
        'TC-04', 'Login Admin (ไม่มี 2FA) → ควรเข้า Dashboard',
        onDashboard,
        onDashboard ? `เข้า Dashboard สำเร็จ: ${url}` : `ยังอยู่ที่: ${url}`
      )
      onDashboard ? passed++ : failed++
    } catch (e) {
      logResult('TC-04', 'Login Admin (ไม่มี 2FA) → ควรเข้า Dashboard', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-05: Login Supervisor (มี 2FA) → ควรไปที่ /2fa-challenge
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await clearSession(page)
      await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' })
      await waitForLoginPageReady(page)

      await page.type('#email', CONFIG.supervisor.email)
      await page.type('#password', CONFIG.supervisor.password)
      await page.click('button[type="submit"]')

      // รอ API Response + Redirect ไปหน้า 2FA
      await new Promise((r) => setTimeout(r, 5000))

      const url = page.url()
      const on2FA = url.includes('/2fa-challenge')

      logResult(
        'TC-05', 'Login Supervisor (มี 2FA) → ควรไปหน้า 2FA Challenge',
        on2FA,
        on2FA ? `ไปหน้า 2FA Challenge สำเร็จ: ${url}` : `ยังอยู่ที่: ${url}`
      )
      on2FA ? passed++ : failed++
    } catch (e) {
      logResult('TC-05', 'Login Supervisor (มี 2FA) → ควรไปหน้า 2FA Challenge', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  Summary
  // ============================================================
  await browser.close()

  const total = passed + failed
  console.log('\n======================================================')
  console.log(`   📊 ผลการทดสอบ: ${passed}/${total} ผ่าน`)
  console.log(`   ✅ Passed: ${passed}   ❌ Failed: ${failed}`)
  console.log('======================================================\n')

  if (failed > 0) process.exit(1)
}

runTests().catch((err) => {
  console.error('❌ Test runner crashed:', err)
  process.exit(1)
})
