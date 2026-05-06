import React, { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  telNumber: string
  preferredContact: string
  message: string
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
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <line x1='18' y1='6' x2='6' y2='18'></line>
    <line x1='6' y1='6' x2='18' y2='18'></line>
  </svg>
)

const ContactForm = () => {
  const cardStyle =
    'w-full max-w-[600px] bg-white rounded-2xl m-10 p-8 border border-gray-200 shadow-lg mx-auto mt-25'
  const requireStyle =
    'after:ml-[3px] after:text-red-500 after:content-["*"] text-sm font-medium text-gray-700'

  // ปรับ getInputStyle: ย้าย mt-1 ออก และเพิ่มช่องว่างด้านขวา (pr-10) สำหรับช่อง Input ปกติ
  const getInputStyle = (hasError?: boolean, isTextarea: boolean = false) =>
    `border rounded-md w-full px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
      isTextarea ? '' : 'pr-10'
    } ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }`

  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    telNumber: '',
    preferredContact: '',
    message: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const maxLength = 500

  const formatPhoneNumber = (value: string) => {
    if (!value) return value
    const phoneNumberLength = value.length
    if (phoneNumberLength < 4) return value
    if (phoneNumberLength < 7) {
      return `${value.slice(0, 3)} ${value.slice(3)}`
    }
    return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)}`
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

  // ฟังก์ชันช่วยสำหรับปุ่ม Clear โดยเฉพาะ
  const handleClear = (name: keyof ContactFormData) => {
    setFormData((prev) => ({ ...prev, [name]: '' }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: FormErrors = {}
    let isValid = true

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อจริงของท่าน'
      isValid = false
    } else if (!/^[a-zA-Zก-๙\s]+$/.test(formData.firstName)) {
      newErrors.firstName =
        'กรุณากรอกเฉพาะตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
      isValid = false
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุลของท่าน'
      isValid = false
    } else if (!/^[a-zA-Zก-๙\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'กรุณากรอกเฉพาะตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมลครับ/ค่ะ'
      isValid = false
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น example@mail.com)'
      isValid = false
    }

    if (formData.telNumber && !/^0[0-9]{9}$/.test(formData.telNumber)) {
      newErrors.telNumber = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 10 หลัก)'
      isValid = false
    }

    if (!formData.preferredContact) {
      newErrors.preferredContact = 'กรุณาเลือกช่องทางการติดต่อกลับ'
      isValid = false
    }

    if (!formData.message.trim()) {
      newErrors.message = 'กรุณากรอกข้อความที่ต้องการสอบถาม'
      isValid = false
    }

    setErrors(newErrors)

    if (!isValid) return

    if (!captchaToken) {
      alert('กรุณายืนยันว่าคุณไม่ใช่บอทครับ')
      return
    }

    const payload = {
      ...formData,
      recaptchaToken: captchaToken,
    }

    console.log('กำลังส่งข้อมูล...', payload)

    // สมมติว่าส่งสำเร็จ จึงรีเซ็ตฟอร์ม
    // recaptchaRef.current?.reset();
    // setCaptchaToken(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      telNumber: '',
      preferredContact: '',
      message: '',
    })
  }

  return (
    <article className={cardStyle}>
      <form onSubmit={handleSubmit} noValidate>
        <p className='text-center text-xl font-bold text-gray-800 mb-6'>
          ฝากข้อความถึงเรา
        </p>
        <div className='grid grid-cols-12 gap-5'>
          {/* --- ชื่อจริง --- */}
          <div className='col-span-12 md:col-span-6'>
            <label htmlFor='firstName' className={requireStyle}>
              ชื่อจริง
            </label>
            <div className='relative mt-1'>
              <input
                type='text'
                name='firstName'
                id='firstName'
                value={formData.firstName}
                maxLength={100}
                onChange={handleChange}
                className={getInputStyle(!!errors.firstName)}
              />
              {formData.firstName && (
                <button
                  type='button'
                  onClick={() => handleClear('firstName')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'
                  aria-label='Clear input'
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            {errors.firstName && (
              <p className='text-red-500 text-xs mt-1'>{errors.firstName}</p>
            )}
          </div>

          {/* --- นามสกุล --- */}
          <div className='col-span-12 md:col-span-6'>
            <label htmlFor='lastName' className={requireStyle}>
              นามสกุล
            </label>
            <div className='relative mt-1'>
              <input
                type='text'
                name='lastName'
                id='lastName'
                maxLength={100}
                value={formData.lastName}
                onChange={handleChange}
                className={getInputStyle(!!errors.lastName)}
              />
              {formData.lastName && (
                <button
                  type='button'
                  onClick={() => handleClear('lastName')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'
                  aria-label='Clear input'
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            {errors.lastName && (
              <p className='text-red-500 text-xs mt-1'>{errors.lastName}</p>
            )}
          </div>

          {/* --- อีเมล --- */}
          <div className='col-span-12 md:col-span-6'>
            <label htmlFor='email' className={requireStyle}>
              อีเมล
            </label>
            <div className='relative mt-1'>
              <input
                type='email'
                name='email'
                id='email'
                maxLength={254}
                value={formData.email}
                onChange={handleChange}
                className={getInputStyle(!!errors.email)}
              />
              {formData.email && (
                <button
                  type='button'
                  onClick={() => handleClear('email')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'
                  aria-label='Clear input'
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            {errors.email && (
              <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
            )}
          </div>

          {/* --- เบอร์โทรศัพท์ --- */}
          <div className='col-span-12 md:col-span-6'>
            <label
              htmlFor='telNumber'
              className='text-sm font-medium text-gray-700'
            >
              เบอร์โทรศัพท์
            </label>
            <div className='relative mt-1'>
              <input
                type='tel'
                name='telNumber'
                id='telNumber'
                maxLength={10}
                value={formatPhoneNumber(formData.telNumber)}
                onChange={handleChange}
                className={getInputStyle(!!errors.telNumber)}
              />
              {formData.telNumber && (
                <button
                  type='button'
                  onClick={() => handleClear('telNumber')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'
                  aria-label='Clear input'
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            {errors.telNumber && (
              <p className='text-red-500 text-xs mt-1'>{errors.telNumber}</p>
            )}
          </div>

          {/* --- ช่องทางติดต่อ --- */}
          <div className='col-span-12'>
            <p className={requireStyle}>สะดวกให้เราติดต่อกลับทางไหน?</p>
            <div className='flex gap-x-6 mt-2'>
              <label className='flex items-center gap-x-2 cursor-pointer'>
                <input
                  type='radio'
                  name='preferredContact'
                  value='email'
                  checked={formData.preferredContact === 'email'}
                  onChange={handleChange}
                  className='w-4 h-4 text-blue-600'
                />
                <span className='text-gray-700'>อีเมล</span>
              </label>
              <label className='flex items-center gap-x-2 cursor-pointer'>
                <input
                  type='radio'
                  name='preferredContact'
                  value='tel'
                  checked={formData.preferredContact === 'tel'}
                  onChange={handleChange}
                  className='w-4 h-4 text-blue-600'
                />
                <span className='text-gray-700'>เบอร์โทรศัพท์</span>
              </label>
            </div>
            {errors.preferredContact && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.preferredContact}
              </p>
            )}
          </div>

          {/* --- กล่องข้อความ (Textarea) --- */}
          <div className='col-span-12'>
            <label
              htmlFor='message'
              className='text-sm font-medium text-gray-700'
            >
              พิมพ์ข้อความของคุณที่นี่...
            </label>
            <div className='relative mt-1'>
              <textarea
                name='message'
                id='message'
                value={formData.message}
                onChange={handleChange}
                placeholder='พิมพ์ข้อความของคุณที่นี่...'
                // ส่ง true ไปที่ getInputStyle เพื่อไม่ให้มันเว้นที่ด้านขวาเยอะเกินไปสำหรับ textarea
                className={`h-[150px] resize-none pr-10 ${getInputStyle(!!errors.message, true)}`}
                maxLength={maxLength}
              />
              {formData.message && (
                <button
                  type='button'
                  onClick={() => handleClear('message')}
                  // Textarea ให้ปุ่มอยู่มุมขวาบน (top-2) แทนการอยู่กึ่งกลาง
                  className='absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors'
                  aria-label='Clear input'
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            <div className='flex justify-between items-start mt-1'>
              <div className='flex-1'>
                {errors.message && (
                  <p className='text-red-500 text-xs'>{errors.message}</p>
                )}
              </div>
              <p className='text-right text-sm text-gray-500'>
                {formData.message.length}/{maxLength}
              </p>
            </div>
          </div>

          <div className='col-span-12 flex justify-center mt-2'>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey='6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
              onChange={handleCaptchaChange}
              hl='th'
            />
          </div>

          <div className='col-span-12 flex justify-center mt-4'>
            <button
              type='submit'
              disabled={!captchaToken}
              className='w-[300px] bg-blue-600 text-white font-medium p-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm'
            >
              ส่งข้อความ
            </button>
          </div>
        </div>
      </form>
    </article>
  )
}

export default ContactForm
