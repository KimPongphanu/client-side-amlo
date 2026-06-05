import type {
  ApiResponseBase,
  CommentItem,
  ContactRequest,
  DepartmentItem,
  NewsItem,
} from '../type'
import { api } from '../utils/api'

export const contentService = {
  /**
   * Fetch content items by type ('PR' or 'NEWS')
   */
  getNews: async (type: 'PR' | 'NEWS', limit = 50): Promise<NewsItem[]> => {
    const res = await api(`/news?type=${type}&limit=${limit}`, {
      method: 'GET',
    })
    return res?.data || []
  },

  /**
   * Create a new announcement or activity entry
   */
  createNews: async (body: FormData): Promise<ApiResponseBase> => {
    return await api('/news', { method: 'POST', body })
  },

  /**
   * Update an existing news or PR entry
   */
  updateNews: async (id: string, body: FormData): Promise<ApiResponseBase> => {
    return await api(`/news/update/${id}`, { method: 'PUT', body })
  },

  /**
   * Toggle visibility status of a news item
   */
  toggleNewsVisibility: async (
    id: string,
    isShow: boolean,
  ): Promise<ApiResponseBase> => {
    return await api(`/news/update/${id}`, {
      method: 'PUT',
      body: { isShow },
    })
  },

  /**
   * Fetch all comments from database
   */
  getComments: async (all = true): Promise<CommentItem[]> => {
    const url = all ? '/comments?all=true' : '/comments'
    const res = await api(url, { method: 'GET' })
    return res?.data || []
  },

  /**
   * Update single comment presentation status
   */
  updateCommentStatus: async (
    id: string,
    isShow: boolean,
  ): Promise<ApiResponseBase> => {
    return await api('/comments/update', {
      method: 'PUT',
      body: { id, isShow },
    })
  },

  /**
   * Submit a new feedback or rating comment
   */
  createComment: async (body: {
    star: number
    msg: string
  }): Promise<ApiResponseBase> => {
    return await api('/comments', { method: 'POST', body })
  },

  /**
   * Fetch contact inquiries list
   */
  getContacts: async (): Promise<ContactRequest[]> => {
    const res = await api('/contact', { method: 'GET' })
    return res?.data || []
  },

  /**
   * Update action status of a contact inquiry
   */
  updateContactStatus: async (
    id: string,
    status: string,
  ): Promise<ApiResponseBase> => {
    return await api('/contact/update', {
      method: 'PUT',
      body: { id, status },
    })
  },

  /**
   * Submit a contact form inquiry
   */
  createContact: async (
    body: Record<string, unknown>,
  ): Promise<ApiResponseBase> => {
    return await api('/contact', { method: 'POST', body })
  },

  /**
   * Fetch organizational departments list
   */
  getDepartments: async (): Promise<DepartmentItem[]> => {
    const res = await api('/departments', { method: 'GET' }).catch(() => null)
    return res?.data || []
  },
}
