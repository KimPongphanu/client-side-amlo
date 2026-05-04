import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  // ----------------------------------------------------
  // 1. State สำหรับ Desktop (ของเดิมของคุณ)
  // ----------------------------------------------------
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----------------------------------------------------
  // 2. State สำหรับ Mobile (เพิ่มใหม่)
  // ----------------------------------------------------
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);
  const location = useLocation(); // ไว้ตรวจจับเวลาเปลี่ยนหน้า

  // ปิดเมนูมือถืออัตโนมัติ เวลาผู้ใช้กดเปลี่ยนหน้าเว็บ
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileExpandedMenu(null);
  }, [location.pathname]);

  // ป้องกันหน้าเว็บด้านหลังเลื่อน (Scroll) เวลาเปิดเมนูมือถือ (UX & Safe Practice)
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // ฟังก์ชันของ Desktop
  const handleMouseEnterNav = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeaveNav = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  // ฟังก์ชันสลับเมนูย่อยในมือถือ (Accordion)
  const toggleMobileSubmenu = (menu: string) => {
    setMobileExpandedMenu(mobileExpandedMenu === menu ? null : menu);
  };

  return (
    <>
      <nav 
        className="fixed top-0 left-0 w-full z-[60] transition-all duration-500 backdrop-blur-none bg-white/80 border-b border-gray-200 shadow-sm"
        onMouseEnter={handleMouseEnterNav}
        onMouseLeave={handleMouseLeaveNav}
      >
        {/* ให้เปลี่ยนโครงสร้างกล่องด้านบนเป็นแบบนี้ครับ (ยังคงอยู่ใน Nav) */}
        {/* เปลี่ยนจาก max-w-7xl เป็น w-full px-8 เพื่อให้ Nav กางเต็มขอบจอด้วย */}
        <div className="w-full flex items-center justify-between px-4 md:px-8 h-16">
          
          {/* 📦 มัดรวมฝั่งซ้าย: Logo + เมนู Desktop */}
          <div className="flex items-center h-full">
            <div className="h-full py-2 flex-shrink-0">
              <Link to="/">
                <img src="/Logo.png" alt="โลโก้ ปปง." className="w-auto h-full" />
              </Link>
            </div>

            {/* เมนู Desktop (ขยับมาอยู่ติด Logo แล้วเว้นระยะนิดนึงด้วย ml-8) */}
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
                <Link to="#">ติดต่อ</Link>
              </div>
            </div>
          </div>

          {/* 📦 มัดรวมฝั่งขวา: ปุ่มล็อกอิน (Desktop) + Hamburger (Mobile) */}
          <div className="flex items-center">
            {/* ฝั่งขวา: ปุ่มเข้าสู่ระบบ (Desktop) */}
            <div className="hidden md:flex items-center gap-4 text-sm font-bold">
              <Link to="#" className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm">
                เข้าสู่ระบบ
              </Link>
            </div>

            {/* ปุ่ม Hamburger (Mobile) */}
            <div className="md:hidden flex items-center ml-4">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 focus:outline-none"
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

        {/* ---------------------------------------------------- */}
        {/* 💻 เมนู Dropdown ยักษ์ (Mega Menu) สำหรับ Desktop เท่านั้น */}
        {/* ---------------------------------------------------- */}
        <div className={`hidden md:block absolute top-full left-0 w-full backdrop-blur-none bg-white/80 shadow-xl border-t border-gray-100 transition-all duration-300 ease-out ${activeMenu === 'about' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="max-w-7xl mx-auto p-8 grid grid-cols-3 gap-8">
            {/* คอลัมน์ 1 */}
            <div>
              <h3 className="text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase">ประวัติของหน่วยงาน</h3>
              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                <li><Link to="#" className="hover:text-blue-600 transition-colors">ประวัติ</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">หน้าที่และอำนาจ</Link></li>
              </ul>
            </div>
            {/* คอลัมน์ 2 */}
            <div className="border-l border-slate-100 pl-8">
              <h3 className="text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase">โครงสร้างหน่วยงาน</h3>
              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                <li><Link to="#" className="hover:text-blue-600 transition-colors">ส่วนบริหารงานข่าวกรองการเงิน</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">ส่วนวิเคราะห์ข่าวกรองทางการเงิน</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">ส่วนวิเคราะห์ธุรกรรมทางการเงิน</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">ส่วนสืบสวนทางการเงิน</Link></li>
              </ul>
            </div>
            {/* คอลัมน์ 3 */}
            <div className="border-l border-slate-100 pl-8">
              <h3 className="text-slate-400 font-bold mb-4 text-xs tracking-wider uppercase">ตามอุตสาหกรรม</h3>
              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                <li><Link to="#" className="hover:text-blue-600 transition-colors">บริษัท AI</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">ค้าปลีก</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------------------------------------------- */}
      {/* 📱 เมนู Mobile แบบเต็มจอ (Full Screen Overlay) */}
      {/* ---------------------------------------------------- */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out pt-16 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full overflow-y-auto px-6 py-8 pb-24">
          <ul className="flex flex-col gap-6 text-lg font-bold text-slate-800">
            
            <li className="border-b border-slate-100 pb-4">
              <Link to="/">หน้าหลัก</Link>
            </li>

            {/* เมนู About แบบ Accordion ยืดหดได้ */}
            <li className="border-b border-slate-100 pb-4">
              <button 
                onClick={() => toggleMobileSubmenu('about')} 
                className="w-full flex justify-between items-center text-left"
              >
                เกี่ยวกับ
                <span className={`transform transition-transform duration-300 text-sm ${mobileExpandedMenu === 'about' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {/* ซ่อน/โชว์ เมนูย่อยเมื่อกด */}
              <div className={`overflow-hidden transition-all duration-300 ${mobileExpandedMenu === 'about' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="pl-4 border-l-2 border-blue-600 space-y-6">
                  <div>
                    <h3 className="text-slate-400 text-xs uppercase mb-2">ประวัติของหน่วยงาน</h3>
                    <ul className="space-y-3 text-sm font-medium text-slate-600">
                      <li><Link to="#">ประวัติ</Link></li>
                      <li><Link to="#">หน้าที่และอำนาจ</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-slate-400 text-xs uppercase mb-2">โครงสร้างหน่วยงาน</h3>
                    <ul className="space-y-3 text-sm font-medium text-slate-600">
                      <li><Link to="#">ส่วนบริหารงานข่าวกรองการเงิน</Link></li>
                      <li><Link to="#">ส่วนวิเคราะห์ข่าวกรองทางการเงิน</Link></li>
                      <li><Link to="#">ส่วนวิเคราะห์ธุรกรรมทางการเงิน</Link></li>
                      <li><Link to="#">ส่วนสืบสวนทางการเงิน</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li className="border-b border-slate-100 pb-4">
              <Link to="#">ติดต่อ</Link>
            </li>

            <li className="pt-4">
              <Link to="#" className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl shadow-md active:scale-95 transition-transform">
                เข้าสู่ระบบ
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </>
  );
}