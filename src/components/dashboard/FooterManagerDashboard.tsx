// src/components/dashboard/FooterManagerDashboard.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFacebook,
  FaFax,
  FaGlobeAmericas,
  FaLine,
  FaLink,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaSpinner,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa'
import { contentService } from '../../services/contentService'
import { toast } from '../../utils/swalConfig'

// ── Default fallback values (ตรงกับ Footer.tsx) ──
const DEFAULTS: Record<string, string> = {
  address: '422 ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330',
  phone: '02-219-3600 ต่อ 1022, 1028',
  fax: '02-219-3902',
  email: 'webmaster@amlo.go.th',
  copyright: 'สำนักงาน ปปง. สงวนลิขสิทธิ์',
  visitor_count: '0',
}

const FIELDS = [
  { key: 'address', label: 'ที่อยู่', type: 'textarea' as const },
  { key: 'phone', label: 'เบอร์โทรศัพท์', type: 'text' as const },
  { key: 'fax', label: 'โทรสาร', type: 'text' as const },
  { key: 'email', label: 'อีเมล', type: 'text' as const },
  { key: 'copyright', label: 'ข้อความลิขสิทธิ์', type: 'text' as const },
]

// 🌟 สลับการซ่อน/แสดงบรรทัด "ผู้เข้าชม: N คน" บน Footer สาธารณะ
//    เก็บใน site_settings เหมือน key อื่น — ค่าเริ่มต้น (ยังไม่มีใน DB) = แสดง
const VISITOR_VISIBLE_KEY = 'visitor_visible'

/** ค่าเริ่มต้น = แสดง (เฉพาะเมื่อตั้งเป็น 'false' อย่างชัดเจนจึงซ่อน) */
const isVisitorVisible = (map: Record<string, string>): boolean =>
  (map[VISITOR_VISIBLE_KEY] ?? '').trim().toLowerCase() !== 'false'

const POLICY_FIELDS = [
  { key: 'policy_website', label: 'นโยบายเว็บไซต์' },
  { key: 'policy_privacy', label: 'นโยบายคุ้มครองข้อมูลส่วนบุคคล' },
  { key: 'policy_cookies', label: 'นโยบายคุกกี้' },
  { key: 'policy_security', label: 'นโยบายความมั่นคงปลอดภัยเว็บไซต์' },
  { key: 'policy_accessibility', label: 'การเข้าถึงเว็บไซต์' },
]

const SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook URL' },
  { key: 'line', label: 'LINE URL' },
  { key: 'youtube', label: 'YouTube URL' },
  { key: 'twitter', label: 'Twitter/X URL' },
]

const LINK_FIELDS = [
  { key: 'bookguide_url', label: 'ลิงก์คู่มือสำหรับประชาชน' },
  { key: 'open_data_url', label: 'ลิงก์ข้อมูลเปิดภาครัฐ (Open Data)' },
  { key: 'rss_url', label: 'ลิงก์ RSS Feed' },
]

export default function FooterManagerDashboard() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [savedSettings, setSavedSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await contentService.getSiteSettings()
      setSettings(data)
      setSavedSettings(data)
    } catch {
      toast.fire({
        icon: 'error',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        timer: 1500,
        showConfirmButton: false,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleToggleVisitorVisible = () => {
    const next = !isVisitorVisible(settings)
    setSettings((prev) => ({
      ...prev,
      [VISITOR_VISIBLE_KEY]: next ? 'true' : 'false',
    }))
    // 🌟 แจ้งทันทีว่าสลับแล้ว — แต่ยังไม่บันทึกจนกว่าจะกดปุ่มบันทึก
    toast.fire({
      icon: 'info',
      title: next
        ? 'จะแสดงบรรทัดผู้เข้าชม — กด "บันทึก" เพื่อยืนยัน'
        : 'จะซ่อนบรรทัดผู้เข้าชม — กด "บันทึก" เพื่อยืนยัน',
      timer: 3000,
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const allFields = [
        ...FIELDS,
        ...POLICY_FIELDS,
        ...SOCIAL_FIELDS,
        ...LINK_FIELDS,
        { key: 'visitor_count', label: 'จำนวนผู้เข้าชม' },
      ]
      // ส่งเฉพาะ field ที่เปลี่ยน — ถ้าผู้ใช้ลบค่า ให้ส่ง "" ไปล้างค่าใน DB ด้วย
      const payload = allFields
        .map((f) => ({
          key: f.key,
          value: settings[f.key] ?? '',
        }))
        .filter((item) => (savedSettings[item.key] ?? '') !== item.value)

      // 🌟 สถานะซ่อน/แสดง ต้องส่งเสมอเมื่อเปลี่ยน (เก็บเป็น 'true'/'false')
      const visitorVisible = isVisitorVisible(settings)
      const savedVisible = isVisitorVisible(savedSettings)
      if (visitorVisible !== savedVisible) {
        payload.push({
          key: VISITOR_VISIBLE_KEY,
          value: visitorVisible ? 'true' : 'false',
        })
      }

      if (payload.length === 0) {
        toast.fire({ icon: 'info', title: 'ไม่มีข้อมูลที่เปลี่ยนแปลง' })
        return
      }

      await contentService.updateSiteSettings(payload)
      setSavedSettings((prev) => {
        const next = { ...prev }
        payload.forEach((item) => {
          next[item.key] = item.value
        })
        return next
      })
      toast.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch {
      toast.fire({ icon: 'error', title: 'ไม่สามารถบันทึกได้' })
    } finally {
      setIsSaving(false)
    }
  }

  const s = (key: string) => settings[key] ?? ''
  const display = (key: string): string => s(key) || DEFAULTS[key] || ''

  const scrollToPreview = () => {
    setShowPreview(true)
    setTimeout(
      () =>
        previewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        }),
      100,
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <FaSpinner className='w-8 h-8 animate-spin text-gray-400' />
      </div>
    )
  }

  return (
    <div className='space-y-6 max-w-4xl'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>จัดการ Footer</h2>
          <p className='text-slate-500 text-sm mt-1'>
            แก้ไขข้อมูล Footer, นโยบาย และ Social Media
          </p>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:bg-slate-300 disabled:border-slate-300 disabled:cursor-not-allowed'
          >
            {isSaving ? (
              <>
                <FaSpinner className='w-3.5 h-3.5 animate-spin' /> กำลังบันทึก...
              </>
            ) : (
              <>
                <FaSave /> บันทึก
              </>
            )}
          </button>
          <button
            onClick={scrollToPreview}
            className='px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5'
          >
            <FaEye /> ดูตัวอย่าง
          </button>
        </div>
      </div>

      {/* ── Contact Info ── */}
      <section className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          ข้อมูลติดต่อ
        </h3>
        <div className='space-y-4'>
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={s(field.key)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={3}
                  placeholder={DEFAULTS[field.key] || ''}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
                />
              ) : (
                <input
                  value={s(field.key)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={DEFAULTS[field.key] || ''}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
                />
              )}
              {DEFAULTS[field.key] && !s(field.key) && (
                <p className='text-[10px] text-gray-400 mt-1'>
                  ค่าเริ่มต้น: {DEFAULTS[field.key]}
                </p>
              )}
            </div>
          ))}

          {/* ── จำนวนผู้เข้าชม + ปุ่มซ่อน/แสดง ── */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              จำนวนผู้เข้าชม
            </label>
            <div className='flex items-center gap-2'>
              <input
                value={s('visitor_count')}
                onChange={(e) => handleChange('visitor_count', e.target.value)}
                placeholder={DEFAULTS.visitor_count || ''}
                inputMode='numeric'
                className='w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
              />
              <button
                type='button'
                onClick={handleToggleVisitorVisible}
                aria-pressed={isVisitorVisible(settings)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isVisitorVisible(settings)
                    ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {isVisitorVisible(settings) ? <FaEye /> : <FaEyeSlash />}
                {isVisitorVisible(settings) ? 'แสดงอยู่' : 'ซ่อนอยู่'}
              </button>
              {isVisitorVisible(settings) !== isVisitorVisible(savedSettings) && (
                <span className='text-xs font-medium text-amber-600'>
                  • ยังไม่บันทึก
                </span>
              )}
            </div>
            <p className='text-[10px] text-gray-400 mt-1'>
              {isVisitorVisible(settings)
                ? 'บรรทัด "ผู้เข้าชม" จะแสดงบน Footer'
                : 'บรรทัด "ผู้เข้าชม" จะถูกซ่อนจาก Footer'}
              {' · '}
              {DEFAULTS.visitor_count && !s('visitor_count')
                ? `ค่าเริ่มต้น: ${DEFAULTS.visitor_count}`
                : 'ถ้าตั้งค่า GA แล้ว ระบบจะแสดงตัวเลขจริงจาก GA แทนค่านี้'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Policy Links ── */}
      <section className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          ลิงก์นโยบาย
        </h3>
        <div className='space-y-4'>
          {POLICY_FIELDS.map((field) => (
            <div key={field.key}>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {field.label}
              </label>
              <div className='flex items-center gap-2 border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-300'>
                <FaLink className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                <input
                  value={s(field.key)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder='https://example.com/policy'
                  className='w-full py-2 text-sm focus:outline-none bg-transparent'
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Extra Links ── */}
      <section className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-1'>
          ลิงก์เพิ่มเติม
        </h3>
        <p className='text-xs text-gray-500 mb-4'>
          ใส่ URL ปลายทาง — ถ้ายังว่าง ลิงก์จะแสดงแบบปิดใช้งาน (สีจาง
          กดไม่ได้) และจะซ่อนจากหน้า Sitemap
        </p>
        <div className='space-y-4'>
          {LINK_FIELDS.map((field) => (
            <div key={field.key}>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {field.label}
              </label>
              <div className='flex items-center gap-2 border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-300'>
                <FaLink className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                <input
                  value={s(field.key)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder='https://...'
                  className='w-full py-2 text-sm focus:outline-none bg-transparent'
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Media ── */}
      <section className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          Social Media
        </h3>
        <div className='space-y-4'>
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.key}>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {field.label}
              </label>
              <div className='flex items-center gap-2 border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-300'>
                <FaLink className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                <input
                  value={s(field.key)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder='https://facebook.com/...'
                  className='w-full py-2 text-sm focus:outline-none bg-transparent'
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Save Buttons ── */}
      <div className='flex justify-end gap-3'>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className='flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all disabled:bg-slate-300 disabled:cursor-not-allowed'
        >
          {isSaving ? (
            <>
              <FaSpinner className='w-4 h-4 animate-spin' /> กำลังบันทึก...
            </>
          ) : (
            <>
              <FaSave className='w-4 h-4' /> บันทึกการเปลี่ยนแปลง
            </>
          )}
        </button>
      </div>

      {/* ── Live Preview ── */}
      {showPreview && (
        <div
          ref={previewRef}
          className='bg-white rounded-xl border border-gray-200 p-6'
        >
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-800'>
              ตัวอย่าง Footer
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className='text-sm text-gray-400 hover:text-gray-600'
            >
              ซ่อน
            </button>
          </div>
          <div className='bg-slate-900 text-slate-300 rounded-lg p-6 text-sm space-y-4'>
            {/* Contact Info */}
            <div className='flex items-start gap-2'>
              <FaMapMarkerAlt className='w-4 h-4 mt-0.5 shrink-0 text-blue-400' />
              <span>{display('address')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <FaPhone className='w-3.5 h-3.5 shrink-0 text-blue-400' />
              <span>{display('phone')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <FaFax className='w-3.5 h-3.5 shrink-0 text-blue-400' />
              <span>{display('fax')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <FaEnvelope className='w-3.5 h-3.5 shrink-0 text-blue-400' />
              <a
                href={`mailto:${display('email')}`}
                className='hover:text-white underline underline-offset-2'
              >
                {display('email')}
              </a>
            </div>

            {/* Social */}
            <div className='flex items-center gap-2 pt-2'>
              {s('facebook') && (
                <FaFacebook className='w-4 h-4 text-blue-500' />
              )}
              {s('line') && <FaLine className='w-4 h-4 text-green-500' />}
              {s('youtube') && <FaYoutube className='w-4 h-4 text-red-500' />}
              {s('twitter') && <FaTwitter className='w-4 h-4 text-sky-500' />}
              {!s('facebook') &&
                !s('line') &&
                !s('youtube') &&
                !s('twitter') && (
                  <span className='text-gray-500 text-xs'>
                    (ยังไม่มี Social Media)
                  </span>
                )}
            </div>

            {/* Policy Links */}
            <div className='border-t border-slate-800 pt-3 grid grid-cols-1 md:grid-cols-2 gap-2'>
              {POLICY_FIELDS.map((pf) => (
                <a
                  key={pf.key}
                  href={s(pf.key) || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`text-xs inline-flex items-center gap-1 ${s(pf.key) ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 cursor-default'}`}
                >
                  <FaGlobeAmericas className='w-3 h-3' /> {pf.label}
                </a>
              ))}
            </div>

            {/* Extra Links */}
            {(s('bookguide_url') || s('open_data_url') || s('rss_url')) && (
              <div className='border-t border-slate-800 pt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs'>
                {s('bookguide_url') && (
                  <a
                    href={s('bookguide_url')}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:text-blue-300 inline-flex items-center gap-1'
                  >
                    <FaGlobeAmericas className='w-3 h-3' /> คู่มือสำหรับประชาชน
                  </a>
                )}
                {s('open_data_url') && (
                  <a
                    href={s('open_data_url')}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:text-blue-300 inline-flex items-center gap-1'
                  >
                    <FaGlobeAmericas className='w-3 h-3' /> Open Data
                  </a>
                )}
                {s('rss_url') && (
                  <a
                    href={s('rss_url')}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:text-blue-300 inline-flex items-center gap-1'
                  >
                    <FaGlobeAmericas className='w-3 h-3' /> RSS Feed
                  </a>
                )}
              </div>
            )}

            {/* Copyright */}
            <div className='border-t border-slate-800 pt-3 text-xs text-slate-500 flex justify-between'>
              <span>
                &copy; {new Date().getFullYear()} {display('copyright')}
              </span>
              {isVisitorVisible(settings) ? (
                <span>ผู้เข้าชม: {display('visitor_count')} คน</span>
              ) : (
                <span className='text-slate-600 italic'>
                  (ซ่อนบรรทัดผู้เข้าชม)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
