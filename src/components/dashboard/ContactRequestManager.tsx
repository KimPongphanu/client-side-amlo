// src/components/dashboard/ContactRequestManager.tsx[cite: 1]
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDashboard } from '../../context/DashboardContext'

export default function ContactRequestManager() {
  const { contacts } = useDashboard()

  // States สำหรับระเบียบการจัดแสดงผล
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ทั้งหมด' | 'ยังไม่ตอบกลับ' | 'ตอบกลับแล้ว'
  >('ทั้งหมด')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set())

  // --- Logic: กรองข้อมูลและจัดกลุ่มข้อความตาม Email (รวมคำขอจากคนเดียวกัน) ---
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {}

    // คัดกรองผ่านช่องค้นหาก่อนจัดกลุ่ม
    const filtered = contacts.data.filter((item) => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'ทั้งหมด' || item.status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.forEach((item) => {
      const key = item.email.toLowerCase()
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
  }, [contacts.data, searchTerm, statusFilter])

  // --- Handlers ในการเปิด/ปิดแถบยุบขยาย ---
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

  return (
    <div className='bg-slate-50 min-h-screen p-4 md:p-8 font-sans antialiased text-slate-800'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* --- Header & Action --- */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5'>
          <div>
            <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
              รายการข้อความติดต่อกลับ
            </h1>
            <p className='text-sm text-slate-500 mt-1'>
              ตรวจสอบ ตรวจตรา และบันทึกสถานะการติดต่อกับประชาชนผู้ฝากข้อความ
            </p>
          </div>
          <button
            onClick={contacts.fetchAll}
            disabled={contacts.loading}
            className='bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer'
          >
            <RefreshCw
              className={`w-4 h-4 ${contacts.loading ? 'animate-spin' : ''}`}
            />
            รีเฟรชข้อมูล
          </button>
        </div>

        {/* --- Stats Bars (Minimal & Compact) --- */}
        <div className='grid grid-cols-3 gap-3 bg-white border border-slate-100 rounded-xl p-2 shadow-sm'>
          {/* ทั้งหมด */}
          <div className='flex items-center justify-between px-4 py-2 border-r border-slate-100'>
            <span className='text-xs font-semibold text-slate-400'>
              ทั้งหมด
            </span>
            <span className='text-xl font-black text-slate-800 tabular-nums'>
              {contacts.total}
            </span>
          </div>

          {/* ตอบกลับแล้ว */}
          <div className='flex items-center justify-between px-4 py-2 border-r border-slate-100'>
            <span className='text-xs font-semibold text-slate-500'>
              ตอบกลับแล้ว
            </span>
            <span className='text-xl font-black text-emerald-600 tabular-nums'>
              {contacts.total - contacts.pending}
            </span>
          </div>

          {/* ค้างตอบ */}
          <div className='flex items-center justify-between px-4 py-2'>
            <span className='text-xs font-semibold text-slate-500'>
              ค้างตอบ
            </span>
            <span className='text-xl font-black text-amber-500 tabular-nums'>
              {contacts.pending}
            </span>
          </div>
        </div>

        {/* --- Filter Bar --- */}
        <div className='bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between'>
          <div className='relative w-full md:w-80'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
            <input
              type='text'
              placeholder='ค้นหาด้วยชื่อ, อีเมล หรือข้อความ...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
            />
          </div>

          <div className='flex rounded-xl bg-slate-100 p-1 w-full md:w-auto text-xs font-bold'>
            {(['ทั้งหมด', 'ยังไม่ตอบกลับ', 'ตอบกลับแล้ว'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        </div>

        {/* --- List Container --- */}
        <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm'>
          <div className='max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-slate-100'>
            {contacts.loading ? (
              <div className='p-12 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3'>
                <RefreshCw className='w-6 h-6 text-blue-600 animate-spin' />
                กำลังดึงข้อมูลความคืบหน้าล่าสุด...
              </div>
            ) : groupedData.length === 0 ? (
              <div className='p-12 text-center text-slate-400 font-medium'>
                ไม่พบข้อมูลรายการข้อความที่ระบุตามเงื่อนไขในขณะนี้
              </div>
            ) : (
              groupedData.map((group) => {
                const hasMultiple = group.items.length > 1
                const isGroupExpanded = expandedGroups.has(group.key)

                return (
                  <div
                    key={group.key}
                    className='transition-colors duration-150'
                  >
                    {/* --- GROUP HEADER (Mini Display) --- */}
                    <div
                      onClick={() => toggleGroup(group.key)}
                      className={`p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors select-none ${isGroupExpanded ? 'bg-slate-50/50' : ''}`}
                    >
                      <div className='flex items-center gap-4 min-w-0'>
                        <div className='w-10 h-10 bg-slate-100 flex items-center justify-center rounded-xl text-slate-500 shrink-0 border border-slate-200'>
                          <Mail className='w-5 h-5 text-slate-600' />
                        </div>
                        <div className='min-w-0'>
                          <p className='font-bold text-slate-900 truncate'>
                            {group.key}
                          </p>
                          <p className='text-xs text-slate-400 font-medium mt-0.5'>
                            {group.items[0].firstName} {group.items[0].lastName}{' '}
                            {group.items[0].telNumber &&
                              `• ${group.items[0].telNumber}`}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 ml-4 shrink-0'>
                        {hasMultiple && (
                          <span className='bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded-md font-extrabold uppercase tracking-wide border border-blue-100'>
                            {group.items.length} ข้อความ
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* --- EXPANDED GROUP LIST --- */}
                    {isGroupExpanded && (
                      <div className='bg-slate-50/40 border-t border-slate-100 divide-y divide-slate-100/70 shadow-inner'>
                        {group.items.map((item: any) => {
                          const isDetailExpanded = expandedDetails.has(item.id)
                          return (
                            <div
                              key={item.id}
                              className='transition-all duration-200'
                            >
                              {/* Entry Summary */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleDetail(item.id)
                                }}
                                className={`px-6 py-3.5 hover:bg-slate-100/80 cursor-pointer flex justify-between items-center ${isDetailExpanded ? 'bg-slate-100/50' : ''}`}
                              >
                                <div className='flex items-center gap-3 min-w-0 pr-4'>
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.status === 'ตอบกลับแล้ว' ? 'bg-emerald-500' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse'}`}
                                  />
                                  <p className='text-xs font-bold text-slate-500 whitespace-nowrap font-mono bg-white border border-slate-200 px-2 py-0.5 rounded'>
                                    {new Date(
                                      item.createdAt,
                                    ).toLocaleDateString('th-TH', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: '2-digit',
                                    })}
                                  </p>
                                  <p className='text-sm text-slate-600 truncate italic font-medium'>
                                    "{item.message}"
                                  </p>
                                </div>
                                <span className='text-[10px] text-slate-400 font-mono uppercase font-semibold shrink-0 select-all'>
                                  {item.id}
                                </span>
                              </div>

                              {/* --- FULL DETAIL (Expanded) --- */}
                              {isDetailExpanded && (
                                <div className='px-12 py-6 bg-white border-y border-slate-100 space-y-4 animate-fade-in'>
                                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                                    <div className='bg-slate-50/50 p-3 rounded-xl border border-slate-100'>
                                      <p className='text-slate-400 text-xs font-bold mb-0.5 uppercase tracking-wide'>
                                        ชื่อ-นามสกุล ผู้ส่ง
                                      </p>
                                      <p className='font-bold text-slate-800'>
                                        {item.firstName} {item.lastName}
                                      </p>
                                    </div>
                                    <div className='bg-slate-50/50 p-3 rounded-xl border border-slate-100'>
                                      <p className='text-slate-400 text-xs font-bold mb-0.5 uppercase tracking-wide'>
                                        ช่องทางที่สะดวกติดต่อกลับ
                                      </p>
                                      <p className='font-bold text-slate-800 flex items-center gap-1.5'>
                                        {item.preferredContact === 'email' ? (
                                          <>
                                            <Mail className='w-4 h-4 text-blue-600' />{' '}
                                            อีเมลการสื่อสาร
                                          </>
                                        ) : (
                                          <>
                                            <Phone className='w-4 h-4 text-emerald-600' />{' '}
                                            โทรศัพท์สายตรง
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <p className='text-slate-400 text-xs font-bold mb-1 uppercase tracking-wide'>
                                      ข้อความหรือรายละเอียดการสอบถาม
                                    </p>
                                    <div className='bg-slate-50 p-4 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-700 shadow-inner whitespace-pre-wrap selection:bg-blue-100'>
                                      {item.message}
                                    </div>
                                  </div>

                                  <div className='flex flex-col sm:flex-row justify-between sm:items-center pt-2 gap-4 border-t border-slate-100'>
                                    <div className='text-[11px] text-slate-400 font-medium space-y-0.5'>
                                      <p className='flex items-center gap-1'>
                                        <Calendar className='w-3 h-3' />{' '}
                                        ส่งมาเมื่อ:{' '}
                                        {new Date(
                                          item.createdAt,
                                        ).toLocaleString('th-TH')}
                                      </p>
                                      {item.updatedAt &&
                                        item.updatedAt !== item.createdAt && (
                                          <p className='text-slate-400 font-bold flex items-center gap-1'>
                                            ✏️ แก้ไขล่าสุดเมื่อ:{' '}
                                            {new Date(
                                              item.updatedAt,
                                            ).toLocaleString('th-TH')}
                                          </p>
                                        )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        contacts.updateStatus(
                                          item.id,
                                          item.status,
                                        )
                                      }
                                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm border active:scale-95 cursor-pointer ${
                                        item.status === 'ตอบกลับแล้ว'
                                          ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                          : 'bg-[#185FA5] text-white border-[#185FA5] hover:bg-[#134b82] shadow-blue-500/10'
                                      }`}
                                    >
                                      {item.status === 'ตอบกลับแล้ว' ? (
                                        <div className='flex items-center gap-1'>
                                          <AlertCircle className='w-3.5 h-3.5' />{' '}
                                          เปลี่ยนเป็นยังไม่ตอบ
                                        </div>
                                      ) : (
                                        <div className='flex items-center gap-1'>
                                          <CheckCircle2 className='w-3.5 h-3.5' />{' '}
                                          บันทึก "ตอบกลับแล้ว"
                                        </div>
                                      )}
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
              })
            )}
          </div>
        </div>
      </div>

      {/* สไตล์ตกแต่งเฉพาะที่ไม่มีในชุด Tailwind พื้นฐาน */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .animate-fade-in { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
