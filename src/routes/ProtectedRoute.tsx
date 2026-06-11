// src/routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('USER' | 'ADMIN')[] // เพิ่มตัวเลือกเช็คสิทธิ์ Role
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const user = useAuthStore((state) => state.user)

  // เพิ่ม Log เพื่อ Debug
  console.log('[ProtectedRoute] isLoggedIn:', isLoggedIn)
  console.log('[ProtectedRoute] user:', user)
  console.log('[ProtectedRoute] allowedRoles:', allowedRoles)

  if (!isLoggedIn || !user) {
    console.log('[ProtectedRoute] Not logged in, redirect to /login')
    return <Navigate to='/login' replace />
  }

  // ถ้าระบุสิทธิ์ที่ต้องการ แล้วผู้ใช้ไม่มีสิทธิ์นั้น ให้ดีดกลับหน้าแรกทันที
  if (allowedRoles && allowedRoles.length > 0) {
    // แปลง role ทั้งสองฝั่งให้เป็นตัวพิมพ์ใหญ่เพื่อป้องกัน case-sensitive issue
    const userRoleUpper = user.role?.toUpperCase()
    const hasAllowedRole = allowedRoles.some(
      (role) => role.toUpperCase() === userRoleUpper,
    )

    console.log('[ProtectedRoute] user.role:', user.role)
    console.log('[ProtectedRoute] userRoleUpper:', userRoleUpper)
    console.log('[ProtectedRoute] hasAllowedRole:', hasAllowedRole)

    if (!hasAllowedRole) {
      console.log('[ProtectedRoute] Role not allowed, redirect to /')
      return <Navigate to='/' replace />
    }
  }

  console.log('[ProtectedRoute] Access granted')
  return <>{children}</>
}

export default ProtectedRoute
