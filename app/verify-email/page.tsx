'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'already_verified'
  message: string
  user?: {
    email: string
    firstName: string
    lastName: string
  }
}

function VerifyEmailContent() {
  const [state, setState] = useState<VerificationState>({
    status: 'loading',
    message: 'Verifying your email...'
  })
  const [resendLoading, setResendLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setState({
        status: 'error',
        message: 'Invalid verification link. Please check your email for the correct link.'
      })
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (data.success) {
        setState({
          status: data.alreadyVerified ? 'already_verified' : 'success',
          message: data.message,
          user: data.user
        })

        // Redirect to dashboard after successful verification
        if (!data.alreadyVerified) {
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        }
      } else {
        setState({
          status: 'error',
          message: data.error || 'Verification failed'
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setState({
        status: 'error',
        message: 'Something went wrong. Please try again.'
      })
    }
  }

  const resendVerificationEmail = async () => {
    if (!state.user?.email) return

    setResendLoading(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: state.user.email
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Verification email sent! Please check your inbox.')
      } else {
        alert(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Loading State */}
          {state.status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
              <p className="text-gray-600">{state.message}</p>
            </>
          )}

          {/* Success State */}
          {state.status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-6">{state.message}</p>
              {state.user && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800">
                    Welcome, {state.user.firstName} {state.user.lastName}!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Redirecting to your dashboard in 3 seconds...
                  </p>
                </div>
              )}
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {/* Already Verified State */}
          {state.status === 'already_verified' && (
            <>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Verified</h1>
              <p className="text-gray-600 mb-6">{state.message}</p>
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {/* Error State */}
          {state.status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{state.message}</p>
              
              <div className="space-y-3">
                {state.message.includes('expired') && (
                  <button
                    onClick={resendVerificationEmail}
                    disabled={resendLoading || !state.user?.email}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                )}
                
                <Link
                  href="/auth/volunteer/login"
                  className="inline-block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="mailto:support@swaeduae.com" className="text-indigo-600 hover:text-indigo-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}