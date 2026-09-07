import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // นำเข้า BrowserRouter
import App from './App.tsx'
import './i18n/index' // 🌟 i18n initialization
import './index.css'

// 🚨 DevTools Warning — Anti-F12 console warning
// แสดงข้อความเตือนเมื่อผู้ใช้เปิด DevTools
const titleStyle = [
  'color: #e11d48;',
  'font-size: 70px;',
  'font-weight: 900;',
  'text-shadow: 2px 2px 0px #000, 4px 4px 0px #000;',
  'padding-bottom: 10px;'
].join('')

const bodyStyle = [
  'font-size: 16px;',
  'font-weight: bold;',
  'color: #111827;',
  'line-height: 1.6;'
].join('')

console.log(
  '%cหยุด!\n%cข้อห้ามเกี่ยวกับการเข้าถึง API และระบบโดยตรง ผู้ใช้บริการต้องใช้งานผ่านระบบและหน้าจอ (UI) ที่ผู้ให้บริการกำหนดเท่านั้น...',
  titleStyle,
  bodyStyle
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* นำมาครอบ App ไว้ตรงนี้ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
