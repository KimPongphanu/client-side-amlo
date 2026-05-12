import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext';

// 🌟 SKELETON COMPONENT (แนวนอน) - ใช้ตัวเดียวกัน
const HorizontalCardSkeleton = () => (
  <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden md:h-[280px] animate-pulse">
    <div className="w-full md:w-1/3 lg:w-80 h-56 md:h-full flex-shrink-0 bg-slate-200"></div>
    <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
      <div>
        <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
        <div className="h-6 md:h-8 bg-slate-200 rounded w-full mb-3"></div>
        <div className="h-6 md:h-8 bg-slate-200 rounded w-3/4 mb-6"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="mt-6 h-4 bg-slate-200 rounded w-32"></div>
    </div>
  </div>
);

const News = () => {
  const context = useContext(NewsContext);
  
  // 🌟 ดึง prList และ isLoading (ใช้ prList สำหรับหน้ากิจกรรมตามโค้ดเดิม)
  const { prList, isLoading } = context || {}; 

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

      {/* 🟢 List Container */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          // 🌟 1. แสดง Skeleton
          [1, 2, 3].map((key) => <HorizontalCardSkeleton key={key} />)
        ) : (!prList || prList.length === 0) ? (
          // 🌟 2. ถ้าโหลดเสร็จแล้วไม่มีข้อมูล
          <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
            ไม่มีกิจกรรมในขณะนี้
          </div>
        ) : (
          // 🌟 3. แสดงข้อมูลจริง
          prList.map((item) => (
            <Link 
              to={`/news/${item.id}`} // แก้ path ตรงนี้เป็น /news ให้ถูกต้องแล้วครับ
              key={item.id} 
              className="group flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:h-[280px]"
            >
              <div className="w-full md:w-1/3 lg:w-80 h-56 md:h-full flex-shrink-0 overflow-hidden relative bg-slate-100">
                <img 
                  src={item.image_src} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                  กิจกรรม
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
                <div>
                  <div className="text-sm text-slate-400 mb-2 font-medium">
                    {item.date || '04 พ.ค. 2569'}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed line-clamp-3">
                    {item.description || 'รายละเอียดเนื้อหาข่าวประชาสัมพันธ์...'}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm">
                  อ่านรายละเอียดเพิ่มเติม
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
};

export default News;