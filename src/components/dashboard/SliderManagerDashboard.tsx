import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import type { SliderImage } from '../../type'
import { api } from '../../utils/api'

const API_URL = import.meta.env.VITE_API_URL || ''

// ── Slide card with Dropdown reorder ──
const SlideCard = ({
  slide,
  index,
  totalSlides,
  onOrderChange,
  onDelete,
}: {
  slide: SliderImage
  index: number
  totalSlides: number
  onOrderChange: (oldIndex: number, newIndex: number) => void
  onDelete: (id: number) => void
}) => {
  const imgSrc = slide.image_url.startsWith('http')
    ? slide.image_url
    : `${API_URL}${slide.image_url}`

  return (
    <div className='flex flex-col gap-2'>
      <div
        className='group relative rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200'
        style={{ aspectRatio: '16/9' }}
      >
        <img
          src={imgSrc}
          alt={`Slide ${index + 1}`}
          className='w-full h-full object-cover'
        />

        {/* Overlay on hover */}
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center'>
          {/* Order badge */}
          <div className='absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-lg'>
            #{index + 1}
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(slide.id)}
            className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg'
            title='ลบรูปนี้'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Dropdown for ordering */}
      <div className='flex items-center gap-2 px-1'>
        <span className='text-sm text-slate-500 font-medium'>ลำดับที่:</span>
        <select
          value={index}
          onChange={(e) => onOrderChange(index, parseInt(e.target.value))}
          className='text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 bg-white cursor-pointer hover:border-blue-400'
        >
          {Array.from({ length: totalSlides }).map((_, i) => (
            <option key={i} value={i}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ── Main Dashboard Component ──
export default function SliderManagerDashboard() {
  const [slides, setSlides] = useState<SliderImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const [hasOrderChanged, setHasOrderChanged] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchSlides = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api<{ success: boolean; data: SliderImage[] }>('/slider', { method: 'GET' })
      if (res?.success) {
        setSlides(res.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch slides', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  // ── File picker ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f))
    setPendingFiles((prev) => [...prev, ...imageFiles])
    setPendingPreviews((prev) => [...prev, ...newPreviews])

    // reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Remove pending (not-yet-uploaded) image ──
  const handleRemovePending = (index: number) => {
    URL.revokeObjectURL(pendingPreviews[index])
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Delete saved slide ──
  const handleDeleteSlide = async (id: number) => {
    const confirm = await Swal.fire({
      title: 'ลบรูปภาพนี้?',
      text: 'รูปภาพจะถูกลบออกจาก Slider หน้าหลักทันที',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    })
    if (!confirm.isConfirmed) return

    try {
      await api(`/slider/${id}`, { method: 'DELETE' })
      setSlides((prev) => prev.filter((s) => s.id !== id))
      Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1200, showConfirmButton: false })
    } catch {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบรูปภาพได้' })
    }
  }

  // ── Dropdown reorder ──
  const handleOrderChange = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return
    setSlides((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, moved)
      return updated
    })
    setHasOrderChanged(true)
  }

  // ── Save: upload new files + save order ──
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. อัปโหลดรูปใหม่ทีละรูป
      if (pendingFiles.length > 0) {
        for (const file of pendingFiles) {
          const formData = new FormData()
          formData.append('image', file)
          await api('/slider', { method: 'POST', body: formData })
        }
        setPendingFiles([])
        setPendingPreviews([])
      }

      // 2. โหลดข้อมูลใหม่หลังอัปโหลด
      const res = await api<{ success: boolean; data: SliderImage[] }>('/slider', { method: 'GET' })
      const latestSlides = res?.data || []

      // 3. ถ้ามีการเปลี่ยนลำดับ ให้บันทึกลำดับ
      if (hasOrderChanged) {
        const orderedIds = slides.map((s) => s.id)
        await api('/slider/reorder', { method: 'PUT', body: { orderedIds } })
        setHasOrderChanged(false)
      }

      setSlides(latestSlides)

      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        text: 'Slider หน้าหลักอัปเดตเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกข้อมูลได้' })
    } finally {
      setIsSaving(false)
    }
  }

  const hasPendingChanges = pendingFiles.length > 0 || hasOrderChanged

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>จัดการ Slider หน้าหลัก</h2>
          <p className='text-slate-500 text-sm mt-1'>
            เพิ่ม/ลบรูปภาพ และเลือก Dropdown ด้านล่างภาพเพื่อจัดลำดับการแสดงผล
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() => fileInputRef.current?.click()}
            className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:border-blue-400 hover:text-blue-600 transition-all text-sm'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            เพิ่มรูปภาพ
          </button>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={handleFileChange}
          />

          <button
            onClick={handleSave}
            disabled={!hasPendingChanges || isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              hasPendingChanges && !isSaving
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                บันทึกการเปลี่ยนแปลง
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pending change indicator */}
      {hasPendingChanges && (
        <div className='flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm font-medium'>
          <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
          </svg>
          มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก — กด "บันทึกการเปลี่ยนแปลง" เพื่อบันทึก
        </div>
      )}

      {/* Slides Grid */}
      {isLoading ? (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='rounded-2xl bg-slate-200 animate-pulse' style={{ aspectRatio: '16/9' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Saved Slides */}
          {slides.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3'>
                รูปภาพที่บันทึกแล้ว ({slides.length} รูป) — เลือก Dropdown เพื่อเปลี่ยนลำดับ
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4'>
                {slides.map((slide, index) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    index={index}
                    totalSlides={slides.length}
                    onOrderChange={handleOrderChange}
                    onDelete={handleDeleteSlide}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending (Not yet uploaded) Slides */}
          {pendingPreviews.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                รอการบันทึก ({pendingPreviews.length} รูป)
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {pendingPreviews.map((src, i) => (
                  <div
                    key={i}
                    className='group relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-400 bg-amber-50'
                    style={{ aspectRatio: '16/9' }}
                  >
                    <img src={src} alt={`Pending ${i + 1}`} className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center'>
                      <button
                        onClick={() => handleRemovePending(i)}
                        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                      <span className='absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg'>
                        รอบันทึก
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {slides.length === 0 && pendingPreviews.length === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className='flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-300 rounded-2xl p-16 text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all'
            >
              <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              <div className='text-center'>
                <p className='font-semibold text-base'>ยังไม่มีรูปภาพใน Slider</p>
                <p className='text-sm mt-1'>คลิกที่นี่เพื่อเพิ่มรูปภาพแรก</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Section */}
      {(slides.length > 0 || pendingPreviews.length > 0) && (
        <div className='mt-8 bg-slate-900 rounded-2xl p-4'>
          <h3 className='text-white text-sm font-semibold mb-3 flex items-center gap-2'>
            <svg className='w-4 h-4 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
            </svg>
            ตัวอย่างลำดับการแสดงผล (Slider Preview)
          </h3>
          <div className='flex gap-2 overflow-x-auto pb-2'>
            {slides.map((slide, i) => (
              <div key={slide.id} className='shrink-0 relative rounded-xl overflow-hidden' style={{ width: 120, height: 68 }}>
                <img
                  src={slide.image_url.startsWith('http') ? slide.image_url : `${API_URL}${slide.image_url}`}
                  alt={`Preview ${i + 1}`}
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-black/20 flex items-end justify-start p-1'>
                  <span className='text-white text-xs font-bold bg-black/50 rounded px-1'>#{i + 1}</span>
                </div>
              </div>
            ))}
            {pendingPreviews.map((src, i) => (
              <div key={`p${i}`} className='shrink-0 relative rounded-xl overflow-hidden border-2 border-amber-400' style={{ width: 120, height: 68 }}>
                <img src={src} alt={`Pending ${i + 1}`} className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black/20 flex items-end justify-start p-1'>
                  <span className='text-amber-300 text-xs font-bold bg-black/50 rounded px-1'>รอ</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
