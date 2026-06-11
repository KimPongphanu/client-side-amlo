import Swal from 'sweetalert2'
import { create } from 'zustand'
import { authService } from '../services/authService'
import type { UserProfile } from '../type'

interface AuthState {
  // --- States ---
  user: UserProfile | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null // 🌟 เพิ่มระบุประเภท Error ให้สัมพันธ์กับตัวแปรด้านล่าง

  // --- Actions ---
  isAdmin: () => boolean
  setLoggedIn: (status: boolean) => void
  verifyUser: () => Promise<void>
  loginUser: (payload: Record<string, unknown>) => Promise<boolean>
  logoutUser: () => Promise<void>
  initIdleTimeout: (idleTimeMs?: number) => () => void
  startHeartbeat: () => () => void // เริ่ม Heartbeat loop, คืนค่า cleanup fn
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // =========================================================================
  // INITIAL STATES & SETTERS
  // =========================================================================
  setLoggedIn: (status: boolean) => set({ isLoggedIn: status }),
  user: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,

  isAdmin: () => {
    const user = get().user
    return user?.role === 'ADMIN' // ต้องไปอัปเดตไฟล์ type ให้มี role ด้วยนะ
  },

  // =========================================================================
  // AUTHENTICATION ACTIONS
  // =========================================================================

  /**
   * ตรวจสอบสถานะการล็อกอินของผู้ใช้งานกับระบบหลังบ้าน
   */
  verifyUser: async () => {
    set({ isLoading: true })
    try {
      // 🌟 แก้ไข Type Casting ให้รับคีย์ user ได้ตรงๆ (ไม่ติดสิทธิ์ ApiResponseBase ตัวเดิม)
      const response = (await authService.getMe()) as {
        success: boolean
        user?: UserProfile
      }

      if (response.success && response.user) {
        set({ isLoggedIn: true, user: response.user })
      } else {
        set({ isLoggedIn: false, user: null })
      }
    } catch {
      // 🌟 นำตัวแปร error ที่ไม่ได้ใช้ออกเพื่อเคลียร์ ESLint (no-unused-vars)
      set({ isLoggedIn: false, user: null })
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * เข้าสู่ระบบด้วย Payload ข้อมูลผู้ใช้งาน
   */
  loginUser: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(credentials)

      // เช็คแค่ success ป้องกันเคสที่ Express ลืมส่ง user มา
      if (response.success) {
        if (response.user) {
          // อัปเดต state แบบสมบูรณ์
          set({ user: response.user, isLoggedIn: true, error: null })
        } else {
          // กันเหนียว: ให้ไปดึงข้อมูลโปรไฟล์จาก /me ผ่าน cookie ทันที
          await get().verifyUser()
        }
        return true
      }

      set({ error: response.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
      return false
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      set({ error: errorMessage })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * ออกจากระบบแบบปกติ (Clear State + Alert)
   */
  logoutUser: async () => {
    console.log(
      '[Logout Store] Initiating integrated secure logout sequence...',
    )

    // 1. ล้างฝั่ง Client Session ทันทีเพื่อป้องกันสิทธิ์ค้างคา
    try {
      if (typeof authService.clearLocalSession === 'function') {
        authService.clearLocalSession()
      } else {
        sessionStorage.clear()
      }
    } catch (cleanError) {
      console.error('[Logout Store] Client session cleanup failed:', cleanError)
    }

    // 2. ยิง API แจ้งลบ Session บน Server ฝั่งหลังบ้าน
    try {
      await authService.logout()
    } catch (apiError) {
      console.error('[Logout Store] API logout request failed:', apiError)
    } finally {
      // มั่นใจได้ว่า State ภายในระบบจะถูกล้างอย่างสมบูรณ์แม้ API จะ Error
      set({ user: null, isLoggedIn: false })

      // 3. แสดงป๊อปอัป SweetAlert2 แจ้งผู้ใช้งาน
      await Swal.fire({
        icon: 'success',
        title: 'ออกจากระบบสำเร็จ',
        text: 'กำลังพาท่านกลับไปยังหน้าแรก',
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
      })

      // 4. บังคับเปลี่ยนหน้าเพื่อเคลียร์หน่วยความจำ RAM โครงสร้างโครงข่ายแอปพลิเคชันเดิมออกทั้งหมด
      window.location.href = '/login'
    }
  },

  // =========================================================================
  // SECURITY & AUTOMATION ACTIONS
  // =========================================================================

  /**
   * Heartbeat: ยิง POST /auth/heartbeat ทุก 5 นาที เพื่ออัปเดต recentOnline
   * สามารถใช้โดย Admin Dashboard เพื่อเช็คว่าใคร Online/Offline อยู่
   */
  startHeartbeat: () => {
    const INTERVAL_MS = 5 * 60 * 1000 // 5 นาที

    // ยิง ping ครั้งแรกทันที (silent fail)
    authService.ping()

    const intervalId = setInterval(() => {
      // ตรวจว่ายัง logged in อยู่ก่อน ping เสมอ เพื่อไม่ ping หลัง logout
      if (get().isLoggedIn) {
        authService.ping()
      } else {
        clearInterval(intervalId)
      }
    }, INTERVAL_MS)

    // คืน cleanup สำหรับเอาไปใช้ใน useEffect return
    return () => clearInterval(intervalId)
  },

  /**
   * ระบบตรวจสอบพฤติกรรมผู้ใช้งานนิ่ง (Idle Timeout) พร้อมเตือนก่อนหมดเวลาเซสชัน
   */
  initIdleTimeout: (idleTimeMs = 15 * 60 * 1000) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let warningId: ReturnType<typeof setTimeout> | null = null
    let isWarningOpen = false
    const warningTimeMs = 60 * 1000 // สัญญาณเตือนล่วงหน้า 60 วินาที

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (warningId) clearTimeout(warningId)

      if (Swal.isVisible() && isWarningOpen) {
        Swal.close()
        isWarningOpen = false
      }

      // 1. นัดเวลาเปิดหน้าต่างแจ้งเตือนนับถอยหลังก่อนเซสชันหมดอายุจริง
      warningId = setTimeout(
        () => {
          let timerInterval: ReturnType<typeof setInterval>
          isWarningOpen = true

          Swal.fire({
            title: 'เซสชันของคุณกำลังจะหมดอายุ',
            html: 'ระบบจะออกจากระบบอัตโนมัติใน <b></b> วินาที เนื่องจากไม่มีการใช้งาน',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ฉันยังใช้งานอยู่',
            cancelButtonText: 'ออกจากระบบ',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            timer: warningTimeMs,
            timerProgressBar: true,
            allowOutsideClick: false,
            didOpen: () => {
              const b = Swal.getHtmlContainer()?.querySelector('b')
              timerInterval = setInterval(() => {
                if (b) {
                  const timeLeft = Swal.getTimerLeft()
                  b.textContent = timeLeft
                    ? Math.ceil(timeLeft / 1000).toString()
                    : '0'
                }
              }, 100)
            },
            willClose: () => {
              clearInterval(timerInterval)
              isWarningOpen = false
            },
          }).then((result) => {
            if (result.isConfirmed) {
              resetTimer()
            } else if (
              result.dismiss === Swal.DismissReason.timer ||
              result.isDismissed
            ) {
              get().logoutUser()
            }
          })
        },
        Math.max(0, idleTimeMs - warningTimeMs),
      )

      // 2. นัดเวลา Force Logout หลักเมื่อหมดเวลาลงตัวอย่างสมบูรณ์
      timeoutId = setTimeout(() => {
        Swal.close()
        get().logoutUser()
      }, idleTimeMs)
    }

    // กำหนด Event ตรวจจับพฤติกรรมความเคลื่อนไหวของผู้ใช้
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]
    const handleEvent = () => resetTimer()

    events.forEach((event) => document.addEventListener(event, handleEvent))
    resetTimer()

    // คืนค่า Cleanup Function สำหรับนำไปทำลายทิ้งใน useEffect เคลียร์ Memory leak
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (warningId) clearTimeout(warningId)
      events.forEach((event) =>
        document.removeEventListener(event, handleEvent),
      )
    }
  },
}))
