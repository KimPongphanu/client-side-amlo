import { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'; // เอา useLocation ออกแล้ว
import { NewsContext } from '../context/NewsContext'; 

export default function Nav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);

  const context = useContext(NewsContext);
  const departmentList = context?.departmentList || []; 

  // 🌟 ฟังก์ชันใหม่: เอาไว้เรียกตอนผู้ใช้กดลิงก์ในมือถือ
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileExpandedMenu(null);
  };

  // 🌟 Effect ตัวนี้ยังต้องเก็บไว้นะ เพราะเป็นการเชื่อมกับระบบภายนอก (DOM document) ถือว่าถูกต้องตามหลักการ
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleMouseEnterNav = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeaveNav = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  const toggleMobileSubmenu = (menu: string) => {
    setMobileExpandedMenu(mobileExpandedMenu === menu ? null : menu);
  };

  return (
    <>
      <nav 
        className="fixed top-0 left-0 w-full z-[60] transition-all duration-500 backdrop-blur-[25px] bg-white/80 border-b border-gray-200 shadow-sm"
        onMouseEnter={handleMouseEnterNav}
        onMouseLeave={handleMouseLeaveNav}
      >
        <div className="w-full flex items-center justify-between px-4 md:px-8 h-16">
          
          <div className="flex items-center h-full">
            <div className="h-full py-2 flex-shrink-0">
              <Link to="/">
                <img src="/Logo.png" alt="โลโก้ ปปง." className="w-auto h-full" />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6 h-full font-bold text-slate-700 text-sm lg:text-base ml-8">
              <div className="h-full flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                <Link to="/">หน้าหลัก</Link>
              </div>
              <div 
                className={`h-full flex items-center cursor-pointer transition-colors ${activeMenu === 'about' ? 'text-blue-600' : 'hover:text-blue-600'}`}
                onMouseEnter={() => {
                  handleMouseEnterNav();
                  setActiveMenu('about');
                }}
              >
                เกี่ยวกับ <span className="ml-1 text-[10px]">▼</span>
              </div>
              <div className="h-full flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                <Link to="/contactform">ติดต่อ</Link>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-4 text-sm font-bold">
              <Link to="#" className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm">
                เข้าสู่ระบบ
              </Link>
            </div>

            <div className="md:hidden flex items-center ml-4">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 focus:outline-none"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* 💻 เมนู Dropdown สำหรับ Desktop */}
        <div className={`hidden md:block absolute top-full left-0 w-full backdrop-blur-md bg-white/95 shadow-xl border-t border-gray-100 transition-all duration-300 ease-out ${activeMenu === 'about' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="max-w-7xl mx-auto p-8 grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase">ประวัติของหน่วยงาน</h3>
              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                <li><Link to="#" className="hover:text-blue-600 transition-colors">ประวัติ</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">หน้าที่และอำนาจ</Link></li>
              </ul>
            </div>
            
            <div className="border-l border-slate-100 pl-8">
              <h3 className="text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase">โครงสร้างหน่วยงาน</h3>
              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                {departmentList.map((dept) => (
                  <li key={dept.id}>
                    <Link to={`/department/${dept.id}`} className="hover:text-blue-600 transition-colors">
                      {dept.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-l border-slate-100 pl-8">
              <h3 className="text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase">ประชาสัมพันธ์/กิจกรรม</h3>
              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                <li><Link to="/advertise" className="hover:text-blue-600 transition-colors">ประชาสัมพันธ์</Link></li>
                <li><Link to="/news" className="hover:text-blue-600 transition-colors">กิจกรรม</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* 📱 เมนู Mobile แบบเต็มจอ */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out pt-16 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full overflow-y-auto px-6 py-8 pb-24">
          <ul className="flex flex-col gap-6 text-lg font-bold text-slate-800">
            
            <li className="border-b border-slate-100 pb-4">
              {/* 🌟 ยัด onClick ใส่ลิงก์ */}
              <Link to="/" onClick={handleCloseMobileMenu}>หน้าหลัก</Link>
            </li>

            <li className="border-b border-slate-100 pb-4">
              <button 
                onClick={() => toggleMobileSubmenu('about')} 
                className="w-full flex justify-between items-center text-left"
              >
                เกี่ยวกับ
                <span className={`transform transition-transform duration-300 text-sm ${mobileExpandedMenu === 'about' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${mobileExpandedMenu === 'about' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="pl-4 border-l-2 border-blue-600 space-y-6">
                  <div>
                    <h3 className="text-slate-400 text-xs uppercase mb-2">ประวัติของหน่วยงาน</h3>
                    <ul className="space-y-3 text-sm font-medium text-slate-600">
                      {/* 🌟 ยัด onClick ใส่ลิงก์ */}
                      <li><Link to="#" onClick={handleCloseMobileMenu}>ประวัติ</Link></li>
                      <li><Link to="#" onClick={handleCloseMobileMenu}>หน้าที่และอำนาจ</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-slate-400 text-xs uppercase mb-2">โครงสร้างหน่วยงาน</h3>
                    <ul className="space-y-3 text-sm font-medium text-slate-600">
                      {departmentList.map((dept) => (
                        <li key={dept.id}>
                          {/* 🌟 ยัด onClick ใส่ลิงก์ของ Dynamic Menu ด้วย */}
                          <Link to={`/department/${dept.id}`} onClick={handleCloseMobileMenu}>
                            {dept.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li className="border-b border-slate-100 pb-4">
              {/* 🌟 ยัด onClick ใส่ลิงก์ */}
              <Link to="/contactform" onClick={handleCloseMobileMenu}>ติดต่อ</Link>
            </li>

            <li className="pt-4">
              {/* 🌟 ยัด onClick ใส่ลิงก์ */}
              <Link to="#" onClick={handleCloseMobileMenu} className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl shadow-md active:scale-95 transition-transform">
                เข้าสู่ระบบ
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </>
  );
}