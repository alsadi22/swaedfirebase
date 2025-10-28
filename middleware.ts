import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0/edge'

// Define protected routes that require authentication
const protectedRoutes = {
  '/admin': ['admin'] as const,
  '/organization': ['organization'] as const,
  '/volunteer': ['volunteer'] as const,
  '/student': ['student'] as const,
  '/profile': ['admin', 'organization', 'volunteer', 'student'] as const, // All authenticated users
  '/dashboard': ['admin', 'organization', 'volunteer', 'student'] as const, // All authenticated users
  '/api/profile': ['admin', 'organization', 'volunteer', 'student'] as const,
  '/api/admin': ['admin'] as const,
  '/api/organization': ['organization'] as const,
  '/api/student': ['student'] as const,
  '/api/volunteer-hours': ['volunteer', 'student'] as const
} as const

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/events',
  '/organizations',
  '/privacy',
  '/terms',
  '/faq',
  '/help',
  '/verify-email'
] as const

// Define public API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth',
  '/api/health',
  '/api/events',
  '/api/organizations'
] as const

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Auth0 routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    (route !== '/' && pathname.startsWith(route))
  )
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  )

  if (protectedRoute) {
    // Get session for protected routes
    try {
      const session = await getSession(request, NextResponse.next())
      
      // Route requires authentication
      if (!session?.user) {
        // Not authenticated - redirect to Auth0 login
        return NextResponse.redirect(new URL('/api/auth/login', request.url))
      }

      // Check if user has required permissions (if user metadata includes user_type)
      const requiredUserTypes = protectedRoutes[protectedRoute as keyof typeof protectedRoutes]
      const userType = session.user.user_type || session.user['https://swaeduae.ae/user_type'] // Check both locations
      
      if (userType && !(requiredUserTypes as readonly string[]).includes(userType)) {
        // User doesn't have permission - redirect to their dashboard
        const dashboardUrl = getUserDashboardUrl(userType)
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    } catch (error) {
      // If session check fails, redirect to login
      return NextResponse.redirect(new URL('/api/auth/login', request.url))
    }
  }

  // Continue to the requested page
  return NextResponse.next()
}

function getUserDashboardUrl(userType: string): string {
  switch (userType) {
    case 'admin':
      return '/admin/dashboard'
    case 'organization':
      return '/organization/dashboard'
    case 'volunteer':
      return '/volunteer/dashboard'
    case 'student':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}

// Enable middleware for role-based routing
export const config = {
  matcher: [
    '/api/(.*)',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}