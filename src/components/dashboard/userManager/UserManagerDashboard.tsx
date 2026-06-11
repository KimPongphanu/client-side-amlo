// src/components/dashboard/UserManagerDashboard.tsx

import React, { useEffect, useMemo, useState } from 'react'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../stores/useAuthStore'

// --- Import Sub-Components & Modals ---
import AccessDenied from './sub_components/AccessDenied'
import BanModal from './sub_components/BanModal'
import PasswordModal from './sub_components/PasswordModal'
import TableSkeleton from './sub_components/TableSkeleton'
import UserTable from './sub_components/UserTable'
import UserAuditLog from './sub_components/UserAuditLog'

// --- Types ---
export interface User {
  id: string
  uuid: string
  firstname: string
  lastname: string
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: string
  recentOnline: string // เวลาใช้งานล่าสุดจาก DB
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

  // Modal & View States
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewingAuditUser, setViewingAuditUser] = useState<User | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState<boolean>(false)

  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isAutoRows, setIsAutoRows] = useState<boolean>(true)

  // คำนวณจำนวนแถวแบบไดนามิกให้พอดีกับความสูงหน้าจอ (Responsive)
  useEffect(() => {
    if (!isAutoRows) return

    const calculateRows = () => {
      // คำนวณความสูงหน้าจอ ลบด้วยระยะขอบ (Margin/Padding), แถบค้นหา, แถบเมนูด้านบน และ Footer
      // ค่า 440px คือพื้นที่คงที่โดยประมาณ เพื่อให้เหลือที่ว่างพอดีสำหรับตาราง
      const availableHeight = window.innerHeight - 440
      const rowHeight = 73 // ความสูงของแต่ละแถวในตารางโดยประมาณ (px)
      const calculated = Math.max(1, Math.floor(availableHeight / rowHeight))
      setRowsPerPage(calculated)
    }

    calculateRows()
    window.addEventListener('resize', calculateRows)
    return () => window.removeEventListener('resize', calculateRows)
  }, [isAutoRows])

  // รีเซ็ตกลับไปหน้า 1 เสมอเมื่อมีการค้นหาหรือเปลี่ยนตัวกรอง
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter])

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

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages)
  }

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredUsers, currentPage, rowsPerPage])

  // --- Action Handlers ---
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
    setIsBanModalOpen(true)
  }

  const handleToggleBan = () => {
    if (!selectedUser) return
    // TODO: ฟีเจอระงับบัญชีจะเพิ่มเมื่อ Backend อัปเดต Schema ให้มีฟิลด์สถานะบัญชี
    setIsBanModalOpen(false)
  }

  const handleViewAuditLogs = (u: User) => {
    setViewingAuditUser(u)
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
    <div className='bg-slate-50 rounded-xl shadow-sm overflow-hidden'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 shrink-0'>
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
      <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full'>
        {viewingAuditUser ? (
          <UserAuditLog
            user={viewingAuditUser}
            onBack={() => setViewingAuditUser(null)}
          />
        ) : (
          <>
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
        <div className='flex flex-col h-[calc(100vh-400px)] bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
          <div className='flex-1 overflow-x-auto overflow-y-auto'>
            {isLoading ? (
              <TableSkeleton />
            ) : filteredUsers.length === 0 ? (
              <div className='px-6 py-12 text-center text-gray-500'>
                ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไขการค้นหา
              </div>
            ) : (
              <UserTable
                filteredUsers={paginatedUsers}
                onOpenPassword={handleOpenPasswordModal}
                onOpenBan={handleOpenBanModal}
                onViewAudit={handleViewAuditLogs}
              />
            )}
          </div>
          {/* Pagination Footer (Light Theme) */}
          <div className='bg-gray-50 px-6 py-3 flex items-center justify-end border-t border-gray-200 text-sm text-gray-600 shrink-0 select-none'>
            <div className='flex items-center space-x-6'>
              
              {/* Pagination Controls */}
              <div className='flex items-center space-x-1 border-r border-gray-300 pr-6'>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className='p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed'
                  title="หน้าแรก"
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className='p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed'
                  title="หน้าก่อนหน้า"
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
              </div>

              {/* Page Indicator */}
              <div className='font-medium text-gray-700 border-r border-gray-300 pr-6'>
                {currentPage} <span className='text-gray-400 font-normal mx-1'>of</span> {totalPages}
              </div>
              
              {/* Rows Per Page Selector */}
              <div className='flex items-center space-x-2 border-r border-gray-300 pr-6'>
                <div className='relative'>
                  <select
                    value={isAutoRows ? 'auto' : rowsPerPage}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'auto') {
                        setIsAutoRows(true)
                      } else {
                        setIsAutoRows(false)
                        setRowsPerPage(Number(val))
                        setCurrentPage(1)
                      }
                    }}
                    className='bg-transparent text-gray-700 border-none focus:ring-0 cursor-pointer appearance-none outline-none font-medium text-sm pr-6 pl-2 py-1 hover:bg-gray-200 rounded transition-colors'
                  >
                    <option value="auto">Auto ({rowsPerPage} rows)</option>
                    <option value={5}>5 rows per page</option>
                    <option value={10}>10 rows per page</option>
                    <option value={25}>25 rows per page</option>
                    <option value={50}>50 rows per page</option>
                  </select>
                  <svg className='w-4 h-4 text-gray-400 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
              </div>

              {/* Next/Last Page Controls */}
              <div className='flex items-center space-x-1'>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className='p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed'
                  title="หน้าถัดไป"
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className='p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed'
                  title="หน้าสุดท้าย"
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M13 5l7 7-7 7M5 5l7 7-7 7' />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {/* --- Modals Section --- */}
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
        onSubmit={handleToggleBan}
      />
    </div>
  )
}

export default UserManagerDashboard
