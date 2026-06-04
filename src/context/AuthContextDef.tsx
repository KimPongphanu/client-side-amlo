// src/context/AuthContextDef.tsx
import { createContext } from 'react'

export interface AuthContextType {
  isLoggedIn: boolean
  login: () => void // 🌟 แก้ไขตรงนี้: เอา (token: string) ออก ให้เป็นฟังก์ชันเปล่า
  logout: () => void
  user: any
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)
