import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useDashboardStore } from '../../stores/useDashboardStore'

// ---------------------------------------------------------
// ClockDisplay Component
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

interface NavBarProps {
  toggleMobileMenu: () => void
  onLogout: () => Promise<void>
}

const NavBar: React.FC<NavBarProps> = ({ toggleMobileMenu, onLogout }) => {
  // =========================================================================
  // STATES & REFS
  // =========================================================================
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [expandedNotifView, setExpandedNotifView] = useState<
    'none' | 'contacts' | 'reviews'
  >('none')

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const { user } = useAuthStore()
  // ดึงทั้ง contacts และ commentList ออกมาจาก Dashboard Store ส่วนกลางโดยตรง
  const { contacts, commentList } = useDashboardStore()

  const currentUser = {
    firstName: user?.firstname || 'Guest',
    lastName: user?.lastname || 'User',
    role: user?.role || 'Admin',
  }
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim()

  // =========================================================================
  // DATA MEMOIZATION (แก้ไขจุดบกพร่องเรื่องความเร็วและสิทธิ์ข้อมูล)
  // =========================================================================
  const latestReviews = useMemo(() => {
    if (!commentList) return []
    return [...commentList].reverse()
  }, [commentList])

  // จัดเรียงรายการติดต่อสอบถามตามเวลาล่าสุด (Clean & High Performance)
  const latestContacts = useMemo(() => {
    if (!contacts?.data) return []

    const mappedContacts = contacts.data.map((item) => ({
      ...item,
      parsedTime: new Date(item.createdAt).getTime(),
    }))

    return mappedContacts.sort((a, b) => b.parsedTime - a.parsedTime)
  }, [contacts]) // <-- ปรับเป็น contacts ทั้ง Object เพื่อให้ React Compiler ทำงานได้สมบูรณ์

  // =========================================================================
  // EFFECTS & HANDLERS
  // =========================================================================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const targetNode = e.target as Node

      if (userMenuRef.current && !userMenuRef.current.contains(targetNode)) {
        setIsUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(targetNode)) {
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

  // =========================================================================
  // RENDER UI (คงสภาพเดิมร้อยเปอร์เซ็นต์ตามกฎเหล็ก)
  // =========================================================================
  return (
    <header className='bg-white h-20 border-b border-slate-200 flex justify-between items-center px-4 md:px-6 sticky top-0 z-20'>
      {/* ฝั่งซ้าย: โลโก้ และ ปุ่มสลับเมนูบนมือถือ */}
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

      {/* ฝั่งขวา: กล่องการแจ้งเตือน และ โปรไฟล์ผู้ใช้งาน */}
      <div className='flex items-center gap-x-6'>
        {/* แผงควบคุมระบบแจ้งเตือน (Notifications) */}
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
              />
            </svg>
            <span className='absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full'></span>
          </button>

          {/* เมนู Dropdown แจ้งเตือน */}
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
              {/* ส่วนแสดงรายการ: ติดต่อสอบถาม */}
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

              {/* ส่วนแสดงรายการ: ความคิดเห็น (Reviews) */}
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

        {/* เมนูจัดการโปรไฟล์ผู้ใช้งาน (User Profile Menu) */}
        <div className='relative' ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className='flex items-center gap-x-3 cursor-pointer hover:opacity-80 transition-opacity outline-none'
            aria-label='User menu'
          >
            <div 
              className='hidden sm:flex flex-col items-center justify-center w-36 md:w-48'
              title={fullName.length > 20 ? fullName : undefined}
            >
              <h6 className='text-sm font-bold text-slate-800 truncate w-full text-center'>
                {currentUser.firstName} {currentUser.lastName}
              </h6>
              <p className='text-xs text-slate-500 text-center'>{currentUser.role}</p>
            </div>
            <Avatar name={fullName} />
            <span
              className={`text-[10px] text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </button>

          {/* เมนูย่อยใน Dropdown โปรไฟล์ */}
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

export default NavBar
