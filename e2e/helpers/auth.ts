// e2e/helpers/auth.ts
// Helper กลางสำหรับ login ใน E2E — credential มาจาก env, รองรับ 2FA (TOTP)
//
// ⚠️ ไม่ hardcode รหัสผ่านในไฟล์เทสต์ เพราะจะค้างเมื่อรหัสถูกเปลี่ยน
//    ตั้งค่าใน e2e/.env.local (ดู e2e/.env.example) หรือ CI secrets:
//      E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD / E2E_ADMIN_TOTP_SECRET
//      E2E_SUPERVISOR_EMAIL / E2E_SUPERVISOR_PASSWORD / E2E_SUPERVISOR_TOTP_SECRET
import { expect, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import crypto from 'node:crypto'

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@amlo.go.th'
export const ADMIN_PASS = process.env.E2E_ADMIN_PASSWORD || 'Admin123!'
export const ADMIN_TOTP = process.env.E2E_ADMIN_TOTP_SECRET || ''

export const SUPERVISOR_EMAIL =
  process.env.E2E_SUPERVISOR_EMAIL || 'supervisor@amlo.go.th'
export const SUPERVISOR_PASS =
  process.env.E2E_SUPERVISOR_PASSWORD || 'Supervisor123!'
export const SUPERVISOR_TOTP = process.env.E2E_SUPERVISOR_TOTP_SECRET || ''

/**
 * ล้าง session ทั้งหมดใน DB ก่อนเทสต์แต่ละตัว — ระบบจำกัด session
 * (SUPERVISOR = 1, ADMIN = 3) การ login ซ้ำในเทสต์จะชน limit ถ้าไม่ล้าง
 * เปิดใช้ด้วย E2E_RESET_SESSIONS=true (ไม่ควรเปิดกับ production)
 */
export const resetSessions = (): void => {
  if (process.env.E2E_RESET_SESSIONS !== 'true') return

  const container = process.env.E2E_DB_CONTAINER || 'amlo-db'
  try {
    execFileSync(
      'docker',
      [
        'exec',
        container,
        'psql',
        '-U',
        'postgres',
        '-d',
        'backend_amlo',
        '-c',
        'DELETE FROM "Session"',
      ],
      { stdio: 'pipe' },
    )
  } catch {
    // ถ้าล้างไม่ได้ (เช่น CI ที่ไม่มี docker) ให้เทสต์เดินต่อ
  }
}

/** คำนวณ TOTP 6 หลักจาก base32 secret (RFC 6238) — ไม่ต้องพึ่ง dependency */
export const generateTotp = (secret: string, timeMs = Date.now()): string => {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = secret.replace(/=+$/, '').replace(/\s/g, '').toUpperCase()

  let bits = ''
  for (const ch of clean) {
    const idx = base32Chars.indexOf(ch)
    if (idx === -1) continue
    bits += idx.toString(2).padStart(5, '0')
  }

  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2))
  }

  const counter = Math.floor(timeMs / 1000 / 30)
  const buf = Buffer.alloc(8)
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  buf.writeUInt32BE(counter >>> 0, 4)

  const hmac = crypto
    .createHmac('sha1', Buffer.from(bytes))
    .update(buf)
    .digest()

  const offset = hmac[hmac.length - 1] & 0x0f
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      (hmac[offset + 1] << 16) |
      (hmac[offset + 2] << 8) |
      hmac[offset + 3]) %
    1_000_000

  return String(code).padStart(6, '0')
}

/** เติม OTP ลงช่อง 6 ช่อง (รองรับทั้ง maxlength และ inputmode) */
const fillOtp = async (page: Page, code: string): Promise<void> => {
  // OtpInput ของโปรเจกต์เป็น input 6 ช่อง (inputMode numeric, 1 หลักต่อช่อง)
  let boxes = page.locator('input[maxlength="1"]')
  if ((await boxes.count()) < code.length) {
    boxes = page.locator('input[inputmode="numeric"]')
  }

  const count = await boxes.count()

  if (count < code.length) {
    // fallback: ช่องเดียวกรอกทั้งรหัส
    await page.locator('input[inputmode="numeric"]').first().fill(code)
    return
  }

  for (let i = 0; i < code.length; i++) {
    await boxes.nth(i).fill('')
  }
  for (let i = 0; i < code.length; i++) {
    await boxes.nth(i).fill(code[i])
  }
}

/** login แล้วยืนยันตัวตนด้วย 2FA ถ้าระบบถาม (คืน URL สุดท้าย) */
export const loginAs = async (
  page: Page,
  email: string,
  password: string,
  totpSecret = '',
): Promise<string> => {
  resetSessions()

  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForLoadState('networkidle')

  if (page.url().includes('2fa-challenge')) {
    if (!totpSecret) {
      throw new Error(
        `ระบบถาม 2FA สำหรับ ${email} แต่ไม่ได้ตั้ง *_TOTP_SECRET — ตั้งค่าใน e2e/.env.local`,
      )
    }
    await fillOtp(page, generateTotp(totpSecret))

    // หน้านี้ไม่ auto-submit — ต้องกดปุ่ม "ยืนยัน" เองหลังกรอกครบ
    // ⚠️ ปุ่มจะเป็น disabled ระหว่างยืนยัน จึงต้อง force click
    const submitBtn = page
      .getByRole('button', { name: /ยืนยัน|Verify|Submit/i })
      .first()
    if (await submitBtn.count()) {
      await submitBtn.click({ force: true }).catch(() => {})
    }

    // รอจนหลุดจากหน้า 2fa-challenge (สำเร็จ → dashboard)
    // ใช้ waitForURL แบบรอ "ไม่ใช่" 2fa-challenge เพื่อไม่ให้จับผลลัพธ์เร็วเกินไป
    await page
      .waitForURL((url) => !url.pathname.includes('2fa-challenge'), {
        timeout: 20000,
      })
      .catch(() => {})
    await page.waitForLoadState('networkidle').catch(() => {})
  }

  return page.url()
}

/** login แบบ ADMIN แล้วยืนยันว่าเข้าถึง dashboard ได้ */
export const loginAsAdmin = async (page: Page): Promise<void> => {
  const url = await loginAs(page, ADMIN_EMAIL, ADMIN_PASS, ADMIN_TOTP)
  expect(url).toMatch(/dashboard/)
}

/** login แบบ SUPERVISOR แล้วยืนยันว่าเข้าถึง dashboard ได้ */
export const loginAsSupervisor = async (page: Page): Promise<void> => {
  const url = await loginAs(
    page,
    SUPERVISOR_EMAIL,
    SUPERVISOR_PASS,
    SUPERVISOR_TOTP,
  )
  expect(url).toMatch(/dashboard/)
}

