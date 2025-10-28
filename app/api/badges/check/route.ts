import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth0-server'
import { db } from '@/lib/database'
import { BadgeService } from '@/lib/badge-service'
import { AuditLogger } from '@/lib/audit-logger'

// POST /api/badges/check - Check and award badges for a user based on their activities
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentUser } = authResult;
    const { userId } = await request.json()

    // If no userId provided, check for current user
    const targetUserId = userId || currentUser.id

    // If checking for another user, verify admin permissions
    if (userId && userId !== currentUser.id) {
      const profileResult = await db.query(
        'SELECT user_type FROM profiles WHERE id = $1',
        [currentUser.id]
      )
      
      const userType = profileResult.rows?.[0]?.user_type
      if (!['admin', 'super_admin'].includes(userType)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Check and award badges
    const awardedBadges = await BadgeService.checkAndAwardBadges(targetUserId)

    // Log badge checks and awards
    if (awardedBadges.length > 0) {
      for (const badge of awardedBadges) {
        await AuditLogger.logCRUD(
          'create',
          'user_badges',
          badge.id.toString(),
          targetUserId,
          undefined,
          { badge_name: badge.name, tier: badge.tier },
          request
        )
      }
    }

    // Log the badge check action
    await AuditLogger.logCRUD(
      'read',
      'badges',
      targetUserId,
      currentUser.id,
      undefined,
      { 
        target_user_id: targetUserId,
        badges_awarded: awardedBadges.length,
        badge_names: awardedBadges.map(b => b.name)
      },
      request
    )

    return NextResponse.json({ 
      success: true,
      awardedBadges,
      count: awardedBadges.length
    })

  } catch (error) {
    console.error('Error checking badges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/badges/check - Get badge eligibility status for a user
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentUser } = authResult;
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If no userId provided, check for current user
    const targetUserId = userId || currentUser.id

    // If checking for another user, verify admin permissions
    if (userId && userId !== currentUser.id) {
      const profileResult = await db.query(
        'SELECT user_type FROM profiles WHERE id = $1',
        [currentUser.id]
      )
      
      const userType = profileResult.rows?.[0]?.user_type
      if (!['admin', 'super_admin'].includes(userType)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Get user's badges with status
    const badges = await BadgeService.getBadgesForUser(targetUserId)
    
    // Separate earned and unearned badges
    const earnedBadges = badges.filter(b => b.earned)
    const unearnedBadges = badges.filter(b => !b.earned)

    // Get user stats for progress calculation
    const statsQuery = `
      SELECT 
        COALESCE(SUM(er.hours_volunteered), 0) as total_hours,
        COUNT(CASE WHEN er.status = 'completed' THEN 1 END) as events_completed,
        COUNT(DISTINCT e.organization_id) as organizations_count,
        COUNT(DISTINCT DATE_TRUNC('month', er.created_at)) as active_months
      FROM event_registrations er
      LEFT JOIN events e ON er.event_id = e.id
      WHERE er.user_id = $1
    `
    
    const statsResult = await db.query(statsQuery, [targetUserId])
    const stats = statsResult.rows?.[0] || {
      total_hours: 0,
      events_completed: 0,
      organizations_count: 0,
      active_months: 0
    }

    // Calculate progress for unearned badges
    const badgesWithProgress = unearnedBadges.map(badge => {
      const criteria = badge.criteria || {}
      const progress: any = {}
      
      Object.entries(criteria).forEach(([key, value]) => {
        switch (key) {
          case 'totalHours':
            progress[key] = {
              current: parseInt(stats.total_hours),
              required: value as number,
              percentage: Math.min(100, (parseInt(stats.total_hours) / (value as number)) * 100)
            }
            break
          case 'eventsCompleted':
            progress[key] = {
              current: parseInt(stats.events_completed),
              required: value as number,
              percentage: Math.min(100, (parseInt(stats.events_completed) / (value as number)) * 100)
            }
            break
          case 'organizationsCount':
            progress[key] = {
              current: parseInt(stats.organizations_count),
              required: value as number,
              percentage: Math.min(100, (parseInt(stats.organizations_count) / (value as number)) * 100)
            }
            break
          case 'activeMonths':
            progress[key] = {
              current: parseInt(stats.active_months),
              required: value as number,
              percentage: Math.min(100, (parseInt(stats.active_months) / (value as number)) * 100)
            }
            break
        }
      })

      return {
        ...badge,
        progress
      }
    })

    return NextResponse.json({
      earnedBadges,
      unearnedBadges: badgesWithProgress,
      stats: {
        totalHours: parseInt(stats.total_hours),
        eventsCompleted: parseInt(stats.events_completed),
        organizationsCount: parseInt(stats.organizations_count),
        activeMonths: parseInt(stats.active_months)
      }
    })

  } catch (error) {
    console.error('Error getting badge eligibility:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}