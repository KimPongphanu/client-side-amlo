import { User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
export default function Nav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(
    null,
  )
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem('token'),
  )
  const accountRef = useRef<HTMLDivElement>(null)

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setMobileExpandedMenu(null)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    setIsLoggedIn(false)
    setIsAccountOpen(false)
    navigate('/')
  }

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setIsAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleMouseEnterNav = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleMouseLeaveNav = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 250)
  }

  const toggleMobileSubmenu = (menu: string) => {
    setMobileExpandedMenu(mobileExpandedMenu === menu ? null : menu)
  }

  return (
    <>
      <nav
        className='fixed top-0 left-0 w-full z-[60] transition-all duration-500 backdrop-blur-[25px] bg-white/90 border-b border-gray-200 shadow-sm'
        onMouseEnter={handleMouseEnterNav}
        onMouseLeave={handleMouseLeaveNav}
      >
        {/* 🌟 ปรับความสูงเป็น h-20 (80px) และใส่ relative เพื่อให้เมนูตรงกลางจัด Center ได้ */}
        <div className='w-full flex items-center justify-between px-4 md:px-8 h-20 relative'>
          {/* ========================================== */}
          {/* 1. ฝั่งซ้าย: โลโก้ + ชื่อหน่วยงาน */}
          {/* ========================================== */}
          <div className='h-full py-3 flex-shrink-0 flex items-center z-20'>
            <button
              onClick={() => {
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                  navigate('/')
                }
              }}
              className='h-full flex items-center group bg-transparent border-0 p-0 cursor-pointer'
              aria-label='กลับหน้าหลักหรือเลื่อนขึ้นบนสุด'
            >
              <img
                src='/Logo.png'
                alt='โลโก้ ปปง.'
                className='w-auto h-full group-hover:scale-105 transition-transform duration-300'
              />
              <div className='hidden sm:block w-[1.5px] h-10 bg-slate-300 mx-4 md:mx-5'></div>
              <div className='hidden sm:flex flex-col justify-center'>
                <h1 className='text-base md:text-lg font-extrabold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors tracking-wide'>
                  กองข่าวกรองทางการเงิน
                </h1>
                <span className='text-xs text-slate-500 font-semibold tracking-wider mt-0.5'>
                  สำนักงาน ปปง.
                </span>
              </div>
            </button>
          </div>

          {/* ========================================== */}
          {/* 2. ตรงกลาง: เมนู Nav (สำหรับจอคอมพิวเตอร์) */}
          {/* ========================================== */}
          <div className='hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 h-full font-bold text-slate-600 text-base z-10'>
            <Link
              to='/'
              className='hover:text-blue-600 transition-colors py-2 relative group'
            >
              หน้าหลัก
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full'></span>
            </Link>

            <div
              className={`flex items-center cursor-pointer transition-colors py-2 relative group ${activeMenu === 'about' ? 'text-blue-600' : 'hover:text-blue-600'}`}
              onMouseEnter={() => {
                handleMouseEnterNav()
                setActiveMenu('about')
              }}
            >
              เกี่ยวกับ <span className='ml-1.5 text-[10px] opacity-70'>▼</span>
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${activeMenu === 'about' ? 'w-full' : 'w-0 group-hover:w-full'}`}
              ></span>
            </div>

            <Link
              to='/contactform'
              className='hover:text-blue-600 transition-colors py-2 relative group'
            >
              ติดต่อ
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full'></span>
            </Link>
          </div>

          {/* 2.1 ตรงกลาง: เมนู Nav (สำรองสำหรับหน้าจอ iPad/Tablet ที่พื้นที่ตรงกลางแคบ) */}
          <div className='hidden md:flex lg:hidden items-center gap-6 h-full font-bold text-slate-600 text-sm ml-auto mr-6 z-20'>
            <Link to='/' className='hover:text-blue-600 transition-colors'>
              หน้าหลัก
            </Link>
            <div
              className={`flex items-center cursor-pointer transition-colors ${activeMenu === 'about' ? 'text-blue-600' : 'hover:text-blue-600'}`}
              onMouseEnter={() => {
                handleMouseEnterNav()
                setActiveMenu('about')
              }}
            >
              เกี่ยวกับ <span className='ml-1 text-[10px]'>▼</span>
            </div>
            <Link
              to='/contactform'
              className='hover:text-blue-600 transition-colors'
            >
              ติดต่อ
            </Link>
          </div>

          {/* ========================================== */}
          {/* 3. ฝั่งขวา: ปุ่มเข้าสู่ระบบ + เมนูมือถือ */}
          {/* ========================================== */}
          <div className='flex items-center z-20'>
            <div className='hidden md:flex items-center' ref={accountRef}>
              {isLoggedIn ? (
                // --- กรณี Login แล้ว: แสดง Dropdown ---
                <div className='relative'>
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    aria-label='เมนูบัญชี'
                    className='flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors'
                  >
                    <User size={20} />
                    <span
                      className={`text-[10px] transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-200 ${
                      isAccountOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <Link
                      to='/dashboard'
                      onClick={() => setIsAccountOpen(false)}
                      className='flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
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
                          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                        />
                      </svg>
                      หน้า Dashboard
                    </Link>
                    <div className='h-px bg-slate-100' />
                    <button
                      onClick={handleLogout}
                      className='flex items-center gap-2.5 w-full px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors'
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
              ) : (
                // --- กรณียังไม่ Login: ไปหน้า Login ---
                <Link
                  to='/login'
                  aria-label='เข้าสู่ระบบ'
                  className='text-slate-600 hover:text-blue-600 transition-colors'
                >
                  <User size={20} />
                </Link>
              )}
            </div>

            {/* ปุ่มแฮมเบอร์เกอร์สำหรับมือถือ */}
            <div className='md:hidden flex items-center ml-4'>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='p-2 text-slate-700 focus:outline-none'
                aria-label='Toggle Mobile Menu'
              >
                {isMobileMenuOpen ? (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M4 12h16M4 18h16'
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 💻 เมนู Dropdown สำหรับ Desktop */}
        <div
          className={`hidden md:block absolute top-full left-0 w-full backdrop-blur-md bg-white/95 shadow-xl border-t border-gray-100 transition-all duration-300 ease-out ${activeMenu === 'about' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <div className='max-w-7xl mx-auto p-8 grid grid-cols-3 gap-8'>
            <div>
              <h3 className='text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase'>
                ประวัติของหน่วยงาน
              </h3>
              <ul className='space-y-3 text-sm text-slate-700 font-medium'>
                <li>
                  <Link
                    to='#'
                    className='hover:text-blue-600 transition-colors'
                  >
                    ประวัติ
                  </Link>
                </li>
                <li>
                  <Link
                    to='#'
                    className='hover:text-blue-600 transition-colors'
                  >
                    หน้าที่และอำนาจ
                  </Link>
                </li>
              </ul>
            </div>

            <div className='border-l border-slate-100 pl-8'>
              <h3 className='text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase'>
                ประชาสัมพันธ์/กิจกรรม
              </h3>
              <ul className='space-y-3 text-sm text-slate-700 font-medium'>
                <li>
                  <Link
                    to='/advertise'
                    className='hover:text-blue-600 transition-colors'
                  >
                    ประชาสัมพันธ์
                  </Link>
                </li>
                <li>
                  <Link
                    to='/news'
                    className='hover:text-blue-600 transition-colors'
                  >
                    กิจกรรม
                  </Link>
                </li>
              </ul>
            </div>

            <div className='border-l border-slate-100 pl-8'>
              <h3 className='text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase'>
                โครงสร้างหน่วยงาน
              </h3>
              {/* <ul className="space-y-3 text-sm text-slate-700 font-medium">
                {departmentList.map((dept) => (
                  <li key={dept.id}>
                    <Link to={`/department/${dept.id}`} className="hover:text-blue-600 transition-colors">
                      {dept.title}
                    </Link>
                  </li>
                ))}
              </ul> */}
            </div>
          </div>
        </div>
      </nav>

      {/* 📱 เมนู Mobile แบบเต็มจอ */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out pt-20 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className='h-full overflow-y-auto px-6 py-8 pb-24'>
          <ul className='flex flex-col gap-6 text-lg font-bold text-slate-800'>
            <li className='border-b border-slate-100 pb-4'>
              <Link to='/' onClick={handleCloseMobileMenu}>
                หน้าหลัก
              </Link>
            </li>

            <li className='border-b border-slate-100 pb-4'>
              <button
                onClick={() => toggleMobileSubmenu('about')}
                className='w-full flex justify-between items-center text-left'
              >
                เกี่ยวกับ
                <span
                  className={`transform transition-transform duration-300 text-sm ${mobileExpandedMenu === 'about' ? 'rotate-180' : ''}`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${mobileExpandedMenu === 'about' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
              >
                <div className='pl-4 border-l-2 border-blue-600 space-y-6'>
                  <div>
                    <h3 className='text-slate-400 text-xs uppercase mb-2'>
                      ประวัติของหน่วยงาน
                    </h3>
                    <ul className='space-y-3 text-sm font-medium text-slate-600'>
                      <li>
                        <Link to='#' onClick={handleCloseMobileMenu}>
                          ประวัติ
                        </Link>
                      </li>
                      <li>
                        <Link to='#' onClick={handleCloseMobileMenu}>
                          หน้าที่และอำนาจ
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-slate-400 text-xs uppercase mb-2'>
                      โครงสร้างหน่วยงาน
                    </h3>
                    {/* <ul className="space-y-3 text-sm font-medium text-slate-600">
                      {departmentList.map((dept) => (
                        <li key={dept.id}>
                          <Link to={`/department/${dept.id}`} onClick={handleCloseMobileMenu}>
                            {dept.title}
                          </Link>
                        </li>
                      ))}
                    </ul> */}
                  </div>
                </div>
              </div>
            </li>

            <li className='border-b border-slate-100 pb-4'>
              <Link to='/contactform' onClick={handleCloseMobileMenu}>
                ติดต่อ
              </Link>
            </li>

            <li className='pt-4'>
              {isLoggedIn ? (
                <>
                  <Link
                    to='/dashboard'
                    onClick={handleCloseMobileMenu}
                    className='block w-full py-3 mb-2 bg-blue-600 text-white text-center rounded-xl shadow-md active:scale-95 transition-transform font-bold'
                  >
                    หน้า Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='block w-full py-3 bg-red-500 text-white text-center rounded-xl shadow-md active:scale-95 transition-transform font-bold'
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <Link
                  to='/login'
                  onClick={handleCloseMobileMenu}
                  className='block w-full py-3 bg-slate-900 text-white text-center rounded-xl shadow-md active:scale-95 transition-transform'
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
