import React, { useEffect, useRef, useState } from 'react'
import { useContentStore } from '../stores/useContentStore'
import type { CommentFormData } from '../type'

const MAX_COMMENT_LENGTH = 500
const MIN_COMMENT_LENGTH = 10

const CommentForm = () => {
  // Bind shared actions and layout validation markers from the central Zustand store
  const submitUserComment = useContentStore((state) => state.submitUserComment)
  const isSubmitting = useContentStore((state) => state.isSubmittingComment)
  const contentError = useContentStore((state) => state.commentError)
  const setCommentError = useContentStore((state) => state.setCommentError)
  const fetchPublicData = useContentStore((state) => state.fetchPublicData)

  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState<CommentFormData>({
    rating: 0,
    content: '',
    botField: '',
  })

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
      snapY = 88
    } else {
      setSnapVertical('bottom')
      snapY = screenHeight - iconSize - 24
    }

    setPosition({ x: snapX, y: snapY })
  }

  const handleOpenClick = () => {
    if (!dragInfo.current.isMoved) {
      setIsOpen(true)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setFormData((prev) => ({ ...prev, content: val }))
    if (val.trim().length > 0 && val.trim().length < MIN_COMMENT_LENGTH) {
      setCommentError(`กรุณากรอกอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร`)
    } else {
      setCommentError('')
    }
  }

  const resetForm = () => {
    setFormData({ rating: 0, content: '', botField: '' })
  }

  const setSubmitTimestamps = (timestamps: number[]) => {
    submitTimestamps.current = timestamps
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitUserComment(
      formData,
      submitTimestamps.current,
      setSubmitTimestamps,
      resetForm,
      setIsOpen,
      fetchPublicData,
    )
  }

  const getFormPlacementClass = () => {
    if (snapVertical === 'top' && snapSide === 'left')
      return 'top-0 left-0 origin-top-left'
    if (snapVertical === 'top' && snapSide === 'right')
      return 'top-0 right-0 origin-top-right'
    if (snapVertical === 'bottom' && snapSide === 'left')
      return 'bottom-0 left-0 origin-bottom-left'
    return 'bottom-0 right-0 origin-bottom-right'
  }

  return (
    <div
      className='fixed top-0 left-0 z-[9999] font-sans touch-none'
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging
          ? 'none'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className='relative w-14 h-14'>
        {/* ปุ่มลอยเรียกฟอร์ม: เน้นขอบเส้นสีเข้ม คมชัดเจน */}
        {!isOpen && (
          <button
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleOpenClick}
            aria-label='เปิดฟอร์มแสดงความคิดเห็น'
            className={`absolute bottom-0 right-0 w-14 h-14 bg-white text-stone-900 rounded-full border-2 border-stone-900 shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-300 ${
              isDragging
                ? 'scale-105 cursor-grabbing bg-stone-100 border-stone-900'
                : 'cursor-grab hover:scale-105 active:scale-95 hover:bg-stone-900 hover:text-white hover:border-stone-900'
            }`}
          >
            <svg
              className='w-6 h-6 stroke-[2]'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z'
              />
            </svg>
          </button>
        )}

        {/* ตัวกล่องฟอร์ม: พื้นขาวจ๋าตัดเส้นขอบสีเข้ม ตัวหนังสือเข้มจัดมองเห็นง่าย */}
        <div
          className={`absolute ${getFormPlacementClass()} transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen
              ? 'scale-100 opacity-100 pointer-events-auto'
              : 'scale-95 opacity-0 pointer-events-none'
          }`}
        >
          <div className='bg-white w-80 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border-2 border-stone-900 overflow-hidden'>
            {/* ส่วนหัวกลุ่มข้อความ */}
            <div className='px-5 pt-5 pb-1 flex justify-between items-center bg-stone-50 border-b border-stone-200'>
              <span className='text-sm font-bold tracking-tight text-stone-900'>
                ข้อเสนอแนะและรีวิว
              </span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label='ปิดฟอร์ม'
                className='text-stone-600 hover:text-stone-950 transition-colors p-1 rounded-md hover:bg-stone-200 border border-transparent hover:border-stone-300'
              >
                <svg
                  className='w-4 h-4 stroke-[2.5]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-5'>
              {/* ดักบอท */}
              <div
                className='absolute opacity-0 -z-10 h-0 w-0 overflow-hidden'
                aria-hidden='true'
              >
                <input
                  type='text'
                  value={formData.botField}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      botField: e.target.value,
                    }))
                  }
                  tabIndex={-1}
                  autoComplete='off'
                />
              </div>

              {/* คะแนนความพึงพอใจ */}
              <div>
                <label className='text-xs font-bold uppercase tracking-wider text-stone-900'>
                  คะแนนความพึงพอใจ
                </label>
                <div className='flex gap-1.5 mt-1.5'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rating: star }))
                      }
                      aria-label={`ให้คะแนน ${star} ดาว`}
                      className='text-2xl transition-all duration-150 transform active:scale-90'
                    >
                      <span
                        className={`${
                          star <= formData.rating
                            ? 'text-amber-500 drop-shadow-[0_1px_2px_rgba(217,119,6,0.2)]'
                            : 'text-stone-300 hover:text-stone-400'
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ช่องป้อนความคิดเห็น */}
              <div>
                <label className='text-xs font-bold uppercase tracking-wider text-stone-900'>
                  ความคิดเห็นของคุณ
                </label>
                <textarea
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder='พิมพ์ข้อความแชร์ประสบการณ์ของคุณที่นี่...'
                  required
                  maxLength={MAX_COMMENT_LENGTH}
                  className='w-full mt-1.5 bg-white border-2 border-stone-800 text-stone-950 font-medium rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 h-24 resize-none placeholder-stone-500 shadow-sm transition-all'
                />
                <div className='flex justify-between items-center mt-1'>
                  <span className='text-[11px] text-red-600 font-bold'>
                    {contentError}
                  </span>
                  <span className='text-xs text-stone-700 font-semibold tracking-wide'>
                    {formData.content.length}/{MAX_COMMENT_LENGTH}
                  </span>
                </div>
              </div>

              {/* ปุ่มส่ง */}
              <button
                type='submit'
                disabled={
                  isSubmitting ||
                  formData.content.trim().length < MIN_COMMENT_LENGTH ||
                  formData.rating === 0
                }
                className={`py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 text-white flex items-center justify-center gap-2 ${
                  isSubmitting ||
                  formData.content.trim().length < MIN_COMMENT_LENGTH ||
                  formData.rating === 0
                    ? 'bg-stone-300 border-2 border-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                    : 'bg-stone-900 border-2 border-stone-900 hover:bg-black hover:border-black active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className='animate-spin h-3.5 w-3.5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  'ส่งข้อเสนอแนะ'
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
