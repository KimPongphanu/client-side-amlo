import type React from 'react'

// ---------------------------------------------------------
// Authentication Types
// ---------------------------------------------------------

/**
 * Structure representing the authenticated user profile details
 */
export interface UserProfile {
  id: string
  email: string
  firstname: string
  lastname: string
  role: 'Admin' | 'Staff' | 'User'
}

// ---------------------------------------------------------
// Content & Media Types
// ---------------------------------------------------------

/**
 * Structure representing general activity or public relations news announcement
 */
export interface NewsItem {
  id: number
  type?: 'PR' | 'NEWS'
  title: string
  date: string
  image_src: string
  description: string
  content?: string
  views?: number
  isShow?: boolean
}

/**
 * Media item details embedded within organizational dynamic galleries
 */
export interface GalleryItem {
  type: 'image' | 'video'
  url: string
}

/**
 * Structure mapping specific organizational department details
 */
export interface DepartmentItem {
  id: number
  title: string
  cover_image: string
  gallery: GalleryItem[]
  content?: string
}

export interface NewsContextType {
  newsList: NewsItem[]
  prList: NewsItem[]
  departmentList: DepartmentItem[]
  isLoading: boolean
  // 🌟 เพิ่ม 2 บรรทัดนี้
  setPrList: React.Dispatch<React.SetStateAction<NewsItem[]>>
  setNewsList: React.Dispatch<React.SetStateAction<NewsItem[]>>
  setDepartmentList: React.Dispatch<React.SetStateAction<DepartmentItem[]>>
}

// ... โค้ดบรรทัดบนๆ เหมือนเดิม ...

export interface DepartmentItem {
  id: number
  title: string
  cover_image: string
  gallery: GalleryItem[]
  content?: string
}

// 🌟 1. เพิ่ม Interface สำหรับ Comment
/**
 * Individual ratings and response comments given by website clients
 */
export interface CommentItem {
  id: string
  msg: string
  star: number
  createdAt: string
  isShow: boolean
}

/**
 * Form values used when managing or creating an activity or announcement entry
 */
export interface NewsFormData {
  id?: string | number
  type?: 'PR' | 'NEWS'
  title: string
  date?: string
  image_src?: string
  description?: string
  content?: string
  views?: number
  isShow?: boolean
}

// ---------------------------------------------------------
// Dashboard & Communication Types
// ---------------------------------------------------------

/**
 * Structure mapping user information inquiries and feedback submissions
 */
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

// ---------------------------------------------------------
// API Response Base Types
// ---------------------------------------------------------

/**
 * Standard backend response payload configuration
 */
export interface ApiResponseBase {
  success: boolean
  message?: string
  error?: string
  data?: unknown
}

// ---------------------------------------------------------
// Context & State Contract Definitions
// ---------------------------------------------------------

/**
 * Layout configuration parameters for legacy news content state wrappers
 */
export interface NewsContextType {
  newsList: NewsItem[]
  prList: NewsItem[]
  departmentList: DepartmentItem[]
  commentList: CommentItem[]
  isLoading: boolean
  setPrList: React.Dispatch<React.SetStateAction<NewsItem[]>>
  setNewsList: React.Dispatch<React.SetStateAction<NewsItem[]>>
  setCommentList: React.Dispatch<React.SetStateAction<CommentItem[]>>
  fetchComments?: () => Promise<void>
}

export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  telNumber: string
  preferredContact: string
  message: string
  botField: string // 🌟 เพิ่ม Field สำหรับ Honeypot
}

export interface ContactFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  telNumber?: string
  preferredContact?: string
  message?: string
}

export interface CommentFormData {
  rating: number
  content: string
  botField: string
}
