// src/components/dashboard/ContactRequestManager.tsx
import { useEffect, useMemo, useState } from 'react'
import { useDashboardStore } from '../../stores/useDashboardStore'
import type { ContactRequest } from '../../type'
import ExportExcelButton from '../common/ExportExcelButton'

interface GroupedContacts {
  key: string
  items: ContactRequest[]
}

export default function ContactRequestManager() {
  const contacts = useDashboardStore((state) => state.contacts)
  const fetchAllContacts = useDashboardStore((state) => state.contacts.fetchAll)
  useEffect(() => {
    fetchAllContacts()
  }, [fetchAllContacts])

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<
    'ทั้งหมด' | 'ยังไม่ตอบกลับ' | 'ตอบกลับแล้ว'
  >('ทั้งหมด')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set())

  const groupedData = useMemo<GroupedContacts[]>(() => {
    const groups: Record<string, ContactRequest[]> = {}
    const filtered = contacts.data.filter((item: ContactRequest) => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'ทั้งหมด' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
    filtered.forEach((item: ContactRequest) => {
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

  const toggleGroup = (key: string): void => {
    const newSet = new Set<string>(expandedGroups)
    if (newSet.has(key)) newSet.delete(key)
    else newSet.add(key)
    setExpandedGroups(newSet)
  }

  const toggleDetail = (id: string): void => {
    const newSet = new Set<string>(expandedDetails)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setExpandedDetails(newSet)
  }

  return (
    <div className='bg-slate-50 min-h-screen p-4 md:p-8 font-sans antialiased text-slate-800'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header & Action */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5'>
          <div>
            <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2'>
              <i className='fas fa-inbox text-blue-600' />
              รายการข้อความติดต่อกลับ
            </h1>
            <p className='text-sm text-slate-500 mt-1'>
              ตรวจสอบ ตรวจตรา และบันทึกสถานะการติดต่อกับประชาชนผู้ฝากข้อความ
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <ExportExcelButton
              data={contacts.data as unknown as Record<string, unknown>[]}
              filename='contact_export'
              columns={[
                { key: 'firstName', label: 'ชื่อ' },
                { key: 'lastName', label: 'นามสกุล' },
                { key: 'email', label: 'อีเมล' },
                { key: 'telNumber', label: 'เบอร์โทร', fallback: '-' },
                {
                  key: 'preferredContact',
                  label: 'ช่องทาง',
                  format: (v) => (v === 'email' ? 'อีเมล' : 'โทรศัพท์'),
                },
                { key: 'message', label: 'ข้อความ' },
                { key: 'status', label: 'สถานะ' },
                {
                  key: 'createdAt',
                  label: 'วันที่ส่ง',
                  format: (v) => new Date(v as string).toLocaleString('th-TH'),
                },
              ]}
            />
            <button
              onClick={contacts.fetchAll}
              disabled={contacts.loading}
              className='bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer'
            >
              <i
                className={`fas fa-sync-alt ${contacts.loading ? 'fa-spin' : ''}`}
              />
              รีเฟรชข้อมูล
            </button>
          </div>
        </div>

        {/* Stats Bars */}
        <div className='grid grid-cols-3 gap-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm'>
          <div className='flex items-center justify-between px-5 py-3 border-r border-slate-100'>
            <span className='text-xs font-semibold text-slate-400 flex items-center gap-1.5'>
              <i className='fas fa-list text-slate-300' /> ทั้งหมด
            </span>
            <span className='text-xl font-black text-slate-800 tabular-nums'>
              {contacts.total}
            </span>
          </div>
          <div className='flex items-center justify-between px-5 py-3 border-r border-slate-100'>
            <span className='text-xs font-semibold text-slate-500 flex items-center gap-1.5'>
              <i className='fas fa-check-circle text-emerald-400' /> ตอบกลับแล้ว
            </span>
            <span className='text-xl font-black text-emerald-600 tabular-nums'>
              {contacts.total - contacts.pending}
            </span>
          </div>
          <div className='flex items-center justify-between px-5 py-3'>
            <span className='text-xs font-semibold text-slate-500 flex items-center gap-1.5'>
              <i className='fas fa-clock text-amber-400' /> ค้างตอบ
            </span>
            <span className='text-xl font-black text-amber-500 tabular-nums'>
              {contacts.pending}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className='bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between'>
          <div className='relative w-full md:w-80'>
            <i className='fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm' />
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

        {/* List Container */}
        <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm'>
          <div className='max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-slate-100'>
            {contacts.loading ? (
              <div className='p-12 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3'>
                <i className='fas fa-spinner fa-spin text-blue-600 text-2xl' />
                กำลังดึงข้อมูลความคืบหน้าล่าสุด...
              </div>
            ) : groupedData.length === 0 ? (
              <div className='p-12 text-center text-slate-400 font-medium'>
                <i className='fas fa-inbox text-slate-300 text-3xl mb-3 block' />
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
                    {/* Group Header */}
                    <div
                      onClick={() => toggleGroup(group.key)}
                      className={`p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors select-none ${isGroupExpanded ? 'bg-slate-50/50' : ''}`}
                    >
                      <div className='flex items-center gap-4 min-w-0'>
                        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-blue-200'>
                          <i className='fas fa-envelope text-blue-500 text-sm' />
                        </div>
                        <div className='min-w-0'>
                          <p className='font-bold text-slate-900 truncate'>
                            {group.key}
                          </p>
                          <p className='text-xs text-slate-400 font-medium mt-0.5'>
                            <i className='fas fa-user text-slate-300 mr-1' />
                            {group.items[0].firstName} {group.items[0].lastName}
                            {group.items[0].telNumber && (
                              <>
                                <i className='fas fa-circle text-[4px] text-slate-300 mx-1.5 align-middle' />
                                <i className='fas fa-phone text-slate-300 mr-1' />
                                {group.items[0].telNumber}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 ml-4 shrink-0'>
                        {hasMultiple && (
                          <span className='bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded-md font-extrabold uppercase tracking-wide border border-blue-100 flex items-center gap-1'>
                            <i className='fas fa-comments text-[9px]' />
                            {group.items.length}
                          </span>
                        )}
                        <i
                          className={`fas fa-chevron-down text-slate-400 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded Group List */}
                    {isGroupExpanded && (
                      <div className='bg-slate-50/40 border-t border-slate-100 divide-y divide-slate-100/70 shadow-inner'>
                        {group.items.map((item: ContactRequest) => {
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
                                    className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'ตอบกลับแล้ว' ? 'bg-emerald-500' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)] animate-pulse'}`}
                                  />
                                  <span className='text-xs font-bold text-slate-500 whitespace-nowrap font-mono bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1'>
                                    <i className='fas fa-calendar-alt text-slate-300' />
                                    {new Date(
                                      item.createdAt,
                                    ).toLocaleDateString('th-TH', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: '2-digit',
                                    })}
                                  </span>
                                  <p className='text-sm text-slate-600 truncate italic font-medium'>
                                    "{item.message}"
                                  </p>
                                </div>
                                <span className='text-[10px] text-slate-400 font-mono uppercase font-semibold shrink-0 select-all flex items-center gap-1'>
                                  <i className='fas fa-hashtag text-[8px]' />
                                  {item.id.slice(0, 8)}
                                </span>
                              </div>

                              {/* Full Detail (Expanded) */}
                              {isDetailExpanded && (
                                <div className='px-6 md:px-10 py-5 bg-white border-y border-slate-100 space-y-4 animate-fade-in'>
                                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='bg-white rounded-xl border border-slate-200 p-4 shadow-sm'>
                                      <div className='flex items-center gap-2 mb-3'>
                                        <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
                                          <i className='fas fa-user text-blue-500 text-xs' />
                                        </div>
                                        <span className='text-xs font-bold text-slate-400 uppercase tracking-wide'>
                                          ผู้ติดต่อ
                                        </span>
                                      </div>
                                      <p className='text-sm font-bold text-slate-800'>
                                        {item.firstName} {item.lastName}
                                      </p>
                                      <p className='text-xs text-slate-400 mt-0.5'>
                                        {item.email}
                                      </p>
                                    </div>
                                    <div className='bg-white rounded-xl border border-slate-200 p-4 shadow-sm'>
                                      <div className='flex items-center gap-2 mb-3'>
                                        <div className='w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center'>
                                          <i className='fas fa-phone text-emerald-500 text-xs' />
                                        </div>
                                        <span className='text-xs font-bold text-slate-400 uppercase tracking-wide'>
                                          ช่องทางติดต่อ
                                        </span>
                                      </div>
                                      <p className='text-sm font-bold text-slate-800'>
                                        {item.telNumber || '-'}
                                      </p>
                                      <p className='text-xs text-slate-400 mt-0.5'>
                                        {item.preferredContact === 'email' ? (
                                          <>
                                            <i className='fas fa-envelope text-blue-400 mr-1' />
                                            อีเมล
                                          </>
                                        ) : (
                                          <>
                                            <i className='fas fa-phone-alt text-emerald-400 mr-1' />
                                            โทรศัพท์
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className='bg-white rounded-xl border border-slate-200 p-4 shadow-sm'>
                                    <div className='flex items-center gap-2 mb-3'>
                                      <div className='w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center'>
                                        <i className='fas fa-comment-dots text-amber-500 text-xs' />
                                      </div>
                                      <span className='text-xs font-bold text-slate-400 uppercase tracking-wide'>
                                        ข้อความ
                                      </span>
                                    </div>
                                    <div className='bg-slate-50 p-4 rounded-lg text-sm leading-relaxed text-slate-700 border border-slate-100 whitespace-pre-wrap'>
                                      {item.message}
                                    </div>
                                  </div>

                                  <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-2 border-t border-slate-100'>
                                    <div className='text-xs text-slate-400 space-y-1'>
                                      <p className='flex items-center gap-1.5'>
                                        <i className='fas fa-paper-plane text-slate-300' />
                                        ส่งเมื่อ:{' '}
                                        {new Date(
                                          item.createdAt,
                                        ).toLocaleString('th-TH')}
                                      </p>
                                      {item.updatedAt &&
                                        item.updatedAt !== item.createdAt && (
                                          <p className='flex items-center gap-1.5'>
                                            <i className='fas fa-edit text-slate-300' />
                                            แก้ไขล่าสุด:{' '}
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
                                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm border active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                                        item.status === 'ตอบกลับแล้ว'
                                          ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                          : 'bg-[#185FA5] text-white border-[#185FA5] hover:bg-[#134b82]'
                                      }`}
                                    >
                                      {item.status === 'ตอบกลับแล้ว' ? (
                                        <>
                                          <i className='fas fa-undo' />{' '}
                                          เปลี่ยนเป็นยังไม่ตอบ
                                        </>
                                      ) : (
                                        <>
                                          <i className='fas fa-check' /> บันทึก
                                          "ตอบกลับแล้ว"
                                        </>
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
