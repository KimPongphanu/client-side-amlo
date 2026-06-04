// src/utils/api.ts

// Clean the slash from .env URL and attach the /api prefix automatically
const ENV_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const BASE_URL = `${ENV_URL.replace(/\/$/, '')}/api`

interface FetchOptions extends RequestInit {
  body?: any
}

export const api = async (endpoint: string, options: FetchOptions = {}) => {
  // Prevent URL duplication by removing leading slash if present (e.g., /api//auth/login)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  const url = `${BASE_URL}/${cleanEndpoint}`

  const headers = new Headers(options.headers)

  // Automatically set Content-Type if the body is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // ❌ REMOVED: sessionStorage.getItem('token') and Authorization header.
  // The browser will now automatically manage and attach the HTTP-Only cookie.

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // 🌟 IMPORTANT: Instructs fetch to include cookies in cross-origin requests
    body:
      options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body),
  }

  const response = await fetch(url, config)

  // 🌟 ปรับปรุงการจัดการสถานะ 401 / 403 ใหม่
  if (response.status === 401 || response.status === 403) {
    // ดึงข้อความ Error (เช่น 'อีเมลหรือรหัสผ่านไม่ถูกต้อง') จากหลังบ้านออกมาก่อน
    const errorData = await response.json().catch(() => ({}))
    const message = errorData.message || 'Unauthorized'

    // 🛡️ เช็คเงื่อนไข: ถ้าปัจจุบันเราอยู่ที่หน้า /login อยู่แล้ว ห้ามสั่ง window.location.href เด็ดขาด
    if (
      window.location.pathname === '/login' ||
      endpoint.includes('/auth/login')
    ) {
      throw new Error(message) // โยนข้อความส่งต่อไปให้ LoginPage เอาไปขึ้น SWAL สีแดงเอง
    }

    // แต่ถ้าเราอยู่หน้าอื่น (เช่นหน้า Dashboard แล้ว Token หมดอายุ) ค่อยดีดกลับหน้า Login
    window.location.href = '/login'
    throw new Error(message)
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
