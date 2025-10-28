'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import { Calendar, Clock, Award, Users, MapPin, Star } from 'lucide-react'

export default function VolunteerDashboard() {
  const router = useRouter()
  const { user, error, isLoading } = useUser()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHours: 0,
    eventsCompleted: 0,
    badgesEarned: 0,
    upcomingEvents: 0
  })

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Check if Auth0 is still loading
        if (isLoading) {
          return
        }

        // If no user is authenticated, redirect to login
        if (!user) {
          router.push('/auth/volunteer/login')
          return
        }
        
        setProfile(user)
        
        // Mock stats for now - in a real app, these would come from API calls
        setStats({
          totalHours: 45,
          eventsCompleted: 8,
          badgesEarned: 3,
          upcomingEvents: 2
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
        router.push('/auth/volunteer/login')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router, user, isLoading])

  if (loading || isLoading) {
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
              Welcome back, {profile?.name || profile?.first_name || 'Volunteer'}!
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Here's your volunteer activity overview
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Total Hours</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalHours}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#5C3A1F] rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Events Completed</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.eventsCompleted}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D2A04A] rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Badges Earned</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.badgesEarned}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#8B5A3C] rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">Upcoming Events</p>
                    <p className="text-3xl font-bold text-[#5C3A1F]">{stats.upcomingEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#A67C52] rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[#5C3A1F] mb-2">Find Events</h3>
                <p className="text-sm text-[#A0A0A0] mb-4">
                  Discover new volunteer opportunities in your area
                </p>
                <Link href="/events">
                  <Button variant="primary" className="w-full">
                    Browse Events
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[#5C3A1F] mb-2">My Profile</h3>
                <p className="text-sm text-[#A0A0A0] mb-4">
                  Update your skills and preferences
                </p>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[#5C3A1F] mb-2">My Certificates</h3>
                <p className="text-sm text-[#A0A0A0] mb-4">
                  View and download your certificates
                </p>
                <Link href="/dashboard/certificates">
                  <Button variant="outline" className="w-full">
                    View Certificates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-[#5C3A1F] mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[#F8F6F3] rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#5C3A1F]">Completed Beach Cleanup Event</p>
                    <p className="text-sm text-[#A0A0A0]">Earned 4 volunteer hours • 2 days ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#F8F6F3] rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#5C3A1F]">Earned Community Helper Badge</p>
                    <p className="text-sm text-[#A0A0A0]">For completing 5 community events • 1 week ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#F8F6F3] rounded-lg">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#5C3A1F]">Registered for Food Drive</p>
                    <p className="text-sm text-[#A0A0A0]">Scheduled for next Saturday • 1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}