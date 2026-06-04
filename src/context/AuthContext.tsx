import { useEffect, useState, type ReactNode } from 'react'
import { api } from '../utils/api'
import { AuthContext } from './AuthContextDef'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isVerifying, setIsVerifying] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(true)

  // 🌟 1. เพิ่ม State สำหรับเก็บข้อมูลผู้ใช้งาน
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await api('/auth/me', { method: 'GET' })
        if (response.success) {
          setIsLoggedIn(true)
          setUser(response.user) // 🌟 2. เก็บข้อมูล user ที่ดึงมาจาก API
        }
      } catch {
        setIsLoggedIn(false)
        setUser(null)
      } finally {
        setIsVerifying(false)
        setIsLoading(false)
      }
    }
    verifyUser()
  }, [])

  const login = () => setIsLoggedIn(true)

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null) // 🌟 3. เคลียร์ข้อมูลผู้ใช้ตอน Logout
  }

  if (isVerifying) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        กำลังยืนยันสิทธิ์...
      </div>
    )
  }

  return (
    // 🌟 4. ส่งค่า user ออกไปให้ Component อื่น (เช่น DashboardPage) ใช้งานได้
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
