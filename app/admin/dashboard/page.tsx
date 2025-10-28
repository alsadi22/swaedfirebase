'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, Calendar, Award, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, error, isLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalEvents: 0,
    pendingOrganizations: 0,
    activeVolunteers: 0,
    totalHours: 0,
  })

  useEffect(() => {
    async function loadAdminDashboard() {
      try {
        if (isLoading) return
        
        if (!user || error) {
          router.push('/auth/login')
          return
        }

        // Check if user is admin
        const userType = user.user_metadata?.user_type || 'volunteer'
        if (!['admin', 'super_admin'].includes(userType)) {
          router.push('/dashboard')
          return
        }

        // Fetch dashboard stats from API endpoint
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setIsAdmin(true)
        } else if (response.status === 401) {
          router.push('/auth/login')
          return
        } else if (response.status === 403) {
          router.push('/dashboard')
          return
        } else {
          console.error('Failed to fetch dashboard stats:', response.statusText)
        }
      } catch (error) {
        console.error('Error loading admin dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAdminDashboard()
  }, [router, user, error, isLoading])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
          <p className="mt-4 text-[#A0A0A0]">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Platform management and oversight
            </p>
          </div>

          {stats.pendingOrganizations > 0 && (
            <Card className="mb-6 border-l-4 border-[#CE1126]">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertCircle className="text-[#CE1126] mr-3" size={24} />
                  <div>
                    <p className="font-semibold text-[#5C3A1F]">
                      {stats.pendingOrganizations} organization{stats.pendingOrganizations !== 1 ? 's' : ''} awaiting verification
                    </p>
                    <Link href="/admin/organizations" className="text-sm text-[#D2A04A] hover:underline">
                      Review now
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#5C3A1F] rounded-full flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Organizations</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalOrganizations}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D2A04A] rounded-full flex items-center justify-center">
                    <Building2 className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Total Events</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#00732F] rounded-full flex items-center justify-center">
                    <Calendar className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Active Volunteers</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.activeVolunteers}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#CE1126] rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Volunteer Hours</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{Math.round(stats.totalHours)}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#5C3A1F] rounded-full flex items-center justify-center">
                    <Award className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Pending Verification</p>
                    <p className="text-3xl font-bold text-[#CE1126]">{stats.pendingOrganizations}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D2A04A] rounded-full flex items-center justify-center">
                    <AlertCircle className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Management Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2" size={20} />
                    User Management
                  </Button>
                </Link>
                <Link href="/admin/organizations">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2" size={20} />
                    Organization Verification
                  </Button>
                </Link>
                <Link href="/admin/events">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2" size={20} />
                    Event Oversight
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2" size={20} />
                    Analytics & Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#A0A0A0] text-sm py-8 text-center">
                  Activity feed coming soon
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
