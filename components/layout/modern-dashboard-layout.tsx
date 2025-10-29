'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'

interface ModernDashboardLayoutProps {
  children: React.ReactNode
  userType: 'volunteer' | 'organization' | 'admin' | 'student'
}

export function ModernDashboardLayout({ children, userType }: ModernDashboardLayoutProps) {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as 'en' | 'ar' || 'en'
    setLanguage(storedLang)
  }, [])

  const handleSignOut = () => {
    window.location.href = '/api/auth/logout'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
          <p className="mt-4 text-[#6B7280]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        userType={userType} 
        onSignOut={handleSignOut} 
        language={language} 
      />
      
      <div className="dashboard-main with-sidebar">
        <Header />
        <main className="pt-20 pb-8">
          <div className="container-dashboard">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}