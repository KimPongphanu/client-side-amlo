import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext';
import type { NewsItem } from '../type';
import DepartmentShowcase from '../components/DepartmentShowcase';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const parseThaiDateToTimestamp = (dateStr: string) => {
  if (!dateStr) return 0;
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = THAI_MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month, day).getTime();
  }
  return new Date(dateStr).getTime();
};

// =========================================
// SKELETON COMPONENTS
// =========================================
const ArticleCardSkeleton = () => (
  <div className="shrink-0 w-[280px] md:w-[350px] bg-white border border-slate-100 rounded-xl md:rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
    <div className="h-[180px] md:h-[200px] w-full bg-slate-200"></div>
    <div className="p-4 md:p-5 flex flex-col flex-grow">
      <div className="h-3 md:h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
      <div className="h-5 md:h-6 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-5 md:h-6 bg-slate-200 rounded w-5/6 mb-4"></div>
      <div className="h-3 md:h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-3 md:h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-3 md:h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
      <div className="mt-auto h-4 md:h-5 bg-slate-200 rounded w-1/3"></div>
    </div>
  </div>
);

const DepartmentSkeleton = () => (
  <div className="flex justify-center animate-pulse">
    <div className="flex flex-col items-center w-fit">
      <div className="w-[120px] h-[120px] md:w-[175px] md:h-[175px] bg-slate-200 rounded-full mb-3 md:mb-4"></div>
      <div className="h-5 md:h-6 bg-slate-200 rounded w-24 md:w-32"></div>
    </div>
  </div>
);

// =========================================
// ARTICLE CARD
// =========================================
const ArticleCard = ({ item, basePath }: { item: NewsItem; basePath: string }) => (
  <Link to={`/${basePath}/${item.id}`}>
    <div className="shrink-0 w-[280px] md:w-[350px] bg-white border rounded-xl md:rounded-2xl overflow-hidden shadow-md flex flex-col hover:shadow-xl transition-shadow h-full">
      <div className="h-[180px] md:h-[200px] w-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={item.image_src}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <p className="text-xs md:text-sm text-blue-600 font-medium mb-1">{item.date}</p>
        <h3 className="text-base md:text-lg font-bold text-gray-800 line-clamp-2 mb-2">{item.title}</h3>
        <p className="text-xs md:text-sm text-gray-500 line-clamp-3 mb-4">{item.description}</p>
        <span className="mt-auto text-left text-sm md:text-base text-blue-500 font-medium hover:text-blue-700 w-fit">
          อ่านเพิ่มเติม ➔
        </span>
      </div>
    </div>
  </Link>
);

// =========================================
// HOME PAGE
// =========================================
const HomePage = () => {
  const context = useContext(NewsContext);

  if (!context) {
    return <div className="p-8 text-red-500 text-2xl font-bold">Error : ไม่พบ Context</div>;
  }

  const { newsList, prList, isLoading } = context;

  // ✅ แก้แล้ว — ถูก list + filter isShow
  const sortedAdvertiseList = prList
    ? [...prList].filter(item => item.isShow).sort((a, b) => parseThaiDateToTimestamp(b.date) - parseThaiDateToTimestamp(a.date))
    : [];
  
  const sortedNewsList = newsList
    ? [...newsList].filter(item => item.isShow).sort((a, b) => parseThaiDateToTimestamp(b.date) - parseThaiDateToTimestamp(a.date))
    : [];

  return (
    <div className="bg-slate-50 min-h-screen pt-0 pb-10 w-full">

      {isLoading ? (
        // ── Skeleton state ──────────────────────────────────────────────
        <div className="px-4 md:px-8">
          <div className="pt-8">
            <div className="flex justify-between items-end mb-6 md:mb-8">
              <div className="h-8 md:h-10 bg-slate-200 rounded w-48 md:w-64 animate-pulse"></div>
            </div>
            <div className="w-full border-2 border-slate-100 p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 overflow-hidden bg-white shadow-sm">
              {[1, 2, 3, 4, 5].map((i) => <ArticleCardSkeleton key={i} />)}
            </div>
          </div>

          <div className="mt-12 md:mt-16">
            <div className="flex justify-between items-end mb-6 md:mb-8">
              <div className="h-8 md:h-10 bg-slate-200 rounded w-56 md:w-72 animate-pulse"></div>
            </div>
            <div className="w-full border-2 border-slate-100 p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 overflow-hidden bg-white shadow-sm">
              {[1, 2, 3, 4, 5].map((i) => <ArticleCardSkeleton key={i} />)}
            </div>
          </div>

          {/* Skeleton สำหรับ DepartmentShowcase */}
          <div className="mt-12 md:mt-16">
            <div className="h-8 md:h-10 bg-slate-200 rounded w-32 md:w-40 animate-pulse mb-6 md:mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-y-12 md:gap-x-8">
              {[1, 2, 3, 4].map((i) => <DepartmentSkeleton key={i} />)}
            </div>
          </div>
        </div>
      ) : (
        // ── Loaded state ────────────────────────────────────────────────
        <>
          <div className="px-4 md:px-8">
            {/* ข่าวประชาสัมพันธ์ */}
            <div className="pt-8">
              <div className="flex justify-between items-end mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">ข่าวประชาสัมพันธ์</h1>
                <Link
                  to="/advertise"
                  className="text-sm md:text-base font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  ดูทั้งหมด <span className="ml-1 text-lg leading-none">›</span>
                </Link>
              </div>
              <div className="w-full border-2 border-gray-200 p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 overflow-x-auto bg-white shadow-sm hide-scrollbar items-stretch">
                {sortedAdvertiseList.slice(0, 5).map((news) => (
                  <ArticleCard key={news.id} item={news} basePath="advertise" />
                ))}
              </div>
            </div>

            {/* กิจกรรมและประกาศ */}
            {sortedNewsList.length > 0 && (
              <div className="mt-12 md:mt-16">
                <div className="flex justify-between items-end mb-6 md:mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800">กิจกรรมและประกาศ</h1>
                  <Link
                    to="/news"
                    className="text-sm md:text-base font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                  >
                    ดูทั้งหมด <span className="ml-1 text-lg leading-none">›</span>
                  </Link>
                </div>
                <div className="w-full border-2 border-gray-200 p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 overflow-x-auto bg-white shadow-sm hide-scrollbar items-stretch">
                  {sortedNewsList.slice(0, 5).map((pr) => (
                    <ArticleCard key={pr.id} item={pr} basePath="news" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/*
            หน่วยงาน — แทนที่ grid วงกลม 4 อัน (departmentList) ด้วย DepartmentShowcase
            Component นี้มี padding และ background ของตัวเองแล้ว จึงไม่ใส่ px-4 md:px-8 ครอบ
          */}
          <div className="mt-10 md:mt-8">
            <DepartmentShowcase />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;