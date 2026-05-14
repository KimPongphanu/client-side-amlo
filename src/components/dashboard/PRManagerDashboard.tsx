import React, { useState } from 'react'
import Swal from 'sweetalert2'

// ==========================================
// 1. Types & Interfaces
// ==========================================
export interface NewsItem {
  id: number
  title: string
  date: string
  image_src: string
  description: string
  content?: string
  views?: number
  isShow?: boolean
}

// ==========================================
// 2. Mock Data Generator
// ==========================================
const generateMockPR = (): NewsItem[] => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: 1000 + i,
    title: `ประกาศประชาสัมพันธ์ เรื่องที่ ${i + 1} การปรับปรุงระบบประจำเดือน`,
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    image_src: `https://picsum.photos/seed/${i + 1}/800/400`,
    description: `คำอธิบายสั้นๆ สำหรับประกาศที่ ${i + 1} เพื่อให้ประชาชนรับทราบ...`,
    content: `รายละเอียดเนื้อหาฉบับเต็มของประกาศที่ ${i + 1}...\n\nระบบจะทำการปิดปรับปรุงในเวลา 23:00 น. ขออภัยในความไม่สะดวกครับ`,
    views: Math.floor(Math.random() * 1000),
    isShow: i < 3,
  }))
}

// ==========================================
// 3. Mini Preview Component
// ==========================================
const MiniAdvertisePreview = ({ data }: { data: NewsItem | null }) => {
  if (!data) return null

  return (
    <div className='bg-white h-full overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl relative shadow-sm pointer-events-none'>
      <div className='w-full h-40 md:h-48 bg-slate-200 flex items-center justify-center text-slate-400'>
        {data.image_src ? (
          <img
            src={data.image_src}
            alt='cover'
            className='w-full h-full object-cover'
          />
        ) : (
          <span className='text-xs'>ไม่มีรูปภาพประกอบ</span>
        )}
      </div>
      <div className='p-4 md:p-6 pb-8'>
        <p className='text-xs text-blue-600 font-bold mb-2'>
          {data.date || 'YYYY-MM-DD'}
        </p>
        <h1 className='text-base md:text-lg font-bold text-slate-800 mb-3 leading-snug'>
          {data.title || 'พิมพ์หัวข้อประกาศ...'}
        </h1>
        <hr className='border-slate-100 mb-4' />
        <div className='text-slate-600 text-sm leading-relaxed whitespace-pre-line'>
          {data.content || data.description || 'พิมพ์เนื้อหาประกาศ...'}
        </div>
      </div>
      <div className='absolute top-3 right-3 bg-slate-900/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm'>
        Live Preview
      </div>
    </div>
  )
}

// ==========================================
// 4. Main Component
// ==========================================
export default function PRManagerDashboard() {

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activePost, setActivePost] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState<NewsItem | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 🌟 State สำหรับ Mobile (สลับหน้า Form <-> Preview)
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form')

  // 🌟 ใส่ () => เข้าไปใน useState ได้เลย ระบบจะรันฟังก์ชันนี้แค่ครั้งแรกที่โหลดหน้าจอ
  const [prList, setPrList] = useState<NewsItem[]>(() => generateMockPR())

  const shownCount = prList.filter((item) => item.isShow).length

  // --- List Handlers ---
  const handleToggleShow = (
    id: number,
    e: React.MouseEvent | React.ChangeEvent,
  ) => {
    e.stopPropagation()
    const target = prList.find((p) => p.id === id)
    if (!target) return

    if (!target.isShow && shownCount >= 10) {
      Swal.fire({
        icon: 'warning',
        title: 'จำกัดจำนวนแสดงผล',
        text: 'สามารถเลือกแสดงผลหน้าเว็บได้สูงสุด 10 รายการเท่านั้น',
        confirmButtonColor: '#f59e0b',
      })
      return
    }
    setPrList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isShow: !p.isShow } : p)),
    )
  }

  const handleCreateNew = () => {
    const newEmptyPost: NewsItem = {
      id: Date.now(),
      title: '',
      date: new Date().toISOString().split('T')[0],
      image_src: '',
      description: '',
      content: '',
      views: 0,
      isShow: false,
    }
    setActivePost(null)
    setFormData(newEmptyPost)
    setMobileView('form') // รีเซ็ตมุมมองมือถือให้เริ่มที่ฟอร์ม
    setIsModalOpen(true)
  }

  const handleOpenModal = (post: NewsItem) => {
    setActivePost(post)
    setFormData({ ...post })
    setMobileView('form') // รีเซ็ตมุมมองมือถือให้เริ่มที่ฟอร์ม
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setActivePost(null)
      setFormData(null)
      setMobileView('form')
    }, 200)
  }

  const handleRefreshData = () => {
    Swal.fire({
      title: 'ยืนยันการคืนค่า?',
      text: 'ข้อมูลที่คุณกำลังแก้ไขจะถูกล้างและกลับไปเป็นค่าเดิม',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ใช่, คืนค่าเดิม',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        if (activePost) {
          setFormData({ ...activePost })
        } else {
          setFormData({
            id: formData?.id || Date.now(),
            title: '',
            date: new Date().toISOString().split('T')[0],
            image_src: '',
            description: '',
            content: '',
            views: 0,
            isShow: false,
          })
        }
        Swal.fire({
          icon: 'success',
          title: 'คืนค่าสำเร็จ',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    })
  }

  // --- Drag & Drop Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFileUpload(e.dataTransfer.files[0])
  }
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0])
  }
  const handleFileUpload = (file: File) => {
    if (!file.type.match(/image.*|video.*/)) {
      Swal.fire({
        icon: 'error',
        title: 'ไฟล์ไม่รองรับ',
        text: 'กรุณาอัปโหลดรูปภาพหรือวิดีโอเท่านั้น',
        confirmButtonColor: '#ef4444',
      })
      return
    }
    const fakeUrl = URL.createObjectURL(file)
    if (formData) setFormData({ ...formData, image_src: fakeUrl })
  }

  const handleSave = () => {
    if (!formData || !formData.title.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาระบุหัวข้อประกาศ',
        confirmButtonColor: '#ef4444',
      })
      // บังคับสลับกลับไปหน้าฟอร์มเพื่อแก้ให้ครบ
      if (mobileView === 'preview') setMobileView('form')
      return
    }

    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      timer: 800,
      didOpen: () => Swal.showLoading(),
    }).then(() => {
      if (activePost === null) {
        setPrList((prev) => [formData, ...prev])
      } else {
        setPrList((prev) =>
          prev.map((p) => (p.id === formData.id ? formData : p)),
        )
      }
      handleCloseModal()
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        confirmButtonColor: '#2563eb',
        showConfirmButton: false,
        timer: 1500,
      })
    })
  }

  return (
    <div className='bg-slate-100 min-h-screen p-4 md:p-8 font-sans text-slate-800'>
      {/* --- Main Page Header --- */}
      <div className='max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
        <div>
          <h1 className='text-2xl font-bold mb-2'>จัดการข่าวประชาสัมพันธ์</h1>
          <div className='flex items-center gap-4 text-sm'>
            <span className='text-slate-600'>
              ทั้งหมด:{' '}
              <span className='font-bold text-slate-900'>{prList.length}</span>
            </span>
            <span className='w-px h-4 bg-slate-300'></span>
            <span
              className={`font-bold ${shownCount === 10 ? 'text-amber-600' : 'text-emerald-600'}`}
            >
              แสดงผลหน้าเว็บ: {shownCount}/10
            </span>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className='w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2'
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
              strokeWidth='2'
              d='M12 4v16m8-8H4'
            />
          </svg>
          สร้างประชาสัมพันธ์ใหม่
        </button>
      </div>

      {/* --- Full Width List Grid --- */}
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20'>
        {prList.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenModal(item)}
            className='bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group'
          >
            <div className='p-4 flex gap-4 flex-1'>
              <div className='w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 shrink-0 overflow-hidden'>
                {item.image_src ? (
                  <img
                    src={item.image_src}
                    alt='cover'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-300'>
                    <svg
                      className='w-8 h-8'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-[11px] text-blue-600 font-bold mb-1'>
                  {item.date}
                </p>
                <h3 className='text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug'>
                  {item.title}
                </h3>
              </div>
            </div>

            <div
              className='bg-slate-50 border-t border-slate-100 px-4 py-3 flex justify-between items-center'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-center gap-1.5 text-[11px] text-slate-500 font-medium'>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  />
                </svg>
                เข้าชม {item.views} ครั้ง
              </div>

              <label className='relative inline-flex items-center cursor-pointer gap-2'>
                <span
                  className={`text-[11px] font-bold ${item.isShow ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                  {item.isShow ? 'แสดงบนเว็บ' : 'ซ่อน'}
                </span>
                <input
                  type='checkbox'
                  checked={item.isShow}
                  onChange={(e) => handleToggleShow(item.id, e)}
                  className='sr-only peer'
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[18px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* MODAL POPUP (Responsive 2-Step) */}
      {/* ========================================== */}
      {isModalOpen && formData && (
        <div
          onClick={handleCloseModal}
          className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white w-full max-w-6xl h-[95vh] md:h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up'
          >
            {/* --- Modal Header --- */}
            <div className='px-4 md:px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0'>
              <div>
                <h2 className='text-base md:text-lg font-bold text-slate-800'>
                  {activePost === null
                    ? 'สร้างประกาศใหม่'
                    : `แก้ไขข้อมูล: ID ${formData.id}`}
                </h2>
                <p className='text-xs text-slate-500 hidden md:block'>
                  โปรดระบุข้อมูลให้ครบถ้วนเพื่อผลลัพธ์ที่ดี
                </p>
              </div>

              <div className='flex items-center gap-2 md:gap-4'>
                <button
                  onClick={handleRefreshData}
                  className='flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors'
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
                      strokeWidth='2'
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  <span className='hidden sm:inline'>รีเซ็ตข้อมูล</span>
                </button>
                <div className='w-px h-6 bg-slate-300'></div>
                <button
                  onClick={handleCloseModal}
                  className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* --- Modal Body (Split on Desktop, Toggle on Mobile) --- */}
            <div className='flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100'>
              {/* 1. Left: Edit Form (ซ่อนบนมือถือถ้าอยู่ในโหมด Preview) */}
              <div
                className={`flex-1 overflow-y-auto custom-scrollbar bg-white p-4 md:p-8 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}
              >
                <div className='max-w-3xl mx-auto space-y-6 md:space-y-8 pb-4'>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start border-b border-slate-100 pb-6 md:pb-8'>
                    <label className='text-sm font-bold text-slate-700 md:pt-2'>
                      หัวข้อประกาศ <span className='text-red-500'>*</span>
                    </label>
                    <div className='md:col-span-3'>
                      <input
                        type='text'
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder='ระบุหัวข้อข่าวประชาสัมพันธ์...'
                        className='w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center border-b border-slate-100 pb-6 md:pb-8'>
                    <label className='text-sm font-bold text-slate-700'>
                      วันที่ (Date)
                    </label>
                    <div className='md:col-span-3'>
                      <input
                        type='date'
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className='border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-auto'
                      />
                    </div>
                  </div>

                  {/* Drag & Drop */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start border-b border-slate-100 pb-6 md:pb-8'>
                    <div>
                      <label className='text-sm font-bold text-slate-700 block mb-1'>
                        ภาพปก (Cover)
                      </label>
                      <span className='text-[10px] text-slate-400 leading-tight block'>
                        JPEG, PNG หรือ MP4
                        <br />
                        สูงสุด 5 MB
                      </span>
                    </div>
                    <div className='md:col-span-3 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center'>
                      {formData.image_src && (
                        <div className='w-full sm:w-32 h-40 rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-sm'>
                          <img
                            src={formData.image_src}
                            alt='cover'
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex-1 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer relative
                          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                      >
                        <input
                          type='file'
                          accept='image/*,video/mp4'
                          onChange={handleFileInput}
                          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                        />
                        <svg
                          className='w-8 h-8 text-slate-400 mb-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                          />
                        </svg>
                        <p className='text-sm font-medium text-blue-600 mb-1'>
                          คลิกอัปโหลด{' '}
                          <span className='text-slate-500'>
                            หรือลากไฟล์มาวาง
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start'>
                    <div>
                      <label className='text-sm font-bold text-slate-700 block mb-1'>
                        เนื้อหา (Content)
                      </label>
                      <span className='text-[10px] text-slate-400'>
                        เนื้อหาส่วนนี้จะแสดงในหน้าอ่านเต็ม
                      </span>
                    </div>
                    <div className='md:col-span-3'>
                      <textarea
                        rows={8}
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        className='w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none custom-scrollbar'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Right/Bottom: Live Preview (ซ่อนบนมือถือถ้าอยู่ในโหมด Form) */}
              <div
                className={`w-full lg:w-[400px] xl:w-[450px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 p-4 lg:p-6 overflow-hidden flex flex-col shrink-0 ${mobileView === 'form' ? 'hidden lg:flex' : 'flex'}`}
              >
                <h3 className='text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0'>
                  <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
                  หน้าตัวอย่าง (Preview)
                </h3>
                <div className='flex-1 min-h-0 overflow-hidden pb-4'>
                  <MiniAdvertisePreview data={formData} />
                </div>
              </div>
            </div>

            {/* --- Modal Footer (Dynamic 2-Step Logic) --- */}
            <div className='px-4 md:px-6 py-4 border-t border-slate-200 bg-white flex justify-between md:justify-end gap-3 shrink-0'>
              {/* ปุ่มควบคุมเฉพาะหน้าจอมือถือ (lg:hidden) */}
              <div className='flex lg:hidden w-full justify-between gap-3'>
                {mobileView === 'form' ? (
                  <>
                    <button
                      onClick={handleCloseModal}
                      className='w-1/3 px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50'
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => setMobileView('preview')}
                      className='w-2/3 px-4 py-3 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100'
                    >
                      ถัดไป: ดูตัวอย่าง ❯
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setMobileView('form')}
                      className='w-1/3 px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50'
                    >
                      ❮ แก้ไขข้อมูล
                    </button>
                    <button
                      onClick={handleSave}
                      className='w-2/3 px-4 py-3 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm'
                    >
                      ยืนยันและบันทึก
                    </button>
                  </>
                )}
              </div>

              {/* ปุ่มควบคุมหน้าจอคอม (Desktop Only) */}
              <div className='hidden lg:flex w-full justify-end gap-3'>
                <button
                  onClick={handleCloseModal}
                  className='px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50'
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  className='px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm'
                >
                  บันทึกประกาศ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
