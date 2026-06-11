import React from 'react'
import type { User } from '../UserManagerDashboard'
import BaseModal from './BaseModal'

interface BanModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUser: User | null
  onSubmit: () => void
}

const BanModal: React.FC<BanModalProps> = ({
  isOpen,
  onClose,
  selectedUser,
  onSubmit,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title='ระงับการใช้งานบัญชีสมาชิก'
    >
      {selectedUser && (
        <div className='space-y-4'>
          <div className='p-4 rounded-md border bg-red-50 border-red-200 text-red-700'>
            <p className='text-sm'>
              คุณกำลังทำรายการ <strong>ระงับการใช้งาน</strong> ของสมาชิกชื่อ{' '}
              <strong>
                {selectedUser.firstname} {selectedUser.lastname}
              </strong>{' '}
              บัญชีดังกล่าวจะไม่สามารถล็อกอินเข้าสู่ระบบได้ชั่วคราว
              จนกว่าผู้ดูแลระบบจะเปิดสิทธิ์ให้อีกครั้ง
            </p>
          </div>
          <div className='flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4'>
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
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700'
            >
              ดำเนินการ
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  )
}

export default BanModal
