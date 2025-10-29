'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VolunteerRegisterPage() {
  const router = useRouter()

  const handleSignUp = () => {
    // Redirect to Auth0 signup with volunteer user type
    window.location.href = `/api/auth/login?screen_hint=signup&user_type=volunteer&returnTo=/volunteer/dashboard`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register as Volunteer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our community and make a difference
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="text-center">
            <button
              onClick={handleSignUp}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register with Auth0
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-4">
              Or register as different user type:
            </div>
            <div className="space-y-2">
              <Link
                href="/auth/register"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                General Registration
              </Link>
              <Link
                href="/auth/organization/register"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Organization Registration
              </Link>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-sm">
              <Link
                href="/auth/volunteer/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Already have a volunteer account? Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
