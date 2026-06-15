// src/components/dashboard/ProfileDashboard.tsx
import { useState } from 'react'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../stores/useAuthStore'
import { toast } from '../../utils/swalConfig'

const roleBadge: Record<string, { label: string; color: string }> = {
  SUPERVISOR: { label: 'ผู้ดูแลระบบสูงสุด', color: 'bg-red-100 text-red-800' },
  ADMIN: { label: 'ผู้ดูแลระบบ', color: 'bg-indigo-100 text-indigo-800' },
  USER: { label: 'ผู้ใช้ทั่วไป', color: 'bg-gray-100 text-gray-800' },
}

export default function ProfileDashboard() {
  const user = useAuthStore((state) => state.user)
  const verifyUser = useAuthStore((state) => state.verifyUser)

  const [firstname, setFirstname] = useState(user?.firstname || '')
  const [lastname, setLastname] = useState(user?.lastname || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const avatarChar = (user?.firstname?.charAt(0) || '?').toUpperCase()
  const roleInfo = user
    ? roleBadge[user.role] || roleBadge.USER
    : roleBadge.USER

  const hasChanges =
    firstname !== user?.firstname || lastname !== user?.lastname

  const handleReset = () => {
    setFirstname(user?.firstname || '')
    setLastname(user?.lastname || '')
    setError('')
  }

  const handleSave = async () => {
    if (!firstname.trim() || !lastname.trim()) {
      setError('กรุณากรอกชื่อและนามสกุล')
      return
    }
    if (firstname.length > 50 || lastname.length > 50) {
      setError('ชื่อหรือนามสกุลต้องไม่เกิน 50 ตัวอักษร')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await authService.updateProfile({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
      })
      await verifyUser()
      await toast.fire({
        icon: 'success',
        title: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
        {/* Header */}
        <div className='px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white'>
          <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <i className='fas fa-user-circle text-blue-600' />
            ข้อมูลส่วนตัว
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            จัดการข้อมูลส่วนตัวของคุณ
          </p>
        </div>

        {/* Avatar + Email Section */}
        <div className='px-8 pt-8 pb-6 border-b border-gray-100'>
          <div className='flex items-center gap-5'>
            <div className='w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0'>
              {avatarChar}
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>
                {user.firstname} {user.lastname}
              </h2>
              <p className='text-sm text-gray-500'>{user.email}</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1.5 ${roleInfo.color}`}
              >
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className='px-8 py-6 space-y-5'>
          {/* Email (readonly) */}
          <div>
            <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5'>
              <i className='fas fa-envelope text-gray-400 mr-1.5' />
              อีเมล
            </label>
            <input
              type='email'
              value={user.email}
              disabled
              className='block w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed'
            />
          </div>

          {/* Firstname */}
          <div>
            <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5'>
              <i className='fas fa-user text-gray-400 mr-1.5' />
              ชื่อ <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={firstname}
              onChange={(e) => {
                setFirstname(e.target.value)
                setError('')
              }}
              placeholder='กรุณากรอกชื่อ'
              maxLength={50}
              className='block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
            />
          </div>

          {/* Lastname */}
          <div>
            <label className='block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5'>
              <i className='fas fa-user text-gray-400 mr-1.5' />
              นามสกุล <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={lastname}
              onChange={(e) => {
                setLastname(e.target.value)
                setError('')
              }}
              placeholder='กรุณากรอกนามสกุล'
              maxLength={50}
              className='block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
            />
          </div>

          {/* Error */}
          {error && (
            <div className='p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg'>
              <i className='fas fa-exclamation-circle mr-1.5' />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-2'>
            <button
              onClick={handleReset}
              disabled={isSaving || !hasChanges}
              className='px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors'
            >
              <i className='fas fa-undo mr-1.5' />
              รีเซ็ต
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className='px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm'
            >
              {isSaving ? (
                <>
                  <i className='fas fa-spinner fa-spin mr-1.5' />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <i className='fas fa-save mr-1.5' />
                  บันทึก
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className='px-8 py-4 bg-gray-50 border-t border-gray-200'>
          <p className='text-xs text-gray-400'>
            <i className='fas fa-info-circle mr-1' />
            เฉพาะชื่อและนามสกุลเท่านั้นที่แก้ไขได้
            หากต้องการเปลี่ยนอีเมลหรือรหัสผ่าน กรุณาติดต่อ Supervisor
          </p>
        </div>
      </div>
    </div>
  )
}
