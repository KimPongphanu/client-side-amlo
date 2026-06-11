import type { ApiResponseBase } from '../type'
import { api } from '../utils/api'

export interface AuditLogItem {
  id: string
  userId: number | null
  action: string
  ipAddress: string
  userAgent: string
  details: string | null
  createdAt: string
}

export interface AuditLogsResponse extends ApiResponseBase {
  data: AuditLogItem[]
}

export const auditService = {
  /**
   * Fetch audit logs, optionally filtered by user ID
   */
  getLogs: async (userId?: string): Promise<AuditLogsResponse> => {
    const url = userId ? `/audit?userId=${userId}` : '/audit'
    return await api<AuditLogsResponse>(url, { method: 'GET' })
  },
}
