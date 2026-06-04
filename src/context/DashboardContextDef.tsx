import { createContext } from 'react'

export interface ContactRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  telNumber: string
  preferredContact: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

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

export interface DashboardContextType {
  contacts: {
    data: ContactRequest[]
    loading: boolean
    total: number
    pending: number
    fetchAll: () => Promise<void>
    updateStatus: (id: string, currentStatus: string) => Promise<void>
  }

  // --- ส่วนของระบบประชาสัมพันธ์ (PR) ---
  prs: NewsItem[]
  fetchPRs: () => Promise<void>
  updatePR: (id: number, form: FormData) => Promise<void> // 🌟 เพิ่มฟังก์ชันอัปเดต PR

  // --- 🌟 เพิ่มส่วนของระบบกิจกรรม (News) เพื่อให้ใช้งานได้แบบ Type-Safe ---
  newsList: NewsItem[]
  fetchNews: () => Promise<void>
  updateNews: (id: number, form: FormData) => Promise<void>
}

export const DashboardContext = createContext<DashboardContextType | null>(null)
