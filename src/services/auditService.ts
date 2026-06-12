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

export const auditService = {
  getAuditLogs: async (limit: number = 100): Promise<AuditLogEntry[]> => {
    const response = await api<AuditLogResponse>('/audit', {
      method: 'GET',
    })
    return response.data || []
  },
}
