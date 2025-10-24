'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase, type Profile } from '@/lib/supabase'
import { Calendar, Award, Clock, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEvents: 0,
    badges: 0,
    points: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (profileData) {
          setProfile(profileData)

          if (profileData.role === 'volunteer' || profileData.role === 'student') {
            const { data: volunteerData } = await supabase
              .from('volunteer_profiles')
              .select('total_hours, total_events, points')
              .eq('user_id', user.id)
              .maybeSingle()

            if (volunteerData) {
              setStats({
                totalHours: volunteerData.total_hours || 0,
                totalEvents: volunteerData.total_events || 0,
                badges: 0,
                points: volunteerData.points || 0,
              })
            }

            const { data: badgeData } = await supabase
              .from('user_badges')
              .select('id')
              .eq('user_id', user.id)

            setStats(prev => ({ ...prev, badges: badgeData?.length || 0 }))
          }
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
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

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              Welcome back, {profile.first_name}!
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Here's your volunteer activity overview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Total Hours</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalHours}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#5C3A1F] rounded-full flex items-center justify-center">
                    <Clock className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Events Joined</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D2A04A] rounded-full flex items-center justify-center">
                    <Calendar className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Badges Earned</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.badges}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#00732F] rounded-full flex items-center justify-center">
                    <Award className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Points</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.points}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#CE1126] rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
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
                <Link href="/events">
                  <Button variant="primary" className="w-full justify-start">
                    <Calendar className="mr-2" size={20} />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2" size={20} />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/dashboard/badges">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="mr-2" size={20} />
                    View Badges
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#A0A0A0] text-center py-8">
                  No recent activity to display
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
