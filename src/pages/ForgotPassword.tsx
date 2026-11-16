// src/pages/ForgotPassword.tsx
// รีเซ็ตรหัสผ่านด้วยตนเอง — ใช้ 2FA (TOTP) หรือ Recovery Key เท่านั้น
// 🚫 ไม่มีการส่งรหัสทางอีเมล (email OTP ถูกยกเลิกแล้ว)
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OtpInput from '../components/common/OtpInput'
import { twoFactorService } from '../services/twoFactorService'
import { api } from '../utils/api'

type Step = 'email' | 'verify' | 'success'
type VerifyMethod = 'totp' | 'recovery'

const ForgotPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>('totp')
  const [totp, setTotp] = useState('')
  const [recoveryKey, setRecoveryKey] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const formatRecoveryKey = (raw: string): string => {
    const clean = raw
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 16)
    const parts: string[] = []
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4))
    }
    return parts.join('-')
  }

  const getRawRecoveryKey = (): string => recoveryKey.replace(/-/g, '')

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const res = await twoFactorService.checkEmail(email.trim())

      if (!res.found) {
        setError('ไม่พบบัญชีนี้ในระบบ')
        return
      }

      // 🌟 บัญชีที่ยังไม่ enroll 2FA จะรีเซ็ตด้วยตนเองไม่ได้
      //    ต้องให้ Supervisor สั่ง force reset เท่านั้น
      if (!res.requires2FA) {
        setError(
          'บัญชีนี้ยังไม่ได้ตั้งค่า 2FA จึงยังรีเซ็ตรหัสผ่านด้วยตนเองไม่ได้ กรุณาติดต่อผู้ดูแลระบบ (Supervisor) เพื่อสั่งรีเซ็ตรหัสผ่าน',
        )
        return
      }

      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (verifyMethod === 'totp' && totp.length !== 6) {
      setError('กรุณากรอกรหัส 2FA ให้ครบ 6 หลัก')
      return
    }

    if (verifyMethod === 'recovery' && getRawRecoveryKey().length !== 16) {
      setError('Recovery Key ต้องมี 16 ตัวอักษร')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน')
      return
    }

    if (newPassword.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }

    setIsLoading(true)

    try {
      let resetToken: string | undefined

      // recovery key → ขอ reset token ก่อน แล้วนำไปตั้งรหัสผ่าน
      if (verifyMethod === 'recovery') {
        const res = await twoFactorService.useRecoveryKey(
          email.trim(),
          getRawRecoveryKey(),
        )
        resetToken = res.data?.resetToken
        if (!resetToken) {
          setError('ไม่สามารถใช้ Recovery Key นี้ได้')
          return
        }
      }

      await api('/auth/reset-password', {
        method: 'POST',
        body: {
          email: email.trim(),
          newPassword,
          ...(verifyMethod === 'totp'
            ? { totp }
            : { resetToken }),
        },
      })

      setTotp('')
      setRecoveryKey('')
      setNewPassword('')
      setConfirmPassword('')
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-slate-50 flex items-center justify-center overflow-y-auto font-sans'>
      <div className='w-[420px] px-12 py-10 bg-white border border-slate-200 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08)] rounded-2xl my-8'>
        <div className='flex flex-col items-center text-center mb-6'>
          <img
            src='/Logo.webp'
            alt={t('app.logoAlt', 'ตราสัญลักษณ์สำนักงาน ปปง.')}
            className='w-14 h-14 object-contain mb-4'
          />
          <h1 className='text-lg font-bold text-slate-800 leading-snug'>
            {step === 'email' && 'ลืมรหัสผ่าน'}
            {step === 'verify' && 'ยืนยันตัวตน'}
            {step === 'success' && 'ตั้งรหัสผ่านใหม่สำเร็จ'}
          </h1>
          <p className='text-xs text-slate-500 mt-2 leading-relaxed'>
            {step === 'email' &&
              'กรอกอีเมลที่ใช้สมัคร เพื่อเริ่มขั้นตอนรีเซ็ตรหัสผ่าน'}
            {step === 'verify' &&
              'ยืนยันด้วยรหัส 2FA หรือ Recovery Key ของคุณ'}
            {step === 'success' && 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว'}
          </p>
        </div>

        {error && (
          <p className='text-[13px] text-red-500 font-bold text-center mb-4 leading-relaxed'>
            {error}
          </p>
        )}

        {step === 'email' && (
          <form onSubmit={handleCheckEmail} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-bold text-slate-700 mb-2'
              >
                อีเมล
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='email@amlo.go.th'
                autoComplete='email'
                required
                className='w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
              />
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
              {isLoading ? 'กำลังตรวจสอบ...' : 'ถัดไป'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleResetPassword} className='space-y-4'>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => {
                  setVerifyMethod('totp')
                  setRecoveryKey('')
                  setError('')
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                  verifyMethod === 'totp'
                    ? 'border-[#185FA5] bg-blue-50 text-[#185FA5]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                รหัส 2FA
              </button>
              <button
                type='button'
                onClick={() => {
                  setVerifyMethod('recovery')
                  setTotp('')
                  setError('')
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                  verifyMethod === 'recovery'
                    ? 'border-[#185FA5] bg-blue-50 text-[#185FA5]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                Recovery Key
              </button>
            </div>

            {verifyMethod === 'totp' ? (
              <div>
                <label className='block text-sm font-bold text-slate-700 mb-2'>
                  รหัส 6 หลักจากแอป Authenticator
                </label>
                <OtpInput value={totp} onChange={setTotp} />
              </div>
            ) : (
              <div>
                <label
                  htmlFor='recoveryKey'
                  className='block text-sm font-bold text-slate-700 mb-2'
                >
                  Recovery Key (16 ตัวอักษร)
                </label>
                <input
                  id='recoveryKey'
                  type='text'
                  value={recoveryKey}
                  onChange={(e) => {
                    setRecoveryKey(formatRecoveryKey(e.target.value))
                    setError('')
                  }}
                  placeholder='AAAA-BBBB-CCCC-DDDD'
                  autoComplete='off'
                  className='w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                />
                <p className='text-[11px] text-slate-400 mt-1.5 leading-relaxed'>
                  ใช้ได้ครั้งเดียว — เมื่อใช้แล้ว 2FA ของบัญชีจะถูกปิด
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor='newPassword'
                className='block text-sm font-bold text-slate-700 mb-2'
              >
                รหัสผ่านใหม่
              </label>
              <input
                id='newPassword'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='อย่างน้อย 8 ตัว มีตัวพิมพ์ใหญ่ เล็ก และตัวเลข'
                autoComplete='new-password'
                required
                className='w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-bold text-slate-700 mb-2'
              >
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='กรอกรหัสผ่านอีกครั้ง'
                autoComplete='new-password'
                required
                className='w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-white text-lg font-bold transition-colors ${
                isLoading
                  ? 'bg-blue-600/50 cursor-not-allowed'
                  : 'bg-[#185FA5] hover:bg-[#134b82] cursor-pointer'
              }`}
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'ตั้งรหัสผ่านใหม่'}
            </button>

            <button
              type='button'
              onClick={() => {
                setStep('email')
                setTotp('')
                setRecoveryKey('')
                setError('')
              }}
              className='w-full text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer'
            >
              ย้อนกลับ
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className='space-y-4'>
            <div className='bg-green-50 border border-green-200 rounded-xl p-4 text-center'>
              <p className='text-sm text-green-800 font-medium leading-relaxed'>
                รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว
              </p>
            </div>
            <button
              type='button'
              onClick={() => navigate('/login', { replace: true })}
              className='w-full py-3.5 rounded-xl text-white text-lg font-bold bg-[#185FA5] hover:bg-[#134b82] transition-colors cursor-pointer'
            >
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        )}

        {step !== 'success' && (
          <button
            type='button'
            onClick={() => navigate('/login')}
            className='w-full mt-4 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer'
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        )}

        <p className='mt-6 text-center text-xs text-slate-400 font-medium'>
          {t('app.fullName')}
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
