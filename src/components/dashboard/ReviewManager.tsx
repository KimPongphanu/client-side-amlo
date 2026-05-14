import React, { useState, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'

// ==========================================
// Types & Interfaces
// ==========================================
export interface CommentData {
  id: string
  msg: string
  star: number
  createdAt: string
  status: 'pending' | 'published'
}

interface FilterState {
  startDate: string
  endDate: string
}

// ==========================================
// Mock Data Generator
// ==========================================
const generateMockData = (): CommentData[] => {
  const today = new Date()
  const mock: CommentData[] = []
  for (let i = 1; i <= 45; i++) {
    const isToday = i % 3 === 0
    const date = new Date(today)
    if (!isToday) date.setDate(date.getDate() - Math.floor(Math.random() * 30))

    mock.push({
      id: `CMT-${1000 + i}`,
      msg: `ความคิดเห็นที่ ${i}: ระบบใช้งานง่ายมาก แต่ยังมีบางจุดที่โหลดช้าเมื่อดึงข้อมูลเยอะๆ อยากให้ปรับปรุงส่วนนี้ครับ ${i % 5 === 0 ? 'เพิ่มเติมคือ UI สะอาดตาดีมาก' : ''}`,
      star: Math.floor(Math.random() * 5) + 1,
      createdAt: date.toISOString(),
      status: i % 4 === 0 ? 'published' : 'pending',
    })
  }
  return mock
}

// -----------------------------------------------------
// Service
// -----------------------------------------------------
const updateReviewStatusService = async (
  ids: string[],
  status: 'published' | 'pending',
) => {
  console.log(`Updating to ${status}...`, ids)
  return new Promise((resolve) => setTimeout(resolve, 600))
}

// ==========================================
// Main Component
// ==========================================
export default function ReviewManager() {
  const [data, setData] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterState>({
    startDate: '',
    endDate: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showDownload, setShowDownload] = useState(false)
  const [showSelectedStack, setShowSelectedStack] = useState(false)

  const [viewMode, setViewMode] = useState<'all' | 'published'>('all')

  const itemsPerPage = 12

  useEffect(() => {
    setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 500)
  }, [])

  const processedData = useMemo(() => {
    let filtered = [...data]

    if (viewMode === 'published') {
      filtered = filtered.filter((item) => item.status === 'published')
    }

    if (filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate).getTime()
      const end = new Date(filter.endDate).getTime() + 86400000
      filtered = filtered.filter((item) => {
        const time = new Date(item.createdAt).getTime()
        return time >= start && time <= end
      })
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [data, filter, viewMode])

  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const currentItems = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const totalComments = processedData.length
  const avgStar =
    totalComments > 0
      ? (
          processedData.reduce((acc, curr) => acc + curr.star, 0) /
          totalComments
        ).toFixed(2)
      : '0.00'

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === currentItems.length) {
      setSelectedIds(new Set())
    } else {
      const newSelected = new Set(selectedIds)
      currentItems.forEach((item) => newSelected.add(item.id))
      setSelectedIds(newSelected)
    }
  }

  const handleTabChange = (mode: 'all' | 'published') => {
    setViewMode(mode)
    setSelectedIds(new Set())
    setCurrentPage(1)
  }

  // -----------------------------------------------------
  // Handlers
  // -----------------------------------------------------
  const handleDownload = (format: 'csv' | 'xlsx' | 'pdf') => {
    setShowDownload(false)
    Swal.fire({
      title: 'กำลังเตรียมไฟล์...',
      html: `ระบบกำลังสร้างไฟล์ <b>.${format.toUpperCase()}</b> กรุณารอสักครู่`,
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => Swal.showLoading(),
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        Swal.fire({
          icon: 'success',
          title: 'ดาวน์โหลดสำเร็จ!',
          text: `ไฟล์ .${format.toUpperCase()} พร้อมใช้งาน`,
          confirmButtonColor: '#2563eb',
        })
      }
    })
  }

  const handlePublishSelected = () => {
    Swal.fire({
      title: 'ยืนยันการนำไปแสดงผล?',
      text: `ต้องการแสดงความคิดเห็น ${selectedIds.size} รายการ บนหน้าเว็บใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ใช่, แสดงผล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateReviewStatusService(Array.from(selectedIds), 'published')
        setData(
          data.map((item) =>
            selectedIds.has(item.id) ? { ...item, status: 'published' } : item,
          ),
        )
        setSelectedIds(new Set())
        setShowSelectedStack(false)
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตสถานะสำเร็จ',
          confirmButtonColor: '#2563eb',
          timer: 1500,
          showConfirmButton: false,
        })
      }
    })
  }

  const handleUnpublishSelected = () => {
    Swal.fire({
      title: 'ยกเลิกการแสดงผล?',
      text: `ต้องการซ่อนความคิดเห็น ${selectedIds.size} รายการ จากหน้าเว็บใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ใช่, ซ่อนการแสดงผล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateReviewStatusService(Array.from(selectedIds), 'pending')
        setData(
          data.map((item) =>
            selectedIds.has(item.id) ? { ...item, status: 'pending' } : item,
          ),
        )
        setSelectedIds(new Set())
        setShowSelectedStack(false)
        Swal.fire({
          icon: 'success',
          title: 'ยกเลิกการแสดงผลสำเร็จ',
          confirmButtonColor: '#2563eb',
          timer: 1500,
          showConfirmButton: false,
        })
      }
    })
  }

  return (
    <div className='bg-slate-50 min-h-screen p-4 md:p-8 font-sans text-slate-800 pb-32 md:pb-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* --- Header --- */}
        <header className='flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 pb-4'>
          <div className='w-full lg:w-auto'>
            <h1 className='text-2xl font-bold mb-3 md:mb-2'>
              จัดการความคิดเห็น
            </h1>
            <div className='flex flex-wrap gap-2 md:gap-4'>
              <div className='bg-white border border-slate-300 px-4 py-2 flex items-center gap-3 flex-1 sm:flex-none justify-center'>
                <span className='text-slate-500 text-sm'>ทั้งหมด</span>
                <span className='text-xl font-bold'>{totalComments}</span>
              </div>
              {totalComments > 0 && (
                <div className='bg-white border border-slate-300 px-4 py-2 flex items-center gap-3 flex-1 sm:flex-none justify-center'>
                  <span className='text-slate-500 text-sm'>คะแนนเฉลี่ย</span>
                  <div className='flex items-center gap-1 text-orange-500'>
                    <span className='text-xl font-bold'>{avgStar}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters & Actions */}
          <div className='flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto'>
            <div className='flex items-center bg-white border border-slate-300 p-1 flex-1 sm:flex-none justify-between'>
              <input
                type='date'
                className='px-1 md:px-2 py-1 outline-none text-sm bg-transparent w-full'
                value={filter.startDate}
                onChange={(e) =>
                  setFilter({ ...filter, startDate: e.target.value })
                }
              />
              <span className='text-slate-400 px-1'>-</span>
              <input
                type='date'
                className='px-1 md:px-2 py-1 outline-none text-sm bg-transparent w-full'
                value={filter.endDate}
                onChange={(e) =>
                  setFilter({ ...filter, endDate: e.target.value })
                }
              />
            </div>

            <div className='relative flex-1 sm:flex-none'>
              <button
                onClick={() => setShowDownload(!showDownload)}
                className='w-full sm:w-auto bg-slate-800 text-white px-4 py-2 text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 h-full min-h-[36px]'
              >
                <span>ดาวน์โหลดข้อมูล</span>
              </button>
              {showDownload && (
                <div className='absolute right-0 sm:right-0 left-0 sm:left-auto mt-1 w-full sm:w-40 bg-white border border-slate-300 z-10 shadow-lg'>
                  <button
                    onClick={() => handleDownload('csv')}
                    className='w-full text-left px-4 py-3 sm:py-2 text-sm hover:bg-slate-100 border-b border-slate-100'
                  >
                    .CSV
                  </button>
                  <button
                    onClick={() => handleDownload('xlsx')}
                    className='w-full text-left px-4 py-3 sm:py-2 text-sm hover:bg-slate-100 border-b border-slate-100'
                  >
                    .XLSX
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className='w-full text-left px-4 py-3 sm:py-2 text-sm hover:bg-slate-100'
                  >
                    .PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- Tabs & Select All --- */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2 gap-4'>
          <div className='flex gap-6 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide'>
            <button
              onClick={() => handleTabChange('all')}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${viewMode === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              ข้อมูลทั้งหมด
            </button>
            <button
              onClick={() => handleTabChange('published')}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${viewMode === 'published' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              แสดงผลอยู่
            </button>
          </div>

          <button
            onClick={handleSelectAll}
            className='text-sm text-blue-600 hover:underline w-full sm:w-auto text-left sm:text-right'
          >
            {selectedIds.size > 0 && selectedIds.size === currentItems.length
              ? 'ยกเลิกการเลือกหน้าปัจจุบัน'
              : 'เลือกทั้งหมดในหน้านี้'}
          </button>
        </div>

        {/* --- Grid Content --- */}
        {loading ? (
          <div className='text-center py-20 text-slate-500'>
            กำลังโหลดข้อมูล...
          </div>
        ) : processedData.length === 0 ? (
          <div className='text-center py-20 text-slate-500'>
            ไม่พบข้อมูลในหมวดหมู่นี้
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)} // เพิ่มให้กดทั้งกล่องเพื่อ Select ได้ (Mobile Friendly)
                className={`relative bg-white border cursor-pointer ${selectedIds.has(item.id) ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200'} p-4 flex flex-col h-full transition-colors`}
              >
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex gap-2 items-center flex-wrap'>
                    {new Date(item.createdAt).toDateString() ===
                      new Date().toDateString() && (
                      <span className='bg-green-100 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded-sm'>
                        วันนี้
                      </span>
                    )}
                    {item.status === 'published' && viewMode === 'all' && (
                      <span className='bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-sm'>
                        แสดงผลอยู่
                      </span>
                    )}
                  </div>
                  <input
                    type='checkbox'
                    checked={selectedIds.has(item.id)}
                    onChange={() => handleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()} // ป้องกัน event ซ้อนกันเวลากด Checkbox
                    className='w-5 h-5 md:w-4 md:h-4 cursor-pointer accent-blue-600'
                  />
                </div>

                <div className='flex gap-1 mb-2 text-orange-400'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < item.star ? 'fill-current' : 'text-slate-200 fill-current'}`}
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>

                <p className='text-slate-700 text-sm flex-1 mb-4 line-clamp-4'>
                  {item.msg}
                </p>

                <div className='text-xs text-slate-400 flex justify-between items-center border-t border-slate-100 pt-3 mt-auto'>
                  <span>{item.id}</span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('th-TH')}{' '}
                    {new Date(item.createdAt).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center gap-2 pt-6 flex-wrap'>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className='px-3 py-2 md:px-4 md:py-2 border border-slate-300 bg-white text-sm disabled:opacity-50'
            >
              ก่อนหน้า
            </button>
            <span className='text-sm text-slate-600 px-2 md:px-4'>
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className='px-3 py-2 md:px-4 md:py-2 border border-slate-300 bg-white text-sm disabled:opacity-50'
            >
              ต่อไป
            </button>
          </div>
        )}
      </div>

      {/* --- Floating Stack (Responsive) --- */}
      {selectedIds.size > 0 && (
        <div className='fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-center gap-3 md:gap-6 z-50 animate-fade-in-up border border-slate-700 shadow-xl rounded-lg md:rounded-none w-[95%] md:w-auto max-w-3xl'>
          <div className='flex items-center justify-between w-full md:w-auto gap-4'>
            <div className='flex flex-col'>
              <span className='text-xs md:text-sm text-slate-300'>
                เลือกข้อมูลแล้ว
              </span>
              <span className='font-bold text-sm md:text-base'>
                {selectedIds.size} รายการ
              </span>
            </div>
            <div className='hidden md:block w-px h-8 bg-slate-600'></div>
          </div>

          <div className='flex gap-2 items-center flex-wrap justify-center w-full md:w-auto'>
            <button
              onClick={() => setShowSelectedStack(!showSelectedStack)}
              className='flex-1 md:flex-none bg-white text-slate-800 px-3 py-2 text-xs md:text-sm hover:bg-slate-100 rounded md:rounded-none whitespace-nowrap'
            >
              ดูรายการที่เลือก
            </button>

            {viewMode === 'all' && (
              <button
                onClick={handlePublishSelected}
                className='flex-1 md:flex-none bg-emerald-600 text-white px-3 py-2 text-xs md:text-sm hover:bg-emerald-700 rounded md:rounded-none whitespace-nowrap'
              >
                นำไปแสดงผล
              </button>
            )}
            {viewMode === 'published' && (
              <button
                onClick={handleUnpublishSelected}
                className='flex-1 md:flex-none bg-amber-600 text-white px-3 py-2 text-xs md:text-sm hover:bg-amber-700 rounded md:rounded-none whitespace-nowrap'
              >
                ยกเลิกการแสดงผล
              </button>
            )}

            <button
              onClick={() => setSelectedIds(new Set())}
              className='flex-1 md:flex-none px-3 py-2 text-xs md:text-sm border border-slate-600 hover:bg-slate-700 text-slate-300 rounded md:rounded-none whitespace-nowrap'
            >
              ยกเลิก
            </button>
          </div>

          {/* Mini Stack View (Responsive) */}
          {showSelectedStack && (
            <div className='absolute bottom-full left-0 mb-2 w-full md:min-w-[350px] max-h-60 overflow-y-auto bg-white text-slate-800 border border-slate-300 p-2 shadow-lg rounded md:rounded-none'>
              <div className='text-sm font-bold p-2 border-b border-slate-100 mb-2 sticky top-0 bg-white z-10'>
                รายการที่เลือก ({selectedIds.size})
              </div>
              {Array.from(selectedIds).map((id) => {
                const item = data.find((d) => d.id === id)
                return item ? (
                  <div
                    key={id}
                    className='text-xs md:text-sm p-2 hover:bg-slate-50 border-b border-slate-50 truncate flex justify-between'
                  >
                    <span>
                      <span className='font-semibold text-blue-600 mr-2'>
                        {item.id}
                      </span>
                      {item.msg.substring(0, 30)}...
                    </span>
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
