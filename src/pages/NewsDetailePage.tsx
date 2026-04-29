import { useParams , Link } from 'react-router-dom';
import { useContext } from 'react';
import { NewsContext } from '../context/NewsContext';

const NewsDetailPage = () => {
  // 1. ดึงค่า id ออกมาจาก URL (ค่าที่ได้จะเป็น String)
  const { id } = useParams(); 

  // 2. เรียกใช้ข้อมูลจากโกดัง (Context)
  const context = useContext(NewsContext);
  if (!context) return <div>Error: ไม่พบ Context</div>;

  const { newsList } = context;

  // 3. ใช้ฟังก์ชัน .find() เพื่อหาข่าวที่มี ID ตรงกับใน URL
  // ต้องระวังเรื่อง Type: id จาก URL เป็น string แต่ id ใน DB มักเป็น number
  const news = newsList.find((item) => item.id === Number(id));

  // กรณีหาข่าวไม่เจอ (เช่น พิมพ์ URL มั่วๆ)
  if (!news) {
    return <div className="pt-24 text-center text-2xl">ไม่พบข้อมูลข่าวสาร</div>;
  }

  // 4. แสดงผลหน้าตา Template
  return (
    <div className="pt-32 pb-20 px-8 max-w-4xl mx-auto min-h-screen">
        <div className="flex justify-start items-center gap-8">
        <Link to="/"><img src="/back.png" alt=""  className='w-10 h-10 cursor-pointer '/></Link>
        <p className="text-blue-600 font-medium">{news.date}</p>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-slate-800 leading-tight">{news.title}</h1>

      {/* รูปภาพประกอบ */}
      {/* กล่องรูปภาพแบบมีขีดจำกัดความสูง */}
        <div className="w-full max-h-[600px] mb-8 rounded-3xl overflow-y-auto shadow-xl bg-gray-100 custom-scrollbar border border-gray-200">
          <img 
            src={news.image_src} 
            alt={news.title} 
            // ใช้ w-full เพื่อให้รูปกว้างเต็มกล่อง ส่วนความสูงปล่อยให้ดันลงไปด้านล่าง
            className="w-full h-auto" 
          />
        </div>

      {/* เพิ่มคลาส whitespace-pre-line เข้าไปครับ */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {news.description}
        </div>
    </div>
  );
};

export default NewsDetailPage;