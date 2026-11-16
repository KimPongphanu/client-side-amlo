import { api } from '../utils/api'

export interface VisitorStats {
  configured: boolean
  totalUsers?: number
  pageViews?: number
  rangeDays?: number
  fetchedAt?: string
}

/**
 * ดึงสถิติผู้เข้าชมจาก GA4 ผ่าน backend
 * - ยังไม่ตั้งค่า GA → { configured: false }
 * - ดึงไม่สำเร็จ (502) → throw error ให้ผู้เรียกจัดการเอง
 */
export const analyticsService = {
  getVisitors: async (): Promise<VisitorStats> => {
    const res = await api<{ success: boolean; data: VisitorStats }>(
      '/analytics/visitors',
      { method: 'GET' },
    )
    return res?.data ?? { configured: false }
  },
}
