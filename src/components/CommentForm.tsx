import React, { useState, useRef, useEffect } from 'react'

const MAX_COMMENT_LENGTH = 500
const MIN_COMMENT_LENGTH = 10
// Rate limit: ส่งได้ไม่เกิน 3 ครั้งต่อ 60 วินาที (Client-side guard เบื้องต้น)
const RATE_LIMIT_COUNT = 3
const RATE_LIMIT_WINDOW_MS = 60_000

const CommentForm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
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

  // Rate limit tracking
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
    // Real-time validation feedback
    if (val.trim().length > 0 && val.trim().length < MIN_COMMENT_LENGTH) {
      setContentError(`กรุณากรอกอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร`)
    } else {
      setContentError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate ความยาวข้อความ
    if (content.trim().length < MIN_COMMENT_LENGTH) {
      setContentError(`กรุณากรอกอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร`)
      return
    }

    // Client-side Rate Limiting
    const now = Date.now()
    submitTimestamps.current = submitTimestamps.current.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS
    )
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
        setContent('')
        setRating(5)
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
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none hidden'
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
              <div>
                <label className='text-xs text-neutral-400 uppercase font-bold tracking-wider'>คะแนนความพึงพอใจ</label>
                <div className='flex gap-2 mt-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type='button' onClick={() => setRating(star)} aria-label={`ให้คะแนน ${star} ดาว`} className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-neutral-600'}`}>★</button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder='พิมพ์ข้อความของคุณที่นี่...'
                  required
                  minLength={MIN_COMMENT_LENGTH}
                  maxLength={MAX_COMMENT_LENGTH}
                  className='w-full bg-neutral-700 border border-neutral-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none'
                />
                <div className='flex justify-between items-center mt-1'>
                  <span className='text-xs text-red-400'>{contentError}</span>
                  <span className='text-xs text-neutral-500'>{content.length}/{MAX_COMMENT_LENGTH}</span>
                </div>
              </div>

              <button
                type='submit'
                disabled={isSubmitting || content.trim().length < MIN_COMMENT_LENGTH}
                className={`py-2 rounded-lg font-bold text-sm transition text-white ${
                  isSubmitting || content.trim().length < MIN_COMMENT_LENGTH
                    ? 'bg-blue-800 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
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