// src/pages/MainLayout.tsx
import { Outlet, useLocation } from 'react-router-dom'
import CommentForm from '../components/CommentForm'
import CookieConsent from '../components/CookieConsent'
import ScrollToTopButton from '../components/ScrollToTopButton'
import Nav from '../pages/Nav'
import Slider from '../pages/Slider'
import { useAuthStore } from '../stores/useAuthStore' // 🌟 1. ดึง useAuthStore มาตรวจสอบสถานะการล็อกอิน
import Footer from './Footer'

const slides = [
  { id: 1, image: '/banner.png', title: 'Slide 1' },
  { id: 2, image: '/amlo1.jpg', title: 'Slide 2' },
  { id: 3, image: '/amlo2.jpg', title: 'Slide 3' },
  { id: 4, image: '/amlo3.jpg', title: 'Slide 4' },
  { id: 5, image: '/amlo4.jpg', title: 'Slide 5' },
  { id: 6, image: '/amlo5.jpg', title: 'Slide 6' },
]

const MainLayout = () => {
  const location = useLocation()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn) // 🌟 2. เรียกใช้งานสถานะ isLoggedIn จาก Store

  // รายชื่อ Path ที่ต้องการซ่อน Slider
  const hideOnPaths = [
    '/newsdetailepage',
    '/agency1',
    '/news',
    '/department',
    '/advertise',
    '/contactform',
    '/bookguide',
    '/login',
  ]

  const currentPath = location.pathname.toLowerCase()

  const shouldHideSlider = hideOnPaths.some((path) =>
    currentPath.startsWith(path),
  )
  const showSlider = !shouldHideSlider

  return (
    <div className='min-h-screen w-full relative flex flex-col'>
      <Nav />

      {showSlider && (
        <div className='pt-16 lg:pt-0 pb-10 bg-slate-50'>
          <Slider slides={slides} />
        </div>
      )}

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
