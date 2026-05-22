import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReviewManager from '../components/dashboard/ReviewManager'
import ContactRequestManager from '../components/dashboard/ContactRequestManager'
import PRManagerDashboard from '../components/dashboard/PRManagerDashboard'
import NewsManagerDashboard from '../components/dashboard/NewsManagerDashboard'

type MenuId =
  | 'overview'
  | 'data-clean'
  | 'settings'
  | 'reviews'
  | 'contacts'
  | 'advertises'
  | 'news'

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
// แก้ไข: Avatar Component แบบ Initials แทนการใช้ ui-avatars.com
// ไม่รั่วชื่อผู้ใช้ไปยัง Third-party และไม่พึ่งพา External Service
// ---------------------------------------------------------
interface AvatarProps {
  name: string
  bgColor?: string
  size?: string
}

const Avatar = ({ name, bgColor = 'bg-blue-600', size = 'w-10 h-10' }: AvatarProps) => {
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
      aria-label={`รูปโปรไฟล์ของ ${name}`}
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
type NavBarProps = {
  toggleMobileMenu: () => void
}

const NavBar = ({ toggleMobileMenu }: NavBarProps) => {
  const [dateTime, setDateTime] = useState<Date>(new Date())

  // ข้อมูลผู้ใช้ปัจจุบัน — ในระบบจริงดึงมาจาก Auth Context / API
  const currentUser = {
    name: 'พงศ์ภานุ แสนสรรค์',
    role: 'Data Science / Admin',
  }

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className='bg-white h-20 border-b border-slate-200 flex justify-between items-center px-4 md:px-6 sticky top-0 z-20'>
      <div className='flex items-center gap-x-4 md:gap-x-6'>
        <button
          onClick={toggleMobileMenu}
          className='md:hidden p-2 border border-slate-300 bg-slate-50 active:bg-slate-200'
          aria-label='เปิด/ปิดเมนู'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='square' strokeLinejoin='miter' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16'></path>
          </svg>
        </button>

        <Link to='/'>
          <img
            src='https://www.amlo.go.th/amlo-intranet/images/banners/logo-m.jpg'
            alt='โลโก้ ปปง.'
            className='h-12 w-auto object-contain'
          />
        </Link>

        <hr className='hidden md:block w-[2px] h-10 bg-slate-300 border-0' />

        <div className='hidden md:block'>
          <h6 className='text-sm md:text-base font-bold text-slate-800'>
            {getThaiFullDate(dateTime)}
          </h6>
          <p className='text-xs md:text-sm text-slate-500'>
            เวลา {getThaiTime(dateTime)} น.
          </p>
        </div>
      </div>

      <div className='flex items-center gap-x-6'>
        <div className='relative cursor-pointer' aria-label='การแจ้งเตือน'>
          <svg className='w-6 h-6 text-slate-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='square' strokeLinejoin='miter' strokeWidth='2' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'></path>
          </svg>
          <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full'></span>
        </div>

        <hr className='w-[2px] h-8 bg-slate-200 border-0' />

        <div className='flex items-center gap-x-3 cursor-pointer'>
          <div className='text-right hidden sm:block'>
            <h6 className='text-sm font-bold text-slate-800'>{currentUser.name}</h6>
            <p className='text-xs text-slate-500'>{currentUser.role}</p>
          </div>
          {/* แก้ไข: ใช้ Avatar Component แทน ui-avatars.com */}
          <Avatar name={currentUser.name} />
        </div>
      </div>
    </header>
  )
}

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
  ]

  return (
    <aside
      className={`
        bg-white border-r border-slate-200 w-64 min-h-[calc(100vh-5rem)]
        absolute md:static top-20 left-0 z-10 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <nav className='p-4 flex flex-col gap-y-2'>
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`
              w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors
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
// Root Component
// ---------------------------------------------------------
const DashboardPage = () => {
  const [activeMenu, setActiveMenu] = useState<MenuId>('overview')
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)

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
      default:
        return <div className='p-6'>อยู่ระหว่างการพัฒนา...</div>
    }
  }

  return (
    <div className='bg-slate-100 min-h-screen text-slate-800 font-sans'>
      <NavBar toggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)} />

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