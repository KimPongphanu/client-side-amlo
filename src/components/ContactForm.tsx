import React, { useState, useRef, useEffect } from 'react'
import isEmail from 'validator/lib/isEmail'

declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, parameters: Record<string, unknown>) => number
      reset: (widgetId: number) => void
    }
  }
}

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  telNumber: string
  preferredContact: string
  message: string
  botField: string // 🌟 เพิ่ม Field สำหรับ Honeypot
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  telNumber?: string
  preferredContact?: string
  message?: string
}

const ClearIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='18' y1='6' x2='6' y2='18'></line>
    <line x1='6' y1='6' x2='18' y2='18'></line>
  </svg>
)

const ContactForm = () => {
  const cardStyle = 'w-full max-w-[600px] bg-white rounded-2xl m-10 p-8 border border-gray-200 shadow-lg mx-auto mt-25'
  const requireStyle = 'after:ml-[3px] after:text-red-500 after:content-["*"] text-sm font-medium text-gray-700'

  const getInputStyle = (hasError?: boolean, isTextarea: boolean = false) =>
    `border rounded-md w-full px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
      isTextarea ? '' : 'pr-10'
    } ${
      hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }`

  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '', lastName: '', email: '', telNumber: '', preferredContact: '', message: '', botField: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false) // 🌟 State สำหรับปุ่มโหลด
  const maxLength = 500

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const [widgetId, setWidgetId] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true

    const checkGrecaptcha = setInterval(() => {
      if (!mounted) {
        clearInterval(checkGrecaptcha)
        return
      }
      if (window.grecaptcha && window.grecaptcha.render && recaptchaContainerRef.current && widgetId === null) {
        const id = window.grecaptcha.render(recaptchaContainerRef.current, {
          sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test Key
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
          hl: 'th',
        })
        setWidgetId(id)
        clearInterval(checkGrecaptcha)
      }
    }, 200)

    return () => {
      mounted = false
      clearInterval(checkGrecaptcha)
    }
  }, [widgetId])

  const formatPhoneNumber = (value: string) => {
    if (!value) return value
    if (value.length < 4) return value
    if (value.length < 7) return `${value.slice(0, 3)} ${value.slice(3)}`
    return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'telNumber') {
      const rawValue = value.replace(/\D/g, '')
      if (rawValue.length > 10) return
      setFormData((prev) => ({ ...prev, [name]: rawValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleClear = (name: keyof ContactFormData) => {
    setFormData((prev) => ({ ...prev, [name]: '' }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🌟 1. ดักจับ Honeypot ถ้ามีข้อมูลแปลว่าเป็น Bot แน่นอน
    if (formData.botField) {
      console.warn('Bot detected via honeypot!')
      // หลอกบอทว่าส่งผ่านแล้ว รีเซ็ตฟอร์มทันทีโดยไม่ยิง API
      setFormData({ firstName: '', lastName: '', email: '', telNumber: '', preferredContact: '', message: '', botField: '' })
      return
    }

    const newErrors: FormErrors = {}
    let isValid = true

    const isThaiOnly = (v: string) => /^[ก-๙\s]+$/.test(v)
    const isEngOnly = (v: string) => /^[a-zA-Z\s]+$/.test(v)

    if (!formData.firstName.trim()) { 
      newErrors.firstName = 'กรุณากรอกชื่อจริงของท่าน'; 
      isValid = false; 
    } else if (!isThaiOnly(formData.firstName) && !isEngOnly(formData.firstName)) { 
      newErrors.firstName = 'กรุณากรอกเฉพาะตัวอักษรภาษาไทยหรือภาษาอังกฤษล้วนเท่านั้น'; 
      isValid = false; 
    }

    if (!formData.lastName.trim()) { 
      newErrors.lastName = 'กรุณากรอกนามสกุลของท่าน'; 
      isValid = false; 
    } else if (!isThaiOnly(formData.lastName) && !isEngOnly(formData.lastName)) { 
      newErrors.lastName = 'กรุณากรอกเฉพาะตัวอักษรภาษาไทยหรือภาษาอังกฤษล้วนเท่านั้น'; 
      isValid = false; 
    }

    // 2. เช็คว่าชื่อและนามสกุลใช้ภาษาเดียวกันหรือไม่
    if (isValid && formData.firstName && formData.lastName) {
      if (isThaiOnly(formData.firstName) !== isThaiOnly(formData.lastName)) {
        // 🌟 สั่งให้แสดง Error แดงทั้ง 2 ช่อง
        newErrors.firstName = 'ชื่อและนามสกุลต้องเป็นภาษาเดียวกันเท่านั้น'
        newErrors.lastName = 'ชื่อและนามสกุลต้องเป็นภาษาเดียวกันเท่านั้น'
        isValid = false
      }
    }

    if (!formData.email.trim()) { 
      newErrors.email = 'กรุณากรอกอีเมลครับ/ค่ะ'; 
      isValid = false; 
    } else if (!isEmail(formData.email)) { 
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น example@mail.com)'; 
      isValid = false; 
    }

    if (formData.telNumber && !/^0[0-9]{9}$/.test(formData.telNumber)) { 
      newErrors.telNumber = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 10 หลัก)'; 
      isValid = false; 
    }

    if (!formData.preferredContact) { 
      newErrors.preferredContact = 'กรุณาเลือกช่องทางการติดต่อกลับ'; 
      isValid = false; 
    }

    if (!formData.message.trim()) { 
      newErrors.message = 'กรุณากรอกข้อความที่ต้องการสอบถาม'; 
      isValid = false; 
    }

    setErrors(newErrors)

    if (!isValid) return

    if (!captchaToken) {
      alert('กรุณายืนยันว่าคุณไม่ใช่บอทครับ')
      return
    }

    // 🌟 2. เริ่มสถานะโหลดและเตรียมส่งข้อมูล
    setIsSubmitting(true)

    // ตัด botField ทิ้งก่อนส่งไปหลังบ้าน
    // eslint-disable-next-line
    const { botField: _, ...actualData } = formData
    const payload = { ...actualData, recaptchaToken: captchaToken }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert('ส่งข้อความสำเร็จ ขอบคุณที่ติดต่อเราครับ')
        if (widgetId !== null && window.grecaptcha) {
          window.grecaptcha.reset(widgetId)
        }
        setCaptchaToken(null)
        setFormData({ firstName: '', lastName: '', email: '', telNumber: '', preferredContact: '', message: '', botField: '' })
      } else {
        alert('ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่')
    } finally {
      // 🌟 3. คืนสถานะปุ่มกลับมาเป็นปกติไม่ว่าจะส่งผ่านหรือพัง
      setIsSubmitting(false)
    }
  }

  return (
    <article className={cardStyle}>
      <form onSubmit={handleSubmit} noValidate>
        
        {/* 🌟 Honeypot Input: ซ่อนตัวจากสายตามนุษย์ให้พ้นด้วย CSS ห้ามเอาออกเด็ดขาด! */}
        <div className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="botField">กรุณาปล่อยช่องนี้ว่างไว้หากคุณเป็นมนุษย์</label>
          <input type="text" name="botField" id="botField" tabIndex={-1} value={formData.botField} onChange={handleChange} autoComplete="off" />
        </div>

        <p className='text-center text-xl font-bold text-gray-800 mb-6'>ฝากข้อความถึงเรา</p>
        
        <div className='grid grid-cols-12 gap-5'>

          <div className='col-span-12 md:col-span-6'>
            <label htmlFor='firstName' className={requireStyle}>ชื่อจริง</label>
            <div className='relative mt-1'>
              <input type='text' name='firstName' id='firstName' value={formData.firstName} maxLength={100} onChange={handleChange} className={getInputStyle(!!errors.firstName)} disabled={isSubmitting} />
              {formData.firstName && !isSubmitting && <button type='button' onClick={() => handleClear('firstName')} className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'><ClearIcon /></button>}
            </div>
            {errors.firstName && <p className='text-red-500 text-xs mt-1'>{errors.firstName}</p>}
          </div>

          <div className='col-span-12 md:col-span-6'>
            <label htmlFor='lastName' className={requireStyle}>นามสกุล</label>
            <div className='relative mt-1'>
              <input type='text' name='lastName' id='lastName' maxLength={100} value={formData.lastName} onChange={handleChange} className={getInputStyle(!!errors.lastName)} disabled={isSubmitting} />
              {formData.lastName && !isSubmitting && <button type='button' onClick={() => handleClear('lastName')} className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'><ClearIcon /></button>}
            </div>
            {errors.lastName && <p className='text-red-500 text-xs mt-1'>{errors.lastName}</p>}
          </div>

          <div className='col-span-12 md:col-span-6'>
            <label htmlFor='email' className={requireStyle}>อีเมล</label>
            <div className='relative mt-1'>
              <input type='email' name='email' id='email' maxLength={254} value={formData.email} onChange={handleChange} className={getInputStyle(!!errors.email)} disabled={isSubmitting} />
              {formData.email && !isSubmitting && <button type='button' onClick={() => handleClear('email')} className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'><ClearIcon /></button>}
            </div>
            {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
          </div>

          <div className='col-span-12 md:col-span-6'>
            <label htmlFor='telNumber' className={requireStyle}>เบอร์โทรศัพท์</label>
            <div className='relative mt-1'>
              <input type='tel' name='telNumber' id='telNumber' maxLength={12} value={formatPhoneNumber(formData.telNumber)} onChange={handleChange} placeholder='0XX XXX XXXX' className={getInputStyle(!!errors.telNumber)} disabled={isSubmitting} />
              {formData.telNumber && !isSubmitting && <button type='button' onClick={() => handleClear('telNumber')} className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'><ClearIcon /></button>}
            </div>
            {errors.telNumber && <p className='text-red-500 text-xs mt-1'>{errors.telNumber}</p>}
          </div>

          <div className='col-span-12'>
            <p className={requireStyle}>สะดวกให้เราติดต่อกลับทางไหน?</p>
            <div className='flex gap-x-6 mt-2'>
              <label className={`flex items-center gap-x-2 ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                <input type='radio' name='preferredContact' value='email' checked={formData.preferredContact === 'email'} onChange={handleChange} className='w-4 h-4 text-blue-600' disabled={isSubmitting} />
                <span className='text-gray-700'>อีเมล</span>
              </label>
              <label className={`flex items-center gap-x-2 ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                <input type='radio' name='preferredContact' value='tel' checked={formData.preferredContact === 'tel'} onChange={handleChange} className='w-4 h-4 text-blue-600' disabled={isSubmitting} />
                <span className='text-gray-700'>เบอร์โทรศัพท์</span>
              </label>
            </div>
            {errors.preferredContact && <p className='text-red-500 text-xs mt-1'>{errors.preferredContact}</p>}
          </div>

          <div className='col-span-12'>
            <label htmlFor='message' className='text-sm font-medium text-gray-700'>พิมพ์ข้อความของคุณที่นี่...</label>
            <div className='relative mt-1'>
              <textarea name='message' id='message' value={formData.message} onChange={handleChange} placeholder='พิมพ์ข้อความของคุณที่นี่...' className={`h-[150px] resize-none pr-10 ${getInputStyle(!!errors.message, true)}`} maxLength={maxLength} disabled={isSubmitting} />
              {formData.message && !isSubmitting && <button type='button' onClick={() => handleClear('message')} className='absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'><ClearIcon /></button>}
            </div>
            <div className='flex justify-between items-start mt-1'>
              <div className='flex-1'>{errors.message && <p className='text-red-500 text-xs'>{errors.message}</p>}</div>
              <p className='text-right text-sm text-gray-500'>{formData.message.length}/{maxLength}</p>
            </div>
          </div>

          <div className='col-span-12 flex justify-center mt-2 min-h-[78px]'>
            <div ref={recaptchaContainerRef}></div>
          </div>

          <div className='col-span-12 flex justify-center mt-4'>
            {/* 🌟 ปุ่มอัปเกรด: แสดงสถานะ Loading และล็อคปุ่มกันกดเบิ้ล */}
            <button 
              type='submit' 
              disabled={!captchaToken || isSubmitting} 
              className={`w-[300px] font-medium p-3 rounded-md transition-colors shadow-sm flex items-center justify-center gap-2 ${(!captchaToken || isSubmitting) ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังส่งข้อความ...
                </>
              ) : (
                'ส่งข้อความ'
              )}
            </button>
          </div>
        </div>
      </form>
    </article>
  )
}

export default ContactForm