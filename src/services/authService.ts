import type { ApiResponseBase, LoginResponse } from '../type'
import { api } from '../utils/api'

export const authService = {
  /**
   * Get current authenticated user profile
   */
  getMe: async (): Promise<ApiResponseBase> => {
    return await api('/auth/me', { method: 'GET' })
  },

  /**
   * Log in user with credentials
   */
  login: async (body: Record<string, unknown>): Promise<LoginResponse> => {
    // ใส่ <LoginResponse> เพื่อบอกให้ฟังก์ชัน api รู้ว่าข้อมูลที่จะ return กลับมาหน้าตาเป็นอย่างไร
    return await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body,
    })
  },

  /**
   * Terminate backend session and cookies
   */
  logout: async (): Promise<void> => {
    await api('/auth/logout', { method: 'POST' }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.warn('[Logout Service] Backend session clear skipped:', msg)
    })
  },

  clearLocalSession: (): void => {
    sessionStorage.removeItem('activeDashboardMenu')
    sessionStorage.removeItem('token')
  },
}
