import { useCallback, useEffect, useState } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { contentService } from '../../services/contentService'
import { swal, toast } from '../../utils/swalConfig'

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
}

export default function AboutHistoryManager() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasContent, setHasContent] = useState(false)

  useEffect(() => {
    contentService
      .getSiteSettings()
      .then((settings) => {
        const val = settings.about_history || ''
        setContent(val)
        setHasContent(!!val.trim())
      })
      .catch(() => {
        setContent('')
        setHasContent(false)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = useCallback(async () => {
    if (!content.trim() || content === '<p><br></p>') {
      toast.fire({
        icon: 'warning',
        title: 'กรุณากรอกเนื้อหาประวัติของหน่วยงานก่อนบันทึก',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    setIsSaving(true)
    try {
      await contentService.updateSiteSettings([
        { key: 'about_history', value: content },
      ])
      setHasContent(true)
      toast.fire({
        icon: 'success',
        title: 'บันทึกประวัติหน่วยงานสำเร็จ',
        timer: 1200,
        showConfirmButton: false,
      })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้'
      toast.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: msg,
      })
    } finally {
      setIsSaving(false)
    }
  }, [content])

  const handleClear = useCallback(() => {
    swal
      .fire({
        title: 'ยืนยันการล้างเนื้อหา',
        text: 'เนื้อหาที่พิมพ์ไว้จะหายไป และผู้ใช้จะไม่สามารถดูประวัติหน่วยงานได้จนกว่าจะมีเนื้อหาใหม่',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน ล้างเนื้อหา',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
      })
      .then((result) => {
        if (result.isConfirmed) {
          setContent('')
          setHasContent(false)
          toast.fire({
            icon: 'info',
            title: 'ล้างเนื้อหาเรียบร้อย',
            timer: 1000,
            showConfirmButton: false,
          })
        }
      })
  }, [])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>
            จัดการประวัติของหน่วยงาน
          </h2>
          <p className='text-slate-500 text-sm mt-1'>
            ใช้เครื่องมือด้านล่างในการเขียนหรือแก้ไขประวัติความเป็นมาของสำนักงาน ปปง.
          </p>
        </div>
        {hasContent && (
          <button
            onClick={handleClear}
            className='px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors'
          >
            ล้างเนื้อหา
          </button>
        )}
      </div>

      <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
        {/* Editor */}
        <div className='bg-white'>
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={quillModules}
            placeholder='พิมพ์ประวัติความเป็นมา จัดรูปแบบตามต้องการ...'
            className='h-[600px] pb-10'
          />
        </div>
      </div>

      <div className='flex justify-end gap-3'>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className='px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 active:scale-[0.97] transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกประวัติ'}
        </button>
      </div>

      <style>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e2e8f0 !important; padding: 12px 16px !important; background-color: #f8fafc; }
        .ql-container.ql-snow { border: none !important; font-size: 16px !important; font-family: inherit !important; }
        .ql-editor { min-height: 400px; padding: 24px !important; color: #334155; }
      `}</style>
    </div>
  )
}