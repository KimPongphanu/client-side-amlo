import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import ScrollToTop from './pages/ScrollToTop'
import { useAuthStore } from './stores/useAuthStore'

const Home = lazy(() => import('./pages/homePage'))
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const user = useAuthStore((state) => state.user)

  if (!isLoggedIn && !user) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  return isLoggedIn ? <Navigate to='/dashboard' replace /> : <>{children}</>
}

function App() {
  const verifyUser = useAuthStore((state) => state.verifyUser)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await verifyUser()
      } catch (err) {
        console.error(err)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    initAuth()
  }, [verifyUser])

  if (isCheckingAuth) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-slate-50'>
        <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

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
          <Route element={<MainLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/news' element={<News />} />
            <Route path='/news/:id' element={<NewsDetailPage />} />
            <Route path='/department/:id' element={<DepartmentDetailPage />} />
            <Route path='/advertise' element={<Advertise />} />
            <Route path='/advertise/:id' element={<AdvertiseDetail />} />
            <Route path='/bookguide' element={<BookGuidePage />} />
            <Route path='/commentform' element={<CommentForm />} />
            <Route path='/contactform' element={<ContactForm />} />

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
                <DashboardPage />
              </ProtectedRoute>
            }
          />

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
