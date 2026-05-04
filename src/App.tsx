import { BrowserRouter, Routes, Route , Link} from 'react-router-dom'
import Home from './pages/homePage'
import About from './pages/aboutPage'
import DutyPage from './pages/dutyPage'
import MainLayout from './pages/MainLayout'
import { NewsProvider } from './context/NewsContext'
import NewsDetailPage from './pages/NewsDetailePage'
import DepartmentDetailPage from './pages/DepartDetailPage'
import ScrollToTop from './pages/ScrollToTop'
import Advertise from './pages/Advertise'
import AdvertiseDetail from './pages/Advertisedetail'

function App() {
  return (
    <NewsProvider>
      <BrowserRouter>
        <ScrollToTop />
          <Routes>
            {/* สร้าง Layout Route ขึ้นมาครอบหน้าอื่นๆ ทั้งหมด */}
            <Route element={<MainLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} />
              <Route path='/advertise'element={<Advertise/>}></Route>
              <Route path='/duty' element={<DutyPage/>}></Route>
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/department/:id" element={<DepartmentDetailPage />} />
              <Route path="/advertise/:id" element={<AdvertiseDetail />} />
            </Route>

            {/* Route สำหรับหน้าที่ไม่อยากมีทั้ง Nav , Slider */}
            {/* <Route path="/duty" element={<DutyPage />} /> */}

            {/* หน้า 404 Not Found (ถ้าไม่มี Route ไหนตรงเลย) */}
            <Route path="*" element={<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black to-white-500 text-white">
              <h1 className="text-4xl font-bold">404 - ไม่พบหน้านี้</h1>
              <Link to="/" className="cursor-pointer mt-6">
                <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <h2>หน้าหลัก</h2>
                </div>
              </Link>
              </div>} />

          </Routes>
      </BrowserRouter>
    </NewsProvider>
  )
}

export default App
