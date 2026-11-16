// e2e/global-setup.ts
// ล้าง session ค้างก่อนเริ่มเทสต์ — ระบบจำกัด session ต่อบัญชี
// (SUPERVISOR = 1, ADMIN = 3) ถ้า session ค้างจากรอบก่อน เทสต์จะชน limit
//
// ใช้ DATABASE_URL ที่ชี้ไปยัง DB ของ environment ที่ทดสอบ (ไม่ใช่ production)
import { execFileSync } from 'node:child_process'

const E2E_RESET_SESSIONS = process.env.E2E_RESET_SESSIONS === 'true'

export default async function globalSetup(): Promise<void> {
  if (!E2E_RESET_SESSIONS) {
    console.log(
      '[e2e] ข้ามการล้าง session (ตั้ง E2E_RESET_SESSIONS=true เพื่อเปิด)',
    )
    return
  }

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
    console.log('[e2e] ล้าง session ทั้งหมดแล้ว')
  } catch (err) {
    console.warn(
      '[e2e] ล้าง session ไม่สำเร็จ (ข้ามไป):',
      err instanceof Error ? err.message : err,
    )
  }
}
