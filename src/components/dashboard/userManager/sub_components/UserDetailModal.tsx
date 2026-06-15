import React from 'react'
import type { DashboardUser } from './BanModal'

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  user: DashboardUser | null
  onBan: (u: DashboardUser) => void
  onUnban: (u: DashboardUser) => void
  onDelete: (u: DashboardUser) => void
  onForcePassword: (u: DashboardUser) => void
  onOpenRequest?: (u: DashboardUser) => void
}

const getOnlineStatus = (recentOnline: string) => {
  const diffMs = Date.now() - new Date(recentOnline).getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 10) {
    return {
      label: 'Online',
      color: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
    }
  } else if (diffMins < 60) {
    return {
      label: `${diffMins} นาทีที่แล้ว`,
      color: 'bg-gray-100 text-gray-600',
      dot: null,
    }
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    return {
      label: `${hours} ชั่วโมงที่แล้ว`,
      color: 'bg-gray-100 text-gray-600',
      dot: null,
    }
  } else {
    const days = Math.floor(diffMins / 1440)
    return {
      label: `${days} วันที่แล้ว`,
      color: 'bg-gray-100 text-gray-500',
      dot: null,
    }
  }
}

const getAvatarColor = (firstname: string) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
  ]
  return colors[firstname.charCodeAt(0) % colors.length]
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return {
        label: 'ผู้ดูแลระบบ',
        className: 'bg-indigo-100 text-indigo-800',
      }
    case 'SUPERVISOR':
      return { label: 'ผู้ดูแลสูงสุด', className: 'bg-red-100 text-red-800' }
    default:
      return { label: 'ผู้ใช้ทั่วไป', className: 'bg-gray-100 text-gray-800' }
  }
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onBan,
  onUnban,
  onDelete,
  onForcePassword,
  onOpenRequest,
}) => {
  if (!isOpen || !user) return null

  const onlineStatus = getOnlineStatus(user.recentOnline)
  const roleBadge = getRoleBadge(user.role)
  const avatarChar = (user.firstname?.charAt(0) || '?').toUpperCase()
  const avatarColor = getAvatarColor(user.firstname || '')
  const isBanned = user.status === 'Inactive'
  const isSupervisorTarget = user.role === 'SUPERVISOR'

  const handleAction = (action: string) => {
    if (isSupervisorTarget && onOpenRequest) {
      onOpenRequest(user)
      onClose()
      return
    }
    onClose()
    setTimeout(() => {
      if (action === 'ban') {
        if (isBanned) onUnban(user)
        else onBan(user)
      } else if (action === 'delete') onDelete(user)
      else if (action === 'force') onForcePassword(user)
    }, 150)
  }

  return (
    <div
      className='fixed inset-0 z-50 overflow-y-auto'
      role='dialog'
      aria-modal='true'
    >
      <div className='flex items-center justify-center min-h-screen px-4 py-8'>
        <div
          className='fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm'
          onClick={onClose}
        />
        <div className='relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 z-20 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          <div className='p-8'>
            <div className='flex items-center gap-5 mb-8'>
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0`}
              >
                {avatarChar}
              </div>
              <div className='min-w-0'>
                <h2 className='text-xl font-bold text-gray-900 truncate'>
                  {user.firstname} {user.lastname}
                </h2>
                <p className='text-sm text-gray-500 truncate'>{user.email}</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1.5 ${roleBadge.className}`}
                >
                  {roleBadge.label}
                </span>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-x-8 gap-y-5 mb-8 bg-gray-50 rounded-xl p-5'>
              <div>
                <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1'>
                  รหัส UUID
                </label>
                <p className='text-sm font-mono text-gray-900 break-all'>
                  {user.uuid || '-'}
                </p>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1'>
                  สถานะ 2FA
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {user.twoFactorEnabled
                    ? '✅ ยืนยันแล้ว'
                    : '❌ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1'>
                  สถานะ
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                >
                  {isBanned ? 'ถูกระงับ' : 'ปกติ'}
                </span>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1'>
                  ใช้งานล่าสุด
                </label>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${onlineStatus.color}`}
                >
                  {onlineStatus.dot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${onlineStatus.dot} animate-pulse`}
                    />
                  )}
                  {onlineStatus.label}
                </span>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1'>
                  วันที่ลงทะเบียน
                </label>
                <p className='text-sm text-gray-900'>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-3 pt-4 border-t border-gray-200'>
              {isSupervisorTarget ? (
                <>
                  <div className='w-full p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2'>
                    <p className='text-xs font-medium text-amber-700'>
                      ⚠️ Supervisor ต้องการคำร้องเพื่อดำเนินการ
                    </p>
                    <p className='text-xs text-amber-600 mt-0.5'>
                      ต้องได้รับการอนุมัติจาก Supervisor เป้าหมายก่อน
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction('request')}
                    className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm bg-[#185FA5] hover:bg-[#134b82] text-white'
                  >
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      />
                    </svg>
                    ยื่นคำร้อง
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAction('ban')}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${isBanned ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    {isBanned ? 'ปลดระงับการใช้งาน' : 'ระงับการใช้งาน'}
                  </button>
                  <button
                    onClick={() => handleAction('delete')}
                    className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm bg-white text-red-600 border border-red-300 hover:bg-red-50'
                  >
                    ลบบัญชี
                  </button>
                  <button
                    onClick={() => handleAction('force')}
                    className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm bg-amber-500 hover:bg-amber-600 text-white'
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
