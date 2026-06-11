// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react'

import ContactRequestManager from '../components/dashboard/ContactRequestManager'
import DepartmentManagerDashboard from '../components/dashboard/department/DepartmentManagerDashboard'
import NavBar from '../components/dashboard/NavBarComponent'
import NewsManagerDashboard from '../components/dashboard/NewsManagerDashboard'
import PRManagerDashboard from '../components/dashboard/PRManagerDashboard'
import ReviewManager from '../components/dashboard/ReviewManager'
import SliderManagerDashboard from '../components/dashboard/SliderManagerDashboard'
import UserManagerDashboard from '../components/dashboard/userManager/UserManagerDashboard'
import { useAuthStore } from '../stores/useAuthStore'

type MenuId =
  | 'overview'
  | 'data-clean'
  | 'settings'
  | 'reviews'
  | 'contacts'
  | 'advertises'
  | 'user-manage'
  | 'news'
  | 'departments'
  | 'slider'

// ---------------------------------------------------------
// Mockup Components
// ---------------------------------------------------------
const OverviewComponent = () => (
  <div className='bg-slate-50 border border-slate-200 p-6'>
    <h2 className='text-xl font-bold mb-4'>ภาพรวมระบบ (Overview)</h2>
    <p className='text-slate-600'>กำลังแสดงข้อมูลสถิติ...</p>
  </div>
)

const DataCleansingComponent = () => (
  <div className='bg-slate-50 border border-slate-200 p-6'>
    <h2 className='text-xl font-bold mb-4'>จัดการและทำความสะอาดข้อมูล</h2>
    <p className='text-slate-600'>ตารางข้อมูลธุรกรรม...</p>
  </div>
)

// ---------------------------------------------------------
// Sidebar Component
// ---------------------------------------------------------
type SideBarProps = {
  activeMenu: MenuId
  setActiveMenu: (id: MenuId) => void
  isMobileOpen: boolean
}

const SideBar = ({ activeMenu, setActiveMenu, isMobileOpen }: SideBarProps) => {
  const menus: { id: MenuId; label: string }[] = [
    { id: 'overview', label: 'ภาพรวมระบบ' },
    { id: 'data-clean', label: 'จัดการข้อมูล' },
    { id: 'settings', label: 'ตั้งค่าระบบ' },
    { id: 'user-manage', label: 'จัดการสมาชิก' },
    { id: 'reviews', label: 'รีวิว/ความคิดเห็น' },
    { id: 'contacts', label: 'การติดต่อ' },
    { id: 'advertises', label: 'ประชาสัมพันธ์' },
    { id: 'news', label: 'กิจกรรมและประกาศ' },
    { id: 'departments', label: 'จัดการหน่วยงาน' },
    { id: 'slider', label: 'Slider หน้าหลัก' },
  ]

  return (
    <aside
      className={`
        bg-white border-r border-slate-200 w-64 min-h-[calc(100vh-5rem)]
        absolute md:static top-0 left-0 z-10 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <nav className='p-4 flex flex-col gap-y-2'>
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`
              w-full text-left px-4 py-3 text-sm font-medium transition-colors cursor-pointer outline-none rounded-md
              ${
                activeMenu === menu.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }
            `}
          >
            {menu.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

// ---------------------------------------------------------
// Dashboard Main Component
// ---------------------------------------------------------
const DashboardPage = () => {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)

  // 🌟 Initialize state safely after passing Auth Guards
  const [activeMenu, setActiveMenu] = useState<MenuId>(() => {
    const savedMenu = sessionStorage.getItem('activeDashboardMenu')
    return (savedMenu as MenuId) || 'overview'
  })

  // Auth Store - เพิ่ม user และ verifyUser
  const user = useAuthStore((state) => state.user)
  const verifyUser = useAuthStore((state) => state.verifyUser)
  const logoutUser = useAuthStore((state) => state.logoutUser)
  const initIdleTimeout = useAuthStore((state) => state.initIdleTimeout)

  // 🌟 Loading state สำหรับตรวจสอบสิทธิ์
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true)

  // 🌟 ตรวจสอบ token และสิทธิ์ผู้ใช้ก่อนโหลด Dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ถ้ายังไม่มี user ให้ verify ก่อน
        if (!user) {
          await verifyUser()
        }
      } catch (error) {
        console.error('[Dashboard] Auth verification failed:', error)
      } finally {
        setIsVerifyingAuth(false)
      }
    }
    checkAuth()
  }, [user, verifyUser])

  // 🌟 Unified secure logout handler
  const handleLogout = async () => {
    console.log('[Logout Flow] Initiating integrated secure logout sequence...')
    sessionStorage.removeItem('activeDashboardMenu')
    sessionStorage.removeItem('token')

    await logoutUser()

    // Hard refresh via window.location to completely wipe RAM structures and React states
    window.location.href = '/login'
  }

  useEffect(() => {
    const cleanupIdleTimer = initIdleTimeout(
      15 * 60 * 1000,
    ) as unknown as () => void

    return () => {
      if (typeof cleanupIdleTimer === 'function') {
        cleanupIdleTimer()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Memorize currently active view state
  useEffect(() => {
    sessionStorage.setItem('activeDashboardMenu', activeMenu)
  }, [activeMenu])

  // 🌟 แสดง Loading ขณะตรวจสอบสิทธิ์
  if (isVerifyingAuth) {
    return (
      <div className='bg-slate-100 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-slate-600 font-medium'>
            กำลังตรวจสอบสิทธิ์เข้าใช้งาน...
          </p>
        </div>
      </div>
    )
  }

  // 🌟 ถ้าไม่มี user หรือไม่ใช่ ADMIN ให้แสดงข้อความแจ้งเตือน
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className='bg-slate-100 min-h-screen flex items-center justify-center'>
        <div className='bg-white rounded-2xl shadow-lg p-8 max-w-md text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-red-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m0 0v2m0-2h2m-2 0H9m3-14v2m-5.7 2.3L4.93 4.93m14.14 14.14l-1.414-1.414M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-bold text-slate-800 mb-2'>
            ไม่มีสิทธิ์เข้าถึง
          </h2>
          <p className='text-slate-500 mb-6'>
            คุณไม่มีสิทธิ์ในการเข้าถึง Dashboard นี้
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    switch (activeMenu) {
      case 'overview':
        return <OverviewComponent />
      case 'data-clean':
        return <DataCleansingComponent />
      case 'reviews':
        return <ReviewManager />
      case 'contacts':
        return <ContactRequestManager />
      case 'advertises':
        return <PRManagerDashboard />
      case 'news':
        return <NewsManagerDashboard />
      case 'departments':
        return <DepartmentManagerDashboard />
      case 'slider':
        return <SliderManagerDashboard />
      case 'user-manage':
        return <UserManagerDashboard />
      default:
        return <div className='p-6'>อยู่ระหว่างการพัฒนา...</div>
    }
  }

  return (
    <div className='bg-slate-100 min-h-screen text-slate-800 font-sans'>
      {/* Pass unified logout logic directly downstream into NavBar props */}
      <NavBar
        toggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        onLogout={handleLogout}
      />

      <div className='flex relative'>
        <SideBar
          activeMenu={activeMenu}
          setActiveMenu={(id: MenuId) => {
            setActiveMenu(id)
            setIsMobileOpen(false)
          }}
          isMobileOpen={isMobileOpen}
        />

        <main className='flex-1 p-4 md:p-8 overflow-auto h-[calc(100vh-5rem)]'>
          <div className='max-w-7xl mx-auto'>{renderMainContent()}</div>
        </main>

        {isMobileOpen && (
          <div
            className='fixed inset-0 bg-black/20 z-0 md:hidden'
            onClick={() => setIsMobileOpen(false)}
          ></div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
