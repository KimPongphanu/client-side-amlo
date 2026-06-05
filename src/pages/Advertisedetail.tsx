import DOMPurify from 'dompurify'
import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import RecommendedSidebar from '../components/ReccommendedSidebar'
import { NewsContext } from '../context/NewsContext'
import ImageModal from '../components/ImageModal'
import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''
// ฟังก์ชันแปลงเวลาเป็น UTC
const formatToUTC = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  // หากแปลงไม่ได้ (เช่น รูปแบบ string ไม่ตรงตามมาตรฐาน) ให้แสดงค่าเดิม
  return isNaN(date.getTime()) ? dateString : date.toUTCString()
}

const AdvertiseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useContext(NewsContext)

  const currentId = Number(id)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const prList = context?.prList || []
  const isLoading = context?.isLoading
  const advertiseData = prList.find((pr) => pr.id === currentId)

  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center h-screen bg-slate-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600'></div>
      </div>
    )
  }

  if (!advertiseData) {
    return (
      <div className='min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 text-center'>
        <h1 className='text-2xl md:text-3xl font-bold text-slate-800 mb-4'>
          ไม่พบข้อมูลประกาศนี้
        </h1>
        <button
          onClick={() => navigate(-1)}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          กลับไปหน้าก่อนหน้า
        </button>
      </div>
    )
  }

  return (
    <div className='bg-slate-50 min-h-screen pt-24 pb-16 px-4 md:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8 items-start'>
          <div className='lg:col-span-3 bg-white rounded-3xl shadow-md overflow-hidden border border-slate-200'>
            <div className='w-full h-[250px] md:h-[450px] overflow-hidden bg-slate-200 flex justify-center items-center'>
              {advertiseData.image_src ? (
                <img
                  src={
                    advertiseData.image_src.startsWith('blob:')
                      ? advertiseData.image_src
                      : `${API_URL}${advertiseData.image_src}`
                  }
                  alt={advertiseData.title}
                  fetchPriority='high'
                  className='w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity'
                  onClick={() => setIsModalOpen(true)}
                />
              ) : (
                <span className='text-slate-400'>ไม่มีรูปภาพประกอบ</span>
              )}
            </div>

            <div className='p-6 md:p-10'>
              <Breadcrumb title={advertiseData.title} />
              <p className='text-sm text-blue-600 font-bold mb-3'>
                {formatToUTC(advertiseData.date)}
              </p>
              <h1 className='text-2xl md:text-4xl font-bold text-slate-800 mb-6 leading-snug'>
                {advertiseData.title}
              </h1>
              <hr className='border-slate-100 mb-8' />
              <div
                className='prose prose-lg max-w-none text-slate-600 leading-relaxed text-base md:text-lg ql-rendered'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    advertiseData.content || advertiseData.description,
                  ),
                }}
              />
            </div>
          </div>

          <div className='lg:col-span-1'>
            <RecommendedSidebar
              currentId={currentId}
              items={prList}
              basePath='advertise'
              title='ประกาศอื่นๆ จาก ปปง.'
            />
          </div>
        </div>
      </div>
      <ImageModal 
        isOpen={isModalOpen} 
        imageUrl={advertiseData?.image_src?.startsWith('blob:') ? advertiseData.image_src : `${API_URL}${advertiseData?.image_src}`}
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

export default AdvertiseDetail
