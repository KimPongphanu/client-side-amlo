// src/components/dashboard/DepartmentManagerDashboard.tsx
import {
  Edit2,
  FileText,
  Folder,
  Grid,
  HelpCircle,
  Image as ImageIcon,
  List,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import Swal from 'sweetalert2'
import { useDashboardStore } from '../../stores/useDashboardStore'
import type { DepartmentItem, GalleryItem } from '../../type'

type ViewMode = 'card' | 'list'

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

// ==========================================
// Gallery Preview Strip Component
// ==========================================
const GalleryStrip = ({ gallery }: { gallery: GalleryItem[] }) => {
  if (!gallery || gallery.length === 0) {
    return (
      <span className='text-xs text-slate-400 font-medium'>
        ไม่มีรูป/วิดีโอในคลัง
      </span>
    )
  }
  const API_URL = import.meta.env.VITE_API_URL

  return (
    <div className='flex gap-1 flex-wrap mt-1'>
      {gallery.slice(0, 5).map((item: GalleryItem, i: number) => (
        <div
          key={i}
          className='w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm shrink-0'
        >
          {item.type === 'image' ? (
            <img
              src={
                item.url.startsWith('http') ? item.url : `${API_URL}${item.url}`
              }
              alt={`gallery-preview-${i}`}
              className='w-full h-full object-cover'
            />
          ) : (
            <Video className='w-4 h-4 text-rose-500' />
          )}
        </div>
      ))}
      {gallery.length > 5 && (
        <div className='w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-black shrink-0'>
          +{gallery.length - 5}
        </div>
      )}
    </div>
  )
}

// ==========================================
// Main Dashboard Manager Component
// ==========================================
export default function DepartmentManagerDashboard() {
  const departmentList = useDashboardStore((state) => state.departmentList)
  const fetchDepartments = useDashboardStore((state) => state.fetchDepartments)
  const departmentLoading = useDashboardStore(
    (state) => state.departmentLoading,
  )

  // Bind network mutable workflow actions from store
  const createDepartment = useDashboardStore((state) => state.createDepartment)
  const updateDepartment = useDashboardStore((state) => state.updateDepartment)
  const deleteDepartment = useDashboardStore((state) => state.deleteDepartment)

  // Fetch record entities initially over component mounting stage
  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  // Component configuration state controls
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Core dynamic textual record fields properties
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [youtubeInput, setYoutubeInput] = useState<string>('')

  // Traditional elements input storage references
  const coverImageInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  // Asset previews and tracking array blocks
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([])
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([])
  const [isGalleryUpdated, setIsGalleryUpdated] = useState<boolean>(false)

  // Filter records collection matching criteria search tokens
  const filteredDepartments = useMemo<DepartmentItem[]>(() => {
    return departmentList.filter(
      (item: DepartmentItem) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content &&
          item.content.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [departmentList, searchTerm])

  // --- Handlers: Input form components values wipeout ---
  const resetForm = (): void => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setYoutubeInput('')
    setCoverPreview('')
    setGalleryUrls([])
    setExistingGalleryUrls([])
    setNewGalleryFiles([])
    setIsGalleryUpdated(false)
    if (coverImageInputRef.current) coverImageInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  // --- Handlers: Modal popups triggers ---
  const openAddModal = (): void => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (dept: DepartmentItem): void => {
    resetForm()
    setEditingId(dept.id)
    setTitle(dept.title)
    setContent(dept.content || '')

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    setCoverPreview(
      dept.cover_image.startsWith('http')
        ? dept.cover_image
        : `${API_URL}${dept.cover_image}`,
    )

    const ytUrls = dept.gallery
      .filter((g: GalleryItem) => g.type === 'video')
      .map((g: GalleryItem) => g.url)

    const imgUrls = dept.gallery
      .filter((g: GalleryItem) => g.type === 'image')
      .map((g: GalleryItem) => g.url)

    setGalleryUrls(ytUrls)
    setExistingGalleryUrls(imgUrls)
    setIsModalOpen(true)
  }

  // --- Handlers: Live adjustments inside layout media arrays ---
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleAddYoutubeUrl = (): void => {
    const trimmed = youtubeInput.trim()
    if (!trimmed) return

    const youtubeRegex =
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([^?&\s]{11})/
    if (!youtubeRegex.test(trimmed)) {
      Swal.fire({
        icon: 'warning',
        title: 'URL ไม่ถูกต้อง',
        text: 'กรุณาวางลิงก์วิดีโอ YouTube ที่ถูกต้อง',
        confirmButtonColor: '#185FA5',
      })
      return
    }

    setGalleryUrls((prev: string[]) => [...prev, trimmed])
    setYoutubeInput('')
    setIsGalleryUpdated(true)
  }

  const handleRemoveYoutubeUrl = (index: number): void => {
    setGalleryUrls((prev: string[]) =>
      prev.filter((_, i: number) => i !== index),
    )
    setIsGalleryUpdated(true)
  }

  const handleRemoveExistingImage = (index: number): void => {
    setExistingGalleryUrls((prev: string[]) =>
      prev.filter((_, i: number) => i !== index),
    )
    setIsGalleryUpdated(true)
  }

  const handleGalleryFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (e.target.files) {
      setNewGalleryFiles(Array.from(e.target.files))
      setIsGalleryUpdated(true)
    }
  }

  // --- Transactions: Operational creation/updation procedures ---
  const handleAddOrEdit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกหัวข้อหน่วยงาน',
        confirmButtonColor: '#185FA5',
      })
      return
    }

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('content', content.trim())

    if (coverImageInputRef.current?.files?.[0]) {
      formData.append('cover_image', coverImageInputRef.current.files[0])
    }

    if (isGalleryUpdated) {
      formData.append('isGalleryUpdated', 'true')
      galleryUrls.forEach((url: string) => formData.append('galleryUrls', url))
      existingGalleryUrls.forEach((url: string) =>
        formData.append('existingGalleryUrls', url),
      )
      newGalleryFiles.forEach((file: File) => formData.append('gallery', file))
    }

    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    let success = false
    if (editingId !== null) {
      success = await updateDepartment(editingId, formData)
    } else {
      if (!coverImageInputRef.current?.files?.[0]) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกรูปภาพปกหน่วยงาน',
          confirmButtonColor: '#185FA5',
        })
        return
      }
      success = await createDepartment(formData)
    }

    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลเรียบร้อย',
        timer: 1500,
        showConfirmButton: false,
      })
      setIsModalOpen(false)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: 'เกิดข้อผิดพลาดในการติดต่อฐานข้อมูล',
        confirmButtonColor: '#dc2626',
      })
    }
  }

  // --- Transactions: Operational termination procedures ---
  const handleDeleteClick = async (id: number): Promise<void> => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบหน่วยงาน?',
      text: 'ข้อมูลภาควิชาและอัลบั้มภาพทั้งหมดจะถูกทำลายถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
    })

    if (!result.isConfirmed) return

    Swal.fire({
      title: 'กำลังประมวลผล...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    const success = await deleteDepartment(id)
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'ลบข้อมูลสำเร็จ',
        timer: 1500,
        showConfirmButton: false,
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถลบข้อมูลจากฐานข้อมูลได้',
        confirmButtonColor: '#dc2626',
      })
    }
  }

  return (
    <div className='p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans antialiased text-slate-800'>
      {/* Top Banner Control Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0'>
            <Folder className='w-6 h-6' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-slate-900 tracking-tight'>
              จัดการโครงสร้างหน่วยงานภายใน
            </h1>
            <p className='text-sm text-slate-500 mt-0.5'>
              เพิ่ม แก้ไข
              หรือลบข้อมูลหน่วยงานพร้อมทั้งคลังภาพและวิดีโอสื่อประชาสัมพันธ์
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className='w-full sm:w-auto bg-[#185FA5] hover:bg-[#134b82] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer active:scale-95'
        >
          <Plus className='w-4 h-4' />
          เพิ่มหน่วยงานใหม่
        </button>
      </div>

      {/* Filter and View Selection Strip */}
      <div className='flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4'>
        <input
          type='text'
          placeholder='ค้นหาด้วยชื่อหรือรายละเอียดหน่วยงาน...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full sm:w-80 px-4 py-2 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium'
        />
        <div className='flex bg-slate-100 p-1 rounded-xl items-center border border-slate-200/40 shrink-0 select-none'>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Grid className='w-4 h-4' />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <List className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Grid Content rendering block */}
      {departmentLoading ? (
        <div className='flex flex-col justify-center items-center h-64 gap-3 bg-white border border-slate-100 rounded-2xl shadow-sm'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600' />
          <p className='text-sm text-slate-400 font-medium'>
            กำลังเตรียมคลังข้อมูลโครงสร้าง...
          </p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className='flex flex-col justify-center items-center h-64 gap-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400'>
          <HelpCircle className='w-12 h-12 text-slate-300' />
          <p className='font-bold text-slate-700'>ไม่พบข้อมูลหน่วยงาน</p>
          <p className='text-xs text-slate-400'>
            ทดลองเปลี่ยนคำค้นหา หรือกดปุ่มระบบสร้างหน่วยงานใหม่ด้านบน
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredDepartments.map((dept: DepartmentItem) => {
            const API_URL =
              import.meta.env.VITE_API_URL || 'http://localhost:8080'
            const coverSrc = dept.cover_image.startsWith('http')
              ? dept.cover_image
              : `${API_URL}${dept.cover_image}`

            return (
              <div
                key={dept.id}
                className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-200 transition-all duration-200'
              >
                <div className='relative aspect-video bg-slate-900 overflow-hidden shrink-0'>
                  <img
                    src={coverSrc}
                    alt={dept.title}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent' />
                  <div className='absolute bottom-3 left-4 right-4'>
                    <h2 className='text-base font-bold text-white line-clamp-1 drop-shadow-sm'>
                      {dept.title}
                    </h2>
                  </div>
                </div>

                <div className='p-4 flex-1 flex flex-col justify-between space-y-4 bg-white'>
                  <div className='space-y-2'>
                    <div className='flex items-start gap-1.5 text-slate-500'>
                      <FileText className='w-4 h-4 mt-0.5 shrink-0 text-slate-400' />
                      <div
                        className='text-xs leading-relaxed line-clamp-3 text-slate-500 font-medium whitespace-pre-wrap html-container'
                        dangerouslySetInnerHTML={{
                          __html:
                            dept.content ||
                            '<span class="italic text-slate-300">ไม่ได้ระบุคำอธิบาย</span>',
                        }}
                      />
                    </div>
                    <GalleryStrip gallery={dept.gallery} />
                  </div>

                  <div className='grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 shrink-0'>
                    <button
                      onClick={() => openEditModal(dept)}
                      className='w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200/60 active:scale-95 cursor-pointer'
                    >
                      <Edit2 className='w-3.5 h-3.5 text-slate-500' />
                      แก้ไขหน่วยงาน
                    </button>
                    <button
                      onClick={() => handleDeleteClick(dept.id)}
                      className='w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-rose-100/60 active:scale-95 cursor-pointer'
                    >
                      <Trash2 className='w-3.5 h-3.5 text-rose-500' />
                      ลบออก
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className='bg-white border border-slate-100 shadow-sm rounded-2xl divide-y divide-slate-100 overflow-hidden'>
          {filteredDepartments.map((dept: DepartmentItem) => {
            const API_URL =
              import.meta.env.VITE_API_URL || 'http://localhost:8080'
            const coverSrc = dept.cover_image.startsWith('http')
              ? dept.cover_image
              : `${API_URL}${dept.cover_image}`

            return (
              <div
                key={dept.id}
                className='p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/60 transition-colors'
              >
                <div className='flex items-center gap-4 min-w-0'>
                  <img
                    src={coverSrc}
                    alt={dept.title}
                    className='w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100 shadow-sm'
                  />
                  <div className='min-w-0'>
                    <h3 className='font-bold text-slate-900 truncate text-sm'>
                      {dept.title}
                    </h3>
                    <GalleryStrip gallery={dept.gallery} />
                  </div>
                </div>
                <div className='flex gap-2 w-full sm:w-auto shrink-0'>
                  <button
                    onClick={() => openEditModal(dept)}
                    className='flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200/40 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95'
                  >
                    <Edit2 className='w-3 h-3' /> แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteClick(dept.id)}
                    className='flex-1 sm:flex-none px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg border border-rose-200/40 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95'
                  >
                    <Trash2 className='w-3 h-3' /> ลบ
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add & Edit Modal Sheet Component */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 antialiased'>
          <div className='bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in border border-slate-100 overflow-hidden'>
            <div className='px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0'>
              <div className='flex items-center gap-2'>
                <div
                  className={`p-2 rounded-lg text-white ${editingId ? 'bg-amber-500' : 'bg-[#185FA5]'}`}
                >
                  {editingId ? (
                    <Edit2 className='w-4 h-4' />
                  ) : (
                    <Plus className='w-4 h-4' />
                  )}
                </div>
                <h3 className='font-bold text-slate-800 text-base'>
                  {editingId
                    ? 'แก้ไขข้อมูลรายละเอียดหน่วยงาน'
                    : 'เพิ่มระบบหน่วยงานโครงสร้างใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className='p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <form
              onSubmit={handleAddOrEdit}
              className='flex-1 flex flex-col min-h-0'
            >
              <div className='p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-sm'>
                {/* Title Section Input */}
                <div className='space-y-1.5'>
                  <label className='block font-bold text-slate-700'>
                    หัวข้อชื่อภาควิชา / หน่วยงาน{' '}
                    <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='ระบุชื่อหน่วยงาน เช่น กองข่าวกรองทางการเงิน...'
                    className='w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium'
                  />
                </div>

                {/* Cover Image Upload Block */}
                <div className='space-y-1.5'>
                  <label className='block font-bold text-slate-700'>
                    รูปภาพปกประจำหน่วยงาน
                  </label>
                  <div className='flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80'>
                    {coverPreview && (
                      <img
                        src={coverPreview}
                        alt='Cover Preview'
                        className='w-20 h-14 rounded-lg object-cover border shadow-sm shrink-0'
                      />
                    )}
                    <input
                      type='file'
                      ref={coverImageInputRef}
                      accept='image/jpeg,image/png,image/webp'
                      onChange={handleCoverChange}
                      className='block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100'
                    />
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div className='space-y-1.5'>
                  <label className='block font-bold text-slate-700'>
                    ภารกิจและหน้าที่รับผิดชอบ (คำอธิบายรายละเอียด)
                  </label>
                  <div className='rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner'>
                    <ReactQuill
                      theme='snow'
                      value={content}
                      onChange={setContent}
                      modules={quillModules}
                      placeholder='กรอกรายละเอียดบทบาทของหน่วยงาน...'
                    />
                  </div>
                </div>

                {/* Media Management Section */}
                <div className='border-t border-slate-100 pt-4 space-y-4'>
                  <div>
                    <h4 className='font-bold text-slate-800 flex items-center gap-1.5'>
                      <ImageIcon className='w-4 h-4 text-slate-500' />
                      ระบบจัดการคลังสื่อ (Gallery)
                    </h4>
                    <p className='text-[11px] text-slate-400 mt-0.5'>
                      เพิ่มอัปโหลดรูปภาพใหม่
                      หรือแนบลิงก์คลิปวิดีโอจากระบบโซเชียล YouTube
                    </p>
                  </div>

                  {/* YouTube Addition Utility */}
                  <div className='flex gap-2 bg-slate-50 p-3 border border-slate-200/60 rounded-xl items-center'>
                    <input
                      type='text'
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      placeholder='วาง YouTube Share Link เช่น https://youtu.be/xxxxx'
                      className='flex-1 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-400/20'
                    />
                    <button
                      type='button'
                      onClick={handleAddYoutubeUrl}
                      className='bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95'
                    >
                      แนบวิดีโอ
                    </button>
                  </div>

                  {/* Current Active Media Assets Render */}
                  {(galleryUrls.length > 0 ||
                    existingGalleryUrls.length > 0) && (
                    <div className='p-4 bg-slate-50/50 border border-slate-100 rounded-2xl grid grid-cols-4 sm:grid-cols-5 gap-3 shadow-inner max-h-48 overflow-y-auto custom-scrollbar'>
                      {galleryUrls.map((url: string, index: number) => (
                        <div
                          key={`yt-${index}`}
                          className='relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 flex flex-col items-center justify-center p-2 text-center group shadow-sm'
                        >
                          <Video className='w-6 h-6 text-rose-500 mb-0.5 shrink-0' />
                          <p className='text-[9px] text-slate-400 font-medium truncate w-full font-mono'>
                            {url.slice(-11)}
                          </p>
                          <button
                            type='button'
                            onClick={() => handleRemoveYoutubeUrl(index)}
                            className='absolute top-1 right-1 bg-slate-900/80 text-white rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-sm cursor-pointer hover:bg-rose-600'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </div>
                      ))}
                      {existingGalleryUrls.map((url: string, index: number) => {
                        const API_URL =
                          import.meta.env.VITE_API_URL ||
                          'http://localhost:8080'
                        return (
                          <div
                            key={`img-${index}`}
                            className='relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 group shadow-sm'
                          >
                            <img
                              src={
                                url.startsWith('http')
                                  ? url
                                  : `${API_URL}${url}`
                              }
                              alt='Gallery asset'
                              className='w-full h-full object-cover'
                            />
                            <button
                              type='button'
                              onClick={() => handleRemoveExistingImage(index)}
                              className='absolute top-1 right-1 bg-slate-900/80 text-white rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-sm cursor-pointer hover:bg-rose-600'
                            >
                              <X className='w-3 h-3' />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* New Gallery Upload Button */}
                  <div className='space-y-1.5'>
                    <label className='block text-xs font-bold text-slate-600 flex items-center gap-1'>
                      <ImageIcon className='w-3.5 h-3.5 text-sky-500' />
                      อัปโหลดภาพชุดใหม่เพิ่มเติม
                    </label>
                    <div className='bg-slate-50 p-3 rounded-xl border border-slate-200/80'>
                      <input
                        type='file'
                        ref={galleryInputRef}
                        multiple
                        accept='image/jpeg,image/png,image/webp'
                        onChange={handleGalleryFileChange}
                        className='block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 file:cursor-pointer hover:file:bg-sky-100'
                      />
                    </div>
                    {newGalleryFiles.length > 0 && (
                      <p className='text-xs font-black text-sky-600 px-1'>
                        ✨ มี {newGalleryFiles.length}{' '}
                        รูปภาพพร้อมจัดเก็บเข้าอัลบั้มหลังบันทึก
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Control Bottom Action Bar */}
              <div className='px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end items-center gap-2 shrink-0'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer text-center active:scale-95'
                >
                  ยกเลิกรายการ
                </button>
                <button
                  type='submit'
                  className='w-full sm:w-auto px-6 py-2.5 bg-[#185FA5] hover:bg-[#134b82] text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer text-center active:scale-95'
                >
                  {editingId ? 'บันทึกการแก้ไขข้อมูล' : 'ยืนยันสร้างหน่วยงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled overrides sheet block tags */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .animate-fade-in { animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
