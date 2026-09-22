import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// 🌟 หน้า 404 — ออกแบบจาก design_404.html แบบที่ 2 (Investigation Theme)
// ข้อความสั้น + ปุ่มเดียว ผูก i18n keys: notfound.wrongLink / notfound.backHome
export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className='relative min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden'>
      {/* Radial glow ด้านบน */}
      <div
        aria-hidden='true'
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(600px 300px at 50% 0%, #eff6ff, transparent 70%)',
        }}
      />
      <style>{`
        @keyframes notfound-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className='relative flex flex-col items-center max-w-md'>
        <div className='w-full max-w-[340px]'>
          <svg
            viewBox='0 0 360 320'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            {/* เอกสาร */}
            <rect x='60' y='40' width='180' height='230' rx='14' fill='#fff' stroke='#e2e8f0' strokeWidth='2' />
            <rect x='86' y='76' width='128' height='10' rx='5' fill='#dbeafe' />
            <rect x='86' y='102' width='96' height='10' rx='5' fill='#f1f5f9' />
            <rect x='86' y='128' width='112' height='10' rx='5' fill='#f1f5f9' />
            <rect x='86' y='154' width='72' height='10' rx='5' fill='#f1f5f9' />
            <rect x='86' y='196' width='60' height='20' rx='6' fill='#eff6ff' stroke='#dbeafe' />
            {/* เหรียญ */}
            <circle cx='286' cy='228' r='26' fill='#fde68a' stroke='#f59e0b' strokeWidth='2.5' />
            <circle cx='286' cy='228' r='15' fill='none' stroke='#f59e0b' strokeWidth='2' strokeDasharray='4 3' />
            <circle cx='316' cy='262' r='18' fill='#fef3c7' stroke='#f59e0b' strokeWidth='2' />
            {/* แว่นขยาย 404 (ลอยขึ้นลง) */}
            <g style={{ animation: 'notfound-float 3.5s ease-in-out infinite' }}>
              <circle cx='252' cy='128' r='62' fill='rgba(255,255,255,.9)' stroke='#2563eb' strokeWidth='10' />
              <text
                x='252'
                y='145'
                textAnchor='middle'
                fontFamily='Sarabun, sans-serif'
                fontSize='42'
                fontWeight='700'
                fill='#2563eb'
              >
                404
              </text>
              <line x1='296' y1='172' x2='338' y2='214' stroke='#1e40af' strokeWidth='14' strokeLinecap='round' />
            </g>
          </svg>
        </div>

        <h1 className='mt-5 text-2xl md:text-3xl font-bold text-slate-800 text-center'>
          {t('notfound.wrongLink', 'ลิงก์ที่เข้าชมอาจไม่ถูกต้อง')}
        </h1>

        <Link
          to='/'
          className='mt-6 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-colors'
        >
          {t('notfound.backHome', 'กลับสู่หน้าแรก')}
        </Link>
      </div>
    </div>
  )
}
