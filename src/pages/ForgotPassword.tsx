// src/pages/ForgotPassword.tsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OtpInput from '../components/common/OtpInput'
import { twoFactorService } from '../services/twoFactorService'
import { api } from '../utils/api'
import { toast } from '../utils/swalConfig'

type Step = 'email' | 'reset'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const stateEmail = (location.state as { email?: string })?.email || ''

  const [step, setStep] = useState<Step>(stateEmail ? 'reset' : 'email')
  const [email, setEmail] = useState(stateEmail)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await twoFactorService.requestEmailOTP(email)
      await toast.fire({
        icon: 'success',
        title: 'ส่ง OTP แล้ว',
        text: 'โปรดตรวจสอบอีเมลของคุณ',
      })
      setStep('reset')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      await toast.fire({
        icon: 'error',
        title: 'ไม่สามารถส่ง OTP ได้',
        text: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!otp || otp.length !== 6) {
      await toast.fire({
        icon: 'error',
        title: 'กรุณากรอกรหัส OTP',
        text: 'กรุณากรอกรหัส OTP 6 หลักที่ได้รับ',
      })
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      await toast.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
      })
      setIsLoading(false)
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      await toast.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงตามเงื่อนไข',
        text: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสามารถใช้ Special characters',
      })
      setIsLoading(false)
      return
    }

    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: { email, otp, newPassword },
      })
      await toast.fire({
        icon: 'success',
        title: 'ตั้งรหัสผ่านสำเร็จ',
        text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
      })
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      await toast.fire({
        icon: 'error',
        title: 'ไม่สามารถตั้งรหัสผ่านได้',
        text: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => {
    const steps: { key: Step; label: string }[] = [
      { key: 'email', label: 'อีเมล' },
      { key: 'reset', label: 'OTP + รหัสผ่าน' },
    ]
    const currentIndex = steps.findIndex((s) => s.key === step)

    return (
      <div className='flex items-center justify-center gap-2 mb-8'>
        {steps.map((s, index) => (
          <div key={s.key} className='flex items-center gap-2'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                index <= currentIndex
                  ? 'bg-[#185FA5] text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-sm font-medium ${
                index <= currentIndex ? 'text-[#185FA5]' : 'text-slate-400'
              }`}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  index < currentIndex ? 'bg-[#185FA5]' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='fixed inset-0 bg-slate-50 flex items-center justify-center overflow-hidden font-sans'>
      <div className='w-[420px] px-12 py-10 bg-white border border-slate-200 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08)] rounded-2xl'>
        <div className='flex flex-col items-center text-center mb-6'>
          <img
            src='/Logo.png'
            alt='โลโก้ ปปง.'
            className='w-20 h-20 object-contain mb-4'
          />
          <h1 className='text-2xl font-bold text-slate-800 m-0'>ลืมรหัสผ่าน</h1>
          <p className='text-sm text-slate-500 mt-1'>
            {step === 'email' && 'กรุณากรอกอีเมลเพื่อรับ OTP'}
            {step === 'reset' && 'กรุณากรอกรหัส OTP และตั้งรหัสผ่านใหม่'}
          </p>
        </div>

        {renderStepIndicator()}

        {step === 'email' && (
          <form onSubmit={handleRequestOTP} className='flex flex-col w-full'>
            <div className='mb-6'>
              <label
                htmlFor='email'
                className='block text-xs font-bold tracking-[0.07em] uppercase text-slate-500 mb-2'
              >
                อีเมล
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='email@amlo.go.th'
                required
                disabled={!!stateEmail}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-base outline-none focus:border-blue-500 transition-colors ${stateEmail ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              {stateEmail && (
                <p className='text-xs text-slate-400 mt-1'>
                  อีเมลจากหน้า Login
                </p>
              )}
            </div>
            <button
              type='submit'
              disabled={isLoading || !email.trim()}
              className={`w-full py-3.5 rounded-xl text-white text-lg font-bold transition-colors ${
                isLoading || !email.trim()
                  ? 'bg-blue-600/50 cursor-not-allowed'
                  : 'bg-[#185FA5] hover:bg-[#134b82] cursor-pointer'
              }`}
            >
              {isLoading ? 'กำลังส่ง OTP...' : 'ส่ง OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className='flex flex-col w-full'>
            <div className='mb-4'>
              <label
                htmlFor='otp'
                className='block text-xs font-bold tracking-[0.07em] uppercase text-slate-500 mb-2'
              >
                รหัส OTP
              </label>
              <OtpInput value={otp} onChange={(val) => setOtp(val)} />
            </div>
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
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='••••••••'
                required
                className='w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-base outline-none focus:border-blue-500 transition-colors'
              />
            </div>
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='••••••••'
                required
                className='w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-base outline-none focus:border-blue-500 transition-colors'
              />
            </div>
            <p className='text-xs text-slate-400 mb-4'>
              รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก
              ตัวเลข และสามารถใช้ Special characters
            </p>
            <button
              type='submit'
              disabled={
                isLoading ||
                otp.length !== 6 ||
                !newPassword ||
                !confirmPassword
              }
              className={`w-full py-3.5 rounded-xl text-white text-lg font-bold transition-colors ${
                isLoading ||
                otp.length !== 6 ||
                !newPassword ||
                !confirmPassword
                  ? 'bg-blue-600/50 cursor-not-allowed'
                  : 'bg-[#185FA5] hover:bg-[#134b82] cursor-pointer'
              }`}
            >
              {isLoading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
            </button>
          </form>
        )}

        <button
          onClick={() => navigate('/login')}
          className='w-full mt-4 py-2.5 rounded-xl text-[#185FA5] text-sm font-bold border border-[#185FA5] hover:bg-blue-50 transition-colors cursor-pointer'
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword
