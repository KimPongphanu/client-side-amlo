// src/components/dashboard/UserManagerDashboard.tsx

import React, { useEffect, useMemo, useState } from 'react'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../stores/useAuthStore'

// --- Import Sub-Components & Modals ---
import AccessDenied from './sub_components/AccessDenied'
import BanModal from './sub_components/BanModal'
import PasswordModal from './sub_components/PasswordModal'
import RoleModal from './sub_components/RoleModal'
import TableSkeleton from './sub_components/TableSkeleton'
import UserTable from './sub_components/UserTable'

// --- Types ---
export interface User {
  id: string
  uuid: string
  firstname: string
  lastname: string
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: string
  status?: 'Active' | 'Inactive'
}

export type RoleFilter = 'ALL' | 'ADMIN' | 'USER'

const UserManagerDashboard: React.FC = () => {
  // Zustand Store
  const user = useAuthStore((state) => state.user)
  const isAuthLoading = useAuthStore((state) => state.isLoading)

  // State Management
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')

  // Modal States
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState<boolean>(false)
  const [reasonForChange, setReasonForChange] = useState<string>('')

  // Fetch Users on Mount & Sync Auth Guard
  useEffect(() => {
    const fetchUsers = async () => {
      // 🛡️ ป้องกันไม่ให้ฝืนยิง API หากไม่มี Token หรือไม่ได้เป็นแอดมิน
      if (!user || user.role !== 'ADMIN') {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await authService.getUsers()

        if (response.success) {
          const usersWithStatus = response.data.map((u) => ({
            ...u,
            id: String(u.id),
            status: 'Active' as const,
          }))
          setUsers(usersWithStatus)
        } else {
          setError('ไม่สามารถดึงข้อมูลผู้ใช้งานจากระบบได้')
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูลผู้ใช้งาน')
        console.error('Fetch Users Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [user])

  // Filtered and Searched Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstname} ${u.lastname}`.toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === '' ||
        fullName.includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  // --- Action Handlers ---
  const handleOpenRoleModal = (u: User) => {
    setSelectedUser(u)
    setReasonForChange('')
    setIsRoleModalOpen(true)
  }

  const handleChangeRole = () => {
    if (!selectedUser) return
    const newRole = selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN'
    console.log(
      `[AUDIT LOG] เปลี่ยนสิทธิ์ ${selectedUser.email}: ${selectedUser.role} -> ${newRole}. เหตุผล: ${reasonForChange}`,
    )
    // TODO: Implement API call
    alert(`จำลองสถานะ: เปลี่ยนสิทธิ์เป็น ${newRole} เรียบร้อยแล้ว`)
    setIsRoleModalOpen(false)
  }

  const handleOpenPasswordModal = (u: User) => {
    setSelectedUser(u)
    setIsPasswordModalOpen(true)
  }

  const handleForceResetPassword = () => {
    if (!selectedUser) return
    console.log(`[AUDIT LOG] บังคับรีเซ็ตรหัสผ่านของ ${selectedUser.email}`)
    // TODO: Implement API call
    alert(
      `จำลองสถานะ: ส่งระบบตั้งรหัสผ่านชั่วคราวไปยังอีเมล ${selectedUser.email} แล้ว`,
    )
    setIsPasswordModalOpen(false)
  }

  const handleOpenBanModal = (u: User) => {
    setSelectedUser(u)
    setReasonForChange('')
    setIsBanModalOpen(true)
  }

  const handleToggleBan = () => {
    if (!selectedUser) return
    const newStatus = selectedUser.status === 'Active' ? 'Inactive' : 'Active'
    console.log(
      `[AUDIT LOG] เปลี่ยนสถานะบัญชี ${selectedUser.email}: -> ${newStatus}. เหตุผล: ${reasonForChange}`,
    )

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, status: newStatus } : u,
      ),
    )
    alert(
      `จำลองสถานะ: บัญชีผู้ใช้เปลี่ยนเป็นสถานะ ${newStatus === 'Active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} แล้ว`,
    )
    setIsBanModalOpen(false)
  }

  const handleViewAuditLogs = (u: User) => {
    console.log(`[NAVIGATION] เรียกดูประวัติการใช้งานของ ID: ${u.id}`)
    alert(
      `จำลองสถานะ: เปิดแสดงหน้าต่างประวัติการทำงาน (Audit Logs) ของคุณ ${u.firstname}`,
    )
  }

  // --- Auth Loading Guard ---
  if (isAuthLoading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-gray-500 font-medium animate-pulse'>
          กำลังตรวจสอบสิทธิ์เข้าใช้งานระบบ...
        </div>
      </div>
    )
  }

  // 🛡️ 3. Frontend Block Guard: หากไม่ผ่านเงื่อนไข ADMIN จะส่งหน้า Access Denied ทันที ไม่เรนเดอร์โครงสร้างเว็บหลัก
  if (!user || user.role !== 'ADMIN') {
    return <AccessDenied />
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 font-sans'>
                จัดการข้อมูลสมาชิก
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                สิทธิ์สำหรับแอดมินในการควบคุม ตรวจสอบ
                และบริหารจัดการบัญชีผู้ใช้ทั้งหมดในระบบ
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-600'>
                ผู้เข้าใช้ระบบ:{' '}
                <span className='font-semibold'>
                  {user.firstname} {user.lastname}
                </span>
              </span>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'>
                ผู้ดูแลระบบ
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Search & Filter Bar */}
        <div className='mb-8 flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg
                className='w-5 h-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <input
              type='text'
              placeholder='ค้นหาด้วยชื่อ นามสกุล หรืออีเมล...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            />
          </div>
          <div className='relative'>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className='block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-white'
            >
              <option value='ALL'>เลือกประเภทสิทธิ์ทั้งหมด</option>
              <option value='ADMIN'>แอดมิน (Admin)</option>
              <option value='USER'>ผู้ใช้งานทั่วไป (User)</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className='rounded-md bg-red-50 p-4 mb-8 border border-red-200'>
            <div className='flex'>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
          <div className='overflow-x-auto'>
            {isLoading ? (
              <TableSkeleton />
            ) : filteredUsers.length === 0 ? (
              <div className='px-6 py-12 text-center text-gray-500'>
                ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไขการค้นหา
              </div>
            ) : (
              <UserTable
                filteredUsers={filteredUsers}
                onOpenRole={handleOpenRoleModal}
                onOpenPassword={handleOpenPasswordModal}
                onOpenBan={handleOpenBanModal}
                onViewAudit={handleViewAuditLogs}
              />
            )}
          </div>
          {/* Footer with count */}
          <div className='bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200 text-sm text-gray-500'>
            <span>
              กำลังแสดง {filteredUsers.length} จากทั้งหมด {users.length} รายการ
            </span>
          </div>
        </div>
      </main>

      {/* --- Modals Section --- */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        selectedUser={selectedUser}
        reasonForChange={reasonForChange}
        setReasonForChange={setReasonForChange}
        onSubmit={handleChangeRole}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        selectedUser={selectedUser}
        onSubmit={handleForceResetPassword}
      />

      <BanModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        selectedUser={selectedUser}
        reasonForChange={reasonForChange}
        setReasonForChange={setReasonForChange}
        onSubmit={handleToggleBan}
      />
    </div>
  )
}

export default UserManagerDashboard
