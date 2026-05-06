import React, { useState } from 'react'

const CommentForm = () => {
  // สร้าง State เก็บสถานะต่างๆ
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ฟังก์ชันจัดการตอนกดส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault() // ป้องกันไม่ให้หน้าเว็บรีเฟรช
    setIsSubmitting(true)

    try {
      // ตรงนี้คือจุดที่ยิงไปหา Express Backend ของคุณ
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }), // ส่งคะแนนและข้อความไป
      })

      if (response.ok) {
        alert('ส่งความคิดเห็นสำเร็จ ขอบคุณครับ!')
        // เคลียร์ค่าฟอร์มและปิดหน้าต่าง
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

  return (
    // คอนเทนเนอร์หลัก ล็อคตำแหน่งไว้มุมขวาล่าง
    <div className='fixed bottom-6 right-6 z-50 font-sans'>
      {/* 1. ปุ่ม Avatar วงกลม (โชว์ตอน isOpen เป็น false) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95'
        >
          {/* ไอคอนข้อความ (SVG) */}
          <svg
            className='w-7 h-7'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
            ></path>
          </svg>
        </button>
      )}

      {/* 2. กล่อง Form (โชว์ตอน isOpen เป็น true) */}
      {/* ใช้ Tailwind origin-bottom-right เพื่อให้มันขยายขึ้นมาจากมุม */}
      <div
        className={`transform transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0 pointer-events-none hidden'
        }`}
      >
        <div className='bg-neutral-800 w-80 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden'>
          {/* Header ของกล่อง */}
          <div className='bg-blue-600 p-4 flex justify-between items-center'>
            <span className='font-bold text-white'>แสดงความคิดเห็น</span>
            <button
              onClick={() => setIsOpen(false)}
              className='text-white/80 hover:text-white text-2xl leading-none'
            >
              &times;
            </button>
          </div>

          {/* ส่วนฟอร์ม */}
          <form onSubmit={handleSubmit} className='p-4 flex flex-col gap-4'>
            {/* เลือกระดับคะแนน */}
            <div>
              <label className='text-xs text-neutral-400 uppercase font-bold tracking-wider'>
                คะแนนความพึงพอใจ
              </label>
              <div className='flex gap-2 mt-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-neutral-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* ช่องพิมพ์ข้อความ */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='พิมพ์ข้อความของคุณที่นี่...'
                required
                className='w-full bg-neutral-700 border border-neutral-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none'
              ></textarea>
            </div>

            {/* ปุ่ม Submit */}
            <button
              type='submit'
              disabled={isSubmitting}
              className={`py-2 rounded-lg font-bold text-sm transition text-white ${
                isSubmitting
                  ? 'bg-blue-800 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งความคิดเห็น'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CommentForm
