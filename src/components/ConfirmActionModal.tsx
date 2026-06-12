// src/components/ConfirmActionModal.tsx
import { useEffect, useState } from 'react'

interface ConfirmActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  title: string
  description: string
  targetName: string
  targetEmail: string
  actionType: string
  isDanger?: boolean
}

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  targetName,
  targetEmail,
  actionType,
  isDanger = false,
}: ConfirmActionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [reason, setReason] = useState('')
  const [countdown, setCountdown] = useState(5)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setReason('')
      setCountdown(5)
      setError('')
      setIsExecuting(false)
    }
  }, [isOpen])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 3 && countdown > 0 && !isExecuting) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (step === 3 && countdown === 0 && !isExecuting) {
      handleExecute()
    }
    return () => clearTimeout(timer)
  }, [step, countdown, isExecuting])

  const handleStep1Continue = () => {
    setStep(2)
  }

  const handleStep2Confirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this action')
      return
    }
    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters')
      return
    }
    setError('')
    setStep(3)
    setCountdown(5)
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    try {
      await onConfirm(reason)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
      setStep(2)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const handleCancelCountdown = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75'
          onClick={onClose}
        ></div>

        <div className='inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='px-6 pt-5 pb-4 bg-white sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div
                className={`flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isDanger ? 'bg-red-100' : 'bg-yellow-100'}`}
              >
                {isDanger ? (
                  <svg
                    className='w-6 h-6 text-red-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-6 h-6 text-yellow-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                )}
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                <h3 className='text-lg font-medium leading-6 text-gray-900'>
                  {title}
                </h3>

                {step === 1 && (
                  <div className='mt-4'>
                    <p className='text-sm text-gray-600'>{description}</p>
                    <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                      <p className='text-sm font-medium text-gray-900'>
                        Target User:
                      </p>
                      <p className='text-sm text-gray-600'>{targetName}</p>
                      <p className='text-sm text-gray-500'>{targetEmail}</p>
                    </div>
                    <p className='mt-3 text-xs text-gray-500'>
                      Action: {actionType}
                    </p>
                  </div>
                )}

                {step === 2 && (
                  <div className='mt-4'>
                    <p className='text-sm text-gray-600'>
                      Please confirm this action by providing a reason.
                    </p>
                    <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                      <p className='text-sm font-medium text-gray-900'>
                        Target User:
                      </p>
                      <p className='text-sm text-gray-600'>{targetName}</p>
                      <p className='text-sm text-gray-500'>{targetEmail}</p>
                    </div>
                    <div className='mt-4'>
                      <label className='block text-sm font-medium text-gray-700'>
                        Reason for this action
                      </label>
                      <textarea
                        rows={3}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${error ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder='Enter detailed reason...'
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      {error && (
                        <p className='mt-1 text-xs text-red-600'>{error}</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className='mt-4'>
                    <p className='text-sm text-gray-600'>
                      This action will be executed in {countdown} seconds. You
                      can cancel now.
                    </p>
                    <div className='mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200'>
                      <p className='text-sm font-medium text-yellow-800'>
                        Action Summary:
                      </p>
                      <p className='text-sm text-yellow-700'>
                        Action: {actionType}
                      </p>
                      <p className='text-sm text-yellow-700'>
                        Target: {targetName}
                      </p>
                      <p className='text-sm text-yellow-700'>
                        Reason: {reason}
                      </p>
                    </div>
                    {isExecuting && (
                      <div className='mt-3 flex justify-center'>
                        <div className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                        <span className='ml-2 text-sm text-gray-600'>
                          Executing...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='px-6 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse'>
            {step === 1 && (
              <>
                <button
                  type='button'
                  onClick={handleStep1Continue}
                  className='inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm'
                >
                  Continue
                </button>
                <button
                  type='button'
                  onClick={handleCancel}
                  className='inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
                >
                  Cancel
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  type='button'
                  onClick={handleStep2Confirm}
                  className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${isDanger ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                >
                  Confirm
                </button>
                <button
                  type='button'
                  onClick={handleCancel}
                  className='inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
                >
                  Cancel
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <button
                  type='button'
                  onClick={handleCancelCountdown}
                  disabled={isExecuting}
                  className='inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
                >
                  Cancel Now
                </button>
                <button
                  type='button'
                  disabled={true}
                  className='inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-not-allowed'
                >
                  Waiting ({countdown}s)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
