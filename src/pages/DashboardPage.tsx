// src/pages/DashboardPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'

import ContactRequestManager from '../components/dashboard/ContactRequestManager'
import DepartmentManagerDashboard from '../components/dashboard/department/DepartmentManagerDashboard'
import NavBar from '../components/dashboard/NavBarComponent'
import NewsManagerDashboard from '../components/dashboard/NewsManagerDashboard'
import PRManagerDashboard from '../components/dashboard/PRManagerDashboard'
import ReviewManager from '../components/dashboard/ReviewManager'
import SliderManagerDashboard from '../components/dashboard/SliderManagerDashboard'
import UserManagerDashboard from '../components/dashboard/userManager/UserManagerDashboard'
import { useAuthStore } from '../stores/useAuthStore'
import SupervisorRequests from './SupervisorRequests'

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
  | 'requests'

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
  menus: { id: MenuId; label: string }[]
  pendingCount: number
}

const SideBar = ({
  activeMenu,
  setActiveMenu,
  isMobileOpen,
  menus,
  pendingCount,
}: SideBarProps) => {
  return (
    <aside
      className={`bg-white border-r border-slate-200 w-64 min-h-[calc(100vh-5rem)] absolute md:static top-0 left-0 z-10 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <nav className='p-4 flex flex-col gap-y-2'>
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors cursor-pointer outline-none rounded-md flex items-center justify-between ${
              activeMenu === menu.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{menu.label}</span>
            {menu.id === 'requests' && pendingCount > 0 && (
              <span className='inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-red-500 rounded-full'>
                {pendingCount}
              </span>
            )}
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

  const [activeMenu, setActiveMenu] = useState<MenuId>(() => {
    const savedMenu = sessionStorage.getItem('activeDashboardMenu')
    return (savedMenu as MenuId) || 'overview'
  })

  const user = useAuthStore((state) => state.user)
  const verifyUser = useAuthStore((state) => state.verifyUser)
  const logoutUser = useAuthStore((state) => state.logoutUser)
  const initIdleTimeout = useAuthStore((state) => state.initIdleTimeout)
  const startHeartbeat = useAuthStore((state) => state.startHeartbeat)
  const isSupervisor = useAuthStore((state) => state.isSupervisor)
  const canAccessSupervisorFeatures = useAuthStore(
    (state) => state.canAccessSupervisorFeatures,
  )

  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true)
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending request count
  useEffect(() => {
    if (user?.role === 'SUPERVISOR') {
      import('../services/supervisorRequestService').then(
        ({ supervisorRequestService }) => {
          supervisorRequestService
            .getPending()
            .then((res) => {
              if (res.success) setPendingCount(res.data.length)
            })
            .catch(() => {})
        },
      )
    }
  }, [user])

  const baseMenus: { id: MenuId; label: string }[] = useMemo(
    () => [
      { id: 'overview', label: 'ภาพรวมระบบ' },
      { id: 'data-clean', label: 'จัดการข้อมูล' },
      { id: 'reviews', label: 'รีวิว/ความคิดเห็น' },
      { id: 'contacts', label: 'การติดต่อ' },
      { id: 'advertises', label: 'ประชาสัมพันธ์' },
      { id: 'news', label: 'กิจกรรมและประกาศ' },
      { id: 'departments', label: 'จัดการหน่วยงาน' },
      { id: 'slider', label: 'Slider หน้าหลัก' },
    ],
    [],
  )

  const supervisorOnlyMenus: { id: MenuId; label: string }[] = useMemo(
    () => [
      { id: 'settings', label: 'ตั้งค่าระบบ' },
      { id: 'user-manage', label: 'จัดการสมาชิก' },
      { id: 'requests', label: '📋 คำร้อง' },
    ],
    [],
  )

  const getFilteredMenus = useCallback((): { id: MenuId; label: string }[] => {
    if (isSupervisor()) return [...baseMenus, ...supervisorOnlyMenus]
    return baseMenus
  }, [isSupervisor, baseMenus, supervisorOnlyMenus])

  const filteredMenus = useMemo(() => getFilteredMenus(), [getFilteredMenus])

  const canAccessMenu = useCallback(
    (menuId: MenuId): boolean => {
      if (isSupervisor()) return true
      const supervisorOnlyMenuIds: MenuId[] = [
        'settings',
        'user-manage',
        'requests',
      ]
      return !supervisorOnlyMenuIds.includes(menuId)
    },
    [isSupervisor],
  )

  useEffect(() => {
    if (!canAccessMenu(activeMenu)) {
      setActiveMenu('overview')
      sessionStorage.setItem('activeDashboardMenu', 'overview')
    }
  }, [activeMenu, canAccessMenu])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) await verifyUser()
      } catch (error) {
        console.error('[Dashboard] Auth verification failed:', error)
      } finally {
        setIsVerifyingAuth(false)
      }
    }
    checkAuth()
  }, [user, verifyUser])

  const handleLogout = async () => {
    sessionStorage.removeItem('activeDashboardMenu')
    sessionStorage.removeItem('token')
    await logoutUser()
    window.location.href = '/login'
  }

  useEffect(() => {
    const cleanupIdleTimer = initIdleTimeout(
      15 * 60 * 1000,
    ) as unknown as () => void
    const cleanupHeartbeat = startHeartbeat()
    return () => {
      if (typeof cleanupIdleTimer === 'function') cleanupIdleTimer()
      cleanupHeartbeat()
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('activeDashboardMenu', activeMenu)
  }, [activeMenu])

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

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
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
      case 'settings':
        if (!canAccessSupervisorFeatures())
          return (
            <div className='p-6 text-center text-red-600'>
              ไม่มีสิทธิ์เข้าถึง
            </div>
          )
        return (
          <div className='bg-slate-50 border border-slate-200 p-6'>
            <h2 className='text-xl font-bold mb-4'>ตั้งค่าระบบ (Settings)</h2>
          </div>
        )
      case 'user-manage':
        return user?.role === 'SUPERVISOR' ? (
          <UserManagerDashboard />
        ) : (
          <div className='p-6 text-center text-red-600'>ไม่มีสิทธิ์เข้าถึง</div>
        )
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
      case 'requests':
        return <SupervisorRequests />
      default:
        return <div className='p-6'>อยู่ระหว่างการพัฒนา...</div>
    }
  }

  return (
    <div className='bg-slate-100 min-h-screen text-slate-800 font-sans'>
      {user.role === 'SUPERVISOR' && !user.twoFactorEnabled && (
        <div className='bg-red-500 text-white px-6 py-3 flex items-center justify-between'>
          <span className='font-medium'>
            ⚠️ คุณต้องตั้งค่า Two-Factor Authentication (2FA) ก่อนเข้าใช้งานระบบ
          </span>
          <button
            onClick={() => (window.location.href = '/2fa-setup')}
            className='bg-white text-red-600 px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-red-50 cursor-pointer'
          >
            ตั้งค่า 2FA ทันที
          </button>
        </div>
      )}
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
          menus={filteredMenus}
          pendingCount={pendingCount}
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
