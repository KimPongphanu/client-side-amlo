// src/pages/TwoFactorSetup.tsx
import { useEffect, useState } from 'react'
import { twoFactorService } from '../services/twoFactorService'
import { useAuthStore } from '../stores/useAuthStore'

export default function TwoFactorSetup() {
  const { user } = useAuthStore()
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const [secret, setSecret] = useState('')
  const [otpauthUrl, setOtpauthUrl] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [recoveryKeys, setRecoveryKeys] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [keysCopied, setKeysCopied] = useState(false)

  useEffect(() => {
    if (user?.twoFactorEnabled) {
      setStep('complete')
    } else {
      loadSetup()
    }
  }, [user])

  const loadSetup = async () => {
    setIsLoading(true)
    try {
      const response = await twoFactorService.setup2FA()
      setSecret(response.data.secret)
      setOtpauthUrl(response.data.otpauthUrl)
    } catch (err) {
      setError('Failed to load 2FA setup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!otpToken || otpToken.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await twoFactorService.enable2FA(otpToken)
      setRecoveryKeys(response.data.recoveryKeys)
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateKeys = async () => {
    setIsLoading(true)
    try {
      const response = await twoFactorService.regenerateRecoveryKeys()
      setRecoveryKeys(response.data.recoveryKeys)
      setKeysCopied(false)
    } catch (err) {
      setError('Failed to regenerate recovery keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyKeys = () => {
    navigator.clipboard.writeText(recoveryKeys.join('\n'))
    setKeysCopied(true)
    setTimeout(() => setKeysCopied(false), 3000)
  }

  const handlePrintKeys = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>AMLO Recovery Keys</title></head>
          <body>
            <h1>AMLO Account Recovery Keys</h1>
            <p>Store these keys in a secure location. Each key can only be used once.</p>
            <ul>
              ${recoveryKeys.map((key) => `<li><strong>${key}</strong></li>`).join('')}
            </ul>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <hr>
            <p><small>Anti-Money Laundering Office (AMLO)</small></p>
          </body>
        </html>
      `)
      printWindow.print()
      printWindow.close()
    }
  }

  if (user?.role !== 'SUPERVISOR') {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='p-8 text-center bg-white rounded-lg shadow-md'>
          <h2 className='text-xl font-bold text-red-600'>Access Denied</h2>
          <p className='mt-2 text-gray-600'>
            2FA setup is only available for Supervisor accounts.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'complete' && user?.twoFactorEnabled) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h2 className='mt-4 text-xl font-bold text-gray-900'>
              2FA is Enabled
            </h2>
            <p className='mt-2 text-gray-600'>
              Your account is protected with two-factor authentication.
            </p>
          </div>

          <div className='mt-6 border-t pt-6'>
            <h3 className='font-medium text-gray-900'>Recovery Keys</h3>
            <p className='text-sm text-gray-500 mt-1'>
              You have {recoveryKeys.length} unused recovery keys.
            </p>
            <div className='mt-4 flex space-x-3'>
              <button
                onClick={handleRegenerateKeys}
                className='px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700'
              >
                Regenerate Keys
              </button>
              <button
                onClick={handlePrintKeys}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                Print Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Two-Factor Authentication Setup
        </h1>
        <p className='mt-2 text-gray-600'>
          Protect your Supervisor account with 2FA using Google Authenticator or
          Microsoft Authenticator.
        </p>

        {error && (
          <div className='mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg'>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className='flex justify-center py-12'>
            <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : (
          <>
            {step === 'setup' && (
              <>
                <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                  <h3 className='font-medium text-gray-900'>
                    Step 1: Scan QR Code
                  </h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    Open Google Authenticator or Microsoft Authenticator and
                    scan this QR code:
                  </p>

                  <div className='mt-4 flex justify-center'>
                    <div className='p-4 bg-white rounded-lg border'>
                      {otpauthUrl && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
                          alt='QR Code'
                          className='w-48 h-48'
                        />
                      )}
                    </div>
                  </div>

                  <p className='mt-3 text-sm text-gray-500 text-center'>
                    Can't scan? Manually enter this code:{' '}
                    <code className='px-1 py-0.5 bg-gray-200 rounded'>
                      {secret}
                    </code>
                  </p>
                </div>

                <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                  <h3 className='font-medium text-gray-900'>
                    Step 2: Verify Setup
                  </h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    Enter the 6-digit code from your authenticator app:
                  </p>
                  <div className='mt-3'>
                    <input
                      type='text'
                      placeholder='000000'
                      maxLength={6}
                      className='w-full px-3 py-2 text-center text-2xl font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      value={otpToken}
                      onChange={(e) => {
                        setOtpToken(e.target.value.replace(/\D/g, ''))
                        setError('')
                      }}
                    />
                  </div>
                </div>

                <div className='mt-6 flex justify-end'>
                  <button
                    onClick={handleVerify}
                    disabled={!otpToken || otpToken.length !== 6}
                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50'
                  >
                    Verify and Enable 2FA
                  </button>
                </div>
              </>
            )}

            {step === 'complete' && recoveryKeys.length > 0 && (
              <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <h3 className='font-bold text-yellow-800'>
                  Important: Save Your Recovery Keys
                </h3>
                <p className='text-sm text-yellow-700 mt-1'>
                  These keys can be used to access your account if you lose your
                  2FA device. Each key can only be used once. Store them
                  securely.
                </p>

                <div className='mt-3 p-3 bg-white rounded border'>
                  <div className='grid grid-cols-2 gap-2 font-mono text-sm'>
                    {recoveryKeys.map((key, idx) => (
                      <div key={idx} className='p-1'>
                        {idx + 1}. {key}
                      </div>
                    ))}
                  </div>
                </div>

                <div className='mt-4 flex space-x-3'>
                  <button
                    onClick={handleCopyKeys}
                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
                  >
                    {keysCopied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button
                    onClick={handlePrintKeys}
                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                  >
                    Print Keys
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
