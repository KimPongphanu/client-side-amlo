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
//  SECTION 4 — COMPONENT: YouTubeSlide
//
//  หน้าที่:
//    1. สร้าง YT Player ใหม่ทุกครั้งที่ isActive = true
//       (แก้ปัญหา loop: DOM ถูก YT replace → ref ชี้ผิด)
//    2. Destroy player ทุกครั้งที่ isActive = false
//       พร้อม reset DOM ให้สะอาดรอรอบถัดไป
//    3. Block การโต้ตอบจากผู้ใช้ด้วย Overlay div
//    4. แจ้ง parent ผ่าน onVideoEnded เมื่อคลิปจบ
//    5. Fallback: ข้ามอัตโนมัติถ้าคลิปไม่เริ่มเล่น
// ════════════════════════════════════════════════════════════
const YouTubeSlide = ({ url, isActive, onVideoEnded }) => {
  const containerRef = useRef(null); // div ที่ YT จะ inject iframe เข้ามา
  const playerRef    = useRef(null); // YT.Player instance
  const onEndedRef   = useRef(onVideoEnded); // ref เก็บ callback ล่าสุด (ป้องกัน stale closure)
  const fallbackRef  = useRef(null); // setTimeout handle สำหรับ fallback
  const playingRef   = useRef(false); // ติดตามว่ากำลังเล่นอยู่จริงไหม

  const videoId = getYouTubeId(url);

  // ── sync callback ref ทุก render ──────────────────────────
  useEffect(() => { onEndedRef.current = onVideoEnded; }, [onVideoEnded]);

  // ── helper: จัดการ fallback timer ─────────────────────────
  const clearFallback = () => clearTimeout(fallbackRef.current);
  const startFallback = () => {
    clearFallback();
    fallbackRef.current = setTimeout(() => {
      // ไม่มี PLAYING state ใน FALLBACK_MS วิ → ถือว่าจบ
      onEndedRef.current?.();
    }, FALLBACK_MS);
  };

  // ── lifecycle หลัก: สร้าง/destroy player ตาม isActive ────
  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    clearFallback();
    playingRef.current = false;

    // ─── ออกจาก slide: cleanup สมบูรณ์ ───────────────────
    if (!isActive) {
      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
      return;
    }

    // ─── เข้า slide: สร้าง player ใหม่ทุกครั้ง ────────────
    let cancelled = false;

    loadYTScript().then(() => {
      if (cancelled || !containerRef.current) return;

      // destroy ของเก่าก่อน (กันซ้ำ)
      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;

      // สร้าง div target ใหม่ — YT API จะ replace div นี้ด้วย iframe
      const target = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(target);

      playerRef.current = new window.YT.Player(target, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,         // ซ่อน control bar ของ YouTube
          modestbranding: 1,   // ลด YouTube logo
          rel: 0,              // ไม่แสดงวิดีโอแนะนำตอนจบ
          fs: 0,               // ปิดปุ่ม Fullscreen (overlay ทับอยู่)
          playsinline: 1,
          disablekb: 1,        // ปิด keyboard shortcut (spacebar, arrow keys)
          iv_load_policy: 3,   // ซ่อน annotations
          cc_load_policy: 0,   // ซ่อน closed captions
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            e.target.playVideo();
            startFallback(); // เริ่ม fallback เผื่อ autoplay โดน block
          },
          onStateChange: (e) => {
            if (cancelled) return;
            const S = window.YT.PlayerState;

            if (e.data === S.PLAYING) {
              clearFallback();        // เล่นได้จริง → ยกเลิก fallback
              playingRef.current = true;

            } else if (e.data === S.ENDED) {
              clearFallback();
              playingRef.current = false;
              onEndedRef.current?.(); // แจ้ง parent ว่าจบแล้ว

            } else if (e.data === S.PAUSED || e.data === S.BUFFERING) {
              // ถ้ายังไม่เคย PLAYING มาก่อน → เริ่ม fallback รอ
              if (!playingRef.current) startFallback();
            }
          },
          onError: () => {
            // คลิปเสีย / ถูก block → ข้าม slide ทันที
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, videoId]);

  // ── cleanup เมื่อ component unmount ───────────────────────
  useEffect(() => () => {
    clearFallback();
    try { playerRef.current?.destroy(); } catch (_) {}
    playerRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!videoId) return null;

  return (
    // ════════════════════════════════════════════════════════
    //  SECTION 4.1 — OVERLAY LAYER (หัวใจของฟีเจอร์นี้)
    //
    //  โครงสร้าง: position relative wrapper
    //    ├── div#container  → YT inject iframe เข้ามาที่นี่
    //    └── div#overlay    → ทับ iframe ทั้งหมด 100%
    //
    //  Overlay ทำหน้าที่:
    //    - pointer-events: all  → รับ mouse/touch event ทั้งหมดแทน iframe
    //    - user-select: none    → ป้องกันการ select text
    //    - background: transparent → มองไม่เห็น แต่ block interaction ได้
    //    - z-index สูงกว่า iframe → อยู่บนสุดเสมอ
    //
    //  ผลลัพธ์:
    //    ✅ วิดีโอเล่นปกติ (YT Player API ควบคุมผ่าน JS)
    //    ✅ ไม่มี control bar / progress bar
    //    ✅ Hover ไม่ขึ้น UI ของ YouTube
    //    ✅ ไม่สามารถคลิก pause / seek / ปรับ volume ได้
    //    ✅ ไม่สามารถ drag เพื่อ seek ได้
    //    ⚠️ Fullscreen ใช้ไม่ได้ (trade-off ที่ยอมรับได้)
    // ════════════════════════════════════════════════════════
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* iframe container — YT API จะ inject เข้ามาที่นี่ */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Overlay: block การโต้ตอบจากผู้ใช้ทั้งหมด */}
      <div
        style={{
          position: 'absolute',
          inset: 0,                    // top/right/bottom/left = 0 (เต็มพื้นที่)
          zIndex: 10,                  // อยู่เหนือ iframe เสมอ
          background: 'transparent',   // มองไม่เห็น
          pointerEvents: 'all',        // รับ event ทั้งหมดแทน iframe
          userSelect: 'none',          // ป้องกัน text selection
          WebkitUserSelect: 'none',    // Safari
          cursor: 'default',           // cursor ปกติ ไม่ให้รู้สึกว่า clickable
        }}
        // กัน context menu (คลิกขวา) บน overlay
        onContextMenu={(e) => e.preventDefault()}
      />

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