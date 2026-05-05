import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext';

const News = () => {
  // ดึงข้อมูล PR จาก Context (ถ้าคุณยังไม่ได้แยก prList ก็ใช้ newsList แทนได้ครับ)
  const context = useContext(NewsContext);
  
  // สมมติว่าใน Context คุณแยก prList ไว้แล้ว ถ้ายังไม่แยก ให้เปลี่ยนเป็น newsList นะครับ
  const { prList } = context || {}; 

  // ถ้าข้อมูลยังไม่มา หรือโหลดไม่ขึ้น
  if (!prList || prList.length === 0) {
    return <div className="pt-32 text-center text-gray-500 min-h-screen">ไม่มีข้อมูลประชาสัมพันธ์ในขณะนี้</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-screen">
      
      {/* 🟢 Header: หัวข้อหน้า */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-800 border-l-8 border-blue-600 pl-4">
          กิจกรรม
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          ติดตามความเคลื่อนไหวและประกาศสำคัญจากสำนักงาน ปปง.
        </p>
      </div>

      {/* 🟢 List Container: เรียง Card ลงมาตามแกน Y */}
      <div className="flex flex-col gap-6">
        {prList.map((item) => (
          
          /* 📦 Horizontal Card: ห่อด้วย Link และบังคับความสูงให้เท่ากันที่ 280px */
          <Link 
            to={`/advertise/${item.id}`} // 🌟 เปลี่ยน path ให้ตรงกับที่ตั้งใจไว้
            key={item.id} 
            className="group flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:h-[280px]"
          >
            
            {/* 🖼️ ฝั่งซ้าย: รูปภาพ (บังคับความสูงเต็มกล่องแม่ h-full) */}
            <div className="w-full md:w-1/3 lg:w-80 h-56 md:h-full flex-shrink-0 overflow-hidden relative bg-slate-100">
              <img 
                src={item.image_src} 
                alt={item.title} 
                /* object-cover ทำให้รูปเต็มกรอบพอดี ไม่ว่ารูปต้นฉบับจะสัดส่วนไหน */
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              {/* ป้าย Tag สีน้ำเงินมุมขวาบน */}
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                กิจกรรม
              </div>
            </div>

            {/* 📝 ฝั่งขวา: เนื้อหา */}
            <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
              
              <div>
                {/* วันที่ */}
                <div className="text-sm text-slate-400 mb-2 font-medium">
                  {item.date || '04 พ.ค. 2569'}
                </div>
                
                {/* หัวข้อ (ตัดบรรทัดที่ 2) */}
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h2>
                
                {/* รายละเอียด (ตัดบรรทัดที่ 3) */}
                <p className="text-slate-600 leading-relaxed line-clamp-3">
                  {item.description || 'รายละเอียดเนื้อหาข่าวประชาสัมพันธ์...'}
                </p>
              </div>

              {/* ปุ่มอ่านเพิ่มเติม (ถูกดันไปอยู่ล่างสุดเสมอ) */}
              <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm">
                อ่านรายละเอียดเพิ่มเติม
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>

            </div>
          </Link>
          
        ))}
      </div>

    </div>
  );
};

export default News;