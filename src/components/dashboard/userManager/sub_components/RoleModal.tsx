import React from 'react'
import type { User } from '../UserManagerDashboard'
import BaseModal from './BaseModal'

interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUser: User | null
  reasonForChange: string
  setReasonForChange: (val: string) => void
  onSubmit: () => void
}

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  selectedUser,
  reasonForChange,
  setReasonForChange,
  onSubmit,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title='ปรับเปลี่ยนระดับสิทธิ์สมาชิก'
    >
      {selectedUser && (
        <div className='space-y-4'>
          <div className='bg-gray-50 p-4 rounded-md text-sm text-gray-600 space-y-1.5 border border-gray-100'>
            <p>
              ชื่อผู้ใช้:{' '}
              <span className='font-semibold text-gray-900'>
                {selectedUser.firstname} {selectedUser.lastname}
              </span>
            </p>
            <p>
              สิทธิ์ปัจจุบัน:{' '}
              <span className='font-semibold text-indigo-700'>
                {selectedUser.role === 'ADMIN'
                  ? 'ผู้ดูแลระบบ (ADMIN)'
                  : 'ผู้ใช้ทั่วไป (USER)'}
              </span>
            </p>
            <p>
              สิทธิ์ใหม่หลังจากเปลี่ยน:{' '}
              <span className='font-semibold text-green-700'>
                {selectedUser.role === 'ADMIN'
                  ? 'ผู้ใช้ทั่วไป (USER)'
                  : 'ผู้ดูแลระบบ (ADMIN)'}
              </span>
            </p>
          </div>
          <div>
            <label
              htmlFor='role-reason'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              ระบุเหตุผลในการเปลี่ยนแปลงข้อมูล{' '}
              <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='role-reason'
              rows={3}
              value={reasonForChange}
              onChange={(e) => setReasonForChange(e.target.value)}
              className='shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='กรุณาระบุวัตถุประสงค์เพื่อบันทึกลงระบบตรวจสอบ...'
            />
          </div>
          <div className='flex justify-end space-x-3 pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              ยกเลิก
            </button>
            <button
              type='button'
              onClick={onSubmit}
              disabled={!reasonForChange.trim()}
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              ยืนยันการเปลี่ยนสิทธิ์
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  )
}

export default RoleModal
