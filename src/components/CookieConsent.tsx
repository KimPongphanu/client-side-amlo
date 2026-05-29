import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // ใช้ sessionStorage เพื่อแสดงเฉพาะครั้งแรกของการเข้าเว็บ (ถ้าโหลดหน้าใหม่ค่าจะยังอยู่ ไม่เด้งซ้ำ)
    const hasVisitedSession = sessionStorage.getItem('hasVisitedSession');
    const hasVisitedLocal = localStorage.getItem('hasAcceptedCookies');
    
    // ถ้ายังไม่เคยเห็นใน session นี้ และยังไม่เคยกดปุ่มยอมรับ/ตั้งค่า
    if (!hasVisitedSession && !hasVisitedLocal) {
      setIsVisible(true);
      sessionStorage.setItem('hasVisitedSession', 'true');
    }
  }, []);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    // เมื่อกดปุ่มใดๆ จะถือว่ายอมรับ/จัดการไปแล้ว และบันทึกลง localStorage ถาวร
    localStorage.setItem('hasAcceptedCookies', 'true');
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] w-[90vw] max-w-[450px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-100">
       <div className="p-6">
         <div className="flex items-center gap-3 mb-4">
            <span className="bg-gray-50 p-2 rounded-lg text-gray-500 border border-gray-200 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </span>
            <h3 className="text-xl font-bold text-gray-500">เว็บไซต์กองข่าวกรองทางการเงิน</h3>
         </div>
         <p className="text-gray-500 text-base leading-relaxed mb-6 font-medium">
           เว็บไซต์ของเราใช้งานคุกกี้เพื่อช่วยเพิ่มประสบการณ์การใช้งานเว็บไซต์ให้สามารถใช้งานได้ดียิ่งขึ้น คุณสามารถเลือกที่จะยอมรับหรือปฏิเสธการใช้งานคุกกี้ได้ง่ายๆ โดยการดูรายละเอียดเพิ่มเติมที่ "การตั้งค่าคุกกี้"
         </p>
         <div className="flex flex-col gap-2">
            <div className="flex gap-2 w-full">
              <button onClick={handleClose} className="w-full bg-[#879683] hover:bg-[#72806F] text-white py-3.5 rounded-xl font-bold transition duration-200 text-[15px] shadow-sm">ยอมรับทั้งหมด</button>
              <button onClick={handleClose} className="w-full bg-[#879683] hover:bg-[#72806F] text-white py-3.5 rounded-xl font-bold transition duration-200 text-[15px] shadow-sm">ยอมรับเฉพาะที่จำเป็น</button>
            </div>
            <button onClick={handleClose} className="w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-500 py-3.5 rounded-xl font-bold transition duration-200 text-[15px]">การตั้งค่าคุกกี้</button>
         </div>
       </div>
    </div>
  );
}
