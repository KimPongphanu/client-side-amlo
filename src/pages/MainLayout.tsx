// src/pages/MainLayout.tsx
import { Outlet, useLocation } from 'react-router-dom'
import CommentForm from '../components/CommentForm'
import CookieConsent from '../components/CookieConsent'
import ScrollToTopButton from '../components/ScrollToTopButton'
import Nav from '../pages/Nav'
import { useAuthStore } from '../stores/useAuthStore' // 🌟 1. ดึง useAuthStore มาตรวจสอบสถานะการล็อกอิน
import Footer from './Footer'

const MainLayout = () => {
  const location = useLocation()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn) // 🌟 2. เรียกใช้งานสถานะ isLoggedIn จาก Store

  return (
    <div className='min-h-screen w-full relative flex flex-col'>
      <Nav />

      <main className='flex-grow'>
        <Outlet />
      </main>
      <Footer />

      {/* 🌟 3. แสดงปุ่ม CommentForm ตลอดเวลาสำหรับผู้ใช้งานทั่วไป (Public Feedback) */}
      <CommentForm />

      <ScrollToTopButton />
      <CookieConsent />
    </div>
  )
}

export default MainLayout
