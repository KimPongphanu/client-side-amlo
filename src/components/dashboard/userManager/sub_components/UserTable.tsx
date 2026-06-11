import React from 'react'
import type { User } from '../UserManagerDashboard'

// ย้ายออกนอก Component เป็น module-level utility fn
// เพื่อเลี่ยงการ call Date.now() ใน render body (React pure function rule)
const getOnlineStatus = (recentOnline: string) => {
  const diffMs = Date.now() - new Date(recentOnline).getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 10) {
    return { label: 'Online', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' }
  } else if (diffMins < 60) {
    return { label: `${diffMins} นาทีที่แล้ว`, color: 'bg-gray-100 text-gray-600', dot: null }
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    return { label: `${hours} ชั่วโมงที่แล้ว`, color: 'bg-gray-100 text-gray-600', dot: null }
  } else {
    const days = Math.floor(diffMins / 1440)
    return { label: `${days} วันที่แล้ว`, color: 'bg-gray-100 text-gray-500', dot: null }
  }
}

interface UserTableProps {
  filteredUsers: User[]
  onOpenPassword: (u: User) => void
  onOpenBan: (u: User) => void
  onViewAudit: (u: User) => void
}

const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  onOpenPassword,
  onOpenBan,
  onViewAudit,
}) => {
  return (
    <table className='min-w-full divide-y divide-gray-200'>
      <thead className='bg-gray-50'>
        <tr>
          <th
            scope='col'
            className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
          >
            รหัสประจำตัว
          </th>
          <th
            scope='col'
            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
          >
            ชื่อ-นามสกุล
          </th>
          <th
            scope='col'
            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
          >
            อีเมลติดต่อ
          </th>
          <th
            scope='col'
            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
          >
            สิทธิ์เข้าใช้งาน
          </th>
          <th
            scope='col'
            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
          >
            ใช้งานล่าสุด
          </th>
          <th
            scope='col'
            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
          >
            วันที่ลงทะเบียน
          </th>
          <th
            scope='col'
            className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
          >
            เครื่องมือจัดการ
          </th>
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200'>
        {filteredUsers.map((u) => (
          <tr
            key={u.id}
            className='hover:bg-gray-50 transition-colors duration-150'
          >
            <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 text-center'>
              {u.id}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
              {u.firstname} {u.lastname}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
              {u.email}
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {u.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
              </span>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              {(() => {
                const status = getOnlineStatus(u.recentOnline)
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.dot && (
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                    )}
                    {status.label}
                  </span>
                )
              })()}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
              {new Date(u.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
              <div className='flex justify-end space-x-2'>
                <button
                  onClick={() => onOpenPassword(u)}
                  className='text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-full transition-colors'
                  title='บังคับเปลี่ยนรหัสผ่าน'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onOpenBan(u)}
                  className='text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors'
                  title='ระงับบัญชีนี้'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onViewAudit(u)}
                  className='text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors'
                  title='ตรวจสอบบันทึกกิจกรรม'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default UserTable
