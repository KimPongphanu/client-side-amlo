import { Grid, List, Plus, X, ImagePlus, Video, Pencil, Trash2 } from 'lucide-react'
import React, { useCallback, useContext, useRef, useState } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import Swal from 'sweetalert2'
import { NewsContext } from '../../context/NewsContext'
import { api } from '../../utils/api'
import type { DepartmentItem, GalleryItem } from '../../type'

// ==========================================
// 1. Types & Interfaces
// ==========================================
type ViewMode = 'card' | 'list'

interface GalleryInputItem {
  id: string // client-side temp id
  type: 'image' | 'video'
  file?: File
  preview?: string // object URL for image preview
  url?: string     // YouTube URL for video
}

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
// 2. Gallery Preview Strip
// ==========================================
const GalleryStrip = ({ gallery }: { gallery: GalleryItem[] }) => {
  if (!gallery || gallery.length === 0)
    return <span className='text-xs text-slate-400'>ไม่มีรูป/วิดีโอ</span>
  return (
    <div className='flex gap-1 flex-wrap mt-1'>
      {gallery.slice(0, 5).map((item, i) => (
        <div
          key={i}
          className='w-10 h-10 rounded overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200'
        >
          {item.type === 'image' ? (
            <img
              src={item.url.startsWith('/') ? `http://localhost:8080${item.url}` : item.url}
              alt={`gallery-${i}`}
              className='w-full h-full object-cover'
            />
          ) : (
            <Video className='w-4 h-4 text-red-500' />
          )}
        </div>
      ))}
      {gallery.length > 5 && (
        <div className='w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-bold'>
          +{gallery.length - 5}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 3. Form Component
// ==========================================
interface DepartmentFormProps {
  initialData?: DepartmentItem | null
  onSuccess: (dept: DepartmentItem) => void
  onCancel: () => void
}

const DepartmentForm = ({ initialData, onSuccess, onCancel }: DepartmentFormProps) => {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>(
    initialData?.cover_image
      ? initialData.cover_image.startsWith('/')
        ? `http://localhost:8080${initialData.cover_image}`
        : initialData.cover_image
      : '',
  )
  const [gallery, setGallery] = useState<GalleryInputItem[]>(
    initialData?.gallery?.map((g, i) => ({
      id: `existing-${i}`,
      type: g.type,
      url: g.url,
      preview: g.type === 'image'
        ? (g.url.startsWith('/') ? `http://localhost:8080${g.url}` : g.url)
        : undefined,
    })) ?? [],
  )
  const [youtubeInput, setYoutubeInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!initialData

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleImagesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newItems: GalleryInputItem[] = files.map((file) => ({
      id: `img-${Date.now()}-${Math.random()}`,
      type: 'image',
      file,
      preview: URL.createObjectURL(file),
    }))
    setGallery((prev) => [...prev, ...newItems])
    e.target.value = ''
  }

  const handleAddYoutube = () => {
    const trimmed = youtubeInput.trim()
    if (!trimmed) return
    // Validate YouTube URL
    const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([^?&\s]{11})/
    if (!youtubeRegex.test(trimmed)) {
      Swal.fire({
        icon: 'warning',
        title: 'URL ไม่ถูกต้อง',
        text: 'กรุณาวาง YouTube Share Link ที่ถูกต้อง เช่น https://youtu.be/xxxxx',
        confirmButtonColor: '#3b82f6',
      })
      return
    }
    setGallery((prev) => [
      ...prev,
      {
        id: `yt-${Date.now()}`,
        type: 'video',
        url: trimmed,
      },
    ])
    setYoutubeInput('')
  }

  const handleRemoveGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกชื่อหน่วยงาน', confirmButtonColor: '#3b82f6' })
      return
    }
    if (!isEditing && !coverFile) {
      Swal.fire({ icon: 'warning', title: 'กรุณาอัปโหลดรูปปก', confirmButtonColor: '#3b82f6' })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      if (content) formData.append('content', content)
      if (coverFile) formData.append('cover_image', coverFile)

      // ส่งรูปภาพอัปโหลดเข้า gallery
      gallery
        .filter((g) => g.type === 'image' && g.file)
        .forEach((g) => formData.append('gallery', g.file!))

      // ส่ง YouTube URLs เข้า galleryUrls (Backend รองรับแล้ว)
      gallery
        .filter((g) => g.type === 'video' && g.url)
        .forEach((g) => formData.append('galleryUrls', g.url!))

      // ส่งรูปภาพที่มีอยู่แล้ว (ที่ไม่ได้ถูกลบ) กลับไปให้ Backend 🌟
      gallery
        .filter((g) => g.type === 'image' && !g.file && g.url)
        .forEach((g) => {
          // ตัด http://localhost:8080 ออก เอาแค่ /uploads/...
          const path = new URL(g.url!, window.location.href).pathname
          formData.append('existingGalleryUrls', path)
        })

      // บอก Backend ว่าเราต้องการ Sync Gallery ใหม่ทั้งหมด
      formData.append('isGalleryUpdated', 'true')

      let result: DepartmentItem
      if (isEditing) {
        const res = await api(`/departments/${initialData.id}`, { method: 'PUT', body: formData })
        result = res.data
      } else {
        const res = await api(`/departments`, { method: 'POST', body: formData })
        result = res.data
      }

      await Swal.fire({
        icon: 'success',
        title: isEditing ? 'แก้ไขสำเร็จ!' : 'เพิ่มหน่วยงานสำเร็จ!',
        timer: 1500,
        showConfirmButton: false,
      })
      onSuccess(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: msg, confirmButtonColor: '#ef4444' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Title */}
      <div>
        <label className='block text-sm font-semibold text-slate-700 mb-1'>
          ชื่อหน่วยงาน <span className='text-red-500'>*</span>
        </label>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='เช่น ฝ่ายปราบปรามการฟอกเงิน'
          maxLength={150}
          className='w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
        />
        <p className='text-xs text-slate-400 mt-1 text-right'>{title.length}/150</p>
      </div>

      {/* Cover Image */}
      <div>
        <label className='block text-sm font-semibold text-slate-700 mb-1'>
          รูปปก {!isEditing && <span className='text-red-500'>*</span>}
        </label>
        <div
          onClick={() => coverInputRef.current?.click()}
          className='border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition flex flex-col items-center gap-2'
        >
          {coverPreview ? (
            <img src={coverPreview} alt='cover preview' className='max-h-40 object-cover rounded-lg' />
          ) : (
            <>
              <ImagePlus className='w-8 h-8 text-slate-400' />
              <p className='text-xs text-slate-500'>คลิกเพื่อเลือกรูปปก (JPEG, PNG, WebP)</p>
            </>
          )}
          {coverPreview && <p className='text-xs text-blue-500'>คลิกเพื่อเปลี่ยนรูป</p>}
        </div>
        <input
          ref={coverInputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          className='hidden'
          onChange={handleCoverChange}
        />
      </div>

      {/* Content (Rich Text) */}
      <div>
        <label className='block text-sm font-semibold text-slate-700 mb-1'>
          เนื้อหา / คำอธิบาย
        </label>
        <div className='rounded-lg overflow-hidden border border-slate-200'>
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={quillModules}
            placeholder='กรอกรายละเอียดของหน่วยงาน...'
          />
        </div>
      </div>

      {/* Gallery */}
      <div>
        <label className='block text-sm font-semibold text-slate-700 mb-2'>
          Gallery (รูปภาพและวิดีโอ)
        </label>

        {/* Gallery Items Preview */}
        {gallery.length > 0 && (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3'>
            {gallery.map((item) => (
              <div key={item.id} className='relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square flex items-center justify-center'>
                {item.type === 'image' && (
                  <img
                    src={item.preview}
                    alt='gallery item'
                    className='w-full h-full object-cover'
                  />
                )}
                {item.type === 'video' && (
                  <div className='flex flex-col items-center gap-1 p-2 text-center'>
                    <Video className='w-8 h-8 text-red-500' />
                    <p className='text-[10px] text-slate-500 break-all leading-tight'>
                      {item.url?.replace('https://', '').slice(0, 30)}...
                    </p>
                  </div>
                )}
                <button
                  type='button'
                  onClick={() => handleRemoveGalleryItem(item.id)}
                  className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md'
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Image */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            type='button'
            onClick={() => imageInputRef.current?.click()}
            className='flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition border border-slate-200'
          >
            <ImagePlus className='w-4 h-4' />
            เพิ่มรูปภาพ
          </button>
          <input
            ref={imageInputRef}
            type='file'
            multiple
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={handleImagesAdd}
          />

          {/* Add YouTube */}
          <div className='flex flex-1 gap-2'>
            <input
              type='text'
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder='วาง YouTube Share Link เช่น https://youtu.be/xxx'
              className='flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition'
            />
            <button
              type='button'
              onClick={handleAddYoutube}
              className='flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition border border-red-200'
            >
              <Video className='w-4 h-4' />
              เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex justify-end gap-3 pt-2 border-t border-slate-100'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isSubmitting}
          className='px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50'
        >
          ยกเลิก
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2'
        >
          {isSubmitting ? (
            <>
              <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
              </svg>
              กำลังบันทึก...
            </>
          ) : (
            isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหน่วยงาน'
          )}
        </button>
      </div>
    </form>
  )
}

// ==========================================
// 4. Card View Item
// ==========================================
const DepartmentCard = ({
  dept,
  onEdit,
  onDelete,
}: {
  dept: DepartmentItem
  onEdit: (d: DepartmentItem) => void
  onDelete: (d: DepartmentItem) => void
}) => {
  const coverSrc = dept.cover_image.startsWith('/')
    ? `http://localhost:8080${dept.cover_image}`
    : dept.cover_image

  return (
    <div className='bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group'>
      <div className='relative h-40 bg-slate-100 overflow-hidden'>
        <img src={coverSrc} alt={dept.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 p-3'>
          <p className='text-white text-sm font-bold truncate drop-shadow'>{dept.title}</p>
        </div>
      </div>
      <div className='p-3'>
        <GalleryStrip gallery={dept.gallery} />
        <div className='flex gap-2 mt-3'>
          <button
            onClick={() => onEdit(dept)}
            className='flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200'
          >
            <Pencil className='w-3 h-3' /> แก้ไข
          </button>
          <button
            onClick={() => onDelete(dept)}
            className='flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200'
          >
            <Trash2 className='w-3 h-3' /> ลบ
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 5. List View Item
// ==========================================
const DepartmentRow = ({
  dept,
  onEdit,
  onDelete,
}: {
  dept: DepartmentItem
  onEdit: (d: DepartmentItem) => void
  onDelete: (d: DepartmentItem) => void
}) => {
  const coverSrc = dept.cover_image.startsWith('/')
    ? `http://localhost:8080${dept.cover_image}`
    : dept.cover_image

  return (
    <div className='bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition'>
      <img src={coverSrc} alt={dept.title} className='w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-slate-100' />
      <div className='flex-1 min-w-0'>
        <p className='font-bold text-slate-800 truncate'>{dept.title}</p>
        <GalleryStrip gallery={dept.gallery} />
      </div>
      <div className='flex gap-2 flex-shrink-0'>
        <button
          onClick={() => onEdit(dept)}
          className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition'
        >
          <Pencil className='w-3 h-3' /> แก้ไข
        </button>
        <button
          onClick={() => onDelete(dept)}
          className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition'
        >
          <Trash2 className='w-3 h-3' /> ลบ
        </button>
      </div>
    </div>
  )
}

// ==========================================
// 6. Main Dashboard Component
// ==========================================
export default function DepartmentManagerDashboard() {
  const context = useContext(NewsContext)
  const deptList = context?.departmentList ?? []

  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<DepartmentItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = deptList.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddSuccess = useCallback(
    (newDept: DepartmentItem) => {
      if (context && 'setDepartmentList' in context) {
        context.setDepartmentList((prev: DepartmentItem[]) => {
          const exists = prev.find((d) => d.id === newDept.id)
          if (exists) {
            return prev.map((d) => (d.id === newDept.id ? newDept : d))
          }
          return [newDept, ...prev]
        })
      }
      setShowForm(false)
      setEditTarget(null)
    },
    [context],
  )

  const handleEditClick = (dept: DepartmentItem) => {
    setEditTarget(dept)
    setShowForm(true)
  }

  const handleDeleteClick = async (dept: DepartmentItem) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบ "${dept.title}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบเลย',
      cancelButtonText: 'ยกเลิก',
    })
    
    if (confirm.isConfirmed) {
      try {
        await api(`/departments/${dept.id}`, { method: 'DELETE' })
        if (context && 'setDepartmentList' in context) {
          context.setDepartmentList((prev: DepartmentItem[]) => prev.filter(d => d.id !== dept.id))
        }
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false })
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.message })
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditTarget(null)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-bold text-slate-800'>จัดการหน่วยงาน</h2>
          <p className='text-sm text-slate-500 mt-0.5'>
            ทั้งหมด {deptList.length} รายการ
          </p>
        </div>
        <button
          onClick={() => {
            setEditTarget(null)
            setShowForm(true)
          }}
          className='flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition shadow-sm'
        >
          <Plus className='w-4 h-4' /> เพิ่มหน่วยงานใหม่
        </button>
      </div>


      {/* Form Panel */}
      {showForm && (
        <div className='bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden'>
          <div className='border-b border-slate-100 px-6 py-4 flex items-center justify-between'>
            <h3 className='font-bold text-slate-800'>
              {editTarget ? `แก้ไข: ${editTarget.title}` : 'เพิ่มหน่วยงานใหม่'}
            </h3>
            <button
              onClick={handleCancel}
              className='text-slate-400 hover:text-slate-600 transition'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
          <div className='p-6'>
            <DepartmentForm
              initialData={editTarget}
              onSuccess={handleAddSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Search & View Toggle */}
      <div className='flex flex-col sm:flex-row gap-3 items-center'>
        <input
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='ค้นหาชื่อหน่วยงาน...'
          className='flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
        />
        <div className='flex gap-1 bg-slate-100 p-1 rounded-lg'>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-md transition ${viewMode === 'card' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Grid className='w-4 h-4' />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className='text-center py-20 text-slate-400'>
          <p className='text-4xl mb-3'>🏢</p>
          <p className='font-medium'>
            {searchTerm ? 'ไม่พบหน่วยงานที่ค้นหา' : 'ยังไม่มีหน่วยงาน กดปุ่ม "เพิ่มหน่วยงานใหม่" เพื่อเริ่มต้น'}
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {filtered.map((dept) => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className='space-y-3'>
          {filtered.map((dept) => (
            <DepartmentRow
              key={dept.id}
              dept={dept}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
