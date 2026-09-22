import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { FaSpinner, FaUndo } from 'react-icons/fa'
import {
  MIN_RECOMMENDED_CROP_WIDTH,
  canEncodeWebp,
  clampTransform,
  cropFileToImage,
  frameSize,
  identityTransform,
  outputSizeFor,
  renderedPosition,
  renderedSize,
  sourceRect,
  type CropTransform,
  type Size,
} from '../../utils/imageCrop'
import { toast } from '../../utils/swalConfig'

interface ImageCropperProps {
  file: File
  onApply: (file: File, previewUrl: string) => void
  onUseOriginal: () => void
  onCancel: () => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const NUDGE_STEP = 16

const clampZoom = (value: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))

export default function ImageCropper({
  file,
  onApply,
  onUseOriginal,
  onCancel,
}: ImageCropperProps) {
  const [image, setImage] = useState<{ url: string; size: Size } | null>(null)
  const [failed, setFailed] = useState(false)
  const [box, setBox] = useState<Size>({ width: 0, height: 0 })
  const [rawTransform, setRawTransform] =
    useState<CropTransform>(identityTransform)
  const [busy, setBusy] = useState(false)
  const [outputLabel, setOutputLabel] = useState<'WebP' | 'JPEG'>('WebP')

  const zoomId = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const dragRef = useRef<{
    x: number
    y: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    let cancelled = false
    const element = new Image()

    element.onload = () => {
      if (cancelled) return
      setImage({
        url,
        size: { width: element.naturalWidth, height: element.naturalHeight },
      })
      setRawTransform(identityTransform)
      setFailed(false)
    }

    element.onerror = () => {
      if (!cancelled) setFailed(true)
    }

    element.src = url

    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [file])

  useEffect(() => {
    let cancelled = false

    canEncodeWebp().then((supported) => {
      if (!cancelled) setOutputLabel(supported ? 'WebP' : 'JPEG')
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const element = boxRef.current
    if (!element) return

    const update = () =>
      setBox({ width: element.clientWidth, height: element.clientHeight })

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const frame = frameSize(box)
  const frameWidth = frame.width
  const frameHeight = frame.height
  const transform =
    image && frameWidth > 0
      ? clampTransform(rawTransform, image.size, frame)
      : rawTransform
  const rendered = image
    ? renderedSize(image.size, frame, transform)
    : { width: 0, height: 0 }
  const position = image
    ? renderedPosition(image.size, frame, transform)
    : { left: 0, top: 0 }
  const frameLeft = (box.width - frameWidth) / 2
  const frameTop = (box.height - frameHeight) / 2
  const zoomPercent = Math.round(transform.zoom * 100)
  const output =
    image && frameWidth > 0
      ? outputSizeFor(sourceRect({ image: image.size, frame, transform }))
      : null
  const isLowResolution =
    !!output && output.width < MIN_RECOMMENDED_CROP_WIDTH

  const apply = useCallback(
    (next: CropTransform) => {
      if (!image || frameWidth <= 0) {
        setRawTransform(next)
        return
      }
      setRawTransform(clampTransform(next, image.size, { width: frameWidth, height: frameHeight }))
    },
    [image, frameWidth, frameHeight],
  )

  useEffect(() => {
    const element = boxRef.current
    if (!element || !image || frameWidth <= 0) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      setRawTransform((current) =>
        clampTransform(
          { ...current, zoom: clampZoom(current.zoom - event.deltaY * 0.0015) },
          image.size,
          { width: frameWidth, height: frameHeight },
        ),
      )
    }

    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [image, frameWidth, frameHeight])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values())
      pinchRef.current = {
        distance: Math.hypot(first.x - second.x, first.y - second.y),
        zoom: transform.zoom,
      }
      dragRef.current = null
      return
    }

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image || !pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const pinch = pinchRef.current
    if (pinch && pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values())
      const distance = Math.hypot(first.x - second.x, first.y - second.y)
      if (pinch.distance > 0) {
        apply({
          ...transform,
          zoom: clampZoom(pinch.zoom * (distance / pinch.distance)),
        })
      }
      return
    }

    const drag = dragRef.current
    if (!drag) return
    apply({
      ...transform,
      offsetX: drag.offsetX + (event.clientX - drag.x),
      offsetY: drag.offsetY + (event.clientY - drag.y),
    })
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId)

    if (pointersRef.current.size < 2) pinchRef.current = null

    const [remaining] = Array.from(pointersRef.current.values())
    dragRef.current = remaining
      ? {
          x: remaining.x,
          y: remaining.y,
          offsetX: transform.offsetX,
          offsetY: transform.offsetY,
        }
      : null
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!image) return

    const nudges: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -NUDGE_STEP, y: 0 },
      ArrowRight: { x: NUDGE_STEP, y: 0 },
      ArrowUp: { x: 0, y: -NUDGE_STEP },
      ArrowDown: { x: 0, y: NUDGE_STEP },
    }

    const nudge = nudges[event.key]
    if (nudge) {
      event.preventDefault()
      apply({
        ...transform,
        offsetX: transform.offsetX + nudge.x,
        offsetY: transform.offsetY + nudge.y,
      })
      return
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      apply({ ...transform, zoom: clampZoom(transform.zoom + 0.25) })
      return
    }

    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      apply({ ...transform, zoom: clampZoom(transform.zoom - 0.25) })
    }
  }

  const handleApply = async () => {
    if (!image) return
    setBusy(true)
    try {
      const rect = sourceRect({
        image: image.size,
        frame,
        transform,
      })
      const cropped = await cropFileToImage(file, rect, outputSizeFor(rect))
      onApply(cropped, URL.createObjectURL(cropped))
    } catch (error) {
      toast.fire({
        icon: 'error',
        title: 'ตัดรูปไม่สำเร็จ',
        text: error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง',
      })
    } finally {
      setBusy(false)
    }
  }

  if (failed) {
    return (
      <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center'>
        <p className='text-sm text-red-700'>
          ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ กรุณาเลือกไฟล์ใหม่
        </p>
        <button
          type='button'
          onClick={onCancel}
          className='mt-3 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700'
        >
          เลือกไฟล์ใหม่
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <div
        ref={boxRef}
        tabIndex={0}
        role='group'
        aria-label='พื้นที่ตัดรูป ลากรูปหรือใช้ลูกศรเพื่อจัดตำแหน่ง และปุ่มบวก/ลบเพื่อซูม'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
        className='relative w-full cursor-grab touch-none select-none overflow-hidden rounded-xl bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:cursor-grabbing'
        style={{ height: 'min(46vh, 320px)' }}
      >
        {image && (
          <img
            src={image.url}
            alt=''
            draggable={false}
            className='pointer-events-none absolute max-w-none'
            style={{
              left: frameLeft + position.left,
              top: frameTop + position.top,
              width: rendered.width,
              height: rendered.height,
            }}
          />
        )}

        <div
          data-testid='crop-dim'
          className='pointer-events-none absolute inset-x-0 top-0 bg-slate-900/70'
          style={{ height: frameTop }}
        />
        <div
          data-testid='crop-dim'
          className='pointer-events-none absolute inset-x-0 bottom-0 bg-slate-900/70'
          style={{ height: frameTop }}
        />
        <div
          data-testid='crop-dim'
          className='pointer-events-none absolute left-0 bg-slate-900/70'
          style={{ top: frameTop, height: frameHeight, width: frameLeft }}
        />
        <div
          data-testid='crop-dim'
          className='pointer-events-none absolute right-0 bg-slate-900/70'
          style={{ top: frameTop, height: frameHeight, width: frameLeft }}
        />

        <div
          data-testid='crop-frame'
          className='pointer-events-none absolute border border-white/90'
          style={{
            left: frameLeft,
            top: frameTop,
            width: frameWidth,
            height: frameHeight,
          }}
        >
          <div
            data-testid='crop-grid'
            className='absolute inset-y-0 left-1/3 w-px bg-white/45'
          />
          <div
            data-testid='crop-grid'
            className='absolute inset-y-0 left-2/3 w-px bg-white/45'
          />
          <div
            data-testid='crop-grid'
            className='absolute inset-x-0 top-1/3 h-px bg-white/45'
          />
          <div
            data-testid='crop-grid'
            className='absolute inset-x-0 top-2/3 h-px bg-white/45'
          />
          <span className='absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-white' />
          <span className='absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-white' />
          <span className='absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-white' />
          <span className='absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-white' />
        </div>

        {!image && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <FaSpinner className='h-6 w-6 animate-spin text-white/70' />
          </div>
        )}
      </div>

      <div className='flex items-center gap-3'>
        <label
          htmlFor={zoomId}
          className='whitespace-nowrap text-xs text-gray-500'
        >
          ซูม
        </label>
        <input
          id={zoomId}
          type='range'
          min={MIN_ZOOM * 100}
          max={MAX_ZOOM * 100}
          step={5}
          value={zoomPercent}
          onChange={(event) =>
            apply({ ...transform, zoom: Number(event.target.value) / 100 })
          }
          className='flex-1 accent-blue-600'
        />
        <span className='w-14 text-right text-xs tabular-nums text-gray-500'>
          {zoomPercent}%
        </span>
        <button
          type='button'
          onClick={() => setRawTransform(identityTransform)}
          title='รีเซ็ตตำแหน่ง'
          aria-label='รีเซ็ตตำแหน่ง'
          className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100'
        >
          <FaUndo className='h-3 w-3' />
        </button>
      </div>

      <p className='text-xs leading-relaxed text-gray-500'>
        กรอบด้านใน = ส่วนที่แสดงบนหน้าเว็บ · พื้นที่มืด = ส่วนที่ถูกตัดออก ·
        ซูม 100% = พอดีกรอบ (ลากรูปหรือใช้ลูกศรเพื่อจัดตำแหน่ง)
      </p>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p
          className={`text-xs ${isLowResolution ? 'font-medium text-amber-600' : 'text-gray-500'}`}
        >
          {output
            ? `ไฟล์ที่ได้: ${output.width} × ${output.height} px (${outputLabel})${
                isLowResolution
                  ? ' — ความละเอียดต่ำ แนะนำให้ซูมออกหรือใช้รูปที่ใหญ่ขึ้น'
                  : ''
              }`
            : 'กำลังเตรียมรูปภาพ...'}
        </p>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={onCancel}
            className='rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100'
          >
            ยกเลิก
          </button>
          <button
            type='button'
            onClick={onUseOriginal}
            className='rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100'
          >
            ใช้รูปเต็ม (ไม่ตัด)
          </button>
          <button
            type='button'
            onClick={handleApply}
            disabled={busy || !image}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              busy || !image
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {busy ? (
              <>
                <FaSpinner className='mr-1 inline h-4 w-4 animate-spin' />{' '}
                กำลังตัดรูป...
              </>
            ) : (
              'ใช้รูปนี้'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
