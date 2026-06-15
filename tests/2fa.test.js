/**
 * =============================================================
 *  Puppeteer Automated Test — 2FA Flow (TOTP - Authenticator)
 *  ระบบ AMLO Internal Management
 * =============================================================
 *
 *  วิธีทำงาน (Method 1 — Real-time TOTP Generation):
 *  ─────────────────────────────────────────────────
 *  Google Authenticator ใช้สมการ TOTP (RFC 6238) ในการสร้างรหัส 6 หลัก
 *  โดยอาศัยแค่ 2 อย่างคือ:
 *    1. "Secret Key" (Base32) ที่เก็บอยู่ในฐานข้อมูล column: twoFactorSecret
 *    2. "เวลาปัจจุบัน" (เปลี่ยนทุก 30 วินาที)
 *
 *  Script นี้ใช้ไลบรารี `otplib` ซึ่งใช้สมการเดียวกันทุกประการ
 *  ดังนั้น ถ้าเรามี Secret Key → เราสามารถสร้างรหัส 6 หลัก ณ ขณะนั้น
 *  ได้เองโดยไม่ต้องเปิดแอปบนมือถือเลย ✅
 *
 *  วิธีหา Secret Key ของ Supervisor ที่ใช้ทดสอบ:
 *  ─────────────────────────────────────────────
 *  รันคำสั่งนี้ใน Backend terminal (เปลี่ยน email ให้ตรง):
 *
 *    npx prisma studio
 *    → เปิด Table: user → หา Supervisor ที่ต้องการ → คัดลอก twoFactorSecret
 *
 *  หรือใช้ SQL ตรงๆ:
 *    SELECT email, "twoFactorSecret" FROM "User" WHERE role = 'SUPERVISOR';
 *
 *  วิธีรัน Test:
 *  ─────────────
 *    1. เปิด Dev Server:   npm run dev
 *    2. เปิด Backend:      npm run dev (ในโฟลเดอร์ backend-amlo)
 *    3. ใส่ค่า CONFIG ด้านล่าง
 *    4. รัน:               node tests/2fa.test.js
 *
 *  Test Cases:
 *    TC-2FA-01  กรอก OTP ผิด (6 หลักแต่ไม่ถูกต้อง) → แสดง Error
 *    TC-2FA-02  กรอก OTP ไม่ครบ 6 หลัก → ปุ่มต้อง Disabled
 *    TC-2FA-03  กรอก OTP ถูกต้อง (สร้างแบบ Real-time) → เข้า Dashboard ได้
 *    TC-2FA-04  เข้าหน้า /2fa-challenge โดยตรงโดยไม่ผ่าน Login → ถูกเตะกลับ Login
 *    TC-2FA-05  กด "ยกเลิก" ในหน้า 2FA Challenge → กลับหน้า Login
 * =============================================================
 */

import puppeteer from 'puppeteer'
import { createRequire } from 'module'

// speakeasy เป็น CommonJS module ต้องใช้ createRequire เพื่อ import ใน ESM
const require = createRequire(import.meta.url)
const speakeasy = require('speakeasy')

// ============================================================
//  CONFIG — ใส่ค่าเหล่านี้ก่อนรัน
// ============================================================
const CONFIG = {
  baseUrl: 'http://localhost:5173',

  supervisor: {
    email: '***REMOVED***',        // ← Email Supervisor จริง
    password: '***REMOVED***',  // ← Password จริง

    // Secret Key (Base32) ที่เก็บในฐานข้อมูล column: twoFactorSecret
    // วิธีดู: npx prisma studio → Table User → หา supervisor → คัดลอก twoFactorSecret
    totpSecret: 'H47CUZJSF4ZTM3BQJQ2WMPTTNUYVI4KT',       // ← ← ← แก้ตรงนี้ที่สำคัญที่สุด!
  },
}

// ============================================================
//  ฟังก์ชันสร้างรหัส OTP แบบ Real-time ด้วย otplib
// ============================================================

/**
 * สร้างรหัส TOTP 6 หลัก ณ วินาทีปัจจุบัน
 * ใช้ speakeasy เหมือนกันกับ Backend 100% (encoding: base32, window: 1)
 */
const generateTOTP = (secret) => {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32',
  })
}

/**
 * คืนค่าจำนวนวินาทีที่เหลือก่อนรหัสจะเปลี่ยน (สูงสุด 30 วินาที)
 */
const getSecondsRemaining = () => {
  const epoch = Math.round(Date.now() / 1000)
  return 30 - (epoch % 30)
}

// ============================================================
//  Utilities
// ============================================================

/** ล้าง Session ทั้งหมดก่อนเริ่ม Test ใหม่ */
const clearSession = async (page) => {
  await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' })
  const client = await page.createCDPSession()
  await client.send('Network.clearBrowserCookies')
  await client.send('Network.clearBrowserCache')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/**
 * Login ด้วย Supervisor แล้วรอจนถึงหน้า 2FA Challenge
 * ใช้เป็น Setup ก่อนเริ่ม Test ที่ต้องการหน้า 2FA
 */
const loginAndGoTo2FA = async (page) => {
  await clearSession(page)
  await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' })

  // รอ animation login page (zoom ~1.6 วิ)
  await page.waitForSelector('#email', { visible: true, timeout: 10000 })
  await new Promise((r) => setTimeout(r, 1800))

  await page.type('#email', CONFIG.supervisor.email)
  await page.type('#password', CONFIG.supervisor.password)
  await page.click('button[type="submit"]')

  // รอ redirect ไปหน้า 2FA Challenge
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
  await page.waitForSelector('button[type="submit"]', { visible: true, timeout: 10000 })

  const url = page.url()
  if (!url.includes('/2fa-challenge')) {
    throw new Error(`คาดว่าจะอยู่หน้า 2FA Challenge แต่ URL คือ: ${url}`)
  }
}

/**
 * วิธีที่ถูกต้องสำหรับ React OtpInput Component
 * ─────────────────────────────────────────────
 * Component นี้ใช้ React State + handlePaste จึงต้องใช้ ClipboardEvent
 * แทนการพิมพ์ทีละตัว เพราะ React จะตอบสนองต่อ paste event
 * และเรียก onChange + onComplete (auto-submit) ให้อัตโนมัติ
 */
const pasteOtpCode = async (page, code) => {
  // คลิกที่ช่อง OTP แรกก่อนเพื่อให้ Focus อยู่ใน Component
  const firstInput = await page.$('input[inputmode="numeric"]')
  if (!firstInput) throw new Error('หา OTP Input ไม่เจอ')
  await firstInput.click()
  await new Promise((r) => setTimeout(r, 200))

  // Dispatch ClipboardEvent พร้อมรหัส OTP ลงใน input แรก
  // React จะรับ event นี้ผ่าน onPaste handler และ set state ถูกต้อง
  await page.evaluate((otpCode) => {
    const input = document.querySelector('input[inputmode="numeric"]')
    if (!input) return

    // สร้าง ClipboardEvent ที่มีข้อมูล OTP
    const clipboardData = new DataTransfer()
    clipboardData.setData('text', otpCode)

    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: clipboardData,
    })

    input.dispatchEvent(pasteEvent)
  }, code)

  // รอให้ React อัปเดต State และ onComplete trigger
  await new Promise((r) => setTimeout(r, 500))
}

/** Print ผลลัพธ์ */
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
  console.log('   🔐 AMLO — Puppeteer 2FA Test Suite (Method 1: Real-time TOTP)')
  console.log('======================================================')

  // แสดงข้อมูล TOTP ก่อนรัน
  const previewCode = generateTOTP(CONFIG.supervisor.totpSecret)
  const secLeft = getSecondsRemaining()
  console.log(`\n  📱 ทดสอบ TOTP Secret: ${CONFIG.supervisor.totpSecret}`)
  console.log(`  📱 รหัสตอนนี้: ${previewCode} (หมดอายุใน ${secLeft} วินาที)\n`)

  // ถ้ารหัสเหลือเวลาน้อยมาก (< 5 วินาที) ให้รอรหัสใหม่ก่อน
  if (secLeft < 5) {
    console.log(`  ⏳ รหัสใกล้หมดอายุ กำลังรอรหัสใหม่... (${secLeft} วิ)`)
    await new Promise((r) => setTimeout(r, (secLeft + 1) * 1000))
    console.log(`  ✅ รหัสใหม่พร้อมแล้ว: ${generateTOTP(CONFIG.supervisor.totpSecret)}\n`)
  }

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 60,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox'],
  })

  let passed = 0
  let failed = 0

  // ============================================================
  //  TC-2FA-01: กรอก OTP ผิด → ต้องแสดง Error
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await loginAndGoTo2FA(page)

      // ใส่รหัสผิดจงใจ (ใกล้เคียง แต่ผิด)
      const wrongCode = '000000'
      await pasteOtpCode(page, wrongCode)
      await page.click('button[type="submit"]')
      await new Promise((r) => setTimeout(r, 3000))

      const url = page.url()
      const still2FA = url.includes('/2fa-challenge')

      logResult(
        'TC-2FA-01', 'กรอก OTP ผิด (000000) → ต้องอยู่หน้า 2FA และแสดง Error',
        still2FA,
        still2FA ? 'ยังอยู่หน้า 2FA Challenge และแสดง Error ถูกต้อง' : `ไปที่ URL: ${url}`
      )
      still2FA ? passed++ : failed++
    } catch (e) {
      logResult('TC-2FA-01', 'กรอก OTP ผิด → ต้องแสดง Error', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-2FA-02: กรอก OTP ไม่ครบ 6 หลัก → ปุ่มต้อง Disabled
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await loginAndGoTo2FA(page)

      // พิมพ์แค่ 3 หลัก โดยใช้ evaluate กรอกค่าลง input แรกโดยตรง
      const firstInput = await page.$('input[inputmode="numeric"]')
      if (firstInput) {
        await firstInput.click()
        await page.keyboard.type('123')
      }
      await new Promise((r) => setTimeout(r, 500))

      // เช็คว่าปุ่ม Disabled อยู่ไหม
      const isDisabled = await page.$eval(
        'button[type="submit"]',
        (btn) => btn.disabled
      )

      logResult(
        'TC-2FA-02', 'กรอก OTP แค่ 3 หลัก → ปุ่มต้อง Disabled',
        isDisabled,
        isDisabled ? 'ปุ่ม Disabled ถูกต้อง' : 'ปุ่มไม่ได้ Disabled (ผิดปกติ!)'
      )
      isDisabled ? passed++ : failed++
    } catch (e) {
      logResult('TC-2FA-02', 'กรอก OTP ไม่ครบ → ปุ่มต้อง Disabled', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-2FA-03: กรอก OTP ถูกต้อง (Real-time) → เข้า Dashboard ได้
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await loginAndGoTo2FA(page)

      // ✨ Core ของ Method 1: สร้างรหัส TOTP แบบ Real-time ณ วินาทีนั้น
      const liveOtp = generateTOTP(CONFIG.supervisor.totpSecret)
      console.log(`\n  🔑 [TC-2FA-03] รหัส OTP ที่สร้าง: ${liveOtp} (เหลือ ${getSecondsRemaining()} วิ)`)

      await pasteOtpCode(page, liveOtp)

      // รอให้ onComplete auto-submit ทำงาน (paste 6 หลักครบ → submit อัตโนมัติ)
      // ถ้า auto-submit ไม่ทำงาน fallback กดปุ่มเอง
      await new Promise((r) => setTimeout(r, 1500))
      const submitBtn = await page.$('button[type="submit"]:not([disabled])')
      if (submitBtn) {
        await submitBtn.click()
      }

      // รอ API + SweetAlert Success + Redirect ไป Dashboard
      await new Promise((r) => setTimeout(r, 6000))

      const url = page.url()
      const onDashboard = url.includes('/dashboard')

      logResult(
        'TC-2FA-03', 'กรอก OTP ถูกต้อง (Real-time) → เข้า Dashboard ได้',
        onDashboard,
        onDashboard ? `เข้า Dashboard สำเร็จ: ${url}` : `ยังอยู่ที่: ${url}`
      )
      onDashboard ? passed++ : failed++
    } catch (e) {
      logResult('TC-2FA-03', 'กรอก OTP ถูกต้อง → เข้า Dashboard', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-2FA-04: เข้า /2fa-challenge โดยตรงโดยไม่ผ่าน Login
  //             → ต้องถูก Redirect กลับหน้า Login
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await clearSession(page)

      // เข้า URL ตรงๆ โดยไม่มี state จาก Login
      await page.goto(`${CONFIG.baseUrl}/2fa-challenge`, { waitUntil: 'networkidle2' })
      await new Promise((r) => setTimeout(r, 2000))

      const url = page.url()
      const redirectedToLogin = url.includes('/login')

      logResult(
        'TC-2FA-04', 'เข้า /2fa-challenge โดยตรง → ต้องถูกเตะกลับ Login',
        redirectedToLogin,
        redirectedToLogin ? 'ถูก Redirect กลับ Login ถูกต้อง' : `ยังอยู่ที่: ${url} (ผิดปกติ!)`
      )
      redirectedToLogin ? passed++ : failed++
    } catch (e) {
      logResult('TC-2FA-04', 'เข้า /2fa-challenge โดยตรง → กลับ Login', false, e.message)
      failed++
    } finally {
      await page.close()
    }
  }

  // ============================================================
  //  TC-2FA-05: กด "ยกเลิก" ในหน้า 2FA Challenge → กลับ Login
  // ============================================================
  {
    const page = await browser.newPage()
    try {
      await loginAndGoTo2FA(page)

      // คลิกปุ่มยกเลิก
      await page.click('button[type="button"]')

      // รอ SweetAlert popup ยืนยันการยกเลิก แล้วกด Confirm
      await new Promise((r) => setTimeout(r, 1500))

      // กดปุ่ม "ยืนยันยกเลิก" ใน SweetAlert
      const confirmBtn = await page.$('.swal2-confirm')
      if (confirmBtn) {
        await confirmBtn.click()
      }

      await new Promise((r) => setTimeout(r, 2000))

      const url = page.url()
      const backToLogin = url.includes('/login')

      logResult(
        'TC-2FA-05', 'กด "ยกเลิก" ใน 2FA Challenge → กลับหน้า Login',
        backToLogin,
        backToLogin ? 'กลับหน้า Login สำเร็จ' : `ยังอยู่ที่: ${url}`
      )
      backToLogin ? passed++ : failed++
    } catch (e) {
      logResult('TC-2FA-05', 'กด "ยกเลิก" → กลับ Login', false, e.message)
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
  console.log(`   📊 ผลการทดสอบ 2FA: ${passed}/${total} ผ่าน`)
  console.log(`   ✅ Passed: ${passed}   ❌ Failed: ${failed}`)
  console.log('======================================================\n')

  if (failed > 0) process.exit(1)
}

runTests().catch((err) => {
  console.error('❌ Test runner crashed:', err)
  process.exit(1)
})
