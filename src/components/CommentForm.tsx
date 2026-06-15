// src/components/CommentForm.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useContentStore } from '../stores/useContentStore'
import type { CommentFormData } from '../type'
import { toast } from '../utils/swalConfig'

const MAX_COMMENT_LENGTH = 500
const MIN_COMMENT_LENGTH = 10

const CommentForm = () => {
  const submitUserComment = useContentStore((state) => state.submitUserComment)
  const isSubmitting = useContentStore((state) => state.isSubmittingComment)
  const contentError = useContentStore((state) => state.commentError)
  const setCommentError = useContentStore((state) => state.setCommentError)

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
        const iconSize = 48

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
    const iconSize = 48

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.rating === 0) {
      toast.fire({
        icon: 'warning',
        title: 'กรุณาให้คะแนนความพึงพอใจ',
        text: 'โปรดเลือกคะแนนดาวก่อนส่งข้อเสนอแนะ',
      })
      return
    }

    if (formData.content.trim().length < MIN_COMMENT_LENGTH) {
      toast.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อความ',
        text: `ความคิดเห็นต้องมีอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร`,
      })
      return
    }

    await submitUserComment(formData, resetForm, setIsOpen)
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
    <>
      {/* FAB Container — fixed position with transform */}
      <div
        className='fixed top-0 left-0 z-[9999] touch-none'
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className='relative w-12 h-12'>
          {/* FAB Button */}
          {!isOpen && (
            <button
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onClick={handleOpenClick}
              aria-label='แสดงความคิดเห็น'
              className={`absolute bottom-0 right-0 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                isDragging
                  ? 'scale-105 cursor-grabbing shadow-xl'
                  : 'cursor-grab hover:shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              <svg
                className='w-6 h-6 text-[#1a73e8]'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
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

          {/* Form Card */}
          <div
            className={`absolute ${getFormPlacementClass()} transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen
                ? 'scale-100 opacity-100 pointer-events-auto'
                : 'scale-95 opacity-0 pointer-events-none'
            }`}
          >
            <div className='bg-white w-[400px] rounded-xl shadow-xl border border-[#dadce0] overflow-hidden'>
              {/* Header */}
              <div className='px-6 pt-5 pb-3 flex justify-between items-center border-b border-[#e8eaed]'>
                <span className='text-[16px] font-semibold text-[#202124]'>
                  ข้อเสนอแนะและรีวิว
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label='ปิด'
                  className='w-8 h-8 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className='p-6 flex flex-col gap-5'>
                {/* Honeypot */}
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

                {/* Star Rating */}
                <div>
                  <label className='block text-sm font-medium text-[#5f6368] mb-2'>
                    คะแนนความพึงพอใจ
                  </label>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type='button'
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, rating: star }))
                        }
                        aria-label={`ให้คะแนน ${star} ดาว`}
                        className='text-2xl transition-all duration-150 hover:scale-110 active:scale-90'
                      >
                        <span
                          className={
                            star <= formData.rating
                              ? 'text-amber-500'
                              : 'text-[#dadce0] hover:text-[#9aa0a6]'
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Textarea */}
                <div>
                  <label className='block text-sm font-medium text-[#5f6368] mb-2'>
                    ความคิดเห็นของคุณ
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder='พิมพ์ข้อความแชร์ประสบการณ์ของคุณที่นี่...'
                    required
                    maxLength={MAX_COMMENT_LENGTH}
                    className='w-full border border-[#dadce0] rounded-lg px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent resize-none h-28 transition-shadow'
                  />
                  <div className='flex justify-between items-center mt-1.5'>
                    {contentError ? (
                      <span className='text-xs text-[#d93025] font-medium'>
                        {contentError}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className='text-xs text-[#5f6368] font-medium'>
                      {formData.content.length}/{MAX_COMMENT_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={
                    isSubmitting ||
                    formData.content.trim().length < MIN_COMMENT_LENGTH ||
                    formData.rating === 0
                  }
                  className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${
                    isSubmitting ||
                    formData.content.trim().length < MIN_COMMENT_LENGTH ||
                    formData.rating === 0
                      ? 'bg-[#f1f3f4] text-[#9aa0a6] cursor-not-allowed'
                      : 'bg-[#1a73e8] text-white hover:bg-[#1557b0] active:scale-[0.98] shadow-sm'
                  }`}
                >
                  {isSubmitting ? (
                    <span className='flex items-center justify-center gap-2'>
                      <svg
                        className='animate-spin h-4 w-4'
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
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                      กำลังบันทึก...
                    </span>
                  ) : (
                    'ส่งข้อเสนอแนะ'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CommentForm
