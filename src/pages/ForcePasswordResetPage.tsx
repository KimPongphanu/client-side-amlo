// src/pages/ForcePasswordResetPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { api } from '../utils/api'
import { toast } from '../utils/swalConfig'

const ForcePasswordResetPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const verifyUser = useAuthStore((state) => state.verifyUser)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword.trim()) {
      setError('กรุณากรอกรหัสผ่านใหม่')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      setError(
        'รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสามารถใช้ Special characters',
      )
      return
    }

    setIsLoading(true)

    try {
      // 🌟 ไม่ต้องส่ง OTP แล้ว — การยืนยัน 2FA เกิดขึ้นตอน login และถูกบังคับที่ backend gate
      const res = await api<{ success: boolean; message: string }>(
        '/auth/force-reset/verify',
        {
          method: 'POST',
          body: { newPassword },
        },
      )

      if (res.success) {
        await verifyUser()

        await toast.fire({
          icon: 'success',
          title: 'ตั้งรหัสผ่านใหม่สำเร็จ',
          text: 'กำลังนำคุณไปยังหน้า Dashboard',
        })

        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className='fixed inset-0 bg-slate-50 flex items-center justify-center overflow-hidden font-sans'>
      <div className='relative z-30 w-[460px] px-12 py-10 bg-white border border-slate-200 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_10px_10px_-5px_rgba(0,0,0,0.03)] rounded-2xl'>
        <div className='flex flex-col items-center text-center mb-6'>
          <img
            src='/Logo.webp'
            alt='โลโก้ ปปง.'
            className='w-20 h-20 object-contain mb-4 mx-auto'
          />
          <h1 className='text-2xl font-bold text-slate-800 m-0 mb-1.5'>
            บังคับเปลี่ยนรหัสผ่าน
          </h1>
          <p className='text-sm text-slate-500 m-0'>
            ผู้ดูแลระบบได้กำหนดให้คุณต้องเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน
          </p>
        </div>

        {/* Verified Banner */}
        <div className='bg-emerald-50 border border-emerald-200 rounded-md p-3 mb-4'>
          <p className='text-sm text-emerald-700 text-center'>
            ยืนยันตัวตนด้วย 2FA เรียบร้อยแล้ว
            กรุณาตั้งรหัสผ่านใหม่เพื่อเข้าใช้งานระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          {/* New Password Field */}
          <div className='mb-4'>
            <label
              htmlFor='newPassword'
              className='block text-xs font-bold tracking-[0.07em] uppercase text-slate-500 mb-2'
            >
              รหัสผ่านใหม่
            </label>
            <input
              id='newPassword'
              type='password'
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setError('')
              }}
              placeholder='••••••••'
              autoComplete='new-password'
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 text-base outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
          </div>

          {/* Confirm Password Field */}
          <div className='mb-4'>
            <label
              htmlFor='confirmPassword'
              className='block text-xs font-bold tracking-[0.07em] uppercase text-slate-500 mb-2'
            >
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              placeholder='••••••••'
              autoComplete='new-password'
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 text-base outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
          </div>

          <p className='text-xs text-slate-400 mb-4'>
            รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก
            ตัวเลข
          </p>

          {error && (
            <p className='text-[13px] text-red-500 font-bold text-center -mt-2 mb-3'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-white text-lg font-bold transition-colors ${
              isLoading
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-[#185FA5] hover:bg-[#134b82] cursor-pointer'
            }`}
          >
            {isLoading ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </form>

        <p className='mt-6 text-center text-xs text-slate-400 font-medium'>
          สำนักงานป้องกันและปราบปรามการฟอกเงิน
        </p>
      </div>
    </div>
  )
}

export default ForcePasswordResetPage
