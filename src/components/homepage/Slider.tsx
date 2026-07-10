import { useState } from 'react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Autoplay, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

export interface Slide {
  id: number
  image: string
  link?: string
}

interface SliderProps {
  slides: Slide[]
  containerClassName?: string
}

export default function Slider({ slides, containerClassName }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const handleSlideClick = (link?: string) => {
    if (link && link.trim()) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  const togglePlay = () => {
    if (!swiperInstance) return
    if (isPlaying) {
      swiperInstance.autoplay.stop()
      setIsPlaying(false)
    } else {
      swiperInstance.autoplay.start()
      setIsPlaying(true)
    }
  }

  return (
    <div
      className={`w-full relative group ${containerClassName || 'h-[250px] md:h-[450px] lg:h-[calc(100vh-96px)] xl:h-screen'}`}
    >
      <div className='w-full h-full overflow-hidden relative shadow-md bg-slate-900'>
        <Swiper
          onSwiper={setSwiperInstance}
          modules={[Autoplay, Navigation]}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
          className='w-full h-full z-0'
          navigation={{
            prevEl: '.custom-prev-btn',
            nextEl: '.custom-next-btn',
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                onClick={() => handleSlideClick(slide.link)}
                className={`w-full h-full ${slide.link ? 'cursor-pointer' : ''}`}
              >
                <img
                  src={slide.image}
                  className='w-full h-full object-cover'
                  alt={`Slide ${slide.id}`}
                  loading='lazy'
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <button className='custom-prev-btn hidden group-hover:block absolute top-[50%] -translate-y-[50%] left-4 md:left-8 text-xl md:text-2xl rounded-full p-2 px-3 md:px-4 bg-black/30 text-white cursor-pointer hover:bg-black/60 transition z-10'>
        ❮
      </button>
      <button className='custom-next-btn hidden group-hover:block absolute top-[50%] -translate-y-[50%] right-4 md:right-8 text-xl md:text-2xl rounded-full p-2 px-3 md:px-4 bg-black/30 text-white cursor-pointer hover:bg-black/60 transition z-10'>
        ❯
      </button>

      {/* 🌟 2. ปรับระยะห่างและขนาดของหลอด Progress ให้พอดีกับจอมือถือ */}
      <div className='flex justify-center items-center py-4 md:py-6 gap-2 md:gap-4 absolute bottom-0 left-0 w-full z-10 px-4'>
        {/* Play/Pause Button for Accessibility */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'หยุดภาพสไลด์' : 'เล่นภาพสไลด์'}
          className='w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 transition'
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <div className='flex gap-1 md:gap-2'>
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className='h-1 w-12 md:w-32 bg-gray-300/50 rounded-full overflow-hidden'
            >
              {currentIndex === slideIndex && (
                <div
                  className='h-full bg-blue-600 rounded-full'
                  style={{ animation: isPlaying ? 'slide-progress 5s linear forwards' : 'none', width: isPlaying ? '0%' : '100%' }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slide-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
