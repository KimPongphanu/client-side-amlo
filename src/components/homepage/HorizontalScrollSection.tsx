import React, { useEffect, useRef, useState } from 'react'

interface HorizontalScrollSectionProps {
  children: React.ReactNode
  className?: string
}

const DRAG_THRESHOLD_PX = 5

const HorizontalScrollSection = ({
  children,
  className = '',
}: HorizontalScrollSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = dragState.current
      const el = scrollRef.current
      if (!state.active || !el) return

      const dx = e.clientX - state.startX
      if (!state.moved) {
        if (Math.abs(dx) <= DRAG_THRESHOLD_PX) return
        state.moved = true
      }

      el.scrollLeft = state.startScrollLeft - dx
    }

    const handlePointerEnd = () => {
      if (!dragState.current.active) return
      dragState.current.active = false
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = scrollRef.current
    if (!el) return

    dragState.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    }
    setIsDragging(true)
  }

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.moved) return
    e.preventDefault()
    e.stopPropagation()
    dragState.current.moved = false
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onClickCapture={handleClickCapture}
      onDragStart={handleDragStart}
      style={{ userSelect: isDragging ? 'none' : undefined }}
      className={`w-full p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 overflow-x-auto bg-white shadow-sm hide-scrollbar items-stretch ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
    >
      {children}
    </div>
  )
}

export default HorizontalScrollSection
