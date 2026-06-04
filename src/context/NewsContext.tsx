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

        // 2. 🌟 แก้ไข: ดึงข้อมูลกิจกรรม (NEWS) จาก API หลังบ้านจริงแทนการใช้ค่าวัดดวงในเครื่อง
        const newsRes = await api('/news?type=NEWS&limit=50', { method: 'GET' })
        if (newsRes && newsRes.data) {
          setNewsList(newsRes.data)
        }

        // 3. (Optional) โหลดค่าคอมเมนต์และโครงสร้างภายในแบบ Mock สำรองไว้ก่อน
        // หากในอนาคตหลังบ้านทำ Endpoint /comments หรือ /departments เสร็จ สามารถมายัดใส่ตรงนี้ได้เลย
        const savedComments = localStorage.getItem('amlo_commentList')
        if (savedComments) setCommentList(JSON.parse(savedComments))
      } catch (error) {
        console.error('Failed to fetch public website data:', error)
      } finally {
        setIsLoading(false) // ปิดตัวโหลด Skeleton พร้อมกันเมื่อข้อมูลหลักมาครบ
      }
    }

    fetchPublicData()
  }, [])

  // บันทึกคอมเมนต์ลง LocalStorage (พฤติกรรมเดิมของระบบรับฟังความคิดเห็น)
  useEffect(() => {
    if (commentList.length > 0) {
      try {
        localStorage.setItem('amlo_commentList', JSON.stringify(commentList))
      } catch {}
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
    }),
    [newsList, prList, departmentList, commentList, isLoading],
  )

  return (
    <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>
  )
}
