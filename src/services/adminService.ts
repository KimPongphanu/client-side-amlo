// src/services/adminService.ts
import { api } from '../utils/api'

export type AdminUser = {
  uuid: string
  email: string
  firstname: string
  lastname: string
  role: string
  twoFactorEnabled: boolean
  twoFactorMethod: string
  createdAt: string
  recentOnline: string
  status?: string
}

export interface CreateAdminData {
  email: string
  password: string
  firstname: string
  lastname: string
}

export interface UpdateAdminData {
  firstname?: string
  lastname?: string
}

export interface ActionResponse {
  success: boolean
  message: string
  data?: unknown
}

export const adminService = {
  getAdmins: async (): Promise<AdminUser[]> => {
    const response = await api<{ success: boolean; data: AdminUser[] }>(
      '/admin/users',
      {
        method: 'GET',
      },
    )
    return response.data || []
  },

  getAdminById: async (uuid: string): Promise<AdminUser | null> => {
    const response = await api<{ success: boolean; data: AdminUser }>(
      `/admin/users/${uuid}`,
      {
        method: 'GET',
      },
    )
    return response.data || null
  },

  createAdmin: async (data: CreateAdminData): Promise<ActionResponse> => {
    const response = await api<ActionResponse>('/admin/users', {
      method: 'POST',
      body: data,
    })
    return response
  },

  updateAdmin: async (
    uuid: string,
    data: UpdateAdminData,
  ): Promise<ActionResponse> => {
    const response = await api<ActionResponse>(`/admin/users/${uuid}`, {
      method: 'PUT',
      body: data,
    })
    return response
  },

  banAdmin: async (uuid: string, reason: string): Promise<ActionResponse> => {
    const response = await api<ActionResponse>(`/admin/users/${uuid}/ban`, {
      method: 'PUT',
      body: { reason },
    })
    return response
  },

  unbanAdmin: async (uuid: string, reason: string): Promise<ActionResponse> => {
    const response = await api<ActionResponse>(`/admin/users/${uuid}/unban`, {
      method: 'PUT',
      body: { reason },
    })
    return response
  },

  deleteAdmin: async (
    uuid: string,
    reason: string,
  ): Promise<ActionResponse> => {
    const response = await api<ActionResponse>(`/admin/users/${uuid}`, {
      method: 'DELETE',
      body: { reason },
    })
    return response
  },
}
