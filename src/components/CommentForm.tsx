import React, { useState, useRef, useEffect } from 'react'

const MAX_COMMENT_LENGTH = 500
const MIN_COMMENT_LENGTH = 10
const RATE_LIMIT_COUNT = 3
const RATE_LIMIT_WINDOW_MS = 60_000
// 🌟 เพิ่ม Cooldown 1 นาทีหลังส่งสำเร็จ (รอดจากการกด F5)
const SUCCESS_COOLDOWN_MS = 60_000 

const CommentForm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0) // 🌟 เปลี่ยนเป็น 0 บังคับให้ต้องกดดาว (Star Trap)
  const [content, setContent] = useState('')
  const [botField, setBotField] = useState('') // 🌟 State สำหรับ Honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contentError, setContentError] = useState('')

  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [snapSide, setSnapSide] = useState('right')
  const [snapVertical, setSnapVertical] = useState('bottom')

  const dragInfo = useRef({ startX: 0, startY: 0, isMoved: false })
  const submitTimestamps = useRef<number[]>([])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOpen) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragInfo.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
      isMoved: false,
    }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    dragInfo.current.isMoved = true
    setPosition({
      x: e.clientX - dragInfo.current.startX,
      y: e.clientY - dragInfo.current.startY,
    })
  }

  useEffect(() => {
    const handleResize = () => {
      setPosition((prevPos) => {
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        const iconSize = 56

        let newX = prevPos.x
        let newY = prevPos.y

        if (snapSide === 'right') {
          newX = screenWidth - iconSize - 24
        } else if (snapSide === 'left') {
          newX = 24
        }

        if (newY > screenHeight - iconSize - 24) {
          newY = screenHeight - iconSize - 24
        }
        if (newY < 88) {
          newY = 88
        }

        return { x: newX, y: newY }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [snapSide])

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const iconSize = 56

    let snapX = position.x
    let snapY = position.y

    if (position.x + iconSize / 2 < screenWidth / 2) {
      snapX = 24
      setSnapSide('left')
    } else {
      snapX = screenWidth - iconSize - 24
      setSnapSide('right')
    }

    if (position.y + iconSize / 2 < screenHeight / 2) {
      setSnapVertical('top')
    } else {
      setSnapVertical('bottom')
    }

    if (snapY < 88) snapY = 88
    if (snapY > screenHeight - iconSize - 24) snapY = screenHeight - iconSize - 24

    setPosition({ x: snapX, y: snapY })
  }

  const handleOpenClick = () => {
    if (!dragInfo.current.isMoved) {
      setIsOpen(true)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)
    if (val.trim().length > 0 && val.trim().length < MIN_COMMENT_LENGTH) {
      setContentError(`กรุณากรอกอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร`)
    } else {
      setContentError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🌟 1. Honeypot Check
    if (botField) {
      console.warn('Bot trapped!')
      alert('ส่งความคิดเห็นสำเร็จ ขอบคุณครับ!') // เนียนหลอกบอท
      setContent(''); setRating(0); setBotField(''); setIsOpen(false)
      return
    }

    // 🌟 2. Star Trap: บังคับให้คะแนน
    if (rating === 0) {
      alert('กรุณาให้คะแนนความพึงพอใจก่อนส่งความคิดเห็นครับ')
      return
    }

    // Validate ความยาว
    if (content.trim().length < MIN_COMMENT_LENGTH) {
      setContentError(`กรุณากรอกอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร`)
      return
    }

    // 🌟 3. Anti-Link (กันสแปมเว็บพนัน)
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i
    if (urlRegex.test(content)) {
      alert('ไม่อนุญาตให้แนบลิงก์ในความคิดเห็นครับ')
      return
    }

    const now = Date.now()

    // 🌟 4. Cooldown Check (กันคนกด F5 มารัวส่ง)
    const lastSuccessTime = localStorage.getItem('comment_last_success')
    if (lastSuccessTime && now - parseInt(lastSuccessTime) < SUCCESS_COOLDOWN_MS) {
      const waitTime = Math.ceil((SUCCESS_COOLDOWN_MS - (now - parseInt(lastSuccessTime))) / 1000)
      alert(`คุณเพิ่งส่งความคิดเห็นไป กรุณารอ ${waitTime} วินาทีแล้วลองใหม่ครับ`)
      return
    }

    // Client-side Rate Limiting (กันปุ่มเบิ้ล)
    submitTimestamps.current = submitTimestamps.current.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (submitTimestamps.current.length >= RATE_LIMIT_COUNT) {
      alert('ส่งความคิดเห็นบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่')
      return
    }

    setIsSubmitting(true)
    submitTimestamps.current.push(now)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content: content.trim() }),
      })

      if (response.ok) {
        alert('ส่งความคิดเห็นสำเร็จ ขอบคุณครับ!')
        // บันทึกเวลาส่งสำเร็จลง LocalStorage
        localStorage.setItem('comment_last_success', now.toString())
        setContent('')
        setRating(0)
        setContentError('')
        setIsOpen(false)
      } else {
        alert('ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่')
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFormPlacementClass = () => {
    if (snapVertical === 'top' && snapSide === 'left') return 'top-0 left-0 origin-top-left'
    if (snapVertical === 'top' && snapSide === 'right') return 'top-0 right-0 origin-top-right'
    if (snapVertical === 'bottom' && snapSide === 'left') return 'bottom-0 left-0 origin-bottom-left'
    return 'bottom-0 right-0 origin-bottom-right'
  }

  return (
    <div
      className='fixed top-0 left-0 z-[9999] font-sans touch-none'
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div className='relative w-14 h-14'>

        {!isOpen && (
          <button
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleOpenClick}
            aria-label='เปิดฟอร์มแสดงความคิดเห็น'
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
            isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
          }`}
        >
          <div className='bg-neutral-800 w-80 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden'>
            <div className='bg-blue-600 p-4 flex justify-between items-center'>
              <span className='font-bold text-white'>แสดงความคิดเห็น</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label='ปิดฟอร์ม'
                className='text-white/80 hover:text-white text-2xl leading-none'
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-4 flex flex-col gap-4'>
              
              {/* 🌟 Honeypot Field ซ่อนไว้ */}
              <div className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="botField">Leave blank if human</label>
                <input type="text" id="botField" value={botField} onChange={(e) => setBotField(e.target.value)} tabIndex={-1} autoComplete="off"/>
              </div>

              <div>
                <label className='text-xs text-neutral-400 uppercase font-bold tracking-wider'>คะแนนความพึงพอใจ</label>
                <div className='flex gap-2 mt-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type='button' 
                      onClick={() => setRating(star)} 
                      aria-label={`ให้คะแนน ${star} ดาว`} 
                      className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder='พิมพ์ข้อความของคุณที่นี่ (ไม่อนุญาตให้แนบลิงก์)'
                  required
                  maxLength={MAX_COMMENT_LENGTH}
                  className='w-full bg-neutral-700 border border-neutral-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none placeholder-neutral-400'
                />
                <div className='flex justify-between items-center mt-1'>
                  <span className='text-xs text-red-400'>{contentError}</span>
                  <span className='text-xs text-neutral-500'>{content.length}/{MAX_COMMENT_LENGTH}</span>
                </div>
              </div>

              <button
                type='submit'
                disabled={isSubmitting || content.trim().length < MIN_COMMENT_LENGTH || rating === 0}
                className={`py-2 rounded-lg font-bold text-sm transition text-white flex items-center justify-center gap-2 ${
                  isSubmitting || content.trim().length < MIN_COMMENT_LENGTH || rating === 0
                    ? 'bg-blue-800 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังส่ง...
                  </>
                ) : (
                  'ส่งความคิดเห็น'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CommentForm