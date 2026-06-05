import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CommentItem, DepartmentItem, NewsItem } from '../type'
import { api } from '../utils/api'

import { NewsContext } from './NewsContextDef'
export { NewsContext }

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const [prList, setPrList] = useState<NewsItem[]>([])
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [commentList, setCommentList] = useState<CommentItem[]>([])
  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 🌟 Fetch all comments (including hidden ones with isShow=false) for admin dashboard usage
  const fetchComments = useCallback(async () => {
    try {
      const res = await api('/comments?all=true', { method: 'GET' })
      if (res && res.data) {
        setCommentList(res.data)
      }
    } catch (error) {
      console.error('Failed to sync comments from database:', error)
    }
  }, [])

  // ── Centralized effect hook to load initial public data ──
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setIsLoading(true)

        // 1. Fetch Public Relations news (PR)
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
      } catch (error) {
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
    [newsList, prList, departmentList, commentList, isLoading, fetchComments],
  )

  return (
    <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>
  )
}
