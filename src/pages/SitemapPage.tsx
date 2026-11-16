import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { contentService } from '../services/contentService'
import { useContentStore } from '../stores/useContentStore'

const POLICY_KEYS = [
  'policy_website',
  'policy_privacy',
  'policy_cookies',
  'policy_security',
  'policy_accessibility',
] as const

type PolicyKey = (typeof POLICY_KEYS)[number]

const POLICY_LABELS: Record<PolicyKey, string> = {
  policy_website: 'footer.policyWebsite',
  policy_privacy: 'footer.policyPrivacy',
  policy_cookies: 'footer.policyCookies',
  policy_security: 'footer.policySecurity',
  policy_accessibility: 'footer.policyAccessibility',
}

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url)

const SitemapLink = ({
  to,
  label,
  external = false,
}: {
  to: string
  label: string
  external?: boolean
}) => {
  const className =
    'group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700'

  if (external) {
    return (
      <a
        href={to}
        target='_blank'
        rel='noopener noreferrer'
        className={className}
      >
        <span>{label}</span>
        <FaExternalLinkAlt className='w-3 h-3 shrink-0 text-slate-400 group-hover:text-blue-600' />
      </a>
    )
  }

  return (
    <Link to={to} className={className}>
      <span>{label}</span>
      <FaChevronRight className='w-3 h-3 shrink-0 text-slate-400 group-hover:text-blue-600' />
    </Link>
  )
}

const SitemapSection = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <section>
    <h2 className='mb-2 text-sm font-bold uppercase tracking-wider text-slate-500'>
      {title}
    </h2>
    <div className='rounded-xl border border-slate-100 bg-slate-50/60 p-2'>
      {children}
    </div>
  </section>
)

export default function SitemapPage() {
  const { t, i18n } = useTranslation()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const departments = useContentStore((state) => state.departmentList)
  const fetchPublicData = useContentStore((state) => state.fetchPublicData)

  useEffect(() => {
    let cancelled = false

    contentService
      .getSiteSettings()
      .then((data) => {
        if (!cancelled) setSettings(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!departments || departments.length === 0) fetchPublicData()
  }, [departments, fetchPublicData])

  const isEn = i18n.language === 'en'
  const bookguideUrl = (settings.bookguide_url || '').trim()
  const openDataUrl = (settings.open_data_url || '').trim()
  const rssUrl = (settings.rss_url || '').trim()
  const policies = POLICY_KEYS.map((key) => ({
    key,
    label: t(POLICY_LABELS[key]),
    url: (settings[key] || '').trim(),
  })).filter((item) => item.url)

  return (
    <div className='min-h-screen bg-slate-50 pt-24 pb-16 px-4 md:px-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10'>
          <h1 className='text-3xl md:text-4xl font-bold text-slate-800 border-l-8 border-blue-600 pl-4'>
            {t('nav.sitemap')}
          </h1>
          <p className='mt-4 text-slate-500'>
            {t(
              'sitemap.description',
              'รวมลิงก์ทุกส่วนของเว็บไซต์ เพื่อให้เข้าถึงเนื้อหาได้ง่ายขึ้น',
            )}
          </p>

          <div className='mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <SitemapSection title={t('sitemap.pages', 'หน้าและเนื้อหา')}>
              <SitemapLink to='/' label={t('nav.home')} />
              <SitemapLink to='/news' label={t('nav.news')} />
              <SitemapLink to='/advertise' label={t('nav.pr')} />
              <SitemapLink to='/contactform' label={t('nav.contact')} />
              <SitemapLink
                to='/commentform'
                label={t('sitemap.comment', 'แสดงความคิดเห็น')}
              />
            </SitemapSection>

            {departments.length > 0 && (
              <SitemapSection
                title={t('home.departments', 'หน่วยงานภายใน ปปง.')}
              >
                {departments.map((dept) => (
                  <SitemapLink
                    key={dept.id}
                    to={`/department/${dept.id}`}
                    label={
                      isEn && dept.title_en ? dept.title_en : dept.title
                    }
                  />
                ))}
              </SitemapSection>
            )}

            <SitemapSection title={t('sitemap.about', 'เกี่ยวกับ ปปง.')}>
              <SitemapLink
                to='/about/history'
                label={t('nav.aboutHistoryDetail', 'ประวัติ')}
              />
              {bookguideUrl && (
                <SitemapLink
                  to={bookguideUrl}
                  label={t('nav.bookguide')}
                  external={isExternalUrl(bookguideUrl)}
                />
              )}
              {openDataUrl && (
                <SitemapLink
                  to={openDataUrl}
                  label={t('nav.openData')}
                  external={isExternalUrl(openDataUrl)}
                />
              )}
              {rssUrl && (
                <SitemapLink
                  to={rssUrl}
                  label={t('nav.rss')}
                  external={isExternalUrl(rssUrl)}
                />
              )}
            </SitemapSection>

            {policies.length > 0 && (
              <SitemapSection title={t('footer.policies')}>
                {policies.map((policy) => (
                  <SitemapLink
                    key={policy.key}
                    to={policy.url}
                    label={policy.label}
                    external={isExternalUrl(policy.url)}
                  />
                ))}
              </SitemapSection>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
