import Swal from 'sweetalert2'
import isEmail from 'validator/lib/isEmail'
import { create } from 'zustand'
import { contentService } from '../services/contentService'
import type {
  CommentFormData,
  CommentItem,
  ContactFormData,
  ContactFormErrors,
  ContactRequest,
  DepartmentItem,
  NewsFormData,
  NewsItem,
} from '../type'

interface ContentState {
  // Public Client & Dashboard State Arrays
  newsList: NewsItem[]
  prList: NewsItem[]
  commentList: CommentItem[]
  departmentList: DepartmentItem[]
  contactList: ContactRequest[]

  // Async Loading States
  isLoading: boolean
  isContactLoading: boolean
  isSubmittingContact: boolean
  contactErrors: ContactFormErrors
  isSubmittingComment: boolean
  commentError: string

  // Form Management Variables
  formData: NewsFormData | null
  activePost: NewsItem | null
  uploadFile: File | null
  mobileView: 'form' | 'preview'

  // Actions for State Manipulation
  setMobileView: (view: 'form' | 'preview') => void
  setUploadFile: (file: File | null) => void
  setFormData: (data: NewsFormData | null) => void
  setActivePost: (post: NewsItem | null) => void
  setCommentError: (error: string) => void

  // Centralized API Integration Methods
  fetchPublicData: () => Promise<void>
  fetchContacts: () => Promise<void>
  saveNewsEntry: (type: 'PR' | 'NEWS', closeModal: () => void) => Promise<void>
  toggleNewsVisibility: (id: string, currentShow: boolean) => Promise<void>
  toggleCommentStatus: (id: string, currentShow: boolean) => Promise<void>
  bulkCommentsStatus: (ids: Set<string>, show: boolean) => Promise<void>
  updateContactStatus: (id: string, currentStatus: string) => Promise<void>
  submitContactForm: (
    formData: ContactFormData,
    resetForm: () => void,
  ) => Promise<void>
  clearContactErrors: () => void
  submitUserComment: (
    formData: CommentFormData,
    submitTimestamps: number[],
    setSubmitTimestamps: (timestamps: number[]) => void,
    resetForm: () => void,
    setIsOpen: (open: boolean) => void,
    fetchPublicData: () => Promise<void>,
  ) => Promise<void>
}

export const useContentStore = create<ContentState>((set, get) => ({
  newsList: [],
  prList: [],
  commentList: [],
  departmentList: [],
  contactList: [],
  isLoading: true,
  isContactLoading: false,
  formData: null,
  activePost: null,
  uploadFile: null,
  mobileView: 'form',
  isSubmittingContact: false,
  contactErrors: {},
  isSubmittingComment: false,
  commentError: '',

  setMobileView: (view) => set({ mobileView: view }),
  setUploadFile: (file) => set({ uploadFile: file }),
  setFormData: (data) => set({ formData: data }),
  setActivePost: (post) => set({ activePost: post }),
  setCommentError: (error) => set({ commentError: error }),

  fetchPublicData: async () => {
    try {
      set({ isLoading: true })
      const [prData, newsData, commentsData, deptData] = await Promise.all([
        contentService.getNews('PR'),
        contentService.getNews('NEWS'),
        contentService.getComments(true),
        contentService.getDepartments(),
      ])
      set({
        prList: prData,
        newsList: newsData,
        commentList: commentsData,
        departmentList: deptData || [],
      })
    } catch (err: unknown) {
      console.error('[Content Store] Loading master data failed:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchContacts: async () => {
    try {
      set({ isContactLoading: true })
      const data = (await contentService.getContacts()) as ContactRequest[]
      set({ contactList: data })
    } catch (err: unknown) {
      console.error('[Content Store] Fetching contacts data failed:', err)
    } finally {
      set({ isContactLoading: false })
    }
  },

  clearContactErrors: () => set({ contactErrors: {} }),

  submitContactForm: async (formData, resetForm) => {
    // Intercept automated bot interactions using hidden honeypot validation
    if (formData.botField) {
      console.warn(
        '[Contact Store] Bot submission intercepted via honeypot field.',
      )
      resetForm()
      return
    }

    const newErrors: ContactFormErrors = {}
    let isValid = true

    const isThaiOnly = (v: string) => /^[ก-๙\s]+$/.test(v)
    const isEngOnly = (v: string) => /^[a-zA-Z\s]+$/.test(v)

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อจริงของท่าน'
      isValid = false
    } else if (
      !isThaiOnly(formData.firstName) &&
      !isEngOnly(formData.firstName)
    ) {
      newErrors.firstName =
        'กรุณากรอกเฉพาะตัวอักษรภาษาไทยหรือภาษาอังกฤษล้วนเท่านั้น'
      isValid = false
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุลของท่าน'
      isValid = false
    } else if (
      !isThaiOnly(formData.lastName) &&
      !isEngOnly(formData.lastName)
    ) {
      newErrors.lastName =
        'กรุณากรอกเฉพาะตัวอักษรภาษาไทยหรือภาษาอังกฤษล้วนเท่านั้น'
      isValid = false
    }

    if (isValid && formData.firstName && formData.lastName) {
      if (isThaiOnly(formData.firstName) !== isThaiOnly(formData.lastName)) {
        newErrors.firstName = 'ชื่อและนามสกุลต้องเป็นภาษาเดียวกันเท่านั้น'
        newErrors.lastName = 'ชื่อและนามสกุลต้องเป็นภาษาเดียวกันเท่านั้น'
        isValid = false
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมลครับ/ค่ะ'
      isValid = false
    } else if (!isEmail(formData.email)) {
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

    set({ contactErrors: newErrors })

    if (!isValid) return

    set({ isSubmittingContact: true })

    Swal.fire({
      title: 'กำลังส่งข้อความ...',
      text: 'กรุณารอสักครู่ระบบกำลังบันทึกข้อมูล',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    // Remove client honeypot properties prior to server data delivery
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { botField: _, ...actualData } = formData

    try {
      const response = await contentService.createContact(actualData)

      if (response && response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'ส่งข้อความสำเร็จ!',
          text: 'ขอบคุณที่ติดต่อเรา เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด',
          confirmButtonColor: '#2563eb',
        })

        resetForm()
        await get().fetchContacts()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text:
            response?.message ||
            'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้งในภายหลัง',
          confirmButtonColor: '#dc2626',
        })
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'ระบบขัดข้อง'
      Swal.fire({
        icon: 'error',
        title: 'การเชื่อมต่อล้มเหลว',
        text: msg,
        confirmButtonColor: '#dc2626',
      })
    } finally {
      set({ isSubmittingContact: false })
    }
  },

  saveNewsEntry: async (type, closeModal) => {
    const { formData, activePost, uploadFile, mobileView } = get()

    if (!formData || !formData.title.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาระบุหัวข้อประกาศก่อนดำเนินการต่อครับ',
      })
      if (mobileView === 'preview') set({ mobileView: 'form' })
      return
    }

    if (activePost === null && !uploadFile) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาทำการอัปโหลดรูปภาพปกสำหรับประกาศใหม่นี้ด้วยครับ',
      })
      return
    }

    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    })

    try {
      const form = new FormData()
      form.append('type', type)
      form.append('title', formData.title)
      form.append('description', formData.description || '')
      form.append('content', formData.content || '')
      if (uploadFile) form.append('image', uploadFile)

      if (activePost === null) {
        await contentService.createNews(form)
      } else if (formData.id) {
        await contentService.updateNews(String(formData.id), form)
      }

      await get().fetchPublicData()
      closeModal()

      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จเรียบร้อย',
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'บันทึกข้อมูลล้มเหลว'
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดภายในระบบ',
        text: msg,
      })
    }
  },

  toggleNewsVisibility: async (id, currentShow) => {
    try {
      const nextShow = !currentShow
      await contentService.toggleNewsVisibility(id, nextShow)
      await get().fetchPublicData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Content Store] Toggle visibility pattern aborted:', msg)
    }
  },

  toggleCommentStatus: async (id, currentShow) => {
    Swal.fire({
      title: 'กำลังบันทึกสถานะ',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      const nextShow = !currentShow
      await contentService.updateCommentStatus(id, nextShow)
      set((state) => ({
        commentList: state.commentList.map((c) =>
          c.id === id ? { ...c, isShow: nextShow } : c,
        ),
      }))
      Swal.fire({
        title: 'บันทึกสถานะเรียบร้อย',
        icon: 'success',
        timer: 500,
        showConfirmButton: false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ระบบขัดข้อง'
      Swal.fire({
        icon: 'error',
        title: 'อัปเดตสถานะล้มเหลว',
        text: msg,
      })
    }
  },

  bulkCommentsStatus: async (ids, show) => {
    if (ids.size === 0) return
    Swal.fire({
      title: `กำลังอัปเดตสถานะ ${ids.size} รายการ`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      await Promise.all(
        Array.from(ids).map((id) =>
          contentService.updateCommentStatus(id, show),
        ),
      )
      set((state) => ({
        commentList: state.commentList.map((c) =>
          ids.has(c.id) ? { ...c, isShow: show } : c,
        ),
      }))
      Swal.fire({
        title: 'อัปเดตกลุ่มสำเร็จเรียบร้อย',
        icon: 'success',
        timer: 800,
        showConfirmButton: false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ระบบขัดข้อง'
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดในการอัปเดตกลุ่ม',
        text: msg,
      })
    }
  },

  updateContactStatus: async (id, currentStatus) => {
    const nextStatus =
      currentStatus === 'ยังไม่ตอบกลับ' ? 'ตอบกลับแล้ว' : 'ยังไม่ตอบกลับ'
    const result = await Swal.fire({
      title: 'เปลี่ยนสถานะการติดต่อ?',
      text: `ปรับสถานะรายการนี้เป็น "${nextStatus}" ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    })

    if (!result.isConfirmed) return

    Swal.fire({
      title: 'กำลังประมวลผล...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      await contentService.updateContactStatus(id, nextStatus)
      await get().fetchContacts()
      Swal.fire({
        icon: 'success',
        title: 'อัปเดตสำเร็จ',
        text: `เปลี่ยนสถานะเป็น "${nextStatus}" เรียบร้อยแล้ว`,
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'ไม่สามารถอัปเดตสถานะได้'
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: msg,
      })
    }
  },

  submitUserComment: async (
    formData,
    submitTimestamps,
    setSubmitTimestamps,
    resetForm,
    setIsOpen,
    fetchPublicData,
  ) => {
    const MIN_COMMENT_LENGTH = 10
    const RATE_LIMIT_WINDOW_MS = 60000
    const RATE_LIMIT_COUNT = 3

    // 🌟 1. Intercept automated spambot entries via stealth honeypot validation
    if (formData.botField) {
      Swal.fire({
        title: 'ส่งความคิดเห็นสำเร็จ',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup:
            'rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-2xl',
          title: 'text-sm font-bold text-stone-950 font-sans tracking-tight',
          timerProgressBar: 'bg-stone-900',
        },
      })
      resetForm()
      setIsOpen(false)
      return
    }

    // 🌟 2. Verify rating stars boundary configurations
    if (formData.rating === 0) {
      Swal.fire({
        icon: 'warning',
        iconColor: '#D97706',
        title: 'กรุณาให้คะแนนความพึงพอใจ',
        text: 'โปรดเลือกคะแนนดาวก่อนส่งข้อเสนอแนะให้แก่ระบบครับ',
        buttonsStyling: false,
        confirmButtonText: 'รับทราบ',
        customClass: {
          popup:
            'rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-2xl',
          title:
            'text-base font-bold text-stone-950 font-sans tracking-tight pt-2',
          htmlContainer:
            'text-xs text-stone-600 font-medium leading-relaxed mt-2 px-4',
          confirmButton:
            'bg-stone-900 hover:bg-black text-white text-xs font-bold px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-95 mt-3 outline-none',
        },
      })
      return
    }

    // Enforce message layout character minimum validation gates
    if (formData.content.trim().length < MIN_COMMENT_LENGTH) {
      set({ commentError: `กรุณากรอกอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร` })
      return
    }

    // 🌟 3. Filter out dangerous hyperlink injections or gambling advertisements
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i
    if (urlRegex.test(formData.content)) {
      Swal.fire({
        icon: 'error',
        iconColor: '#DC2626',
        title: 'ไม่อนุญาตให้แนบลิงก์',
        text: 'ระบบความปลอดภัยไม่อนุญาตให้ระบุที่อยู่ลิงก์เว็บไซต์ใดๆ ภายในช่องความคิดเห็นครับ',
        buttonsStyling: false,
        confirmButtonText: 'กลับไปแก้ไข',
        customClass: {
          popup:
            'rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-2xl',
          title:
            'text-base font-bold text-stone-950 font-sans tracking-tight pt-2',
          htmlContainer:
            'text-xs text-stone-600 font-medium leading-relaxed mt-2 px-4',
          confirmButton:
            'bg-stone-900 hover:bg-black text-white text-xs font-bold px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-95 mt-3 outline-none',
        },
      })
      return
    }

    const now = Date.now()
    const filteredTimestamps = submitTimestamps.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS,
    )

    // 🌟 4. Enforce client-side rate limiting windows to block rapid requests
    if (filteredTimestamps.length >= RATE_LIMIT_COUNT) {
      Swal.fire({
        icon: 'warning',
        iconColor: '#D97706',
        title: 'ส่งข้อมูลบ่อยเกินไป',
        text: 'คุณทำรายการถี่เกินกำหนด กรุณาเว้นระยะสักครู่แล้วลองใหม่อีกครั้งครับ',
        buttonsStyling: false,
        confirmButtonText: 'ตกลง',
        customClass: {
          popup:
            'rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-2xl',
          title:
            'text-base font-bold text-stone-950 font-sans tracking-tight pt-2',
          htmlContainer:
            'text-xs text-stone-600 font-medium leading-relaxed mt-2 px-4',
          confirmButton:
            'bg-stone-900 hover:bg-black text-white text-xs font-bold px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-95 mt-3 outline-none',
        },
      })
      setSubmitTimestamps(filteredTimestamps)
      return
    }

    set({ isSubmittingComment: true })
    const updatedTimestamps = [...filteredTimestamps, now]
    setSubmitTimestamps(updatedTimestamps)

    try {
      const response = await contentService.createComment({
        star: formData.rating,
        msg: formData.content.trim(),
      })

      if (response && response.success) {
        // 🌟 5. Display sleek layout minimalist notification upon database commit success
        Swal.fire({
          title: 'ส่งความคิดเห็นสำเร็จ',
          html: 'ขอบพระคุณสำหรับข้อเสนอแนะและคำติชมของท่าน',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup:
              'rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-2xl',
            title: 'text-sm font-bold text-stone-950 font-sans tracking-tight',
            htmlContainer: 'text-xs text-stone-500 font-medium mt-1',
            timerProgressBar: 'bg-stone-900',
          },
        })
        resetForm()
        set({ commentError: '' })
        setIsOpen(false)
        await fetchPublicData() // Synchronize lists dynamically
      } else {
        throw new Error(response?.message || 'ไม่สามารถส่งข้อมูลได้')
      }
    } catch (err: unknown) {
      // 🌟 6. Gracefully map pipeline network issues using standardized error popups
      const msg =
        err instanceof Error
          ? err.message
          : 'ไม่สามารถเชื่อมต่อระบบเซิร์ฟเวอร์ได้ในขณะนี้ กรุณาลองใหม่ครับ'
      Swal.fire({
        icon: 'error',
        iconColor: '#DC2626',
        title: 'เกิดข้อผิดพลาด',
        text: msg,
        buttonsStyling: false,
        confirmButtonText: 'ลองใหม่อีกครั้ง',
        customClass: {
          popup:
            'rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-2xl',
          title:
            'text-base font-bold text-stone-950 font-sans tracking-tight pt-2',
          htmlContainer:
            'text-xs text-stone-600 font-medium leading-relaxed mt-2 px-4',
          confirmButton:
            'bg-stone-900 hover:bg-black text-white text-xs font-bold px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-95 mt-3 outline-none',
        },
      })
    } finally {
      set({ isSubmittingComment: false })
    }
  },
}))
