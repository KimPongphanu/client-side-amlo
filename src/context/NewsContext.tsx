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

        // 2. Fetch Activity and general news (NEWS)
        const newsRes = await api('/news?type=NEWS&limit=50', { method: 'GET' })
        if (newsRes && newsRes.data) {
          setNewsList(newsRes.data)
        }

        // 3. Fetch initial comments data via the unified refresh function
        await fetchComments()

        // 4. Fetch departments and internal organizational structures
        const deptRes = await api('/departments', { method: 'GET' }).catch(
          () => null,
        )
        if (deptRes && deptRes.data) {
          setDepartmentList(deptRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch public website data:', error)
      } finally {
        // Turn off skeletons and loading templates simultaneously
        setIsLoading(false)
      }
    }

    fetchPublicData()
  }, [fetchComments])

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
      fetchComments, // 🌟 Exporting fetchComments function for live synchronizations on dashboard without refreshes
    }),
    [newsList, prList, departmentList, commentList, isLoading, fetchComments],
  )

  return (
    <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>
  )
}
