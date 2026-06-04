import { useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import Swal from 'sweetalert2'
import { api } from '../utils/api'
import { DashboardContext, type ContactRequest } from './DashboardContextDef'

export { DashboardContext }
export type { ContactRequest }

// 🌟 อินเทอร์เฟซสำหรับโครงสร้างประกาศประชาสัมพันธ์และกิจกรรม
export interface NewsItem {
  id: number
  type: 'PR' | 'NEWS'
  title: string
  date: string
  image_src: string
  description: string
  content?: string
  views?: number
  isShow?: boolean
}

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  // --- ส่วนจัดการคำขอติดต่อ (Contact Requests) ---
  const [contactList, setContactList] = useState<ContactRequest[]>([])
  const [contactLoading, setContactLoading] = useState<boolean>(true)

  const totalContacts = contactList.length
  const pendingContacts = contactList.filter(
    (r) => r.status === 'ยังไม่ตอบกลับ',
  ).length

  const fetchContacts = async () => {
    setContactLoading(true)
    try {
      const response = await api('/contact', { method: 'GET' })
      if (response && response.success) {
        setContactList(response.data || [])
      }
    } catch (error) {
      console.error('Fetch dashboard contacts failed:', error)
    } finally {
      setContactLoading(false)
    }
  }

  const updateContactStatus = async (id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'ยังไม่ตอบกลับ' ? 'ตอบกลับแล้ว' : 'ยังไม่ตอบกลับ'

    const result = await Swal.fire({
      title: 'เปลี่ยนสถานะการติดต่อ?',
      text: `ปรับสถานะรายการนี้เป็น "${nextStatus}" ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#185FA5',
      cancelButtonColor: '#64748b',
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
      const response = await api('/contact/update', {
        method: 'PUT',
        body: { id, status: nextStatus },
      })

      if (response && response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'อัปเดตสำเร็จ',
          text: `เปลี่ยนสถานะเป็น "${nextStatus}" เรียบร้อยแล้ว`,
          confirmButtonColor: '#185FA5',
          timer: 1500,
        })
        fetchContacts()
      } else {
        throw new Error(response?.message || 'อัปเดตสถานะล้มเหลว')
      }
    } catch (error: any) {
      console.error('Update contact status failed:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้',
        confirmButtonColor: '#dc2626',
      })
    }
  }

  // --- ส่วนจัดการข่าวประชาสัมพันธ์ (PR) ---
  const [prs, setPrs] = useState<NewsItem[]>([])

  const fetchPRs = async () => {
    try {
      const res = await api('/news?type=PR&limit=50', { method: 'GET' })
      if (res && res.data) {
        setPrs(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch PRs:', error)
    }
  }

  const updatePR = async (id: number, form: FormData) => {
    const response = await api(`/news/${id}`, {
      method: 'PUT',
      body: form,
    })

    if (response && response.success) {
      await fetchPRs()
    } else {
      throw new Error(response?.error || 'การแก้ไขข้อมูลล้มเหลว')
    }
  }

  // --- 🌟 ส่วนจัดการกิจกรรม (News) ที่เพิ่มเข้ามาใหม่ ---
  const [newsList, setNewsList] = useState<NewsItem[]>([])

  const fetchNews = async () => {
    try {
      const res = await api('/news?type=NEWS&limit=50', { method: 'GET' })
      if (res && res.data) {
        setNewsList(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch News:', error)
    }
  }

  const updateNews = async (id: number, form: FormData) => {
    const response = await api(`/news/${id}`, {
      method: 'PUT',
      body: form,
    })

    if (response && response.success) {
      await fetchNews()
    } else {
      throw new Error(response?.error || 'การแก้ไขข้อมูลกิจกรรมล้มเหลว')
    }
  }

  // โหลดข้อมูลเริ่มต้นทั้งหมดพร้อมกัน
  useEffect(() => {
    fetchContacts()
    fetchPRs()
    fetchNews() // 🌟 ดึงข้อมูลกิจกรรมเริ่มต้น
  }, [])

  // ย้ายและรวบรวม contextValue ไว้ท้ายสุดหลังจากฟังก์ชันทั้งหมดถูกสร้างขึ้น
  const contextValue = useMemo(
    () => ({
      contacts: {
        data: contactList,
        loading: contactLoading,
        total: totalContacts,
        pending: pendingContacts,
        fetchAll: fetchContacts,
        updateStatus: updateContactStatus,
      },
      prs,
      fetchPRs,
      updatePR,
      newsList,
      fetchNews,
      updateNews,
    }),
    [
      contactList,
      contactLoading,
      totalContacts,
      pendingContacts,
      prs,
      newsList,
      // 🌟 ใส่ฟังก์ชันเหล่านี้เพิ่มลงไปให้ครบตามที่เบราว์เซอร์บ่นถึงครับ
      fetchContacts,
      updateContactStatus,
      fetchPRs,
      updatePR,
      fetchNews,
      updateNews,
    ],
  )

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
