import React, { useState, useMemo } from 'react'
import Swal from 'sweetalert2'

// ==========================================
// 1. Types & Interfaces
// ==========================================
export interface ContactFormData {
  id: string
  firstName: string
  lastName: string
  email: string
  telNumber: string
  preferredContact: 'email' | 'tel'
  message: string
  status: 'ตอบกลับแล้ว' | 'ยังไม่ตอบกลับ'
  createdAt: string
}

// Interface สำหรับการจัดกลุ่ม
interface GroupedContact {
  key: string // email หรือ tel
  items: ContactFormData[]
}

// ==========================================
// 2. Mock Data
// ==========================================
const mockContacts: ContactFormData[] = [
  {
    id: 'CON-001',
    firstName: 'สมชาย',
    lastName: 'สายลม',
    email: 'somchai@email.com',
    telNumber: '0812345678',
    preferredContact: 'email',
    message: 'สนใจสอบถามบริการติดตั้งอินเทอร์เน็ตครับ',
    status: 'ยังไม่ตอบกลับ',
    createdAt: '2024-05-10T10:00:00Z',
  },
  {
    id: 'CON-002',
    firstName: 'สมชาย',
    lastName: 'สายลม',
    email: 'somchai@email.com',
    telNumber: '0812345678',
    preferredContact: 'email',
    message: 'ยังไม่ได้รับเมลตอบกลับจากเจ้าหน้าที่เลยครับ',
    status: 'ยังไม่ตอบกลับ',
    createdAt: '2024-05-10T14:30:00Z',
  },
  {
    id: 'CON-003',
    firstName: 'วิภา',
    lastName: 'ใจดี',
    email: 'vipa@email.com',
    telNumber: '0998887777',
    preferredContact: 'tel',
    message: 'ต้องการใบเสนอราคาโครงการหมู่บ้าน',
    status: 'ตอบกลับแล้ว',
    createdAt: '2024-05-09T09:15:00Z',
  },
  {
    id: 'CON-004',
    firstName: 'มานะ',
    lastName: 'รักเรียน',
    email: 'mana@test.com',
    telNumber: '0800000000',
    preferredContact: 'email',
    message: 'ขอสอบถามที่ตั้งสำนักงานใหญ่',
    status: 'ยังไม่ตอบกลับ',
    createdAt: '2024-05-08T16:00:00Z',
  },
]

export default function ContactRequestManager() {
  const [data, setData] = useState<ContactFormData[]>(mockContacts)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set())

  // --- Logic: จัดกลุ่มข้อมูล ---
  const groupedData = useMemo(() => {
    const groups: { [key: string]: ContactFormData[] } = {}
    data.forEach((item) => {
      const key = item.email.toLowerCase() // ใช้ email เป็นหลักในการจัดกลุ่ม
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })

    return Object.entries(groups)
      .map(([key, items]) => ({
        key,
        items: items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.items[0].createdAt).getTime() -
          new Date(a.items[0].createdAt).getTime(),
      )
  }, [data])

  // --- Stats ---
  const stats = {
    total: data.length,
    replied: data.filter((d) => d.status === 'ตอบกลับแล้ว').length,
    pending: data.filter((d) => d.status === 'ยังไม่ตอบกลับ').length,
  }

  // --- Handlers ---
  const toggleGroup = (key: string) => {
    const newSet = new Set(expandedGroups)
    if (newSet.has(key)) newSet.delete(key)
    else newSet.add(key)
    setExpandedGroups(newSet)
  }

  const toggleDetail = (id: string) => {
    const newSet = new Set(expandedDetails)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setExpandedDetails(newSet)
  }

  const updateStatus = (id: string, currentStatus: string) => {
    const newStatus =
      currentStatus === 'ยังไม่ตอบกลับ' ? 'ตอบกลับแล้ว' : 'ยังไม่ตอบกลับ'

    Swal.fire({
      title: 'เปลี่ยนสถานะการติดต่อ?',
      text: `เปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus as any } : item,
          ),
        )
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตสำเร็จ',
          timer: 1500,
          showConfirmButton: false,
        })
      }
    })
  }

  const handleDownload = () => {
    Swal.fire({
      title: 'ดาวน์โหลดรายงาน',
      text: 'เลือกรูปแบบไฟล์ที่ต้องการ',
      icon: 'info',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '.CSV',
      denyButtonText: '.XLSX',
      cancelButtonText: '.PDF',
      confirmButtonColor: '#475569',
      denyButtonColor: '#10b981',
      cancelButtonColor: '#f43f5e',
    }).then((result) => {
      let format = ''
      if (result.isConfirmed) format = 'CSV'
      else if (result.isDenied) format = 'Excel'
      else if (result.dismiss === Swal.DismissReason.cancel) format = 'PDF'

      if (format) {
        Swal.fire({
          title: `กำลังส่งออก ${format}`,
          timer: 1000,
          didOpen: () => Swal.showLoading(),
        })
      }
    })
  }

  return (
    <div className='bg-slate-50 min-h-screen p-4 md:p-8 font-sans'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* --- Header & Download --- */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <h1 className='text-2xl font-bold text-slate-800'>
            รายการข้อความติดต่อ
          </h1>
          <button
            onClick={handleDownload}
            className='bg-white border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              />
            </svg>
            ดาวน์โหลดทั้งหมด
          </button>
        </div>

        {/* --- Stats Cards --- */}
        <div className='grid grid-cols-3 gap-4'>
          <div className='bg-white border border-slate-200 p-4 text-center'>
            <p className='text-slate-500 text-xs mb-1 uppercase'>ทั้งหมด</p>
            <p className='text-2xl font-bold'>{stats.total}</p>
          </div>
          <div className='bg-white border border-slate-200 p-4 text-center border-b-emerald-500 border-b-2'>
            <p className='text-emerald-600 text-xs mb-1 uppercase'>
              ตอบกลับแล้ว
            </p>
            <p className='text-2xl font-bold text-emerald-600'>
              {stats.replied}
            </p>
          </div>
          <div className='bg-white border border-slate-200 p-4 text-center border-b-amber-500 border-b-2'>
            <p className='text-amber-600 text-xs mb-1 uppercase'>ค้างตอบ</p>
            <p className='text-2xl font-bold text-amber-600'>{stats.pending}</p>
          </div>
        </div>

        {/* --- List Container --- */}
        <div className='bg-white border border-slate-200 overflow-hidden shadow-sm'>
          <div className='max-h-[600px] overflow-y-auto custom-scrollbar'>
            {groupedData.map((group) => {
              const hasMultiple = group.items.length > 1
              const isGroupExpanded = expandedGroups.has(group.key)

              return (
                <div
                  key={group.key}
                  className='border-b border-slate-100 last:border-0'
                >
                  {/* --- GROUP HEADER (Mini Display) --- */}
                  <div
                    onClick={() => toggleGroup(group.key)}
                    className='p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 bg-slate-100 flex items-center justify-center rounded-full text-slate-500'>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                      </div>
                      <div>
                        <p className='font-bold text-slate-800'>{group.key}</p>
                        <p className='text-xs text-slate-500'>
                          {group.items[0].telNumber}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      {hasMultiple && (
                        <span className='bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider'>
                          {group.items.length} รายการ
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>

                  {/* --- EXPANDED GROUP LIST --- */}
                  {isGroupExpanded && (
                    <div className='bg-slate-50/50 border-t border-slate-100 transition-all'>
                      {group.items.map((item) => {
                        const isDetailExpanded = expandedDetails.has(item.id)
                        return (
                          <div
                            key={item.id}
                            className='border-b border-slate-100 last:border-0'
                          >
                            {/* Entry Summary */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDetail(item.id)
                              }}
                              className='px-6 py-3 hover:bg-slate-100 cursor-pointer flex justify-between items-center'
                            >
                              <div className='flex items-center gap-3'>
                                <span
                                  className={`w-2 h-2 rounded-full ${item.status === 'ตอบกลับแล้ว' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
                                ></span>
                                <p className='text-sm font-medium'>
                                  {new Date(item.createdAt).toLocaleDateString(
                                    'th-TH',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: '2-digit',
                                    },
                                  )}
                                </p>
                                <p className='text-sm text-slate-600 truncate max-w-[200px] md:max-w-md italic'>
                                  "{item.message}"
                                </p>
                              </div>
                              <span className='text-[10px] text-slate-400 font-mono uppercase'>
                                {item.id}
                              </span>
                            </div>

                            {/* --- FULL DETAIL (Expanded) --- */}
                            {isDetailExpanded && (
                              <div className='px-12 py-6 bg-white border-y border-slate-100 space-y-4 animate-fade-in'>
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                  <div>
                                    <p className='text-slate-400 text-xs mb-1'>
                                      ชื่อ-นามสกุล
                                    </p>
                                    <p className='font-bold'>
                                      {item.firstName} {item.lastName}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-slate-400 text-xs mb-1'>
                                      ช่องทางที่สะดวก
                                    </p>
                                    <p className='font-bold uppercase'>
                                      {item.preferredContact === 'email'
                                        ? '📧 อีเมล'
                                        : '📞 โทรศัพท์'}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className='text-slate-400 text-xs mb-1'>
                                    ข้อความ
                                  </p>
                                  <div className='bg-slate-50 p-3 border border-slate-200 text-sm leading-relaxed text-slate-700'>
                                    {item.message}
                                  </div>
                                </div>
                                <div className='flex justify-between items-center pt-2'>
                                  <p className='text-[10px] text-slate-400 italic'>
                                    ส่งเมื่อ:{' '}
                                    {new Date(item.createdAt).toLocaleString(
                                      'th-TH',
                                    )}
                                  </p>
                                  <button
                                    onClick={() =>
                                      updateStatus(item.id, item.status)
                                    }
                                    className={`px-4 py-1.5 text-xs font-bold transition-colors ${item.status === 'ตอบกลับแล้ว' ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                  >
                                    {item.status === 'ตอบกลับแล้ว'
                                      ? 'ทำเป็นยังไม่ตอบ'
                                      : 'ยืนยันการตอบกลับ'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
