// src/context/newsContextDef.ts
// ไฟล์นี้ทำหน้าที่เดียวคือ export Context object
// แยกออกมาจาก NewsProvider เพื่อแก้ ESLint: react-refresh/only-export-components

import { createContext } from 'react'
import type { NewsContextType } from '../type'

export const NewsContext = createContext<NewsContextType | null>(null)