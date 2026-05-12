import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Suspense , lazy } from 'react'

import { NewsProvider } from './context/NewsContext'
import ScrollToTop from './pages/ScrollToTop';

const Home = lazy (() => import ('./pages/homePage'));
const About = lazy (() => import ('./pages/aboutPage'))
const MainLayout = lazy (() => import ('./pages/MainLayout'))
const NewsDetailPage = lazy (() => import ('./pages/NewsDetailePage'))
const DepartmentDetailPage = lazy (() => import ('./pages/DepartDetailPage'))
const Advertise = lazy (() => import ('./pages/Advertise'))
const AdvertiseDetail = lazy (() => import ('./pages/Advertisedetail'))
const News = lazy (() => import ('./pages/News'))
const BookGuidePage = lazy (() => import ('./pages/BookGuidePage'))

const CommentForm = lazy (() => import ('./components/CommentForm'))
const ContactForm = lazy (() => import ('./components/ContactForm'))

function App() {
  return (
    <NewsProvider>
      <BrowserRouter>
        <ScrollToTop />
          <Suspense 
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
              <h2 className="text-xl font-bold text-blue-600 animate-pulse">กำลังโหลดข้อมูล...</h2>
            </div>
          }
          >
            <Routes>
            {/* สร้าง Layout Route ขึ้นมาครอบหน้าอื่นๆ ทั้งหมด */}
            <Route element={<MainLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} />
              <Route path='/news' element={<News />}></Route>
              <Route path='/news/:id' element={<NewsDetailPage />} />
              <Route path='/department/:id' element={<DepartmentDetailPage />} />
              <Route path='/advertise' element={<Advertise />}></Route>
              <Route path='/advertise/:id' element={<AdvertiseDetail />} />
              <Route path='/commentform' element={<CommentForm/>}></Route>
              <Route path='/contactform' element={<ContactForm/>}></Route>
              <Route path='/bookguide' element = {<BookGuidePage/>}></Route>
            </Route>

            {/* Route สำหรับหน้าที่ไม่อยากมีทั้ง Nav , Slider */}
            {/* <Route path="/duty" element={<DutyPage />} /> */}

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
    </NewsProvider>
  )
}

export default App
