'use client'

import { useEffect } from 'react'

export default function OrganizationLoginRedirect() {
  useEffect(() => {
    window.location.replace('/auth/organization/login')
  }, [])
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting...</p>
    </div>
  )
}
