import { expect, test } from '@playwright/test'
import {
  SPLASH_STORAGE_PREFIX,
  getLocalDayKey,
  getSplashSeenKey,
  hasSeenSplashToday,
  markSplashSeen,
} from '../src/utils/splashPopup'

class MemoryStorage implements Storage {
  private data = new Map<string, string>()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

const localDate = (year: number, month: number, day: number, hour = 12) =>
  new Date(year, month - 1, day, hour)

test.describe('splash popup — day key', () => {
  test('คำนวณวันตามเวลาท้องถิ่น ไม่ใช่ UTC', () => {
    const earlyMorning = localDate(2026, 1, 1, 0)

    expect(getLocalDayKey(earlyMorning)).toBe('2026-01-01')

    if (earlyMorning.getTimezoneOffset() !== 0) {
      expect(getLocalDayKey(earlyMorning)).not.toBe(
        earlyMorning.toISOString().slice(0, 10),
      )
    }
  })

  test('เติมศูนย์หน้าเดือนและวัน', () => {
    expect(getLocalDayKey(localDate(2026, 3, 5))).toBe('2026-03-05')
    expect(getLocalDayKey(localDate(2026, 11, 30))).toBe('2026-11-30')
  })

  test('key ขึ้นต้นด้วย prefix ที่กำหนด', () => {
    expect(getSplashSeenKey(localDate(2026, 9, 22))).toBe(
      `${SPLASH_STORAGE_PREFIX}2026-09-22`,
    )
  })
})

test.describe('splash popup — seen flag', () => {
  test('เข้าเว็บครั้งแรกของวัน → ยังไม่เคยเห็น', () => {
    const storage = new MemoryStorage()

    expect(hasSeenSplashToday(storage, localDate(2026, 9, 22, 8))).toBe(false)
  })

  test('กดปิดแล้ววันเดียวกัน → ไม่แสดงอีก', () => {
    const storage = new MemoryStorage()
    const morning = localDate(2026, 9, 22, 8)
    const evening = localDate(2026, 9, 22, 21)

    markSplashSeen(storage, morning)

    expect(hasSeenSplashToday(storage, morning)).toBe(true)
    expect(hasSeenSplashToday(storage, evening)).toBe(true)
  })

  test('ข้ามเที่ยงคืน → ต้องแสดงอีกครั้ง', () => {
    const storage = new MemoryStorage()

    markSplashSeen(storage, localDate(2026, 9, 22, 23))

    expect(hasSeenSplashToday(storage, localDate(2026, 9, 23, 0))).toBe(false)
  })

  test('ข้ามเดือน และข้ามปี', () => {
    const storage = new MemoryStorage()

    markSplashSeen(storage, localDate(2026, 1, 31, 23))
    expect(hasSeenSplashToday(storage, localDate(2026, 2, 1, 0))).toBe(false)

    markSplashSeen(storage, localDate(2026, 12, 31, 23))
    expect(hasSeenSplashToday(storage, localDate(2027, 1, 1, 0))).toBe(false)
  })
})
