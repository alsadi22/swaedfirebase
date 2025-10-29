'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Redirect page - maintaining backward compatibility
 * This route redirects to /auth/organization/register for consistent auth pattern
 */
export default function OrganizationRegisterRedirect() {
  useEffect(() => {
    // Client-side redirect for better UX
    window.location.href = '/auth/organization/register'
  }, [])
  
  // Server-side redirect
  redirect('/auth/organization/register')
}
