'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Award, Lock } from 'lucide-react'

type Badge = {
  id: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  icon_url: string
  tier: string
  points_value: number
  earned?: boolean
  earned_at?: string
}

export default function BadgesPage() {
  const router = useRouter()
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadBadges() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUserId(user.id)

        const { data: allBadges } = await supabase
          .from('badges')
          .select('*')
          .eq('is_active', true)
          .order('tier', { ascending: true })

        const { data: userBadges } = await supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', user.id)

        const userBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || [])
        const userBadgeMap = new Map(userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || [])

        const badgesWithStatus = allBadges?.map(badge => ({
          ...badge,
          earned: userBadgeIds.has(badge.id),
          earned_at: userBadgeMap.get(badge.id)
        })) || []

        setBadges(badgesWithStatus)
      } catch (error) {
        console.error('Error loading badges:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBadges()
  }, [router])

  const tierColors = {
    bronze: 'bg-amber-700',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-blue-400'
  }

  const earnedCount = badges.filter(b => b.earned).length
  const totalPoints = badges.filter(b => b.earned).reduce((sum, b) => sum + b.points_value, 0)

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              Badge Collection
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Earn badges for your volunteer achievements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="w-12 h-12 text-[#D2A04A] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[#5C3A1F]">{earnedCount}/{badges.length}</p>
                <p className="text-sm text-[#A0A0A0]">Badges Earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-[#00732F] rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">
                  {totalPoints}
                </div>
                <p className="text-3xl font-bold text-[#5C3A1F]">{totalPoints}</p>
                <p className="text-sm text-[#A0A0A0]">Total Points</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-[#CE1126] rounded-full flex items-center justify-center mx-auto mb-2 text-white text-xs">
                  {Math.round((earnedCount / badges.length) * 100)}%
                </div>
                <p className="text-3xl font-bold text-[#5C3A1F]">
                  {Math.round((earnedCount / badges.length) * 100)}%
                </p>
                <p className="text-sm text-[#A0A0A0]">Completion</p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
              <p className="mt-4 text-[#A0A0A0]">Loading badges...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.id} className={badge.earned ? '' : 'opacity-60'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 ${badge.earned ? tierColors[badge.tier as keyof typeof tierColors] : 'bg-gray-300'} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {badge.earned ? (
                          <Award className="text-white" size={32} />
                        ) : (
                          <Lock className="text-white" size={32} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-[#5C3A1F]">
                            {badge.name}
                          </h3>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            badge.tier === 'platinum' ? 'bg-blue-100 text-blue-800' :
                            badge.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            badge.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {badge.tier}
                          </span>
                        </div>
                        <p className="text-sm text-[#A0A0A0] mb-2">
                          {badge.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#D2A04A]">
                            +{badge.points_value} points
                          </span>
                          {badge.earned && badge.earned_at && (
                            <span className="text-xs text-[#A0A0A0]">
                              Earned {new Date(badge.earned_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
