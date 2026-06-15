// src/pages/LoginPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/useAuthStore'
import { toast } from '../utils/swalConfig'

const LoginPage = () => {
  const navigate = useNavigate()
  const verifyUser = useAuthStore((state) => state.verifyUser)

  const [phase, setPhase] = useState<'zoom-in' | 'zoom-out' | 'done'>('zoom-in')
  const [email, setemail] = useState('')
  const [password, setPassword] = useState('')
  const [botTrap, setBotTrap] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('[Login LifeCycle] Component mounted')
    const t = setTimeout(() => setPhase('zoom-out'), 400)
    const t2 = setTimeout(() => setPhase('done'), 1600)
    return () => {
      console.log('[Login LifeCycle] Component unmounted / Cleaning timers')
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [])

  const setLoggedIn = useAuthStore((state) => state.setLoggedIn)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })

      // 🌟 Check if 2FA is required
      if (response.requires2FA && response.user) {
        setIsLoading(false)
        navigate('/2fa-challenge', {
          state: {
            email: email,
            twoFactorMethod: response.twoFactorMethod || 'AUTHENTICATOR',
            uuid: response.user.uuid || '',
          },
          replace: true,
        })
        return
      }

      if (response.success) {
        await verifyUser()
        const currentUser = useAuthStore.getState().user

        // Check if user needs to force reset password
        if (currentUser?.forcePasswordReset) {
          await toast.fire({
            icon: 'warning',
            title: 'ต้องเปลี่ยนรหัสผ่าน',
            text: 'ผู้ดูแลระบบได้กำหนดให้คุณต้องเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน',
          })

          setLoggedIn(true)
          navigate('/force-password-reset', { replace: true })
          return
        }

        // 🌟 1. แสดงความสำเร็จให้เรียบร้อยในขณะที่หน้าจอ LoginPage ยังทำงานอยู่ 100%
        await toast.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          text: 'ยินดีต้อนรับเข้าสู่ระบบจัดการภายใน',
        })

        // 🌟 2. เมื่อ Swal ทำงานและปิดตัวลงเสร็จแล้ว ค่อยสั่งเปิดประตูผ่าน Zustand
        setLoggedIn(true)

        // 🌟 3. เดินหน้าเปลี่ยนเส้นทางไปหน้า Dashboard ทันที
        navigate('/dashboard', { replace: true })
      } else {
        const storeError = useAuthStore.getState().error
        throw new Error(storeError || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'

      await toast.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบล้มเหลว',
        text: errorMessage,
      })
      setError(errorMessage)
      setIsLoading(false) // คืนค่าปุ่มเฉพาะตอนล็อกอินพลาด
    }
  }

  const isZoomedOut = phase === 'zoom-out' || phase === 'done'
  const showCard = phase === 'done'

  return (
    <div className='fixed inset-0 bg-slate-50 flex items-center justify-center overflow-hidden font-sans'>
      {/* Radial glow */}
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(24,95,165,0.06)_0%,transparent_70%)] pointer-events-none transition-opacity duration-[1400ms] delay-300 ease-in-out ${isZoomedOut ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Logo Background */}
      <div
        className={`absolute flex items-center justify-center pointer-events-none z-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isZoomedOut ? 'scale-100 opacity-15' : 'scale-[5] opacity-100'}`}
      >
        <img
          src='/Logo.png'
          alt='โลโก้ ปปง. พื้นหลัง'
          className='w-[260px] h-[260px] object-contain'
        />
      </div>

      {/* Light overlay */}
      <div
        className={`absolute inset-0 bg-white/40 pointer-events-none z-20 transition-opacity duration-700 ease-in-out ${showCard ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Login Card */}
      <div
        className={`relative z-30 w-[420px] px-12 py-10 bg-white border border-slate-200 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_10px_10px_-5px_rgba(0,0,0,0.03)] rounded-2xl transition-all duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${showCard ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-5 scale-[0.97] opacity-0'}`}
      >
        <div className='flex flex-col items-center text-center mb-8'>
          <img
            src='/Logo.png'
            alt='โลโก้ ปปง.'
            className='w-20 h-20 object-contain mb-4 mx-auto'
          />
          <h1 className='text-2xl font-bold text-slate-800 m-0 mb-1.5'>
            เข้าสู่ระบบ
          </h1>
          <p className='text-sm text-slate-500 m-0'>
            สำนักงาน ปปง. — ระบบจัดการภายใน
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col w-full'
          autoComplete='on'
        >
          {/* Honeypot Field */}
          <input
            type='text'
            name='website_security_field'
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            className='hidden'
            tabIndex={-1}
            autoComplete='off'
          />

          {/* Email field */}
          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-xs font-bold tracking-[0.07em] uppercase text-slate-500 mb-2'
            >
              ชื่อผู้ใช้งาน
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => {
                setemail(e.target.value)
                setError('')
              }}
              placeholder='email@amlo.go.th'
              autoComplete='email'
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 text-base outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
          </div>

          {/* Password field */}
          <div className='mb-6'>
            <label
              htmlFor='password'
              className='block text-xs font-bold tracking-[0.07em] uppercase text-slate-500 mb-2'
            >
              รหัสผ่าน
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder='••••••••'
              autoComplete='current-password'
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 text-base outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
          </div>

          {error && (
            <p className='text-[13px] text-red-500 font-bold text-center -mt-3 mb-4'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-white text-lg font-bold transition-colors ${isLoading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#134b82] cursor-pointer'}`}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className='mt-4 flex flex-col items-center gap-2'>
          <button
            type='button'
            onClick={() => navigate('/forgot-password', { state: { email } })}
            className='text-sm text-[#185FA5] hover:text-[#134b82] hover:underline font-medium cursor-pointer'
          >
            ลืมรหัสผ่าน?
          </button>
          <button
            type='button'
            onClick={() => navigate('/recovery-login', { state: { email } })}
            className='text-xs text-slate-400 hover:text-slate-600 hover:underline cursor-pointer'
          >
            กู้คืนการเข้าสู่ระบบ (สำหรับ Supervisor)
          </button>
        </div>

        <p className='mt-6 text-center text-xs text-slate-400 font-medium'>
          สำนักงานป้องกันและปราบปรามการฟอกเงิน
        </p>
      </div>
    </div>
  )
}

export default LoginPage
