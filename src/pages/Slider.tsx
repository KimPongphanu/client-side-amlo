import { useState } from 'react';
// 1. Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export interface Slide {
  id: number;
  image: string;
}

interface SliderProps {
  slides: Slide[];
}

export default function Slider({ slides }: SliderProps) {
  // สร้าง State ไว้เก็บค่า Index ปัจจุบัน เพื่อเอาไปใช้กับหลอด Progress
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="min-w-screen h-screen w-full m-auto px-4 relative group">
      
      {/* กรอบ Slider */}
      <div className="w-full h-full overflow-hidden relative shadow-lg bg-white">
        
        {/* 2. ใช้ Component Swiper แทน div ธรรมดา */}
        <Swiper
          modules={[Autoplay, Navigation]}
          loop={true}
          autoplay={{ 
            delay: 5000, 
            disableOnInteraction: false 
          }}
          // อัปเดต currentIndex ทุกครั้งที่สไลด์เปลี่ยน
          onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)} 
          className="w-full h-full z-0"
          
          // จับคู่ปุ่มลูกศรที่เราสร้างเอง ให้ทำงานกับ Swiper
          navigation={{
            prevEl: '.custom-prev-btn',
            nextEl: '.custom-next-btn',
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <img src={slide.image} className="w-full h-full object-cover" alt={`Slide ${slide.id}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 3. ปุ่มลูกศรซ้าย/ขวา (ใส่คลาส custom-prev-btn / custom-next-btn เพิ่มเข้าไป) */}
      <button className="custom-prev-btn hidden group-hover:block absolute top-[50%] -translate-y-[50%] left-8 text-2xl rounded-full p-2 px-4 bg-black/30 text-white cursor-pointer hover:bg-black/60 transition z-10">
        ❮
      </button>
      <button className="custom-next-btn hidden group-hover:block absolute top-[50%] -translate-y-[50%] right-8 text-2xl rounded-full p-2 px-4 bg-black/30 text-white cursor-pointer hover:bg-black/60 transition z-10">
        ❯
      </button>

      {/* 4. จุดนำทางด้านล่าง (Indicators/Bars) - ของเดิมของคุณเจ๋งอยู่แล้ว เก็บไว้เลย! */}
      <div className="flex justify-center py-6 gap-2 absolute bottom-0 left-0 w-full z-10">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            // (ออปชันเสริม) ถ้าใช้ Swiper การคลิกจุดเพื่อกระโดดข้ามสไลด์อาจจะต้องเขียนฟังก์ชันเพิ่ม
            // แต่หลอดวิ่งๆ ยังทำงานได้ปกติครับ
            className="h-1 w-60 bg-gray-300 rounded-full overflow-hidden"
          >
            {currentIndex === slideIndex && (
              <div 
                className="h-full bg-blue-600 rounded-full"
                style={{ animation: 'slide-progress 5s linear forwards' }}
              ></div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}