import { useContext} from 'react';
import { Link } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext';
// import Slider from './Slider';

const HomePage = () => {

  const context = useContext(NewsContext);
  
  if(!context){
    return <div className="p-8 text-red-500 text-2xl font-bold">Error : ไม่พบ Context</div>
  }

  const { newsList, departmentList , isLoading } = context;


  return (
  <div className="bg-slate-50 min-h-screen pt-24 pb-10 px-8">
      <h1 className='text-4xl font-bold mb-8'>ข่าวประชาสัมพันธ์</h1>
      
      {/* 3. สร้างเงื่อนไข: ถ้า isLoading เป็น true ให้โชว์ตัวโหลดหมุนๆ */}
      {isLoading ? (
        <div className="w-full flex justify-center items-center h-[300px]">
          {/* ตัวหมุนๆ (Spinner) ที่สร้างด้วย Tailwind */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <span className="ml-4 text-xl text-gray-500 font-medium">กำลังโหลดข้อมูลข่าวสาร...</span>
        </div>
      ) : (

        // ส่วนข่าวประชาสัมพันธ์
        /* 4. ถ้าโหลดเสร็จแล้ว (isLoading เป็น false) ค่อยโชว์การ์ดข่าว */
        <div className="w-full border-2 border-gray-500 p-8 rounded-3xl flex gap-6 overflow-x-auto bg-white shadow-sm">
          
          {newsList.map((news) => (
            <div key={news.id} className="shrink-0 w-[350px] bg-white border rounded-2xl overflow-hidden shadow-md flex flex-col hover:shadow-xl transition-shadow">
              
              {/* ส่วนรูปภาพ */}
              <div className="h-[200px] w-full overflow-hidden">
                <img 
                  src={news.image_src} 
                  alt={news.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* ส่วนเนื้อหาข่าว */}
              <div className="p-5 flex flex-col flex-grow">
                <p className="text-sm text-blue-600 font-medium mb-1">{news.date}</p>
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">{news.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{news.description}</p>
                
                {/* ปุ่มอ่านต่อ */}
                <Link to={`/news/${news.id}`} className="mt-auto text-left text-blue-500 font-medium hover:text-blue-700 w-fit">
                  อ่านเพิ่มเติม ➔
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

     {/* ส่วนโชว์หน่วยงาน (เอา departmentList ไป Map โชว์ได้เลย) */}
      <div className="mt-12">
        <h1 className='text-4xl font-bold mb-8'>หน่วยงาน</h1>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-y-12 gap-x-8">
          {departmentList.map((dept) => (
            <Link key={dept.id} to={`/department/${dept.id}`} className="flex flex-col items-center group">
              <div className="w-[175px] h-[175px] rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">

                {/* 🌟 เปลี่ยน src ตรงนี้เป็น dept.cover_image ครับ */}
                <img 
                  src={dept.cover_image} 
                  alt={dept.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />

              </div>
              <h3 className='text-2xl font-bold mt-4 text-slate-800 group-hover:text-blue-600'>
                {dept.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>

  </div>
  );
}

export default HomePage