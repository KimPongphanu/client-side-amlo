import { useContext, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsContext } from '../context/NewsContext';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


// ════════════════════════════════════════════════════════════
//  SECTION 1 — HELPER: แกะ YouTube Video ID จาก URL
//  รองรับหลายรูปแบบ: youtu.be / watch?v= / embed/ / shorts/
// ════════════════════════════════════════════════════════════
const getYouTubeId = (url = '') => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([^?&\s]{11})/
  );
  return match ? match[1] : null;
};


// ════════════════════════════════════════════════════════════
//  SECTION 2 — HELPER: โหลด YouTube IFrame API script
//
//  - เรียกได้หลายครั้งโดยไม่ append script ซ้ำ
//  - resolve ทันทีถ้า API พร้อมอยู่แล้ว
//  - ถ้ายังไม่พร้อม → ต่อคิวรอ onYouTubeIframeAPIReady
// ════════════════════════════════════════════════════════════
const loadYTScript = () =>
  new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
  });


// ════════════════════════════════════════════════════════════
//  SECTION 3 — CONSTANT: Fallback timeout
//
//  ถ้าวิดีโอไม่เข้าสู่ state PLAYING ภายใน FALLBACK_MS มิลลิวินาที
//  ระบบจะถือว่า "จบแล้ว" และเลื่อน slide ต่อโดยอัตโนมัติ
//  ใช้สำหรับกรณี: autoplay โดน block / คลิปเสีย / network หลุด
// ════════════════════════════════════════════════════════════
const FALLBACK_MS = 15000;


// ════════════════════════════════════════════════════════════
//  SECTION 4 — COMPONENT: YouTubeSlide (อัปเกรดมีปุ่มควบคุมเอง)
// ════════════════════════════════════════════════════════════
import { useState } from 'react'; // อย่าลืม import useState เพิ่มด้านบนสุดของไฟล์ด้วยนะครับถ้ายังไม่มี

const YouTubeSlide = ({ url, isActive, onVideoEnded }) => {
  const containerRef = useRef(null); 
  const playerRef    = useRef(null); 
  const onEndedRef   = useRef(onVideoEnded); 
  const fallbackRef  = useRef(null); 
  const playingRef   = useRef(false); 

  // 🌟 เพิ่ม State สำหรับคุมปุ่ม UI ของเราเอง
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const videoId = getYouTubeId(url);

  useEffect(() => { onEndedRef.current = onVideoEnded; }, [onVideoEnded]);

  const clearFallback = () => clearTimeout(fallbackRef.current);
  const startFallback = () => {
    clearFallback();
    fallbackRef.current = setTimeout(() => {
      onEndedRef.current?.();
    }, FALLBACK_MS);
  };

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    clearFallback();
    playingRef.current = false;

    if (!isActive) {
      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
      return;
    }

    let cancelled = false;

    loadYTScript().then(() => {
      if (cancelled || !containerRef.current) return;

      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;

      const target = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(target);

      playerRef.current = new window.YT.Player(target, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
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
          onReady: (e) => {
            if (cancelled) return;
            
            // 🌟 ตั้งระดับเสียงเริ่มต้นที่ 40% (ใส่ได้ตั้งแต่ 0 - 100)
            e.target.setVolume(40); 
            
            e.target.playVideo();
            // เช็คสถานะเสียงเริ่มต้น
            setIsMuted(e.target.isMuted());
            startFallback(); 
          },
          onStateChange: (e) => {
            if (cancelled) return;
            const S = window.YT.PlayerState;

            if (e.data === S.PLAYING) {
              clearFallback();        
              playingRef.current = true;
              setIsPlaying(true); // 🌟 อัปเดตปุ่มเป็น Pause

            } else if (e.data === S.ENDED) {
              clearFallback();
              playingRef.current = false;
              setIsPlaying(false);
              onEndedRef.current?.(); 

            } else if (e.data === S.PAUSED) {
              setIsPlaying(false); // 🌟 อัปเดตปุ่มเป็น Play
              if (!playingRef.current) startFallback();
            } else if (e.data === S.BUFFERING) {
               if (!playingRef.current) startFallback();
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
  }, [isActive, videoId]);

  useEffect(() => () => {
    clearFallback();
    try { playerRef.current?.destroy(); } catch (_) {}
    playerRef.current = null;
  }, []);

  // 🌟 ฟังก์ชันสำหรับปุ่ม Play/Pause
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // 🌟 ฟังก์ชันสำหรับปุ่มปิดเปิดเสียง
  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  if (!videoId) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      
      {/* 1. iframe container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* 2. Overlay บังการสัมผัส iframe ไว้เหมือนเดิม (ซ่อน Title และ UI ขยะ) */}
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

      {/* 🌟 3. กล่องคุมปุ่มกดของเราเอง (ลอยอยู่เหนือ Overlay อีกที) */}
      <div 
        className="absolute bottom-4 left-4 z-20 flex gap-3"
        // หยุดการแพร่กระจาย event ไม่ให้ไปกวน Slider
        onPointerDown={(e) => e.stopPropagation()} 
      >
        {/* ปุ่ม เล่น/หยุด */}
        <button 
          onClick={togglePlay}
          className="bg-black/60 hover:bg-black/80 text-white w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm transition-all shadow-lg"
        >
          {isPlaying ? (
            // Icon Pause (ขีดสองขีด)
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            // Icon Play (สามเหลี่ยม)
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        {/* ปุ่ม เสียง */}
        <button 
          onClick={toggleMute}
          className="bg-black/60 hover:bg-black/80 text-white w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm transition-all shadow-lg"
        >
          {isMuted ? (
            // Icon Mute (กากบาท)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            // Icon Volume 
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
      </div>

    </div>
  );
};


// ════════════════════════════════════════════════════════════
//  SECTION 5 — CONSTANTS: ตั้งค่าเวลาทั้งหมดในที่เดียว
// ════════════════════════════════════════════════════════════
const IMAGE_DELAY      = 5000; // รูปภาพ: แสดงนาน 5 วิ แล้วเลื่อน
const POST_VIDEO_DELAY = 5000; // หลังวิดีโอจบ: รอ 5 วิ ก่อนเลื่อน


// ════════════════════════════════════════════════════════════
//  SECTION 6 — MAIN PAGE COMPONENT: DepartmentDetailPage
//
//  จัดการ:
//    - ดึงข้อมูล department จาก Context
//    - ควบคุม Swiper (เลื่อนขวาเท่านั้น, ไม่ใช้ autoplay ของ Swiper)
//    - Timer สำหรับรูปภาพ และ post-video delay
// ════════════════════════════════════════════════════════════
const DepartmentDetailPage = () => {
  const { id } = useParams();
  const context = useContext(NewsContext);
  const { departmentList } = context || {};
  const department = departmentList?.find((dept) => dept.id === Number(id));

  const swiperRef     = useRef(null); // Swiper instance
  const imageTimerRef = useRef(null); // timer สำหรับ slide รูปภาพ
  const postVideoRef  = useRef(null); // timer หน่วงหลังวิดีโอจบ

  // ── เลื่อนขวาเสมอ (ไม่มี slidePrev อัตโนมัติ) ───────────
  const slideNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  // ── รูปภาพ: นับ IMAGE_DELAY วิ แล้วเลื่อน ─────────────────
  const startImageTimer = useCallback(() => {
    clearTimeout(imageTimerRef.current);
    imageTimerRef.current = setTimeout(slideNext, IMAGE_DELAY);
  }, [slideNext]);

  // ── วิดีโอจบ: รอ POST_VIDEO_DELAY วิ แล้วเลื่อน ──────────
  const handleVideoEnded = useCallback(() => {
    clearTimeout(postVideoRef.current);
    postVideoRef.current = setTimeout(slideNext, POST_VIDEO_DELAY);
  }, [slideNext]);

  // ── slide เปลี่ยน: reset timer แล้วตัดสินใจตาม type ───────
  const handleSlideChange = useCallback((swiper) => {
    clearTimeout(imageTimerRef.current);
    clearTimeout(postVideoRef.current);

    const item = department?.gallery?.[swiper.realIndex];
    if (!item) return;

    if (item.type !== 'video') {
      startImageTimer(); // รูปภาพ → เริ่มนับ
    }
    // วิดีโอ → รอ YouTubeSlide ส่ง onVideoEnded มาเอง
  }, [department, startImageTimer]);

  // ── Swiper พร้อม: เริ่ม timer ถ้า slide แรกเป็นรูปภาพ ────
  const handleSwiperInit = useCallback((swiper) => {
    swiperRef.current = swiper;
    const firstItem = department?.gallery?.[0];
    if (firstItem?.type !== 'video') startImageTimer();
  }, [department, startImageTimer]);

  // ── cleanup timers เมื่อออกจากหน้า ───────────────────────
  useEffect(() => () => {
    clearTimeout(imageTimerRef.current);
    clearTimeout(postVideoRef.current);
  }, []);

  if (!department) {
    return (
      <div className="pt-32 text-center text-2xl font-bold text-red-500 min-h-screen">
        ไม่พบข้อมูลหน่วยงานนี้
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-8 max-w-5xl mx-auto min-h-screen">

      {/* Header */}
      <div className="relative flex items-center mb-10 px-4">
        <Link to="/" className="z-10">
          <img
            src="/back.png"
            alt="ย้อนกลับ"
            className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer"
          />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-4xl font-bold text-slate-800 text-center w-max">
          {department.title}
        </h1>
      </div>

      {/* ════════════════════════════════════════════════════
           SECTION 6.1 — SLIDER CONTAINER
           - overflow-hidden บน wrapper ทำให้วิดีโอเต็มกรอบ
           - ไม่ใช้ Swiper autoplay — จัดการเองผ่าน setTimeout
          ════════════════════════════════════════════════════ */}
      <div className="w-full h-[400px] md:h-[500px] mb-12 rounded-3xl overflow-hidden shadow-2xl bg-black">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          allowTouchMove={true}
          autoplay={false}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          className="w-full h-full"
        >
          {department.gallery.map((item, index) => (
            <SwiperSlide
              key={index}
              className="w-full h-full flex justify-center items-center bg-black"
            >
              {({ isActive }) => (
                item.type === 'video' ? (
                  // วิดีโอ: ใช้ YouTubeSlide ที่มี overlay block interaction
                  <YouTubeSlide
                    url={item.url}
                    isActive={isActive}
                    onVideoEnded={handleVideoEnded}
                  />
                ) : (
                  // รูปภาพ: เต็มกรอบด้วย object-cover
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

      {/* รายละเอียดหน่วยงาน */}
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