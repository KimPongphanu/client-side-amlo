import { useEffect, useState } from 'react'

import ContactRequestManager from '../components/dashboard/ContactRequestManager'
import DepartmentManagerDashboard from '../components/dashboard/DepartmentManagerDashboard'
import NavBar from '../components/dashboard/NavBarComponent'
import NewsManagerDashboard from '../components/dashboard/NewsManagerDashboard'
import PRManagerDashboard from '../components/dashboard/PRManagerDashboard'
import ReviewManager from '../components/dashboard/ReviewManager'
import { useAuthStore } from '../stores/useAuthStore'

type MenuId =
  | 'overview'
  | 'data-clean'
  | 'settings'
  | 'reviews'
  | 'contacts'
  | 'advertises'
  | 'news'
  | 'departments'

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
    { id: 'reviews', label: 'รีวิว/ความคิดเห็น' },
    { id: 'contacts', label: 'การติดต่อ' },
    { id: 'advertises', label: 'ประชาสัมพันธ์' },
    { id: 'news', label: 'กิจกรรมและประกาศ' },
    { id: 'departments', label: 'จัดการหน่วยงาน' },
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
              w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors cursor-pointer outline-none
              ${
                activeMenu === menu.id
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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

  //Auth Store
  const logoutUser = useAuthStore((state) => state.logoutUser)

  const initIdleTimeout = useAuthStore((state) => state.initIdleTimeout)

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
