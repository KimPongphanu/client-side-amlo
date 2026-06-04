import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CommentItem, DepartmentItem, NewsItem } from '../type'
import { api } from '../utils/api'

import { NewsContext } from './NewsContextDef'
export { NewsContext }

// ==========================================
// ลบหรือคอมเมนต์ MOCK_DB เก่าออก เพื่อให้โค้ดสะอาดขึ้น
// ==========================================

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const [prList, setPrList] = useState<NewsItem[]>([])
  const [newsList, setNewsList] = useState<NewsItem[]>([]) // 🌟 แก้ไข: เปลี่ยนจากดึง MOCK_DB เป็นเริ่มต้นด้วย Array ว่าง
  const [commentList, setCommentList] = useState<CommentItem[]>([]) // รอต่อ API จริงในอนาคต
  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([]) // รอต่อ API จริงในอนาคต
  const [isLoading, setIsLoading] = useState(true)

  // 🌟 รวมศูนย์ดึงข้อมูลสาธารณะจากหลังบ้านผ่าน useEffect ชุดเดียว
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setIsLoading(true)

        // 1. ดึงข้อมูลประชาสัมพันธ์ (PR)
        const prRes = await api('/news?type=PR&limit=50', { method: 'GET' })
        if (prRes && prRes.data) {
          setPrList(prRes.data)
        }

        // 2. ดึงข้อมูลกิจกรรม (NEWS)
        const newsRes = await api('/news?type=NEWS&limit=50', { method: 'GET' })
        if (newsRes && newsRes.data) {
          setNewsList(newsRes.data)
        }

        // 🌟 เพิ่มส่วนนี้: 3. ดึงข้อมูลหน่วยงาน (Department) จาก Backend
        const deptRes = await api('/departments', { method: 'GET' })
        if (deptRes && Array.isArray(deptRes)) {
          setDepartmentList(deptRes)
        }

        // 4. (Optional) โหลดค่าคอมเมนต์...
        const savedComments = localStorage.getItem('amlo_commentList')
        if (savedComments) setCommentList(JSON.parse(savedComments))
      } catch (error) {
        console.error('Failed to fetch public website data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublicData()
  }, [])

  // บันทึกคอมเมนต์ลง LocalStorage (พฤติกรรมเดิมของระบบรับฟังความคิดเห็น)
  useEffect(() => {
    if (commentList.length > 0) {
      try {
        localStorage.setItem('amlo_commentList', JSON.stringify(commentList))
      } catch(error) {
        console.error('ไม่สามารถบันทึกคอมเมนต์ลง LocalStorage ได้:', error)
      }
    }
  }, [commentList])

  const contextValue = useMemo(
    () => ({
      newsList,
      prList,
      departmentList,
      commentList,
      isLoading,
      setPrList,
      setNewsList,
      setCommentList,
      setDepartmentList,
    }),
    [newsList, prList, departmentList, commentList, isLoading],
  )

  return (
    <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>
  )
}
