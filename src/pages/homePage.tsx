import { useContext, useState, useEffect, useMemo } from 'react';
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
const CARD_HEIGHT = 168; // card height (160px) + gap (8px)

const HomePage = () => {
  const context = useContext(NewsContext);

  // ── Hooks ทั้งหมดต้องอยู่ก่อน early return เสมอ ──
  const [commentOffset, setCommentOffset] = useState(1); // เริ่มต้นที่ index 1 (ข้ามตำแหน่ง clone ตัวสุดท้ายที่อยู่หัวสุด)
  const [isTransitioning, setIsTransitioning] = useState(true);

  // re-enable transition หลังจาก reset position โดยไม่มี animation
  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTransitioning(true));
      });
    }
  }, [isTransitioning]);

  // จัดการการวน Loop ของ Slider ความคิดเห็นแบบ Smooth (Infinite loop)
  useEffect(() => {
    if (!context) return;
    const commentsCount = context.commentList?.filter(c => c.isShow).length || 0;
    if (commentsCount <= 1) return;

    if (commentOffset === commentsCount + 1) {
      // เมื่อสไลด์ถึง clone ตัวแรกสุด (ที่ต่อไว้ท้าย) -> ย้ายกลับไปอันจริงแรกแบบเงียบๆ
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCommentOffset(1);
      }, 700);
      return () => clearTimeout(timer);
    }
    
    if (commentOffset === 0) {
      // เมื่อสไลด์ถึง clone ตัวสุดท้าย (ที่ต่อไว้บนสุด) -> ย้ายกลับไปอันจริงสุดท้ายแบบเงียบๆ
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCommentOffset(commentsCount);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [commentOffset, context]);

  const prList = context?.prList;
  const sortedAdvertiseList = useMemo(() => {
    return prList
      ? [...prList].filter(item => item.isShow !== false).sort((a, b) => parseThaiDateToTimestamp(b.date) - parseThaiDateToTimestamp(a.date))
      : [];
  }, [prList]);

  const newsList = context?.newsList;
  const sortedNewsList = useMemo(() => {
    return newsList
      ? [...newsList].filter(item => item.isShow !== false).sort((a, b) => parseThaiDateToTimestamp(b.date) - parseThaiDateToTimestamp(a.date))
      : [];
  }, [newsList]);

  if (!context) {
    return <div className="p-8 text-red-500 text-2xl font-bold">Error : ไม่พบ Context</div>;
  }

  const { commentList, isLoading } = context;

  const publishedComments = commentList?.filter(c => c.isShow) || [];

  // เลื่อนลง — สไลด์สมูทต่อเนื่อง
  const handleNext = () => {
    if (publishedComments.length <= 1) return;
    // ป้องกันการกดซ้ำระหว่างระบบกำลังกระโดดตำแหน่ง clone
    if (commentOffset > publishedComments.length || commentOffset === 0) return;

    setIsTransitioning(true);
    setCommentOffset(prev => prev + 1);
  };

  // เลื่อนขึ้น — สไลด์สมูทต่อเนื่อง
  const handlePrev = () => {
    if (publishedComments.length <= 1) return;
    // ป้องกันการกดซ้ำระหว่างระบบกำลังกระโดดตำแหน่ง clone
    if (commentOffset <= 0 || commentOffset > publishedComments.length) return;

    setIsTransitioning(true);
    setCommentOffset(prev => prev - 1);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-0 w-full">

      {isLoading ? (
        // ── Skeleton state ──
        <div className="px-4 md:px-8 pb-10">
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

          <div className="mt-12 md:mt-16">
            <div className="h-8 md:h-10 bg-slate-200 rounded w-32 md:w-40 animate-pulse mb-6 md:mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-y-12 md:gap-x-8">
              {[1, 2, 3, 4].map((i) => <DepartmentSkeleton key={i} />)}
            </div>
          </div>
        </div>
      ) : (
        // ── Loaded state ──
        <>
          <div className="px-4 md:px-8 pb-10">

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

          {/* หน่วยงาน */}
          <div className="mt-4 md:mt-4 pb-10">
            <DepartmentShowcase />
          </div>

          {/* ส่วนแสดงความคิดเห็น */}
          {publishedComments.length > 0 && (
            <div className="py-20 w-full overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* ซ้าย: หัวข้อ */}
                <div className="lg:col-span-5 lg:sticky lg:top-24">
                  <p className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-3">
                    เสียงตอบรับจากผู้ใช้งาน
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                    ระบบบริการ<br />
                    <span className="text-blue-500">อิเล็กทรอนิกส์</span>
                  </h2>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                    ความคิดเห็นและประสบการณ์จริงจากผู้ใช้งานระบบบริการของเรา
                    ทุกเสียงสะท้อนคือแรงผลักดันสำคัญให้เราพัฒนาอย่างไม่หยุดยั้ง
                  </p>
                </div>

                {/* ขวา: Vertical slider */}
                <div className="lg:col-span-7 flex flex-row gap-4">

                  {/* Slider container */}
                  <div className="flex-1 overflow-hidden" style={{ height: `${CARD_HEIGHT * 1.35}px` }}>
                    <div
                      style={{
                        transform: `translateY(-${commentOffset * CARD_HEIGHT}px)`,
                        transition: isTransitioning ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                      }}
                    >
                      {/* clone อันสุดท้ายไว้หัวสุด + items จริง + clone อันแรกไว้ท้ายสุด เพื่อ loop ไม่สะดุดทั้งสองทาง */}
                      {[
                        publishedComments[publishedComments.length - 1],
                        ...publishedComments,
                        publishedComments[0]
                      ].map((comment, idx) => (
                        <div
                          key={`${comment.id}-${idx}`}
                          style={{ height: `${CARD_HEIGHT - 8}px`, marginBottom: '8px' }}
                          className="bg-[#1a1a1a] px-6 py-5 rounded-2xl border border-white/5 flex flex-col justify-center shrink-0"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {idx === 0 
                                ? publishedComments.length 
                                : idx === publishedComments.length + 1 
                                ? 1 
                                : idx}
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 fill-current ${i < comment.star ? 'text-yellow-400' : 'text-slate-600'}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">"{comment.msg}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ปุ่มขึ้น/ลง */}
                  <div className="flex flex-col gap-2 justify-center shrink-0">
                    <button
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default HomePage;