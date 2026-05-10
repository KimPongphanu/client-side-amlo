import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext';
import type { NewsItem } from '../type'

// Component สำหรับ Card
const ArticleCard = ({ item, basePath }: { item: NewsItem, basePath: string }) => (
  <div className="shrink-0 w-[280px] md:w-[350px] bg-white border rounded-xl md:rounded-2xl overflow-hidden shadow-md flex flex-col hover:shadow-xl transition-shadow">
    <div className="h-[180px] md:h-[200px] w-full overflow-hidden bg-slate-100">
      <img 
        src={item.image_src} 
        alt={item.title} 
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
        loading='lazy'
      />
    </div>
    <div className="p-4 md:p-5 flex flex-col flex-grow">
      <p className="text-xs md:text-sm text-blue-600 font-medium mb-1">{item.date}</p>
      <h3 className="text-base md:text-lg font-bold text-gray-800 line-clamp-2 mb-2">{item.title}</h3>
      <p className="text-xs md:text-sm text-gray-500 line-clamp-3 mb-4">{item.description}</p>
      
      <Link to={`/${basePath}/${item.id}`} className="mt-auto text-left text-sm md:text-base text-blue-500 font-medium hover:text-blue-700 w-fit">
        อ่านเพิ่มเติม ➔
      </Link>
    </div>
  </div>
);

const HomePage = () => {
  const context = useContext(NewsContext);
  
  if(!context){
    return <div className="p-8 text-red-500 text-2xl font-bold">Error : ไม่พบ Context</div>
  }

  const { newsList, prList, departmentList, isLoading } = context;

  return (
  <div className="bg-slate-50 min-h-screen pt-0 pb-10 px-4 md:px-8 w-full">
      
      {isLoading ? (
        <div className="w-full flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <span className="ml-4 text-lg md:text-xl text-gray-500 font-medium">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <>
          {/* ========================================= */}
          {/* 📰 SECTION 1: ข่าวประชาสัมพันธ์ (Advertise) */}
          {/* ========================================= */}
          <div className="pt-8">
            {/* 🌟 สร้าง Flexbox ให้ Header กับ ปุ่มดูทั้งหมด */}
            <div className="flex justify-between items-end mb-6 md:mb-8">
              <h1 className='text-3xl md:text-4xl font-bold text-slate-800'>ข่าวประชาสัมพันธ์</h1>
              <Link to="/advertise" className="text-sm md:text-base font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                ดูทั้งหมด <span className="ml-1 text-lg leading-none">›</span>
              </Link>
            </div>

            <div className="w-full border-2 border-gray-200 p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 overflow-x-auto bg-white shadow-sm hide-scrollbar">
              {/* 🌟 ใช้ .slice(0, 5) จำกัดโชว์แค่ 5 ข่าวล่าสุด */}
              {newsList?.slice(0, 5).map((news) => (
                <ArticleCard key={news.id} item={news} basePath="advertise" />
              ))}
            </div>
          </div>

          {/* ========================================= */}
          {/* 📢 SECTION 2: กิจกรรม (News/PR) */}
          {/* ========================================= */}
          {prList && prList.length > 0 && (
            <div className="mt-12 md:mt-16">
              {/* 🌟 สร้าง Flexbox ให้ Header กับ ปุ่มดูทั้งหมด */}
              <div className="flex justify-between items-end mb-6 md:mb-8">
                <h1 className='text-3xl md:text-4xl font-bold text-slate-800'>กิจกรรมและประกาศ</h1>
                <Link to="/news" className="text-sm md:text-base font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                  ดูทั้งหมด <span className="ml-1 text-lg leading-none">›</span>
                </Link>
              </div>

              <div className="w-full border-2 border-gray-200 p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 overflow-x-auto bg-white shadow-sm hide-scrollbar">
                {/* 🌟 ใช้ .slice(0, 5) จำกัดโชว์แค่ 5 ข่าวล่าสุด */}
                {prList.slice(0, 5).map((pr) => (
                  <ArticleCard key={pr.id} item={pr} basePath="news" />
                ))}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 🏢 SECTION 3: หน่วยงาน (Departments) */}
          {/* ========================================= */}
          <div className="mt-12 md:mt-16">
            <h1 className='text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-slate-800'>หน่วยงาน</h1>
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:gap-y-12 md:gap-x-8">
              {departmentList?.map((dept) => (
                <div key={dept.id} className="flex justify-center">
                  <Link to={`/department/${dept.id}`} className="flex flex-col items-center group text-center w-fit"> 
                    <div className="w-[120px] h-[120px] md:w-[175px] md:h-[175px] rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                      <img 
                        src={dept.cover_image} 
                        alt={dept.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        loading='lazy'
                      />
                    </div>                
                    <h3 className='text-lg md:text-2xl font-bold mt-3 md:mt-4 text-slate-800 group-hover:text-blue-600'>
                      {dept.title}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

  </div>
  );
}

export default HomePage;