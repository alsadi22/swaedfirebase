'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Calendar, Users, TrendingUp, Plus, Settings } from 'lucide-react'
import Link from 'next/link'

export default function OrganizationDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalVolunteers: 0,
    pendingApplications: 0,
  })

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.role !== 'organization') {
          router.push('/dashboard')
          return
        }

        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!orgMember) {
          router.push('/dashboard')
          return
        }

        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgMember.organization_id)
          .maybeSingle()

        setOrganization(orgData)

        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('organization_id', orgMember.organization_id)

        const activeEvents = events?.filter(e => e.status === 'published' || e.status === 'ongoing') || []

        setStats({
          totalEvents: events?.length || 0,
          activeEvents: activeEvents.length,
          totalVolunteers: events?.reduce((sum, e) => sum + e.current_volunteers, 0) || 0,
          pendingApplications: 0,
        })
      } catch (error) {
        console.error('Error loading organization dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
          <p className="mt-4 text-[#A0A0A0]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              Organization Dashboard
            </h1>
            {organization && (
              <p className="text-lg text-[#A0A0A0]">{organization.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Total Events</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#5C3A1F] rounded-full flex items-center justify-center">
                    <Calendar className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Active Events</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.activeEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#00732F] rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Total Volunteers</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalVolunteers}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D2A04A] rounded-full flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Pending</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.pendingApplications}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#CE1126] rounded-full flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/organization/events/new">
                  <Button variant="primary" className="w-full justify-start">
                    <Plus className="mr-2" size={20} />
                    Create New Event
                  </Button>
                </Link>
                <Link href="/organization/events">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2" size={20} />
                    Manage Events
                  </Button>
                </Link>
                <Link href="/organization/volunteers">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2" size={20} />
                    View Volunteers
                  </Button>
                </Link>
                <Link href="/organization/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2" size={20} />
                    Organization Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                {organization ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5C3A1F]">Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        organization.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                        organization.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {organization.verification_status}
                      </span>
                    </div>
                    {organization.verification_status === 'approved' && (
                      <p className="text-sm text-[#00732F]">
                        Your organization is verified and can create events.
                      </p>
                    )}
                    {organization.verification_status === 'pending' && (
                      <p className="text-sm text-[#A0A0A0]">
                        Your verification is being reviewed by our team.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[#A0A0A0]">Loading organization information...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
