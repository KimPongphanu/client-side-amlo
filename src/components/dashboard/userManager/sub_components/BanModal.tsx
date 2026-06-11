import React from 'react'
import type { User } from '../UserManagerDashboard'
import BaseModal from './BaseModal'

interface BanModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUser: User | null
  reasonForChange: string
  setReasonForChange: (val: string) => void
  onSubmit: () => void
}

const BanModal: React.FC<BanModalProps> = ({
  isOpen,
  onClose,
  selectedUser,
  reasonForChange,
  setReasonForChange,
  onSubmit,
}) => {
  const isActive = selectedUser?.status === 'Active' || !selectedUser?.status

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isActive
          ? 'ระงับการใช้งานบัญชีสมาชิก'
          : 'เปิดคืนสิทธิ์การใช้งานบัญชีสมาชิก'
      }
    >
      {selectedUser && (
        <div className='space-y-4'>
          <div
            className={`p-4 rounded-md border ${isActive ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
          >
            <p className='text-sm'>
              {isActive ? (
                <>
                  คุณกำลังทำรายการ <strong>ระงับการใช้งาน</strong> ของสมาชิกชื่อ{' '}
                  <strong>
                    {selectedUser.firstname} {selectedUser.lastname}
                  </strong>{' '}
                  บัญชีดังกล่าวจะไม่สามารถล็อกอินเข้าสู่ระบบได้ชั่วคราว
                  จนกว่าผู้ดูแลระบบจะเปิดสิทธิ์ให้อีกครั้ง
                </>
              ) : (
                <>
                  คุณกำลังทำรายการ <strong>คืนสิทธิ์เปิดใช้งานปกติ</strong>{' '}
                  ให้แก่มกสิกรรมสมาชิกชื่อ{' '}
                  <strong>
                    {selectedUser.firstname} {selectedUser.lastname}
                  </strong>{' '}
                  เพื่อให้กลับมามีสิทธิ์เข้าใช้งานระบบตามปกติ
                </>
              )}
            </p>
          </div>
          <div>
            <label
              htmlFor='ban-reason'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              ระบุเหตุผลประกอบการทำรายการ{' '}
              <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='ban-reason'
              rows={3}
              value={reasonForChange}
              onChange={(e) => setReasonForChange(e.target.value)}
              className='shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='กรุณากรอกสาเหตุเพื่อความปลอดภัยและเก็บเป็น Log ประวัติ...'
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
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isActive ? 'ดำเนินการระงับบัญชี' : 'ดำเนินการเปิดใช้งานบัญชี'}
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  )
}

export default BanModal
