import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { NewsContext } from '../context/NewsContext';
import DOMPurify from 'dompurify'; // 🌟 1. Import DOMPurify เข้ามา
import Breadcrumb from '../components/Breadcrumb';

const NewsDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const context = useContext(NewsContext);
  
  if (!context) return <div className="p-8 text-red-500">Error: ไม่พบ Context</div>;

  const { newsList, isLoading } = context;
  const news = newsList?.find((item) => item.id === Number(id));

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">ไม่พบข้อมูลข่าวสารนี้</h1>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
          กลับไปหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-md overflow-hidden border border-slate-200">
        
        <div className="w-full h-[250px] md:h-[400px] overflow-hidden bg-slate-200">
          <img 
            src={news.image_src} 
            alt={news.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-12">
          <Breadcrumb title={news.title} />

          <p className="text-sm text-blue-600 font-bold mb-3">{news.date}</p>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-6 leading-snug">
            {news.title}
          </h1>

          <hr className="border-slate-100 mb-8" />

          {/* 🌟 2. ใช้ dangerouslySetInnerHTML + DOMPurify ตรงจุดที่ต้องการให้แสดง HTML */}
          <div 
            className="prose prose-lg max-w-none text-slate-600 leading-relaxed text-base md:text-lg"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(news.content || news.description) 
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default NewsDetailPage;