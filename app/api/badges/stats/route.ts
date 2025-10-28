import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth0-server'
import { db } from '@/lib/database'
import { BadgeService } from '@/lib/badge-service'
import { AuditLogger } from '@/lib/audit-logger'

// GET /api/badges/stats - Get badge statistics
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentUser } = authResult;

    // Check if user is admin for detailed stats
    const profileResult = await db.query(
      'SELECT user_type FROM profiles WHERE id = $1',
      [currentUser.id]
    )
    
    const userType = profileResult.rows?.[0]?.user_type
    const isAdmin = ['admin', 'super_admin'].includes(userType)

    if (isAdmin) {
      // Get comprehensive stats for admin
      const stats = await BadgeService.getBadgeStats()

      // Log admin action
      await AuditLogger.logAdminAction(
        'view_badge_stats',
        'badges',
        'all',
        currentUser.id,
        { stats_type: 'comprehensive' },
        request
      )

      return NextResponse.json(stats)
    } else {
      // Get basic stats for regular users
      const basicStats = await db.query(`
        SELECT 
          COUNT(*) as total_badges,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_badges,
          COUNT(CASE WHEN type = 'bronze' THEN 1 END) as bronze_badges,
          COUNT(CASE WHEN type = 'silver' THEN 1 END) as silver_badges,
          COUNT(CASE WHEN type = 'gold' THEN 1 END) as gold_badges,
          COUNT(CASE WHEN type = 'platinum' THEN 1 END) as platinum_badges
        FROM badges
      `)

      const userBadgeStats = await db.query(`
        SELECT 
          COUNT(*) as user_badges_earned,
          COALESCE(SUM(b.points), 0) as total_points
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = $1
      `, [currentUser.id])

      const stats = {
        ...basicStats.rows[0],
        ...userBadgeStats.rows[0]
      }

      // Convert string numbers to integers
      Object.keys(stats).forEach(key => {
        if (typeof stats[key] === 'string' && !isNaN(Number(stats[key]))) {
          stats[key] = parseInt(stats[key])
        }
      })

      return NextResponse.json(stats)
    }

  } catch (error) {
    console.error('Error getting badge stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}