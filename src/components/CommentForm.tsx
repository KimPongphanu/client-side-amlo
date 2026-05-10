import React, { useState, useRef, useEffect } from 'react'

const CommentForm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🌟 จุดแก้ปัญหา UI Jump: ดึงขนาดจอมาใส่เป็นค่าเริ่มต้นตั้งแต่ตอนประกาศ State เลย!
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 80, 
    y: window.innerHeight - 80 
  })
  
  const [isDragging, setIsDragging] = useState(false)
  
  // เช็คแกน Y (top, bottom) ควบคู่กับแกน X (left, right)
  const [snapSide, setSnapSide] = useState('right') 
  const [snapVertical, setSnapVertical] = useState('bottom') 
  
  const dragInfo = useRef({ startX: 0, startY: 0, isMoved: false })

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOpen) return; 
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfo.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
      isMoved: false,
    };
    setIsDragging(true);
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragInfo.current.isMoved = true;
    setPosition({
      x: e.clientX - dragInfo.current.startX,
      y: e.clientY - dragInfo.current.startY,
    });
  }

  // 🌟 อัปเกรด useEffect: ให้มันรู้ว่าตอนนี้ปุ่มเกาะขอบไหนอยู่ จะได้ขยายจอตามถูกฝั่ง
  useEffect(() => {
    const handleResize = () => {
      setPosition((prevPos) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const iconSize = 56; 

        let newX = prevPos.x;
        let newY = prevPos.y;

        // ลอจิกใหม่: ถ้ายูสเซอร์เคยลากไปเกาะขวา ก็จับมันย้ายไปขอบขวาสุดของจอใหม่เสมอ!
        if (snapSide === 'right') {
          newX = screenWidth - iconSize - 24;
        } 
        // ถ้าเคยเกาะซ้าย ก็ให้มันอยู่ที่ 24px เสมอ
        else if (snapSide === 'left') {
          newX = 24;
        }

        // กันทะลุล่าง
        if (newY > screenHeight - iconSize - 24) {
          newY = screenHeight - iconSize - 24;
        }
        // กันทะลุบน (Nav)
        if (newY < 88) {
          newY = 88;
        }

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    
  }, [snapSide]); // 🌟 สำคัญมาก: ดึงค่า snapSide ล่าสุดมาใช้คำนวณ

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const iconSize = 56; 

    let snapX = position.x;
    let snapY = position.y;

    // เช็คแกน X (ซ้าย/ขวา)
    if (position.x + iconSize / 2 < screenWidth / 2) {
      snapX = 24; 
      setSnapSide('left');
    } else {
      snapX = screenWidth - iconSize - 24; 
      setSnapSide('right');
    }

    // เช็คแกน Y (บน/ล่าง)
    if (position.y + iconSize / 2 < screenHeight / 2) {
      setSnapVertical('top'); 
    } else {
      setSnapVertical('bottom'); 
    }

    // จุดแก้ปัญหาทะลุขอบ: 64 คือความสูง Nav (h-16) + 24 (Margin) รวมเป็น 88px
    if (snapY < 88) snapY = 88;
    if (snapY > screenHeight - iconSize - 24) snapY = screenHeight - iconSize - 24;

    setPosition({ x: snapX, y: snapY });
  }

  const handleOpenClick = () => {
    if (!dragInfo.current.isMoved) {
      setIsOpen(true);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }), 
      })

      if (response.ok) {
        alert('ส่งความคิดเห็นสำเร็จ ขอบคุณครับ!')
        setContent('')
        setRating(5)
        setIsOpen(false)
      } else {
        alert('ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ฟังก์ชันคำนวณ Class ฝั่ง Tailwind แบบครอบคลุม 4 มุมจอ
  const getFormPlacementClass = () => {
    if (snapVertical === 'top' && snapSide === 'left') return 'top-0 left-0 origin-top-left';
    if (snapVertical === 'top' && snapSide === 'right') return 'top-0 right-0 origin-top-right';
    if (snapVertical === 'bottom' && snapSide === 'left') return 'bottom-0 left-0 origin-bottom-left';
    return 'bottom-0 right-0 origin-bottom-right'; 
  };

  return (
    <div 
      className='fixed top-0 left-0 z-[9999] font-sans touch-none'
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div className="relative w-14 h-14">
        
        {!isOpen && (
          <button
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleOpenClick} 
            className={`absolute bottom-0 right-0 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all ${
              isDragging ? 'scale-110 cursor-grabbing bg-blue-700' : 'cursor-grab hover:scale-110 active:scale-95 hover:bg-blue-700'
            }`}
          >
            <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' />
            </svg>
          </button>
        )}

        <div
          className={`absolute ${getFormPlacementClass()} transform transition-all duration-300 ease-out ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none hidden'
          }`}
        >
          <div className='bg-neutral-800 w-80 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden'>
            <div className='bg-blue-600 p-4 flex justify-between items-center'>
              <span className='font-bold text-white'>แสดงความคิดเห็น</span>
              <button onClick={() => setIsOpen(false)} className='text-white/80 hover:text-white text-2xl leading-none'>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className='p-4 flex flex-col gap-4'>
              <div>
                <label className='text-xs text-neutral-400 uppercase font-bold tracking-wider'>คะแนนความพึงพอใจ</label>
                <div className='flex gap-2 mt-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type='button' onClick={() => setRating(star)} className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-neutral-600'}`}>★</button>
                  ))}
                </div>
              </div>

              <div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder='พิมพ์ข้อความของคุณที่นี่...' required className='w-full bg-neutral-700 border border-neutral-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none'></textarea>
              </div>

              <button type='submit' disabled={isSubmitting} className={`py-2 rounded-lg font-bold text-sm transition text-white ${isSubmitting ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งความคิดเห็น'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CommentForm