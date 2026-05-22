import React, { useState, useMemo, useContext } from 'react'
import { Grid , List} from 'lucide-react';
import { NewsContext } from '../../context/NewsContext'
import Swal from 'sweetalert2'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

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

type StatusFilter = 'all' | 'shown' | 'hidden'
type SortOrder = 'newest' | 'oldest'
type ViewMode = 'card' | 'list'

// ==========================================
// 2. Quill Configuration (แถบเครื่องมือ Editor)
// ==========================================
// แนะนำให้วางไว้นอก Component เพื่อป้องกันไม่ให้ Editor รีเฟรชตัวเองตอนพิมพ์
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
}
// ==========================================
// 4. Mini Preview Component
// ==========================================
const MiniAdvertisePreview = ({ data }: { data: NewsItem | null }) => {
  if (!data) return null

  return (
    <div className='bg-white h-full overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl relative shadow-sm'>
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
        
        {/* 🌟 แสดงผล HTML ที่ได้จาก React Quill อย่างปลอดภัย */}
        <div 
          className='text-slate-600 text-sm leading-relaxed ql-rendered'
          dangerouslySetInnerHTML={{ __html: data.content || data.description || 'พิมพ์เนื้อหาประกาศ...' }}
        />
      </div>
      <div className='absolute top-3 right-3 bg-slate-900/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm'>
        Live Preview
      </div>
    </div>
  )
}

// ==========================================
// 5. Filter Bar Component
// ==========================================
interface FilterBarProps {
  search: string
  onSearch: (value: string) => void
  status: StatusFilter
  onStatus: (value: StatusFilter) => void
  sort: SortOrder
  onSort: (value: SortOrder) => void
  view: ViewMode
  onView: (value: ViewMode) => void
  totalCount: number
  filteredCount: number
}

const FilterBar = ({
  search, onSearch,
  status, onStatus,
  sort, onSort,
  view, onView,
  totalCount, filteredCount,
}: FilterBarProps) => {
  return (
    <div className='bg-white border border-slate-200 rounded-xl px-4 py-3 mb-5'>
      <div className='flex flex-wrap gap-3 items-center'>
        <div className='relative flex-1 min-w-[180px]'>
          <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
          <input
            type='text'
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder='ค้นหาชื่อประกาศ...'
            className='w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50'
          />
          {search && (
            <button onClick={() => onSearch('')} className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </div>

        <div className='flex flex-wrap gap-2 items-center'>
          <div className='flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium'>
            {(['all', 'shown', 'hidden'] as StatusFilter[]).map((s) => {
              const labels: Record<StatusFilter, string> = { all: 'ทั้งหมด', shown: 'แสดงอยู่', hidden: 'ซ่อนอยู่' }
              return (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  className={`px-3 py-2 transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {labels[s]}
                </button>
              )
            })}
          </div>

          <div className='flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium'>
            <button onClick={() => onSort('newest')} className={`px-3 py-2 flex items-center gap-1.5 transition-colors ${sort === 'newest' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              ใหม่สุด
            </button>
            <button onClick={() => onSort('oldest')} className={`px-3 py-2 flex items-center gap-1.5 transition-colors ${sort === 'oldest' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              เก่าสุด
            </button>
          </div>

          <div className='flex rounded-lg border border-slate-200 overflow-hidden'>
            <button onClick={() => onView('card')} className={`px-3 py-2 transition-colors ${view === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
              <div className=""><Grid size={16} color='black' /></div>
            </button>
            <button onClick={() => onView('list')} className={`px-3 py-2 transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
              <div className=""><List size={16} color="black" /></div>
            </button>
          </div>
        </div>
      </div>
      {search && (
        <p className='text-xs text-slate-500 mt-2'>
          พบ <span className='font-bold text-slate-700'>{filteredCount}</span> รายการ จากทั้งหมด {totalCount} รายการ
        </p>
      )}
    </div>
  )
}

// ==========================================
// 6. Toggle Switch
// ==========================================
interface ToggleSwitchProps {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  itemId: number
}

const ToggleSwitch = ({ checked, onChange, itemId }: ToggleSwitchProps) => (
  <label className='relative inline-flex items-center cursor-pointer gap-2'>
    <span className={`text-[11px] font-bold ${checked ? 'text-emerald-600' : 'text-slate-400'}`}>
      {checked ? 'แสดงบนเว็บ' : 'ซ่อน'}
    </span>
    <input type='checkbox' checked={checked} onChange={onChange} className='sr-only peer' id={`toggle-${itemId}`} />
    <div className="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[18px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
  </label>
)

// ==========================================
// 7. Main Component
// ==========================================
export default function PRManagerDashboard() {
  // 🌟 1. ดึงข้อมูลและฟังก์ชันจาก NewsContext แทน
  const context = useContext(NewsContext);
  const prList = useMemo(() => context?.prList || [], [context?.prList]);
  const setPrList = context?.setPrList || (() => {});
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activePost, setActivePost] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState<NewsItem | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form')

  // 🌟 2. ลบบรรทัด useState prList เก่าทิ้งไปเลย
  // const [prList, setPrList] = useState<NewsItem[]>(() => generateMockPR()) 
  const shownCount = prList.filter((item) => item.isShow).length

  const filteredList = useMemo(() => {
    let result = [...prList]
    if (search.trim()) {
      const query = search.trim().toLowerCase()
      result = result.filter((item) => item.title.toLowerCase().includes(query))
    }
    if (statusFilter === 'shown') result = result.filter((item) => item.isShow)
    else if (statusFilter === 'hidden') result = result.filter((item) => !item.isShow)

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
    return result
  }, [prList, search, statusFilter, sortOrder])

  const handleToggleShow = (id: number, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation()
    setPrList((prev) => prev.map((p) => (p.id === id ? { ...p, isShow: !p.isShow } : p)))
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
      isShow: true,
    }
    setActivePost(null)
    setFormData(newEmptyPost)
    setMobileView('form')
    setIsModalOpen(true)
  }

  const handleOpenModal = (post: NewsItem) => {
    setActivePost(post)
    setFormData({ ...post })
    setMobileView('form')
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
      confirmButtonText: 'ใช่, คืนค่าเดิม',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(activePost ? { ...activePost } : {
          id: formData?.id || Date.now(),
          title: '', date: new Date().toISOString().split('T')[0], image_src: '', description: '', content: '', views: 0, isShow: true,
        })
        Swal.fire({ icon: 'success', title: 'คืนค่าสำเร็จ', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
      }
    })
  }

  const handleClearAll = () => {
   Swal.fire({
     title: 'ล้างข้อมูลทั้งหมด?',
     text: 'หัวข้อ, ภาพปก และเนื้อหาจะถูกล้างออกหมด',
     icon: 'warning',
     showCancelButton: true,
     confirmButtonColor: '#ef4444',
     cancelButtonColor: '#94a3b8',
     confirmButtonText: 'ล้างทั้งหมด',
     cancelButtonText: 'ยกเลิก',
     reverseButtons: true,
   }).then((result) => {
     if (result.isConfirmed) {
       setFormData({
         ...formData!,
         title: '',
         image_src: '',
         content: '',
         date: new Date().toISOString().split('T')[0],
       })
     }
   })
  } 

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0])
  }
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0])
  }
  // ✅ แก้แล้ว — Base64 อยู่ได้ใน localStorage ข้ามหน้าข้าม session
  const handleFileUpload = (file: File) => {
    if (!file.type.match(/image.*/)) {
      Swal.fire({ icon: 'error', title: 'ไฟล์ไม่รองรับ', text: 'กรุณาอัปโหลดรูปภาพเท่านั้น' })
      return
    }
    // ตรวจขนาดไฟล์ก่อน — Base64 จะใหญ่ขึ้น ~33% localStorage มีขีดจำกัด 5MB
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'ไฟล์ใหญ่เกินไป', text: 'กรุณาเลือกรูปที่มีขนาดไม่เกิน 2MB' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      if (formData) setFormData({ ...formData, image_src: base64 })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!formData || !formData.title.trim()) {
      Swal.fire({ icon: 'error', title: 'ข้อมูลไม่ครบ', text: 'กรุณาระบุหัวข้อประกาศ' })
      if (mobileView === 'preview') setMobileView('form')
      return
    }
    Swal.fire({ title: 'กำลังบันทึกข้อมูล...', timer: 800, didOpen: () => Swal.showLoading() }).then(() => {
      if (activePost === null) setPrList((prev) => [formData, ...prev])
      else setPrList((prev) => prev.map((p) => (p.id === formData.id ? formData : p)))
      handleCloseModal()
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', showConfirmButton: false, timer: 1500 })
    })
  }

  return (
    <div className='bg-slate-100 min-h-screen p-4 md:p-8 font-sans text-slate-800'>

      {/* --- Page Header --- */}
      <div className='max-w-7xl mx-auto mb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
        <div>
          <h1 className='text-2xl font-bold mb-2'>จัดการข่าวประชาสัมพันธ์</h1>
          <div className='flex items-center gap-4 text-sm'>
            <span className='text-slate-600'>ทั้งหมด: <span className='font-bold text-slate-900'>{prList.length}</span></span>
            <span className='w-px h-4 bg-slate-300'></span>
            <span className="font-bold text-emerald-600">แสดงผลหน้าเว็บ: {shownCount}</span>
          </div>
        </div>
        <button onClick={handleCreateNew} className='w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2'>
          สร้างประชาสัมพันธ์ใหม่
        </button>
      </div>

      <div className='max-w-7xl mx-auto'>
        <FilterBar search={search} onSearch={setSearch} status={statusFilter} onStatus={setStatusFilter} sort={sortOrder} onSort={setSortOrder} view={viewMode} onView={setViewMode} totalCount={prList.length} filteredCount={filteredList.length} />
      </div>

      {viewMode === 'card' && filteredList.length > 0 && (
        <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20'>
          {filteredList.map((item) => (
            <div key={item.id} onClick={() => handleOpenModal(item)} className='bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group'>
              <div className='p-4 flex gap-4 flex-1'>
                <div className='w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 shrink-0 overflow-hidden'>
                  {item.image_src ? <img src={item.image_src} alt='cover' className='w-full h-full object-cover' loading='lazy' /> : <div className='w-full h-full flex items-center justify-center text-slate-300'>ไม่มีรูป</div>}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[11px] text-blue-600 font-bold mb-1'>{item.date}</p>
                  <h3 className='text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug'>{item.title}</h3>
                </div>
              </div>
              <div className='bg-slate-50 border-t border-slate-100 px-4 py-3 flex justify-between items-center' onClick={(e) => e.stopPropagation()}>
                <div className='text-[11px] text-slate-500 font-medium'>เข้าชม {item.views} ครั้ง</div>
                <ToggleSwitch checked={!!item.isShow} onChange={(e) => handleToggleShow(item.id, e)} itemId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}

{/* LIST VIEW */}
{viewMode === 'list' && filteredList.length > 0 && (
  <div className='max-w-7xl mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden'>
    {filteredList.map((item) => (
  <div
    key={item.id}
    onClick={() => handleOpenModal(item)}
    className='flex items-center gap-4 p-4 border-b hover:bg-slate-50 cursor-pointer'
  >
    <img
      src={item.image_src}
      className='w-24 h-16 object-cover rounded'
    />

    <div className='flex-1'>
      <p>{item.date}</p>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>

    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <ToggleSwitch
        checked={!!item.isShow}
        onChange={(e) => handleToggleShow(item.id, e)}
        itemId={item.id}
      />
    </div>

  </div>
))}
      </div>
  )}

      {/* ========================================== */}
      {/* MODAL POPUP */}
      {/* ========================================== */}
      {isModalOpen && formData && (
        <div onClick={handleCloseModal} className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4'>
          <div onClick={(e) => e.stopPropagation()} className='bg-white w-full max-w-6xl h-[95vh] md:h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up'>
            
            <div className='px-4 md:px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0'>
              <h2 className='text-base md:text-lg font-bold text-slate-800'>{activePost === null ? 'สร้างประกาศใหม่' : `แก้ไขข้อมูล: ID ${formData.id}`}</h2>
              <div className='flex items-center gap-2 md:gap-4'>
                <button onClick={handleRefreshData} className='text-sm text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50'>รีเซ็ตข้อมูล</button>
                <button
                  onClick={handleClearAll}
                  className='flex items-center gap-2 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                  </svg>
                  <span className='hidden sm:inline'>ล้างทั้งหมด</span>
                </button>
                <button onClick={handleCloseModal} className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg'>✕</button>
              </div>
            </div>

            <div className='flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100'>
              <div className={`flex-1 overflow-y-auto custom-scrollbar bg-white p-4 md:p-8 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                <div className='max-w-3xl mx-auto space-y-6 md:space-y-8 pb-4'>
                  
                  {/* หัวข้อประกาศ */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start border-b border-slate-100 pb-6 md:pb-8'>
                    <label className='text-sm font-bold text-slate-700 md:pt-2'>หัวข้อประกาศ <span className='text-red-500'>*</span></label>
                    <div className='md:col-span-3'>
                      <input type='text' value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder='ระบุหัวข้อข่าวประชาสัมพันธ์...' className='w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500' />
                    </div>
                  </div>

                  {/* วันที่ */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center border-b border-slate-100 pb-6 md:pb-8'>
                    <label className='text-sm font-bold text-slate-700'>วันที่ (Date)</label>
                    <div className='md:col-span-3'>
                      <input type='date' value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className='border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500' />
                    </div>
                  </div>

                  {/* คำอธิบายสั้น */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start border-b border-slate-100 pb-6 md:pb-8'>
                    <div>
                      <label className='text-sm font-bold text-slate-700 block mb-1'>คำอธิบายสั้น</label>
                      <span className='text-[10px] text-slate-400'>แสดงบนการ์ดข่าว (ไม่เกิน 200 ตัวอักษร)</span>
                    </div>
                    <div className='md:col-span-3'>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder='ระบุคำอธิบายสั้นๆ เพื่อแสดงบนการ์ดข่าวประชาสัมพันธ์...'
                        maxLength={200}
                        rows={3}
                        className='w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none'
                      />
                      <p className='text-[11px] text-slate-400 mt-1 text-right'>{(formData.description || '').length}/200</p>
                    </div>
                  </div>

                  {/* ภาพปก */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start border-b border-slate-100 pb-6 md:pb-8'>
                    <div>
                      <label className='text-sm font-bold text-slate-700 block mb-1'>ภาพปก (Cover)</label>
                      <span className='text-[10px] text-slate-400'>แนะนำ 800x400px</span>
                    </div>
                    <div className='md:col-span-3 flex flex-col sm:flex-row gap-4 items-center'>
                      {formData.image_src && (
                        <div className='relative w-full sm:w-32 h-40 rounded-lg border border-slate-200 overflow-hidden shrink-0'>
                          <img src={formData.image_src} alt='cover' className='w-full h-full object-cover' />
                          <button
                            type='button'
                            onClick={() => setFormData({ ...formData, image_src: '' })}
                            className='absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors'
                            title='ลบรูปภาพ'
                          >
                            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M6 18L18 6M6 6l12 12' />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`flex-1 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer relative ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}>
                        <input type='file' accept='image/*' onChange={handleFileInput} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
                        <p className='text-sm font-medium text-blue-600 mb-1'>คลิกอัปโหลด <span className='text-slate-500'>หรือลากไฟล์มาวาง</span></p>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 เนื้อหา (React Quill Editor) 🌟 */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start'>
                    <div>
                      <label className='text-sm font-bold text-slate-700 block mb-1'>เนื้อหา (Content)</label>
                      <span className='text-[10px] text-slate-400'>รองรับรูปภาพและข้อความจัดรูปแบบ</span>
                    </div>
                    <div className='md:col-span-3'>
                      {/* 🌟 แก้ไข: ลบ overflow-hidden ทิ้ง เพื่อไม่ให้มันตัดบรรทัดล่าง */}
                      <div className="bg-white rounded-lg border border-slate-300">
                        <ReactQuill 
                          theme="snow"
                          value={formData.content || ''}
                          onChange={(value) => setFormData({ ...formData, content: value })}
                          modules={quillModules}
                          // 🌟 แก้ไข: เปลี่ยนเป็น flex flex-col เพื่อให้กล่องคำนวณความสูงได้เป๊ะๆ
                          className="flex flex-col h-[350px]" 
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right: Preview */}
              <div className={`w-full lg:w-[400px] xl:w-[450px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 p-4 lg:p-6 overflow-y-auto  custom-scrollbar flex flex-col shrink-0 ${mobileView === 'form' ? 'hidden lg:flex' : 'flex'}`}>
                <h3 className='text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0'>
                  <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
                  หน้าตัวอย่าง (Preview)
                </h3>
                <div className='flex-1 min-h-0 pb-4'>
                  <MiniAdvertisePreview data={formData} />
                </div>
              </div>
            </div>

            <div className='px-4 md:px-6 py-4 border-t border-slate-200 bg-white flex justify-between md:justify-end gap-3 shrink-0'>
              <button onClick={handleCloseModal} className='px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50'>ยกเลิก</button>
              <button onClick={handleSave} className='px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm'>บันทึกประกาศ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}