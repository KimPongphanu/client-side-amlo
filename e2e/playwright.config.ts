import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CONFIG_DIR = path.dirname(fileURLToPath(import.meta.url))

/**
 * โหลดตัวแปรจากไฟล์ .env แบบง่าย ๆ (ไม่เพิ่ม dependency)
 * ใช้เฉพาะ e2e/.env.local และ e2e/.env เท่านั้น
 */
const loadEnvFile = (file: string): void => {
  const full = path.resolve(CONFIG_DIR, file)
  if (!fs.existsSync(full)) return

  for (const rawLine of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  retries: 0,
  // 🌟 ระบบจำกัด session (SUPERVISOR = 1, ADMIN = 3) — รันแบบขนานจะชนกันเอง
  //    จึงบังคับให้รันทีละไฟล์ (worker เดียว)
  workers: 1,
  fullyParallel: false,
  globalSetup: './global-setup.ts',
  use: {
    // ชี้ไปที่ dev server (ค่าเริ่มต้น) หรือ prod/staging ผ่าน E2E_BASE_URL
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
