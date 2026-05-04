import { useState } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    // 🌟 1. ลบ h-screen ออก แล้วเปลี่ยนเป็นความสูงที่เหมาะสมตามขนาดจอ
    <div className="w-full h-[250px] md:h-[450px] lg:h-[calc(100vh-96px)] xl:h-screen relative group">
      
      <div className="w-full h-full overflow-hidden relative shadow-md bg-slate-900">
        
        <Swiper
          modules={[Autoplay, Navigation]}
          loop={true}
          autoplay={{ 
            delay: 5000, 
            disableOnInteraction: false 
          }}
          onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)} 
          className="w-full h-full z-0"
          navigation={{
            prevEl: '.custom-prev-btn',
            nextEl: '.custom-next-btn',
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              {/* object-cover จะทำงานได้สมบูรณ์แบบก็ต่อเมื่อกล่องมีความสูงที่สมมาตรครับ */}
              <img src={slide.image} className="w-full h-full object-cover" alt={`Slide ${slide.id}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <button className="custom-prev-btn hidden group-hover:block absolute top-[50%] -translate-y-[50%] left-4 md:left-8 text-xl md:text-2xl rounded-full p-2 px-3 md:px-4 bg-black/30 text-white cursor-pointer hover:bg-black/60 transition z-10">
        ❮
      </button>
      <button className="custom-next-btn hidden group-hover:block absolute top-[50%] -translate-y-[50%] right-4 md:right-8 text-xl md:text-2xl rounded-full p-2 px-3 md:px-4 bg-black/30 text-white cursor-pointer hover:bg-black/60 transition z-10">
        ❯
      </button>

      {/* 🌟 2. ปรับระยะห่างและขนาดของหลอด Progress ให้พอดีกับจอมือถือ */}
      <div className="flex justify-center py-4 md:py-6 gap-1 md:gap-2 absolute bottom-0 left-0 w-full z-10 px-4">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            // 🌟 3. เปลี่ยน w-60 (กว้างเกินไป) เป็น w-12 ในมือถือ และ w-32 ในจอคอม
            className="h-1 w-12 md:w-32 bg-gray-300/50 rounded-full overflow-hidden"
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