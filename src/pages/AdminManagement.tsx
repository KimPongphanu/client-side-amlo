// src/pages/AdminManagement.tsx
import { useEffect, useState } from 'react'
import ConfirmActionModal from '../components/ConfirmActionModal'
import type { AdminUser, CreateAdminData } from '../services/adminService'
import { adminService } from '../services/adminService'
import { useAuthStore } from '../stores/useAuthStore'

type ModalType = 'create' | 'edit' | 'ban' | 'unban' | 'delete' | null

export default function AdminManagement() {
  const { user } = useAuthStore()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)

  const [createForm, setCreateForm] = useState<CreateAdminData>({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
  })
  const [createError, setCreateError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.role !== 'SUPERVISOR') {
      return
    }
    fetchAdmins()
  }, [user])

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getAdmins()
      setAdmins(data)
    } catch (err) {
      setError('Failed to load admin list')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async (reason: string) => {
    setIsSubmitting(true)
    try {
      await adminService.createAdmin(createForm)
      setCreateForm({ email: '', password: '', firstname: '', lastname: '' })
      setCreateError('')
      setModalType(null)
      await fetchAdmins()
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create admin',
      )
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBanAdmin = async (reason: string) => {
    if (!selectedAdmin) return
    await adminService.banAdmin(selectedAdmin.uuid, reason)
    setModalType(null)
    setSelectedAdmin(null)
    await fetchAdmins()
  }

  const handleUnbanAdmin = async (reason: string) => {
    if (!selectedAdmin) return
    await adminService.unbanAdmin(selectedAdmin.uuid, reason)
    setModalType(null)
    setSelectedAdmin(null)
    await fetchAdmins()
  }

  const handleDeleteAdmin = async (reason: string) => {
    if (!selectedAdmin) return
    await adminService.deleteAdmin(selectedAdmin.uuid, reason)
    setModalType(null)
    setSelectedAdmin(null)
    await fetchAdmins()
  }

  const openCreateModal = () => {
    setCreateForm({ email: '', password: '', firstname: '', lastname: '' })
    setCreateError('')
    setModalType('create')
  }

  const openBanModal = (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setModalType('ban')
  }

  const openUnbanModal = (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setModalType('unban')
  }

  const openDeleteModal = (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setModalType('delete')
  }

  if (user?.role !== 'SUPERVISOR') {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='p-8 text-center bg-white rounded-lg shadow-md'>
          <h2 className='text-xl font-bold text-red-600'>Access Denied</h2>
          <p className='mt-2 text-gray-600'>
            Supervisor privileges required to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='mb-6 flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Admin Management</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Create, manage, and supervise administrator accounts
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Create New Admin
        </button>
      </div>

      {error && (
        <div className='mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg'>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center py-12'>
          <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : admins.length === 0 ? (
        <div className='text-center py-12 bg-white rounded-lg shadow'>
          <p className='text-gray-500'>No admin accounts found</p>
        </div>
      ) : (
        <div className='bg-white shadow overflow-hidden rounded-lg'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  2FA Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created At
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {admins.map((admin) => (
                <tr key={admin.uuid} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {admin.firstname} {admin.lastname}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-500'>{admin.email}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {admin.twoFactorEnabled
                        ? admin.twoFactorMethod
                        : 'Disabled'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(admin.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                      Active
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                    <button
                      onClick={() => openBanModal(admin)}
                      className='text-red-600 hover:text-red-900'
                    >
                      Ban
                    </button>
                    <button
                      onClick={() => openDeleteModal(admin)}
                      className='text-gray-600 hover:text-gray-900 ml-3'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Admin Modal */}
      {modalType === 'create' && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen px-4'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75'
              onClick={() => setModalType(null)}
            ></div>
            <div className='relative bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Create New Admin
              </h3>
              {createError && (
                <div className='mb-4 p-2 text-sm text-red-700 bg-red-100 rounded'>
                  {createError}
                </div>
              )}
              <div className='space-y-4'>
                <input
                  type='text'
                  placeholder='First Name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  value={createForm.firstname}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, firstname: e.target.value })
                  }
                />
                <input
                  type='text'
                  placeholder='Last Name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  value={createForm.lastname}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, lastname: e.target.value })
                  }
                />
                <input
                  type='email'
                  placeholder='Email (@go.th)'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                />
                <input
                  type='password'
                  placeholder='Password (min 8 chars, uppercase, lowercase, number)'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                />
              </div>
              <div className='mt-6 flex justify-end space-x-3'>
                <button
                  onClick={() => setModalType(null)}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      !createForm.firstname ||
                      !createForm.lastname ||
                      !createForm.email ||
                      !createForm.password
                    ) {
                      setCreateError('All fields are required')
                      return
                    }
                    if (
                      !createForm.email.includes('@') ||
                      !createForm.email.includes('.go.th')
                    ) {
                      setCreateError(
                        'Email must be an organization email (@go.th)',
                      )
                      return
                    }
                    setModalType(null)
                    // This would trigger the three-step confirmation
                    handleCreateAdmin('Creating new admin account')
                  }}
                  disabled={isSubmitting}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50'
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Three-Step Confirmation Modals */}
      <ConfirmActionModal
        isOpen={modalType === 'ban'}
        onClose={() => {
          setModalType(null)
          setSelectedAdmin(null)
        }}
        onConfirm={handleBanAdmin}
        title='Confirm Ban Admin'
        description={`You are about to ban ${selectedAdmin?.firstname} ${selectedAdmin?.lastname} from accessing the system.`}
        targetName={`${selectedAdmin?.firstname} ${selectedAdmin?.lastname}`}
        targetEmail={selectedAdmin?.email || ''}
        actionType='BAN ADMIN'
        isDanger={true}
      />

      <ConfirmActionModal
        isOpen={modalType === 'delete'}
        onClose={() => {
          setModalType(null)
          setSelectedAdmin(null)
        }}
        onConfirm={handleDeleteAdmin}
        title='Confirm Delete Admin'
        description={`You are about to permanently delete ${selectedAdmin?.firstname} ${selectedAdmin?.lastname}. This action cannot be undone.`}
        targetName={`${selectedAdmin?.firstname} ${selectedAdmin?.lastname}`}
        targetEmail={selectedAdmin?.email || ''}
        actionType='DELETE ADMIN'
        isDanger={true}
      />
    </div>
  )
}
