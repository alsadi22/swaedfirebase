'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Award, Clock, TrendingUp, Users, Star, Target } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/database'
import { useUser } from '@auth0/nextjs-auth0/client'
import { BadgeService, type BadgeWithStatus } from '@/lib/badge-service'

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEvents: 0,
    badges: 0,
    points: 0,
  })
  const [badges, setBadges] = useState<BadgeWithStatus[]>([])
  const [recentBadges, setRecentBadges] = useState<BadgeWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  const { user, error, isLoading } = useUser()

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Check if Auth0 is still loading
        if (isLoading) {
          return
        }

        // If no user is authenticated or there's an error, redirect to login
        if (!user || error) {
          router.push('/auth/login')
          return
        }

        // Try to get profile from API endpoint which handles Auth0 sync
        const profileResponse = await fetch('/api/profile', {
          credentials: 'include'
        })

        if (profileResponse.ok) {
          const { profile: profileData } = await profileResponse.json()
          setProfile(profileData)

          if (profileData.user_type === 'volunteer' || profileData.user_type === 'student') {
            const volunteerResult = await db.query(
              'SELECT total_hours, total_events, points FROM volunteer_profiles WHERE user_id = $1',
              [profileData.id]
            )

            if (volunteerResult.rows.length > 0) {
              const volunteerData = volunteerResult.rows[0]
              setStats({
                totalHours: volunteerData.total_hours || 0,
                totalEvents: volunteerData.total_events || 0,
                badges: 0,
                points: volunteerData.points || 0,
              })
            }

            const badgeResult = await db.query(
              'SELECT COUNT(*) as badge_count FROM user_badges WHERE user_id = $1',
              [profileData.id]
            )

            setStats(prev => ({ ...prev, badges: parseInt(badgeResult.rows[0]?.badge_count) || 0 }))

            // Load user badges with progress
            try {
              const userBadges = await BadgeService.getBadgesForUser(profileData.id)
              setBadges(userBadges)
              
              // Get recently earned badges (last 5)
              const earnedBadges = userBadges
                .filter((badge: BadgeWithStatus) => badge.earned)
                .sort((a: BadgeWithStatus, b: BadgeWithStatus) => 
                  new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime()
                )
                .slice(0, 5)
              setRecentBadges(earnedBadges)
            } catch (error) {
              console.error('Error loading badges:', error)
            }
          }
        } else if (profileResponse.status === 404) {
          // Profile not found - this might be a new user
          console.log('Profile not found, user might need to complete registration')
          // You could redirect to a profile setup page here
          // router.push('/profile/setup')
        } else if (profileResponse.status === 401) {
          // Not authenticated
          router.push('/auth/login')
          return
        } else {
          console.error('Failed to load profile:', profileResponse.statusText)
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
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-[#D2A04A]" size={20} />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentBadges.length > 0 ? (
                  <div className="space-y-3">
                    {recentBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center gap-3 p-3 bg-[#F8F6F0] rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#D2A04A] to-[#B8941F] rounded-full flex items-center justify-center">
                          <Award className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#5C3A1F]">{badge.name}</p>
                          <p className="text-sm text-[#A0A0A0]">
                            Earned {new Date(badge.earned_at!).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={badge.tier === 'gold' ? 'warning' : badge.tier === 'silver' ? 'secondary' : 'default'}>
                          {badge.tier}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#A0A0A0] text-center py-8">
                    No badges earned yet. Complete activities to earn your first badge!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Badge Progress Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-[#00732F]" size={20} />
                  Badge Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges
                    .filter((badge: BadgeWithStatus) => !badge.earned)
                    .slice(0, 6)
                    .map((badge) => {
                      const progress = badge.progress || {}
                      const criteria = badge.criteria || {}
                      
                      // Calculate progress percentage based on badge criteria
                      let progressPercentage = 0
                      let progressText = 'Not started'
                      
                      if (criteria.totalHours && progress.totalHours !== undefined) {
                        progressPercentage = Math.min((progress.totalHours / criteria.totalHours) * 100, 100)
                        progressText = `${progress.totalHours}/${criteria.totalHours} hours`
                      } else if (criteria.eventsCompleted && progress.eventsCompleted !== undefined) {
                        progressPercentage = Math.min((progress.eventsCompleted / criteria.eventsCompleted) * 100, 100)
                        progressText = `${progress.eventsCompleted}/${criteria.eventsCompleted} events`
                      } else if (criteria.organizationsCount && progress.organizationsCount !== undefined) {
                        progressPercentage = Math.min((progress.organizationsCount / criteria.organizationsCount) * 100, 100)
                        progressText = `${progress.organizationsCount}/${criteria.organizationsCount} organizations`
                      }

                      return (
                        <div key={badge.id} className="p-4 bg-[#F8F6F0] rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#A0A0A0] to-[#808080] rounded-full flex items-center justify-center">
                              <Award className="text-white" size={14} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-[#5C3A1F] text-sm">{badge.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {badge.tier}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#A0A0A0]">Progress</span>
                              <span className="text-[#5C3A1F] font-medium">{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-[#E5E5E5] rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[#00732F] to-[#4CAF50] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-[#A0A0A0]">{progressText}</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
                {badges.filter((badge: BadgeWithStatus) => !badge.earned).length === 0 && (
                  <p className="text-[#A0A0A0] text-center py-8">
                    Congratulations! You've earned all available badges!
                  </p>
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
