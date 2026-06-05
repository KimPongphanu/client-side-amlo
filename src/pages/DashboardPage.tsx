import { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import ContactRequestManager from '../components/dashboard/ContactRequestManager'
import DepartmentManagerDashboard from '../components/dashboard/DepartmentManagerDashboard'
import NewsManagerDashboard from '../components/dashboard/NewsManagerDashboard'
import PRManagerDashboard from '../components/dashboard/PRManagerDashboard'
import ReviewManager from '../components/dashboard/ReviewManager'
import { AuthContext } from '../context/AuthContextDef'
import { useDashboard } from '../context/DashboardContext'
import { NewsContext } from '../context/NewsContext'
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
// Helper Functions
// ---------------------------------------------------------
const getThaiFullDate = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',
    calendar: 'buddhist',
  }).format(date)
}

const getThaiTime = (date: Date): string => {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

// ---------------------------------------------------------
// Avatar Component
// ---------------------------------------------------------
interface AvatarProps {
  name: string
  bgColor?: string
  size?: string
}

const Avatar = ({
  name,
  bgColor = 'bg-blue-600',
  size = 'w-10 h-10',
}: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={`${size} ${bgColor} rounded-full flex items-center justify-center text-white font-bold text-sm border border-slate-300 flex-shrink-0`}
      aria-label={`Profile picture of ${name}`}
    >
      {initials}
    </div>
  )
}

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
// Layout Components
// ---------------------------------------------------------
const ClockDisplay = () => {
  const [dateTime, setDateTime] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className='hidden md:block'>
      <h6 className='text-sm md:text-base font-bold text-slate-800'>
        {getThaiFullDate(dateTime)}
      </h6>
      <p className='text-xs md:text-sm text-slate-500'>
        เวลา {getThaiTime(dateTime)} น.
      </p>
    </div>
  )
}

type NavBarProps = {
  toggleMobileMenu: () => void
  onLogout: () => Promise<void>
}

const NavBar = ({ toggleMobileMenu, onLogout }: NavBarProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [expandedNotifView, setExpandedNotifView] = useState<
    'none' | 'contacts' | 'reviews'
  >('none')

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const context = useContext(NewsContext)

  const auth = useContext(AuthContext)
  const { contacts } = useDashboard()
  const currentUser = {
    firstName: auth?.user?.firstname || 'Guest',
    lastName: auth?.user?.lastname || 'User',
    role: 'Admin',
  }

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim()

  const realReviews = context?.commentList ? [...context.commentList] : []
  const latestReviews = realReviews.reverse()

  const latestContacts = contacts?.data
    ? [...contacts.data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false)
        setExpandedNotifView('none')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogoutClick = async () => {
    setIsUserMenuOpen(false)
    await onLogout()
  }

  return (
    <header className='bg-white h-20 border-b border-slate-200 flex justify-between items-center px-4 md:px-6 sticky top-0 z-20'>
      <div className='flex items-center gap-x-4 md:gap-x-6'>
        <button
          onClick={toggleMobileMenu}
          className='md:hidden p-2 border border-slate-300 bg-slate-50 active:bg-slate-200 cursor-pointer'
          aria-label='Toggle menu'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='square'
              strokeLinejoin='miter'
              strokeWidth='2'
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>

        <Link to='/'>
          <img
            src='https://www.amlo.go.th/amlo-intranet/images/banners/logo-m.jpg'
            alt='AMLO Logo'
            className='h-12 w-auto object-contain'
          />
        </Link>

        <hr className='hidden md:block w-[2px] h-10 bg-slate-300 border-0' />

        <ClockDisplay />
      </div>

      <div className='flex items-center gap-x-6'>
        <div className='relative' ref={notifRef}>
          <button
            className='relative cursor-pointer p-1 hover:bg-slate-100 rounded-full transition-colors'
            aria-label='Notifications'
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <svg
              className='w-6 h-6 text-slate-700'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='square'
                strokeLinejoin='miter'
                strokeWidth='2'
                d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
              ></path>
            </svg>
            <span className='absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full'></span>
          </button>

          {/* Notif Dropdown Menu */}
          <div
            className={`absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-200 ${
              isNotifOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className='px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center'>
              <h6 className='text-sm font-bold text-slate-800'>การแจ้งเตือน</h6>
              <span className='text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full'>
                รวม {latestContacts.length + latestReviews.length}
              </span>
            </div>

            <div className='max-h-96 overflow-y-auto p-2'>
              {/* Contacts */}
              {(expandedNotifView === 'none' ||
                expandedNotifView === 'contacts') && (
                <div className='mb-2'>
                  <div className='px-2 py-1 flex items-center gap-2'>
                    <span className='text-xs font-bold text-slate-500'>
                      ติดต่อ
                    </span>
                    <hr className='flex-1 border-slate-200' />
                  </div>
                  {latestContacts
                    .slice(0, expandedNotifView === 'contacts' ? 5 : 2)
                    .map((item) => (
                      <div
                        key={item.id}
                        className='px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors'
                      >
                        <p className='text-sm text-slate-800 truncate font-medium'>
                          {item.message}
                        </p>
                        <p className='text-[10px] text-slate-400 mt-0.5'>
                          {item.firstName} {item.lastName}
                        </p>
                      </div>
                    ))}

                  {expandedNotifView === 'none' &&
                    latestContacts.length > 2 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedNotifView('contacts')
                        }}
                        className='px-3 py-1.5 text-xs text-center text-blue-500 font-medium cursor-pointer hover:bg-blue-50 rounded-lg'
                      >
                        +{latestContacts.length - 2} เพิ่มเติม
                      </div>
                    )}
                  {expandedNotifView === 'contacts' && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedNotifView('none')
                      }}
                      className='px-3 py-1.5 text-xs text-center text-slate-500 font-medium cursor-pointer hover:bg-slate-100 rounded-lg'
                    >
                      แสดงน้อยลง
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              {(expandedNotifView === 'none' ||
                expandedNotifView === 'reviews') && (
                <div>
                  <div className='px-2 py-1 flex items-center gap-2'>
                    <span className='text-xs font-bold text-slate-500'>
                      ความคิดเห็น
                    </span>
                    <hr className='flex-1 border-slate-200' />
                  </div>
                  {latestReviews
                    .slice(0, expandedNotifView === 'reviews' ? 5 : 2)
                    .map((item) => (
                      <div
                        key={item.id}
                        className='px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors'
                      >
                        <p className='text-sm text-slate-800 truncate font-medium'>
                          {item.msg}
                        </p>
                        <p className='text-[10px] text-slate-400 mt-0.5'>
                          {item.star} ดาว
                        </p>
                      </div>
                    ))}

                  {expandedNotifView === 'none' && latestReviews.length > 2 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedNotifView('reviews')
                      }}
                      className='px-3 py-1.5 text-xs text-center text-blue-500 font-medium cursor-pointer hover:bg-blue-50 rounded-lg'
                    >
                      +{latestReviews.length - 2} เพิ่มเติม
                    </div>
                  )}
                  {expandedNotifView === 'reviews' && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedNotifView('none')
                      }}
                      className='px-3 py-1.5 text-xs text-center text-slate-500 font-medium cursor-pointer hover:bg-slate-100 rounded-lg'
                    >
                      แสดงน้อยลง
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className='w-[2px] h-8 bg-slate-200 border-0' />

        {/* User Profile Dropdown */}
        <div className='relative' ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className='flex items-center gap-x-3 cursor-pointer hover:opacity-80 transition-opacity outline-none'
            aria-label='User menu'
          >
            <div className='text-right hidden sm:block'>
              <h6 className='text-sm font-bold text-slate-800'>
                {currentUser.firstName} {currentUser.lastName}
              </h6>
              <p className='text-xs text-slate-500'>{currentUser.role}</p>
            </div>
            <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} />
            <span
              className={`text-[10px] text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 top-full mt-3 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-200 ${
              isUserMenuOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className='px-4 py-3 border-b border-slate-100'>
              <p className='text-xs font-bold text-slate-800'>{fullName}</p>
              <p className='text-xs text-slate-400 mt-0.5'>
                {currentUser.role}
              </p>
            </div>

            <button
              onClick={handleLogoutClick}
              className='flex items-center gap-2.5 w-full px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer outline-none'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-4 h-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

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
// Root Component (Auto Logout Logic Included)
// ---------------------------------------------------------
const useIdleTimeout = (
  onIdle: () => void,
  idleTimeMs: number = 15 * 60 * 1000,
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isIdleWarningOpen = useRef<boolean>(false)

  useEffect(() => {
    const warningTimeMs = 60 * 1000

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)

      if (Swal.isVisible() && isIdleWarningOpen.current) {
        Swal.close()
        isIdleWarningOpen.current = false
      }

      warningRef.current = setTimeout(() => {
        let timerInterval: ReturnType<typeof setInterval>
        isIdleWarningOpen.current = true
        Swal.fire({
          title: 'เซสชันของคุณกำลังจะหมดอายุ',
          html: 'ระบบจะออกจากระบบอัตโนมัติใน <b></b> วินาที เนื่องจากไม่มีการใช้งาน',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ฉันยังใช้งานอยู่',
          cancelButtonText: 'ออกจากระบบ',
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#ef4444',
          timer: warningTimeMs,
          timerProgressBar: true,
          didOpen: () => {
            const b = Swal.getHtmlContainer()?.querySelector('b')
            timerInterval = setInterval(() => {
              if (b)
                b.textContent = Math.ceil(
                  Swal.getTimerLeft()! / 1000,
                ).toString()
            }, 100)
          },
          willClose: () => {
            clearInterval(timerInterval)
            isIdleWarningOpen.current = false
          },
        }).then((result) => {
          if (result.isConfirmed) {
            resetTimer()
          } else if (
            result.dismiss === Swal.DismissReason.timer ||
            result.isDismissed
          ) {
            onIdle()
          }
        })
      }, idleTimeMs - warningTimeMs)

      timeoutRef.current = setTimeout(() => {
        onIdle()
        Swal.close()
      }, idleTimeMs)
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]
    const handleEvent = () => resetTimer()

    events.forEach((event) => document.addEventListener(event, handleEvent))
    resetTimer()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      events.forEach((event) =>
        document.removeEventListener(event, handleEvent),
      )
    }
  }, [onIdle, idleTimeMs])
}

// ---------------------------------------------------------
// Dashboard Main Component
// ---------------------------------------------------------
const DashboardPage = () => {
  // 🌟 Initialize state safely after passing Auth Guards
  const [activeMenu, setActiveMenu] = useState<MenuId>(() => {
    const savedMenu = sessionStorage.getItem('activeDashboardMenu')
    return (savedMenu as MenuId) || 'overview'
  })

  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
  const logoutUser = useAuthStore((state) => state.logoutUser)

  // 🌟 Unified secure logout handler
  const handleLogout = async () => {
    console.log('[Logout Flow] Initiating integrated secure logout sequence...')
    sessionStorage.removeItem('activeDashboardMenu')
    sessionStorage.removeItem('token')

    await logoutUser()

    // Hard refresh via window.location to completely wipe RAM structures and React states
    window.location.href = '/login'
  }

  // Handle idle automation
  useIdleTimeout(handleLogout, 15 * 60 * 1000)

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
