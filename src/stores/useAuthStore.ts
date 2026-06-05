import Swal from 'sweetalert2'
import { create } from 'zustand'
import { authService } from '../services/authService'
import type { UserProfile } from '../type'

interface AuthState {
  user: UserProfile | null
  isLoggedIn: boolean
  isLoading: boolean
  verifyUser: () => Promise<void>
  loginUser: (payload: Record<string, unknown>) => Promise<boolean>
  logoutUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  verifyUser: async () => {
    try {
      const response = await authService.getMe()
      if (response.success && response.user) {
        set({ isLoggedIn: true, user: response.user as UserProfile })
      }
    } catch {
      set({ isLoggedIn: false, user: null })
    } finally {
      set({ isLoading: false })
    }
  },

  loginUser: async (payload) => {
    const response = await authService.login(payload)
    if (response.success) {
      set({
        isLoggedIn: true,
        user: response.user ? (response.user as UserProfile) : null,
      })
      return true
    }
    return false
  },

  logoutUser: async () => {
    console.log('[Logout Store] Initiating secure logout sequence...')
    try {
      sessionStorage.clear()
      await authService.logout()
      set({ user: null, isLoggedIn: false })

      await Swal.fire({
        icon: 'success',
        title: 'ออกจากระบบสำเร็จ',
        text: 'กำลังพาท่านกลับไปยังหน้าแรก',
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
      })
    } catch (error: unknown) {
      console.error('[Logout Store] Critical process failed:', error)
    }
  },
}))
