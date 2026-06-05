import type { ApiResponseBase } from '../type'
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
  login: async (body: Record<string, unknown>): Promise<ApiResponseBase> => {
    return await api('/auth/login', {
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
}
