import React from 'react'
import type { User } from '../UserManagerDashboard'

interface UserTableProps {
  filteredUsers: User[]
  onOpenRole: (u: User) => void
  onOpenPassword: (u: User) => void
  onOpenBan: (u: User) => void
  onViewAudit: (u: User) => void
}

const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  onOpenRole,
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
            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
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
            สถานะบัญชี
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
            <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500'>
              {u.id.substring(0, 8)}...
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
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === 'Active' || !u.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {u.status === 'Inactive' ? 'ระงับการใช้งาน' : 'เปิดใช้งานปกติ'}
              </span>
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
                  onClick={() => onOpenRole(u)}
                  className='text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-colors'
                  title='ปรับเปลี่ยนระดับสิทธิ์'
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
                      d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                    />
                  </svg>
                </button>
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
                  className={`${u.status === 'Inactive' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-600 bg-red-50 hover:bg-red-100'} p-2 rounded-full transition-colors`}
                  title={
                    u.status === 'Inactive'
                      ? 'เปิดคืนสิทธิ์การใช้งาน'
                      : 'ระงับบัญชีนี้'
                  }
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
