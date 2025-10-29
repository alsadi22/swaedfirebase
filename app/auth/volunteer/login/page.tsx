'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VolunteerLoginPage() {
  const router = useRouter()

  const handleSignIn = () => {
    // Redirect to Auth0 login with volunteer user type
    window.location.href = `/api/auth/login?user_type=volunteer&returnTo=/volunteer/dashboard`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Volunteer Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your volunteer dashboard
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="text-center">
            <button
              onClick={handleSignIn}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In with Auth0
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-4">
              Or access other portals:
            </div>
            <div className="space-y-2">
              <Link
                href="/auth/login"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                General Login
              </Link>
              <Link
                href="/auth/organization/login"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Organization Login
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm">
            <Link
              href="/auth/volunteer/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Don't have a volunteer account? Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
