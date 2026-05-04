import { useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext'; // 🌟 เช็ค path ตรงนี้ให้ตรงกับโปรเจกต์น้องนะ

const AdvertiseDetail = () => {
  const { id } = useParams(); // ดึง ID จาก URL
  const navigate = useNavigate();
  const context = useContext(NewsContext);

  if (!context) return <div className="p-8 text-red-500">Error: ไม่พบ Context</div>;

  const { prList, isLoading } = context;

  // 🌟 SENIOR TIP: หาข้อมูลประกาศที่ ID ตรงกับ URL
  // ใช้ Number(id) เพราะ URL มักจะเป็น String แต่ใน Data เราเป็น Number
  const advertiseData = prList?.find(pr => pr.id === Number(id));

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!advertiseData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">ไม่พบข้อมูลประกาศนี้</h1>
        <Link to="/" className="text-blue-600 hover:underline">กลับหน้าหลัก</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-16 px-4 md:px-8">
      {/* 🌟 จำกัดความกว้างเนื้อหาให้อ่านง่าย (max-w-4xl) จะไม่กางเต็มจอจนตาลาย */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-md overflow-hidden border border-slate-200">
        
        {/* รูปภาพ Cover */}
        <div className="w-full h-[250px] md:h-[400px] overflow-hidden bg-slate-200">
          <img 
            src={advertiseData.image_src} 
            alt={advertiseData.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* ส่วนเนื้อหา */}
        <div className="p-6 md:p-12">
          {/* ปุ่มย้อนกลับ */}
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 flex items-center transition-colors"
          >
            ❮ ย้อนกลับ
          </button>

          <p className="text-sm text-blue-600 font-bold mb-3">{advertiseData.date}</p>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-6 leading-snug">
            {advertiseData.title}
          </h1>

          <hr className="border-slate-100 mb-8" />

          {/* เนื้อหาเต็ม (ใช้ whitespace-pre-line เพื่อให้มันขึ้นบรรทัดใหม่ตามที่เราเคาะ Enter ไว้ใน Mock Data) */}
          <div className="text-slate-600 leading-relaxed text-base md:text-lg whitespace-pre-line">
            {advertiseData.content}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdvertiseDetail;