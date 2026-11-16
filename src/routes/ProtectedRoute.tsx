// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  // เพิ่ม SUPERVISOR เข้าไปใน type
  allowedRoles?: ('USER' | 'ADMIN' | 'SUPERVISOR')[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (isLoggingOut) {
    return null
  }

  if (!isLoggedIn || !user) {
    return <Navigate to='/login' replace />
  }

  // 🌟 Bootstrap ของบัญชี admin — บังคับตามลำดับเดียวกับที่ backend gate บังคับ
  //    ขั้นที่ 1: ยังไม่มี 2FA  → ต้อง enroll ก่อน (ห้ามเปลี่ยนรหัสผ่านก่อน enroll)
  //    ขั้นที่ 2: มี 2FA แล้ว   → จึงเปลี่ยนรหัสผ่านชั่วคราว
  if (user.forcePasswordReset && !user.twoFactorEnabled) {
    if (location.pathname !== '/2fa-setup') {
      return <Navigate to='/2fa-setup' replace />
    }
    return <>{children}</>
  }

  if (user.forcePasswordReset && user.twoFactorEnabled) {
    if (location.pathname !== '/force-password-reset') {
      return <Navigate to='/force-password-reset' replace />
    }
    return <>{children}</>
  }

  // 🌟 Force ADMIN and SUPERVISOR to enable 2FA before accessing any protected page
  if (
    (user.role === 'SUPERVISOR' || user.role === 'ADMIN') &&
    !user.twoFactorEnabled &&
    location.pathname !== '/2fa-setup'
  ) {
    return <Navigate to='/2fa-setup' replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role
    const hasAllowedRole = allowedRoles.some((role) => {
      const match = role === userRole
      return match
    })

    if (!hasAllowedRole) {
      return <Navigate to='/' replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
