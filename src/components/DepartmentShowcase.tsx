import { useEffect, useRef, useState, useContext, useMemo } from 'react'
import { NewsContext } from '../context/NewsContext'

const DepartmentShowcase = () => {
  // 🌟 State สำหรับ Desktop
  const [activeIndex, setActiveIndex] = useState(0)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  // 🌟 State สำหรับ Mobile (Horizontal Scroll-jacking)
  const [mobileScrollProgress, setMobileScrollProgress] = useState(0)
  const mobileContainerRef = useRef<HTMLDivElement>(null)

  const context = useContext(NewsContext)
  const departments = useMemo(() => context?.departmentList || [], [context?.departmentList])

  // ==========================================
  // 💻 Logic สำหรับ Desktop
  // ==========================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(index)
          }
        })
      },
      { rootMargin: '-50% 0px -50% 0px' }
    )

    setTimeout(() => {
      imageRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref)
      })
    }, 100)

    return () => observer.disconnect()
  }, [departments])

  const handleScrollTo = (index: number) => {
    setActiveIndex(index)
    imageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // ==========================================
  // 📱 Logic สำหรับ Mobile
  // ==========================================
  useEffect(() => {
    const handleMobileScroll = () => {
      if (!mobileContainerRef.current) return
      
      const rect = mobileContainerRef.current.getBoundingClientRect()
      const scrollStart = rect.top
      const scrollDistance = rect.height - window.innerHeight

      if (scrollStart > 0) {
        setMobileScrollProgress(0)
      } else if (-scrollStart > scrollDistance) {
        setMobileScrollProgress(1)
      } else {
        setMobileScrollProgress(-scrollStart / scrollDistance)
      }
    }

    window.addEventListener('scroll', handleMobileScroll, { passive: true })
    handleMobileScroll() 
    
    return () => window.removeEventListener('scroll', handleMobileScroll)
  }, [])

  const stripHtmlToText = (html?: string) => {
    if (!html) return 'ไม่มีข้อมูลรายละเอียด'
    return html.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
  }

  if (departments.length === 0) return null

  return (
    <section className="bg-transparent text-slate-800 py-8 md:py-12 font-sans relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Header Section */}
        <div className="mb-12 md:mb-20 max-w-2xl">
          <p className="text-blue-600 font-bold tracking-widest text-xs md:text-sm uppercase mb-3">
            โครงสร้างองค์กร
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-slate-900">
            หน่วยงานภายใน ปปง.
          </h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            องค์กรถูกขับเคลื่อนด้วย {departments.length} กองหลักที่ทำงานประสานกัน 
            เพื่อป้องกันและปราบปรามอาชญากรรมทางการเงินอย่างมีประสิทธิภาพ
          </p>
        </div>

        {/* ========================================== */}
        {/* 💻 ส่วนแสดงผลสำหรับ DESKTOP */}
        {/* ========================================== */}
        <div className="hidden md:flex flex-row gap-10 md:gap-20 relative">
          
          {/* 👈 ฝั่งซ้าย: ตัวหนังสือ (Sticky) */}
          <div className="w-5/12">
            <div className="sticky top-[20vh] flex flex-col gap-6">
              {departments.map((dept, index) => {
                const isActive = activeIndex === index
                const code = `0${index + 1}`.slice(-2) 

                return (
                  <div
                    key={dept.id}
                    onClick={() => handleScrollTo(index)}
                    className={`cursor-pointer transition-all duration-500 pl-6 border-l-2 ${
                      isActive ? 'border-blue-600 opacity-100' : 'border-slate-200 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <p className="text-xs font-bold text-blue-600 mb-1 tracking-wider uppercase">กอง {code}</p>
                    <h3 className={`text-2xl font-bold transition-colors duration-500 ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                      {dept.title}
                    </h3>
                    <div className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="text-slate-500 leading-relaxed text-sm pt-3 pb-2">
                          {stripHtmlToText(dept.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 👉 ฝั่งขวา: รูปภาพ (อัปเกรด Focus Scale Effect) */}
          <div className="w-7/12 flex flex-col pb-[30vh]">
            {departments.map((dept, index) => {
              // 🌟 เช็คว่ารูปนี้กำลัง Active อยู่ไหม
              const isActive = activeIndex === index;

              return (
                <div 
                  key={dept.id} 
                  data-index={index} 
                  ref={(el) => { imageRefs.current[index] = el }} 
                  // 🌟 ลดระยะห่างเหลือ mb-[25vh] ให้รูปชิดกันมากขึ้นแต่ยังมีสเปซ
                  className="mb-[25vh] last:mb-0 w-full flex items-center justify-center"
                >
                  {/* 🌟 กล่องรูปภาพ: ถ้ายกเลิก Active ให้หดเหลือ 85% และจางลง / ถ้า Active ให้เด้งเต็ม 100% */}
                  <div 
                    className={`w-full aspect-[16/10] rounded-3xl overflow-hidden relative bg-slate-100 border border-slate-200 origin-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                      ${isActive ? 'scale-100 opacity-100 shadow-2xl ring-4 ring-blue-500/10' : 'scale-[0.85] opacity-40 shadow-sm'}
                    `}
                  >
                    <img src={dept.cover_image} alt={dept.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📱 ส่วนแสดงผลสำหรับ MOBILE (Sticky Horizontal Slide คงเดิม) */}
      {/* ========================================== */}
      <div 
        ref={mobileContainerRef} 
        className="md:hidden relative w-full"
        style={{ height: `${departments.length * 100}vh` }} 
      >
        <div className="sticky top-[10vh] h-[80vh] w-full overflow-hidden flex flex-col justify-center">
          
          <div 
            className="flex h-[60vh] items-center will-change-transform"
            style={{
              width: `${departments.length * 100}%`,
              transform: `translateX(-${mobileScrollProgress * (100 - 100 / departments.length)}%)`,
            }}
          >
            {departments.map((dept, index) => {
              const code = `0${index + 1}`.slice(-2)

              return (
                <div key={dept.id} className="w-full h-full px-6 flex flex-col justify-center">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col h-full max-h-[500px]">
                    <div className="h-[45%] w-full relative shrink-0 bg-slate-200">
                      <img src={dept.cover_image} alt={dept.title} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                        กอง {code}
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{dept.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">
                        {stripHtmlToText(dept.content)}
                      </p>
                      <div className="mt-auto pt-4 flex items-center text-blue-600 font-semibold text-sm">
                        รายละเอียด <span className="ml-1">➔</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex justify-center gap-2 px-6">
            {departments.map((_, i) => {
              const isActive = Math.round(mobileScrollProgress * (departments.length - 1)) === i
              return (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`} 
                />
              )
            })}
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-3 font-medium tracking-wide flex items-center justify-center gap-1 opacity-70">
            <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            เลื่อนลงเพื่อดูเพิ่มเติม
          </div>

        </div>
      </div>
    </section>
  )
}

export default DepartmentShowcase