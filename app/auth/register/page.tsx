'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // User is already logged in, redirect to dashboard
      router.push('/dashboard')
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Choose your account type to get started:
            </p>
            
            <div className="space-y-4">
              <a
                href="/api/auth/login?screen_hint=signup&user_type=volunteer"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register as Volunteer
              </a>
              
              <a
                href="/api/auth/login?screen_hint=signup&user_type=organization"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Register as Organization
              </a>
              
              <a
                href="/api/auth/login?screen_hint=signup&user_type=student"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register as Student
              </a>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-4">
              Or register for specific roles:
            </div>
            <div className="space-y-2">
              <Link
                href="/auth/organization/register"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Organization Registration
              </Link>
              <Link
                href="/auth/volunteer/register"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Volunteer Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
