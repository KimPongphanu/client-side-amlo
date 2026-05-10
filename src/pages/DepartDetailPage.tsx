import { useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper'; 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ════════════════════════════════════════════════════════════
//  SECTION 1 — HELPER & TYPES
// ════════════════════════════════════════════════════════════
const getYouTubeId = (url = '') => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([^?&\s]{11})/
  );
  return match ? match[1] : null;
};

interface YouTubePlayer {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string | HTMLElement, options: unknown) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        ENDED: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// ════════════════════════════════════════════════════════════
//  SECTION 2 — โหลด YouTube IFrame API script
// ════════════════════════════════════════════════════════════
const loadYTScript = () =>
  new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
  });

const FALLBACK_MS = 15000;

// ════════════════════════════════════════════════════════════
//  SECTION 3 — COMPONENT: YouTubeSlide
// ════════════════════════════════════════════════════════════
const YouTubeSlide = ({ url, isActive, onVideoEnded }: { url: string, isActive: boolean, onVideoEnded: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null); 
  const playerRef    = useRef<YouTubePlayer | null>(null); 
  const onEndedRef   = useRef(onVideoEnded); 
  const fallbackRef  = useRef<ReturnType<typeof setTimeout> | null>(null); 
  const playingRef   = useRef(false); 

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // 🌟 บังคับเริ่มต้นแบบ "มีเสียง" เสมอ

  const videoId = getYouTubeId(url);

  // คอยอัปเดต onVideoEnded ล่าสุด
  useEffect(() => { onEndedRef.current = onVideoEnded; }, [onVideoEnded]);

  const clearFallback = () => {
    if (fallbackRef.current) clearTimeout(fallbackRef.current);
  };

  const startFallback = useCallback(() => {
    clearFallback();
    fallbackRef.current = setTimeout(() => {
      onEndedRef.current?.();
    }, FALLBACK_MS);
  }, []);
  
  // 🌟 Effect: ทำงานทุกครั้งที่ isActive เปลี่ยนแปลง (รวมร่างโค้ดทำลายทิ้งของนายมาไว้ที่นี่!)
  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    // 🌟 ถ้าสไลด์เลื่อนหนี (isActive = false) ให้ "ฆ่าทิ้ง" เลย ป้องกันเสียงผีหลอกตอนโคลนนิ่ง
    if (!isActive) {
      clearFallback();
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      containerRef.current.innerHTML = '';
      return;
    }

    // 🌟 ถ้าสไลด์มาถึง (isActive = true) ให้สร้างใหม่เสมอ จะได้เป็น "Loop แรก" ตลอดไป!
    let cancelled = false;
    startFallback(); 

    loadYTScript().then(() => {
      if (cancelled || !containerRef.current) return;

      const target = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(target);

      playerRef.current = new window.YT.Player(target, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,         // 🌟 บังคับออโต้
          mute: 0,             // 🌟 บังคับมีเสียง
          controls: 0,         
          modestbranding: 1,   
          rel: 0,              
          fs: 0,               
          playsinline: 1,
          disablekb: 1,        
          iv_load_policy: 3,   
          cc_load_policy: 0,   
        },
        events: {
          onReady: (e: { target: YouTubePlayer }) => {
            if (cancelled) return;
            e.target.unMute();       // 🌟 ย้ำว่าห้าม Mute
            e.target.setVolume(50);  // 🌟 ตั้งระดับเสียงมาตรฐานที่ 50%
            e.target.playVideo();    // 🌟 สั่งเล่นทันทีที่โหลดเสร็จ
          },
          onStateChange: (e: { data: number }) => {
            if (cancelled) return;
            const S = window.YT.PlayerState;

            if (e.data === S.PLAYING) {
              clearFallback();        
              playingRef.current = true;
              setIsPlaying(true); 
            } else if (e.data === S.ENDED) {
              clearFallback();
              playingRef.current = false;
              setIsPlaying(false);
              onEndedRef.current?.(); 
            } else if (e.data === S.PAUSED) {
              setIsPlaying(false); 
            }
          },
          onError: () => {
            if (cancelled) return;
            clearFallback();
            onEndedRef.current?.();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearFallback();
    };
  }, [isActive, videoId, startFallback]); 

  // Cleanup ตอนปิด component
  useEffect(() => () => {
    clearFallback();
    try { playerRef.current?.destroy(); } catch { /* ignore */ }
    playerRef.current = null;
  }, []);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(50); // กลับมาที่ 50%
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  if (!videoId) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,                    
          zIndex: 10,                  
          background: 'transparent',   
          pointerEvents: 'all',        
          userSelect: 'none',          
          WebkitUserSelect: 'none',    
          cursor: 'default',           
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div 
        className="absolute bottom-4 left-4 z-20 flex gap-3"
        onPointerDown={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={togglePlay}
          className="bg-black/60 hover:bg-black/80 text-white w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm transition-all shadow-lg"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <button 
          onClick={toggleMute}
          className="bg-black/60 hover:bg-black/80 text-white w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm transition-all shadow-lg"
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  SECTION 4 — MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════
const DepartmentDetailPage = () => {
  const { id } = useParams();
  const context = useContext(NewsContext);
  const { departmentList } = context || {};
  const department = departmentList?.find((dept) => dept.id === Number(id));

  const swiperRef = useRef<SwiperType | null>(null);

  const handleVideoEnded = useCallback(() => {
    swiperRef.current?.slideNext();
    swiperRef.current?.autoplay.start(); 
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const item = department?.gallery?.[swiper.realIndex];
    if (!item) return;

    if (item.type === 'video') {
      swiper.autoplay.stop(); // 🌟 ปิด Timer ของ Swiper เด็ดขาด ให้วิดีโอมันคุมการเลื่อนแทน
    } else {
      swiper.autoplay.start(); 
    }
  }, [department]);

  const handleAutoplayStart = useCallback((swiper: SwiperType) => {
    const item = department?.gallery?.[swiper.realIndex];
    if (item?.type === 'video') {
      swiper.autoplay.stop(); // 🌟 กันเหนียว ถ้ายูสเซอร์ปัดกลับมาวิดีโอ ต้องสั่งปิด Timer อีกรอบ
    }
  }, [department]);

  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    const firstItem = department?.gallery?.[0];
    if (firstItem?.type === 'video') {
      swiper.autoplay.stop(); 
    }
  }, [department]);

  if (!department) {
    return (
      <div className="pt-32 text-center text-2xl font-bold text-red-500 min-h-screen">
        ไม่พบข้อมูลหน่วยงานนี้
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-8 max-w-5xl mx-auto min-h-screen">
      <div className="relative flex items-center mb-10 px-4">
        <Link to="/" className="z-10">
          <img src="/back.png" alt="ย้อนกลับ" className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-4xl font-bold text-slate-800 text-center w-max">
          {department.title}
        </h1>
      </div>

      <div className="w-full h-[400px] md:h-[500px] mb-12 rounded-3xl overflow-hidden shadow-2xl bg-black">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          allowTouchMove={true}
          autoplay={{ 
            delay: 5000, 
            disableOnInteraction: false 
          }} 
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          onAutoplayStart={handleAutoplayStart} 
          className="w-full h-full"
        >
          {department.gallery.map((item, index) => (
            <SwiperSlide key={index} className="w-full h-full flex justify-center items-center bg-black">
              {({ isActive }) => (
                item.type === 'video' ? (
                  <YouTubeSlide
                    url={item.url}
                    isActive={isActive}
                    onVideoEnded={handleVideoEnded}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={`ภาพประกอบ ${department.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700 border-b pb-4">
          โครงสร้างและหน้าที่รับผิดชอบ
        </h2>
        <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
          ยินดีต้อนรับเข้าสู่ <strong>{department.title}</strong>
          <br /><br /> 
          ในอนาคตคุณสามารถนำเนื้อหา เช่น หน้าที่รับผิดชอบ, เบอร์ติดต่อส่วนงาน,
          หรือโครงสร้างบุคลากร จาก Database มาแสดงผลในกล่องนี้ได้เลยครับ!
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailPage;