// src/App.tsx
import { Suspense, lazy, useContext } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'

import { AuthContext } from './context/AuthContextDef'
import { DashboardProvider } from './context/DashboardContext'
import ScrollToTop from './pages/ScrollToTop'

const Home = lazy(() => import('./pages/homePage'))
const About = lazy(() => import('./pages/aboutPage'))
const MainLayout = lazy(() => import('./pages/MainLayout'))
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'))
const DepartmentDetailPage = lazy(() => import('./pages/DepartDetailPage'))
const Advertise = lazy(() => import('./pages/Advertise'))
const AdvertiseDetail = lazy(() => import('./pages/Advertisedetail'))
const News = lazy(() => import('./pages/News'))
const BookGuidePage = lazy(() => import('./pages/BookGuidePage'))
const Login = lazy(() => import('./pages/LoginPage'))

const CommentForm = lazy(() => import('./components/CommentForm'))
const ContactForm = lazy(() => import('./components/ContactForm'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

// 🔒 ProtectedRoute: สำหรับหน้าต้องการสิทธิ์ความปลอดภัย (เข้าได้เฉพาะคนที่ Login แล้ว)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext)

  // 1. 🌟 ล็อกประตูไว้ก่อน: ตราบใดที่ยังโหลดไม่เสร็จ (isLoading === true) ห้ามแสดงผลหน้า Dashboard เด็ดขาด
  if (auth?.isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-slate-100'>
        <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  // 2. ตรวจสอบสถานะ: โหลดเสร็จแล้ว ถ้าล็อกอินผ่านให้เข้าหน้าระบบ ถ้าไม่ผ่านให้ดีดกลับไปหน้า Login
  return auth?.isLoggedIn ? <>{children}</> : <Navigate to='/login' replace />
}

// 🛡️ PublicRoute: สำหรับหน้าสาธารณะ (เตะผู้ใช้ที่เคยล็อกอินสำเร็จแล้วหนีไปหน้า Dashboard)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext)
  // หากตรวจพบสถานะการเข้าสู่ระบบค้างไว้ ดีดไปหน้าจัดการภายในทันที
  return auth?.isLoggedIn ? (
    <Navigate to='/dashboard' replace />
  ) : (
    <>{children}</>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className='flex items-center justify-center min-h-screen bg-slate-50'>
            <h2 className='text-xl font-bold text-blue-600 animate-pulse'>
              กำลังโหลดข้อมูล...
            </h2>
          </div>
        }
      >
        <Routes>
          {/* สร้าง Layout Route ขึ้นมาครอบหน้าอื่นๆ ทั้งหมด */}
          <Route element={<MainLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/news' element={<News />} />
            <Route path='/news/:id' element={<NewsDetailPage />} />
            <Route path='/department/:id' element={<DepartmentDetailPage />} />
            <Route path='/advertise' element={<Advertise />} />
            <Route path='/advertise/:id' element={<AdvertiseDetail />} />
            <Route path='/bookguide' element={<BookGuidePage />} />
            <Route path='/commentform' element={<CommentForm />} />
            <Route path='/contactform' element={<ContactForm />} />

            {/* 🌟 ปรับปรุง: ครอบหน้า Login ด้วย PublicRoute เพื่อไม่ให้ล็อกอินซ้ำซ้อน */}
            <Route
              path='/login'
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
          </Route>

          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <DashboardProvider>
                  <DashboardPage />
                </DashboardProvider>
              </ProtectedRoute>
            }
          />

          {/* หน้า 404 Not Found (ถ้าไม่มี Route ไหนตรงเลย) */}
          <Route
            path='*'
            element={
              <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black to-white-500 text-white'>
                <h1 className='text-4xl font-bold'>404 - ไม่พบหน้านี้</h1>
                <Link to='/' className='cursor-pointer mt-6'>
                  <div className='bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors'>
                    <h2>หน้าหลัก</h2>
                  </div>
                </Link>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
