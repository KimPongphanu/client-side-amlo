import { useState, useMemo, useContext } from 'react'
import { NewsContext } from '../../context/NewsContext'

interface FilterState {
  startDate: string
  endDate: string
}

interface ToggleSwitchProps {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  itemId: string
}
const ToggleSwitch = ({ checked, onChange, itemId }: ToggleSwitchProps) => (
  <label className='relative inline-flex items-center cursor-pointer gap-2'>
    <span className={`text-[11px] font-bold ${checked ? 'text-emerald-600' : 'text-slate-400'}`}>
      {checked ? 'แสดงบนเว็บ' : 'ซ่อน'}
    </span>
    <input type='checkbox' checked={checked} onChange={onChange} className='sr-only peer' id={`toggle-${itemId}`} />
    <div className="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[18px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
  </label>
)

export default function ReviewManager() {
  const context = useContext(NewsContext)
  const commentList = useMemo(() => context?.commentList || [], [context?.commentList])
  const setCommentList = context?.setCommentList || (() => {})

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filter] = useState<FilterState>({ startDate: '', endDate: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'all' | 'published'>('all')

  const itemsPerPage = 12

  // สลับแสดง/ซ่อน รายเดียว
  const handleToggleShow = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation()
    setCommentList((prev) => prev.map((c) => (c.id === id ? { ...c, isShow: !c.isShow } : c)))
  }

  // 🌟 Bulk Action: แสดง/ซ่อน ทุกรายการที่เลือก
  const handleBulkSetShow = (show: boolean) => {
    setCommentList((prev) =>
      prev.map((c) => (selectedIds.has(c.id) ? { ...c, isShow: show } : c))
    )
    setSelectedIds(new Set())
  }

  const processedData = useMemo(() => {
    let filtered = [...commentList]
    if (viewMode === 'published') filtered = filtered.filter((item) => item.isShow)
    if (filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate).getTime()
      const end = new Date(filter.endDate).getTime() + 86400000
      filtered = filtered.filter((item) => {
        const time = new Date(item.createdAt).getTime()
        return time >= start && time <= end
      })
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [commentList, filter, viewMode])

  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const currentItems = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalComments = processedData.length
  const avgStar = totalComments > 0 ? (processedData.reduce((acc, curr) => acc + curr.star, 0) / totalComments).toFixed(2) : '0.00'

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === currentItems.length) setSelectedIds(new Set())
    else {
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

  return (
    <div className='bg-slate-100 min-h-screen p-4 md:p-8 font-sans text-slate-800 pb-32 md:pb-8'>
      <div className='max-w-7xl mx-auto space-y-6'>

        {/* Header */}
        <header className='flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 pb-4'>
          <div className='w-full lg:w-auto'>
            <h1 className='text-2xl font-bold mb-3 md:mb-2'>จัดการความคิดเห็น</h1>
            <div className='flex flex-wrap gap-2 md:gap-4'>
              <div className='bg-white border border-slate-300 px-4 py-2 flex items-center gap-3 flex-1 sm:flex-none justify-center rounded-lg shadow-sm'>
                <span className='text-slate-500 text-sm'>ทั้งหมด</span>
                <span className='text-xl font-bold'>{totalComments}</span>
              </div>
              {totalComments > 0 && (
                <div className='bg-white border border-slate-300 px-4 py-2 flex items-center gap-3 flex-1 sm:flex-none justify-center rounded-lg shadow-sm'>
                  <span className='text-slate-500 text-sm'>คะแนนเฉลี่ย</span>
                  <span className='text-xl font-bold text-orange-500'>{avgStar}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tabs & Select All */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2 gap-4'>
          <div className='flex gap-6'>
            <button onClick={() => handleTabChange('all')} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${viewMode === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              ข้อมูลทั้งหมด
            </button>
            <button onClick={() => handleTabChange('published')} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${viewMode === 'published' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              แสดงผลหน้าเว็บ
            </button>
          </div>
          <button onClick={handleSelectAll} className='text-sm text-blue-600 hover:underline'>
            {selectedIds.size > 0 && selectedIds.size === currentItems.length ? 'ยกเลิกการเลือกหน้าปัจจุบัน' : 'เลือกทั้งหมดในหน้านี้'}
          </button>
        </div>

        {/* 🌟 Bulk Action Bar */}
        <div className={`transition-all duration-300 overflow-hidden ${selectedIds.size > 0 ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className='bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
            <span className='text-sm font-bold text-blue-700'>เลือกแล้ว {selectedIds.size} รายการ</span>
            <div className='flex gap-2'>
              <button onClick={() => handleBulkSetShow(true)} className='flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors shadow-sm'>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                แสดงทั้งหมด
              </button>
              <button onClick={() => handleBulkSetShow(false)} className='flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white text-sm font-bold transition-colors shadow-sm'>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                ซ่อนทั้งหมด
              </button>
              <button onClick={() => setSelectedIds(new Set())} className='px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 text-sm font-bold transition-colors'>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {processedData.length === 0 ? (
          <div className='text-center py-20 text-slate-500'>ไม่พบข้อมูลในหมวดหมู่นี้</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {currentItems.map((item) => {
              const isToday = new Date(item.createdAt).toDateString() === new Date().toDateString()
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`relative bg-white border rounded-2xl p-5 flex flex-col h-full transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedIds.has(item.id) ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : 'border-slate-200'}`}
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div className='h-6'>
                      {isToday && <span className='bg-green-100 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-md font-bold'>วันนี้</span>}
                    </div>
                    <input type='checkbox' checked={selectedIds.has(item.id)} onChange={() => handleSelect(item.id)} onClick={(e) => e.stopPropagation()} className='w-5 h-5 cursor-pointer accent-slate-600 border-slate-300 rounded' />
                  </div>

                  <div className='flex gap-1 mb-4 text-orange-400'>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < item.star ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    ))}
                  </div>

                  <p className='text-slate-700 text-base font-medium flex-1 mb-6 leading-relaxed'>{item.msg}</p>

                  <div className='text-sm text-slate-400 font-medium flex justify-between items-center border-t border-slate-100 pt-4 mt-auto mb-4'>
                    <span>{item.id}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('th-TH')} {new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className='bg-slate-50 border-t border-slate-100 px-5 py-3 -mx-5 -mb-5 flex justify-between items-center rounded-b-2xl' onClick={(e) => e.stopPropagation()}>
                    <div className='text-xs text-slate-500 font-bold uppercase tracking-wide'>แสดงหน้าเว็บ</div>
                    <ToggleSwitch checked={!!item.isShow} onChange={(e) => handleToggleShow(item.id, e)} itemId={item.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center gap-2 pt-4'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {page}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}