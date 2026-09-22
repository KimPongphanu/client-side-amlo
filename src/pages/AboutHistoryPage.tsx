import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { sanitizeHtml } from '../utils/sanitizeHtml'
import { contentService } from '../services/contentService'

export default function AboutHistoryPage() {
  const { t } = useTranslation()
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)

  useEffect(() => {
    contentService
      .getSiteSettings()
      .then((settings) => {
        const content = settings.about_history
        if (content && content.trim()) {
          setHtml(content)
        } else {
          setEmpty(true)
        }
      })
      .catch(() => {
        setEmpty(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // Prevent premature redirect while loading
  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 pt-24 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-slate-600 font-medium'>{t('common.loading', 'กำลังโหลด...')}</p>
        </div>
      </div>
    )
  }

  // Empty → redirect to home
  if (empty) {
    return <Navigate to='/' replace />
  }

  return (
    <div className='min-h-screen bg-slate-50 pt-24 pb-16'>
      <div className='max-w-5xl mx-auto px-4 md:px-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-slate-800 border-l-8 border-blue-600 pl-4 mb-8'>
          {t('nav.aboutHistoryDetail', 'ประวัติ')}
        </h1>
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10'>
          <div
            className='prose prose-lg max-w-none text-slate-600 leading-relaxed ql-rendered'
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || '') }}
          />
        </div>
      </div>

    </div>
  )
}