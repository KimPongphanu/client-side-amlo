import { useEffect, useState } from 'react'
import { API_URL } from '../../config/constants'
import { contentService } from '../../services/contentService'

export default function SplashPopup() {
  const [popup, setPopup] = useState<{
    image_url: string
    title: string
    bg_color?: string
  } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const currentToday = new Date().toISOString().slice(0, 10)
    const hasSeenToday = !!localStorage.getItem(`splash_seen_${currentToday}`)
    
    if (hasSeenToday) {
      setDismissed(true)
      return
    }

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

  const handleEnter = () => {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(`splash_seen_${today}`, 'true')
    setDismissed(true)
  }

  if (dismissed || !popup) return null

  const imgSrc = popup.image_url.startsWith('http')
    ? popup.image_url
    : `${API_URL}${popup.image_url}`

  return (
    <div className='fixed inset-0 z-[999999] flex items-center justify-center'>
      {/* Backdrop: blur + dark overlay */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' />

      {/* Content card - smoke bg */}
      <div className='relative z-10 flex flex-col items-center max-w-lg w-full mx-6'>
        <div className='w-full bg-slate-100 rounded-3xl shadow-2xl overflow-hidden'>
          {/* Image */}
          <div className='w-full'>
            <img
              src={imgSrc}
              alt={popup.title || 'Splash'}
              className='w-full h-auto object-cover'
            />
          </div>

          {/* Title + Button */}
          <div className='px-6 py-6 flex flex-col items-center gap-5'>
            {popup.title && (
              <h2 className='text-xl md:text-2xl font-bold text-slate-800 text-center'>
                {popup.title}
              </h2>
            )}

            <button
              onClick={handleEnter}
              className='px-10 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 active:scale-[0.97] transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300'
            >
              เข้าสู่เว็บไซต์
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
