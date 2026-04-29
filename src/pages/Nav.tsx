import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
  // เก็บ State ว่าตอนนี้กำลัง Hover เมนูไหนอยู่
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnterNav = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeaveNav = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250); // ตั้งค่า delay ได้ที่นี่ (250ms = 0.25 วินาที)
  };

  return (
    // 1. fixed ลอยอยู่บนสุด (z-50)
    // 2. backdrop-blur-md ทำพื้นหลังเบลอแบบกระจกฝ้า
    // 3. bg-white/70 คือสีขาวที่โปร่งใส 70% เพื่อให้เห็นการเบลอ
    <nav 
      className="fixed top-0 left-0 w-full z-50 transition-all duration-500 backdrop-blur-[25px] bg-white/60 border-b border-gray-200 shadow-lg"
      onMouseEnter={handleMouseEnterNav} // ยกเลิกการนับเวลาถอยหลังถ้าเอาเมาส์กลับเข้ามา
      onMouseLeave={handleMouseLeaveNav} // เริ่มนับเวลาถอยหลังเพื่อปิดเมนู
    >
      <div className=" max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        
        {/* ฝั่งซ้าย: Logo + เมนู */}
        <div className="flex items-center gap-8 h-full">
          <div className="h-full py-2"><Link to="/"><img src="/Logo.png" alt="Logo" className=" w-auto h-full" /></Link></div>

          {/* Group เมนู */}
          <div className="flex items-center gap-6 h-full font-bold text-black-600 text-md ">
            
            {/* เมนู: Main */}
            <div className="h-full flex items-center cursor-pointer hover:text-slate-600">
              <Link to = "/">หน้าหลัก</Link>
            </div>

            {/* เมนู: About */}
            <div 
              className="h-full flex items-center cursor-pointer hover:text-slate-500"
              onMouseEnter={() => {
                handleMouseEnterNav();
                setActiveMenu('about');
              }}
            >
              เกี่ยวกับ <span className="ml-1 text-xs">▼</span>
            </div>
            {/* เมนู: Organizational Structure */}
            <div className="h-full flex items-center cursor-pointer hover:text-slate-500">
              <Link to = "#">ติดต่อ</Link>
            </div>
            
          </div>
        </div>

        {/* ฝั่งขวา: ปุ่มเข้าสู่ระบบ */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="#" className="px-4 py-2 hover:text-slate-900 transition">เข้าสู่ระบบ</Link>
        </div>
      </div>

      {/* ----------------------------------------- */}
      {/* ส่วนของ Mega Menu Dropdown (กางเต็มจอ) */}
      {/* ----------------------------------------- */}

      {/* เมนู about */}
      <div 
        className={`absolute top-full left-0 w-full backdrop-blur-md bg-white/90 shadow-xl border-t border-gray-100 transition-all duration-500 ease-out-in ${
          activeMenu === 'about' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
          {/* จัดโครงสร้างคอลัมน์ให้อยู่ตรงกลางเหมือน Nav */}
          <div className="max-w-7xl mx-auto p-8 grid grid-cols-3 gap-8">

            {/* คอลัมน์ 1 */}
            <div>
              <h3 className="text-slate-500 font-semibold mb-4 text-sm uppercase">ประวิติของหน่วยงานข่าวกรองทางการเงิน</h3>
              <ul className="space-y-3 text-sm text-[#635BFF] font-medium">
                <li><Link to="#" className="hover:text-[#4B45CC]">ประวัติ</Link></li>
                <li><Link to="#" className="hover:text-[#4B45CC]">หน้าที่และอำนาจ</Link></li>
              </ul>
            </div>

            {/* คอลัมน์ 2 */}
            <div className="border-l pl-8">
              <h3 className="text-slate-500 font-semibold mb-4 text-sm uppercase">โครงสร้างหน่วยงาน</h3>
              <ul className="space-y-3 text-sm text-[#635BFF] font-medium">
                <li><Link to="#" className="hover:text-[#4B45CC]">ส่วนบริหารงานข่าวกรองการเงิน</Link></li>
                <li><Link to="#" className="hover:text-[#4B45CC]">ส่วนวิเคราะห์ข่าวกรองทางการเงิน</Link></li>
                <li><Link to="#" className="hover:text-[#4B45CC]">ส่วนวิเคราะห์ธุรกรรมทางการเงิน</Link></li>
                <li><Link to= "" className="hover:text-[#4B45CC]">ส่วนสืบสวนทางการเงิน</Link></li>
              </ul>
            </div>

            {/* คอลัมน์ 3 */}
            <div className="border-l pl-8">
              <h3 className="text-slate-500 font-semibold mb-4 text-sm uppercase">ตามอุตสาหกรรม</h3>
              <ul className="space-y-3 text-sm text-[#635BFF] font-medium">
                <li><Link to="#" className="hover:text-[#4B45CC]">บริษัท AI</Link></li>
                <li><Link to="#" className="hover:text-[#4B45CC]">ค้าปลีก</Link></li>
              </ul>
            </div>

          </div>
        </div>

      {/* เมนู Organizational structure */}
      <div 
        className={`absolute top-full left-0 w-full backdrop-blur-md bg-white/90 shadow-xl border-t border-gray-100 transition-all duration-500 ease-out-in ${
          activeMenu === 'Organizational structure' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
          {/* จัดโครงสร้างคอลัมน์ให้อยู่ตรงกลางเหมือน Nav */}
          <div className="max-w-7xl mx-auto p-8 grid grid-cols-3 gap-8">

            {/* คอลัมน์ 1 */}
            <div>
              <h3 className="text-slate-500 font-semibold mb-4 text-sm uppercase">ตามชั้น</h3>
              <ul className="space-y-3 text-sm text-[#635BFF] font-medium">
                <li><Link to="#" className="hover:text-[#4B45CC]">องค์กร</Link></li>
                <li><Link to="#" className="hover:text-[#4B45CC]">สตาร์ทอัพ</Link></li>
              </ul>
            </div>
          </div>
        </div>

    </nav>
  );
}