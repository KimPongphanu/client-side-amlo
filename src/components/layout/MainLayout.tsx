// src/pages/MainLayout.tsx
import { Outlet } from 'react-router-dom'

import CommentForm from '../CommentForm'
import CookieConsent from '../CookieConsent'
import ScrollToTopButton from '../ScrollToTopButton'
import Footer from './Footer'
import Nav from './Nav'

const MainLayout = () => {
  return (
    <div className='min-h-screen w-full relative flex flex-col'>
      {/* Skip to Main Content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        ข้ามไปเนื้อหาหลัก
      </a>

      <Nav />

      <main id="main-content" className='flex-grow outline-none' tabIndex={-1}>
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
