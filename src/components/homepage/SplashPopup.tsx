import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { API_URL } from '../../config/constants'
import { contentService } from '../../services/contentService'
import {
  clearSplashSeen,
  hasSeenSplashToday,
  markSplashSeen,
  parseSplashOverride,
  type SplashOverride,
} from '../../utils/splashPopup'

const MIN_MEDIA_WIDTH = 200
const MAX_CARD_WIDTH = 512
const MAX_MEDIA_HEIGHT = 640
const FOOTER_HEIGHT = 76

export default function SplashPopup() {
  const [popup, setPopup] = useState<{
    image_url: string
    title: string
    bg_color?: string | null
  } | null>(null)
  const [override] = useState<SplashOverride | null>(() =>
    parseSplashOverride(window.location.search, import.meta.env.DEV),
  )
  const [dismissed, setDismissed] = useState(
    () => !override && hasSeenSplashToday(localStorage),
  )
  const [entered, setEntered] = useState(false)
  const [loadedImage, setLoadedImage] = useState<{
    src: string
    width: number
    height: number
  } | null>(null)
  const [space, setSpace] = useState({ width: 0, height: 0 })

  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (override === 'reset') clearSplashSeen(localStorage)
  }, [override])

  useEffect(() => {
    if (dismissed) return

    contentService
      .getActiveSplashPopup()
      .then((data) => {
        if (!data || !data.image_url) {
          setDismissed(true)
        } else {
          setPopup(data as typeof popup)
        }
      })
      .catch(() => {
        setDismissed(true)
      })
  }, [dismissed])

  const isOpen = !dismissed && !!popup

  useEffect(() => {
    if (!isOpen) return

    const element = containerRef.current
    if (!element) return

    const update = () => {
      const styles = getComputedStyle(element)
      const paddingX =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const paddingY =
        parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)

      setSpace({
        width: Math.max(0, element.clientWidth - paddingX),
        height: Math.max(0, element.clientHeight - paddingY),
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [isOpen])

  const handleDismiss = useCallback(() => {
    if (override !== 'force') markSplashSeen(localStorage)
    setDismissed(true)
  }, [override])

  useEffect(() => {
    if (!isOpen) return

    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true))
    })

    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement as HTMLElement | null

    document.body.style.overflow = 'hidden'
    buttonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDismiss()
        return
      }
      if (event.key === 'Tab') {
        event.preventDefault()
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen, handleDismiss])

  if (!isOpen || !popup) return null

  const imgSrc = popup.image_url.startsWith('http')
    ? popup.image_url
    : `${API_URL}${popup.image_url}`

  const natural = loadedImage && loadedImage.src === imgSrc ? loadedImage : null
  const maxWidth = Math.min(Math.max(space.width, MIN_MEDIA_WIDTH), MAX_CARD_WIDTH)
  const maxHeight = Math.min(
    Math.max(space.height - FOOTER_HEIGHT, MIN_MEDIA_WIDTH),
    MAX_MEDIA_HEIGHT,
  )
  const scale = natural
    ? Math.min(maxWidth / natural.width, maxHeight / natural.height)
    : 0
  const display = natural
    ? {
        width: Math.round(natural.width * scale),
        height: Math.round(natural.height * scale),
      }
    : null

  return (
    <div
      className='fixed inset-0 z-[999999] overflow-y-auto'
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
    >
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      />

      <div
        ref={containerRef}
        className='relative flex min-h-full items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
      >
        <div
          className={`relative flex max-h-[calc(100dvh-2rem)] w-fit max-w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
            entered ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'
          }`}
        >
          <div
            className={`flex shrink items-center justify-center overflow-hidden ${
              display ? '' : 'min-h-[240px] min-w-[240px]'
            }`}
            style={{ backgroundColor: popup.bg_color || '#ffffff' }}
          >
            <img
              src={imgSrc}
              alt={popup.title || 'Splash'}
              onLoad={(event) => {
                const element = event.currentTarget
                setLoadedImage({
                  src: imgSrc,
                  width: element.naturalWidth,
                  height: element.naturalHeight,
                })
              }}
              className='block h-auto w-auto max-w-full object-contain'
              style={
                display
                  ? { width: display.width, height: display.height }
                  : { display: 'none' }
              }
            />
          </div>

          <div className='flex w-full shrink-0 flex-col p-3'>
            <h2 id={titleId} className='sr-only'>
              {popup.title || 'ประกาศ'}
            </h2>

            <button
              ref={buttonRef}
              type='button'
              onClick={handleDismiss}
              className='min-h-12 w-full touch-manipulation rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 active:scale-[0.97]'
            >
              เข้าสู่เว็บไซต์
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
