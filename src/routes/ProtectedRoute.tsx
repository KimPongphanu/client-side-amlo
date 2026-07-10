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

  // If user is forced to reset password, redirect to force-password-reset
  // unless they are already on that page
  if (
    user.forcePasswordReset &&
    location.pathname !== '/force-password-reset'
  ) {
    return <Navigate to='/force-password-reset' replace />
  }

  // 🌟 NEW: Force SUPERVISOR to enable 2FA before accessing any protected page
  if (
    user.role === 'SUPERVISOR' &&
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
