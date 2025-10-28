'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { getUserDashboardRoute } from '@/lib/auth/client'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedUserTypes = [], 
  redirectTo 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      // Not authenticated - redirect to login
      router.push(redirectTo || '/auth/login')
      return
    }

    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.user_type)) {
      // User doesn't have permission - redirect to their dashboard
      const dashboardRoute = getUserDashboardRoute(user.user_type)
      router.push(dashboardRoute)
      return
    }
  }, [isAuthenticated, user, isLoading, allowedUserTypes, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.user_type)) {
    return null // Will redirect
  }

  return <>{children}</>
}