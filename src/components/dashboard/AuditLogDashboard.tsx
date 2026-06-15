// src/components/dashboard/AuditLogDashboard.tsx
import { useCallback, useEffect, useState } from 'react'
import { auditService, type AuditLogEntry } from '../../services/auditService'
import { useAuthStore } from '../../stores/useAuthStore'

type SortField = 'createdAt' | 'action' | 'ipAddress'
type SortOrder = 'asc' | 'desc'

type ActionFilter =
  | 'all'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'CREATE_ADMIN_SUCCESS'
  | 'BAN_ADMIN_SUCCESS'
  | 'UNBAN_ADMIN_SUCCESS'
  | 'DELETE_ADMIN_SUCCESS'
  | 'EMERGENCY_ACTION_SUCCESS'
  | 'EMERGENCY_ACTION_FAILED'
  | 'OTP_ACTION_UNBAN_SUCCESS'
  | 'FORCE_LOGOUT_SUCCESS'
  | 'SUPERVISOR_REQUEST_CREATED'
  | 'SUPERVISOR_REQUEST_APPROVED'
  | 'SUPERVISOR_REQUEST_REJECTED'
  | 'ENABLE_2FA_SUCCESS'
  | 'RECOVERY_KEY_USED'

const actionConfig: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  LOGIN_SUCCESS: {
    label: 'Login สำเร็จ',
    icon: 'fa-sign-in-alt',
    color: 'text-green-700 bg-green-100',
  },
  LOGIN_FAILED: {
    label: 'Login ล้มเหลว',
    icon: 'fa-exclamation-triangle',
    color: 'text-red-700 bg-red-100',
  },
  LOGOUT: {
    label: 'ออกจากระบบ',
    icon: 'fa-sign-out-alt',
    color: 'text-gray-700 bg-gray-100',
  },
  CREATE_ADMIN_SUCCESS: {
    label: 'สร้าง Admin',
    icon: 'fa-user-plus',
    color: 'text-blue-700 bg-blue-100',
  },
  BAN_ADMIN_SUCCESS: {
    label: 'แบนผู้ใช้',
    icon: 'fa-ban',
    color: 'text-red-700 bg-red-100',
  },
  UNBAN_ADMIN_SUCCESS: {
    label: 'ปลดแบน',
    icon: 'fa-check-circle',
    color: 'text-green-700 bg-green-100',
  },
  DELETE_ADMIN_SUCCESS: {
    label: 'ลบผู้ใช้',
    icon: 'fa-trash-alt',
    color: 'text-red-700 bg-red-100',
  },
  CREATE_NEWS_SUCCESS: {
    label: 'สร้างข่าว',
    icon: 'fa-newspaper',
    color: 'text-purple-700 bg-purple-100',
  },
  UPDATE_NEWS_SUCCESS: {
    label: 'อัปเดตข่าว',
    icon: 'fa-edit',
    color: 'text-purple-700 bg-purple-100',
  },
  CREATE_DEPARTMENT_SUCCESS: {
    label: 'สร้างหน่วยงาน',
    icon: 'fa-building',
    color: 'text-indigo-700 bg-indigo-100',
  },
  UPDATE_DEPARTMENT_SUCCESS: {
    label: 'อัปเดตหน่วยงาน',
    icon: 'fa-edit',
    color: 'text-indigo-700 bg-indigo-100',
  },
  DELETE_DEPARTMENT_SUCCESS: {
    label: 'ลบหน่วยงาน',
    icon: 'fa-trash-alt',
    color: 'text-red-700 bg-red-100',
  },
  ENABLE_2FA_SUCCESS: {
    label: 'เปิด 2FA',
    icon: 'fa-shield-alt',
    color: 'text-green-700 bg-green-100',
  },
  DISABLE_2FA_SUCCESS: {
    label: 'ปิด 2FA',
    icon: 'fa-shield-alt',
    color: 'text-yellow-700 bg-yellow-100',
  },
  REGENERATE_RECOVERY_KEYS: {
    label: 'สร้าง Keys ใหม่',
    icon: 'fa-key',
    color: 'text-orange-700 bg-orange-100',
  },
  RECOVERY_KEY_USED: {
    label: 'ใช้ Recovery Key',
    icon: 'fa-key',
    color: 'text-red-700 bg-red-100',
  },
  EMERGENCY_ACTION_SUCCESS: {
    label: 'ฉุกเฉินสำเร็จ',
    icon: 'fa-ambulance',
    color: 'text-green-700 bg-green-100',
  },
  EMERGENCY_ACTION_FAILED: {
    label: 'ฉุกเฉินล้มเหลว',
    icon: 'fa-exclamation-circle',
    color: 'text-red-700 bg-red-100',
  },
  OTP_ACTION_UNBAN_SUCCESS: {
    label: 'ปลดแบน OTP',
    icon: 'fa-unlock',
    color: 'text-green-700 bg-green-100',
  },
  OTP_ACTION_FAILED: {
    label: 'OTP ผิด',
    icon: 'fa-times-circle',
    color: 'text-red-700 bg-red-100',
  },
  FORCE_LOGOUT_SUCCESS: {
    label: 'Force Logout',
    icon: 'fa-power-off',
    color: 'text-orange-700 bg-orange-100',
  },
  FORCE_LOGOUT_FAILED: {
    label: 'Force Logout ล้ม',
    icon: 'fa-times-circle',
    color: 'text-red-700 bg-red-100',
  },
  SUPERVISOR_REQUEST_CREATED: {
    label: 'สร้างคำร้อง',
    icon: 'fa-file-alt',
    color: 'text-blue-700 bg-blue-100',
  },
  SUPERVISOR_REQUEST_APPROVED: {
    label: 'อนุมัติคำร้อง',
    icon: 'fa-check',
    color: 'text-green-700 bg-green-100',
  },
  SUPERVISOR_REQUEST_REJECTED: {
    label: 'ปฏิเสธคำร้อง',
    icon: 'fa-times',
    color: 'text-red-700 bg-red-100',
  },
}

const TH_CLASS =
  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 transition-colors'
const TD_CLASS = 'px-6 py-4 whitespace-nowrap text-sm'

export default function AuditLogDashboard() {
  const { user } = useAuthStore()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(50)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  const fetchLogs = useCallback(async () => {
    if (user?.role !== 'SUPERVISOR') return
    setIsLoading(true)
    setError('')
    try {
      const { data, pagination } = await auditService.getAuditLogs(
        page,
        limit,
        sortField,
        sortOrder,
        actionFilter,
        searchTerm,
      )
      setLogs(data)
      setTotal(pagination.total)
      setTotalPages(pagination.totalPages)
    } catch {
      setError('ไม่สามารถโหลด Audit Logs ได้')
    } finally {
      setIsLoading(false)
    }
  }, [user, page, limit, sortField, sortOrder, actionFilter, searchTerm])

  useEffect(() => {
    if (user?.role !== 'SUPERVISOR') {
      setIsLoading(false)
      return
    }
    fetchLogs()
  }, [fetchLogs, user])

  // Reset page when filter/search/limit changes
  useEffect(() => {
    setPage(1)
  }, [actionFilter, searchTerm, limit])

  const handleSort = (field: SortField) => {
    if (sortField === field)
      setSortOrder((p) => (p === 'desc' ? 'asc' : 'desc'))
    else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (f: SortField) => {
    if (sortField !== f) return 'fa-sort text-gray-300'
    return sortOrder === 'desc'
      ? 'fa-sort-down text-blue-600'
      : 'fa-sort-up text-blue-600'
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
  }

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getAction = (action: string) =>
    actionConfig[action] || {
      label: action.replace(/_/g, ' '),
      icon: 'fa-circle',
      color: 'text-gray-700 bg-gray-100',
    }

  const renderPagination = () => {
    const pages: (number | string)[] = []
    const delta = 2
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    pages.push(1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)

    return (
      <div className='flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200 gap-3'>
        <div className='flex items-center gap-3'>
          <p className='text-sm text-gray-500'>
            {total} รายการ · หน้า {page} จาก {totalPages}
          </p>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className='px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value={25}>25 รายการ</option>
            <option value={50}>50 รายการ</option>
            <option value={100}>100 รายการ</option>
          </select>
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className='px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
          >
            <i className='fas fa-chevron-left mr-1' /> ก่อนหน้า
          </button>
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={`e-${i}`} className='px-2 text-gray-400'>
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-100'}`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className='px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
          >
            ถัดไป <i className='fas fa-chevron-right ml-1' />
          </button>
        </div>
      </div>
    )
  }

  if (user?.role !== 'SUPERVISOR') {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='p-8 text-center bg-white rounded-2xl shadow-lg'>
          <i className='fas fa-lock text-4xl text-red-500 mb-4' />
          <h2 className='text-xl font-bold text-red-600'>ไม่มีสิทธิ์เข้าถึง</h2>
          <p className='mt-2 text-gray-500'>เฉพาะ Supervisor เท่านั้น</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-4 md:p-6 font-sans'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          <i className='fas fa-history text-blue-600 mr-2' />
          Audit Logs
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          บันทึกการดำเนินการทั้งหมดในระบบ
        </p>
      </div>

      <div className='mb-5 flex flex-col sm:flex-row gap-3'>
        <div className='flex-1 relative'>
          <i className='fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm' />
          <input
            type='text'
            placeholder='ค้นหา...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
          className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
        >
          <option value='all'>ทั้งหมด</option>
          {Object.entries(actionConfig).map(([k, c]) => (
            <option key={k} value={k}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          onClick={fetchLogs}
          className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
        >
          <i className='fas fa-sync-alt mr-1.5' /> รีเฟรช
        </button>
      </div>

      {error && (
        <div className='mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg'>
          <i className='fas fa-exclamation-circle mr-1.5' />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center py-16'>
          <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : logs.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200'>
          <i className='fas fa-inbox text-4xl text-gray-300 mb-3' />
          <p className='text-gray-500'>ไม่พบ Audit Logs</p>
        </div>
      ) : (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {[
                    {
                      key: 'createdAt' as SortField,
                      label: 'เวลา',
                      icon: 'fa-clock',
                    },
                    {
                      key: 'action' as SortField,
                      label: 'Action',
                      icon: 'fa-tag',
                    },
                    null,
                    {
                      key: 'ipAddress' as SortField,
                      label: 'IP',
                      icon: 'fa-network-wired',
                    },
                    null,
                  ].map((col, i) =>
                    col ? (
                      <th
                        key={col.key}
                        className={TH_CLASS}
                        onClick={() => handleSort(col.key)}
                      >
                        <i className={`fas ${col.icon} mr-1.5 text-gray-400`} />
                        {col.label}
                        <i
                          className={`fas ${getSortIcon(col.key)} ml-1.5 text-xs`}
                        />
                      </th>
                    ) : (
                      <th
                        key={`s-${i}`}
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        {i === 2 && (
                          <>
                            <i className='fas fa-user mr-1.5 text-gray-400' />
                            ผู้ใช้
                          </>
                        )}
                        {i === 4 && (
                          <>
                            <i className='fas fa-comment-dots mr-1.5 text-gray-400' />
                            รายละเอียด
                          </>
                        )}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {logs.map((log, idx) => {
                  const ac = getAction(log.action)
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'} hover:bg-blue-50/50 transition-colors cursor-pointer`}
                    >
                      <td className={`${TD_CLASS} text-gray-500 font-mono`}>
                        <span className='text-xs'>
                          {formatDate(log.createdAt)}
                        </span>
                      </td>
                      <td className={TD_CLASS}>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ac.color}`}
                        >
                          <i className={`fas ${ac.icon}`} />
                          {ac.label}
                        </span>
                      </td>
                      <td className={`${TD_CLASS} text-gray-800`}>
                        {log.user ? (
                          <>
                            <span className='font-medium'>
                              {log.user.firstname} {log.user.lastname}
                            </span>
                            <div className='text-xs text-gray-400'>
                              {log.user.email}
                            </div>
                          </>
                        ) : (
                          <span className='text-gray-400'>
                            System / สาธารณะ
                          </span>
                        )}
                      </td>
                      <td
                        className={`${TD_CLASS} text-gray-500 font-mono text-xs`}
                      >
                        {log.ipAddress}
                      </td>
                      <td className={`${TD_CLASS} text-gray-500`}>
                        {log.details || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
          onClick={() => setSelectedLog(null)}
        >
          <div
            className='bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                <i className='fas fa-history text-blue-600' />
                Audit Log Detail
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className='p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
              >
                <i className='fas fa-times' />
              </button>
            </div>
            {/* Body */}
            <div className='px-6 py-5 space-y-4'>
              {[
                {
                  icon: 'fa-clock',
                  label: 'เวลา',
                  value: formatDateTime(selectedLog.createdAt),
                },
                {
                  icon: 'fa-tag',
                  label: 'Action',
                  value: (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getAction(selectedLog.action).color}`}
                    >
                      <i
                        className={`fas ${getAction(selectedLog.action).icon}`}
                      />
                      {getAction(selectedLog.action).label}
                    </span>
                  ),
                },
                {
                  icon: 'fa-user',
                  label: 'ผู้ใช้',
                  value: selectedLog.user ? (
                    <>
                      <span className='font-medium'>
                        {selectedLog.user.firstname} {selectedLog.user.lastname}
                      </span>
                      <div className='text-xs text-gray-400'>
                        {selectedLog.user.email}
                      </div>
                    </>
                  ) : (
                    <span className='text-gray-400'>System / สาธารณะ</span>
                  ),
                },
                {
                  icon: 'fa-network-wired',
                  label: 'IP Address',
                  value: (
                    <span className='font-mono text-sm'>
                      {selectedLog.ipAddress}
                    </span>
                  ),
                },
                {
                  icon: 'fa-globe',
                  label: 'User Agent',
                  value: (
                    <span className='text-sm break-words'>
                      {selectedLog.userAgent || '-'}
                    </span>
                  ),
                },
                {
                  icon: 'fa-comment-dots',
                  label: 'รายละเอียด',
                  value: (
                    <p className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                      {selectedLog.details || '-'}
                    </p>
                  ),
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5'>
                      <i className={`fas ${item.icon} text-gray-500 text-xs`} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        {item.label}
                      </p>
                      <div className='mt-0.5'>{item.value}</div>
                    </div>
                  </div>
                  {i < 5 && <hr className='mt-3 border-gray-100' />}
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end'>
              <button
                onClick={() => setSelectedLog(null)}
                className='px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
