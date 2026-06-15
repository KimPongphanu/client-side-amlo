// src/services/auditService.ts
import { api } from '../utils/api'

export type AuditLogEntry = {
  id: string
  userId: number | null
  action: string
  ipAddress: string
  userAgent: string
  details: string | null
  createdAt: string
  user?: {
    email: string
    firstname: string
    lastname: string
  }
}

export interface AuditLogResponse {
  success: boolean
  data: AuditLogEntry[]
}

export interface AuditLogPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AuditLogPaginatedResponse extends AuditLogResponse {
  pagination?: AuditLogPagination
}

export const auditService = {
  getAuditLogs: async (
    page = 1,
    limit = 50,
    sort: string = 'createdAt',
    order: string = 'desc',
    action?: string,
    q?: string,
  ): Promise<{ data: AuditLogEntry[]; pagination: AuditLogPagination }> => {
    let url = `/audit?page=${page}&limit=${limit}&sort=${sort}&order=${order}`
    if (action && action !== 'all')
      url += `&action=${encodeURIComponent(action)}`
    if (q && q.trim()) url += `&q=${encodeURIComponent(q.trim())}`
    const response = await api<AuditLogPaginatedResponse>(url, {
      method: 'GET',
    })
    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
      },
    }
  },

  getLogs: async (userId: number | string): Promise<AuditLogEntry[]> => {
    const response = await api<AuditLogResponse>(`/audit?userId=${userId}`, {
      method: 'GET',
    })
    return response.data || []
  },
}
