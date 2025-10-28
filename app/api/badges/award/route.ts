import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth0-server'
import { db } from '@/lib/database'
import { BadgeService } from '@/lib/badge-service'
import { AuditLogger } from '@/lib/audit-logger'

// POST /api/badges/award - Award a badge to a user
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentUser } = authResult;

    // Check if user is admin
    const profileResult = await db.query(
      'SELECT user_type FROM profiles WHERE id = $1',
      [currentUser.id]
    )
    
    const userType = profileResult.rows?.[0]?.user_type
    if (!['admin', 'super_admin'].includes(userType)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, badgeId, progress } = await request.json()

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: 'userId and badgeId are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const userExists = await db.query(
      'SELECT id FROM profiles WHERE id = $1',
      [userId]
    )

    if (!userExists.rows || userExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify badge exists
    const badgeExists = await db.query(
      'SELECT id, name FROM badges WHERE id = $1 AND is_active = true',
      [badgeId]
    )

    if (!badgeExists.rows || badgeExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Badge not found or inactive' },
        { status: 404 }
      )
    }

    const badge = badgeExists.rows[0]
    const userBadge = await BadgeService.awardBadge(userId, badgeId, progress)

    // Log admin action
    await AuditLogger.logAdminAction(
      'award_badge',
      'user_badges',
      userBadge.id.toString(),
      currentUser.id,
      { 
        target_user_id: userId,
        badge_id: badgeId,
        badge_name: badge.name
      },
      request
    )

    return NextResponse.json({ userBadge }, { status: 201 })

  } catch (error) {
    console.error('Error awarding badge:', error)
    
    if (error instanceof Error && error.message === 'User already has this badge') {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/badges/award - Remove a badge from a user
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentUser } = authResult;

    // Check if user is admin
    const profileResult = await db.query(
      'SELECT user_type FROM profiles WHERE id = $1',
      [currentUser.id]
    )
    
    const userType = profileResult.rows?.[0]?.user_type
    if (!['admin', 'super_admin'].includes(userType)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const badgeId = searchParams.get('badgeId')

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: 'userId and badgeId are required' },
        { status: 400 }
      )
    }

    // Get badge info for logging
    const badgeResult = await db.query(
      'SELECT name FROM badges WHERE id = $1',
      [badgeId]
    )

    const badgeName = badgeResult.rows?.[0]?.name || 'Unknown Badge'

    await BadgeService.removeBadge(userId, parseInt(badgeId))

    // Log admin action
    await AuditLogger.logAdminAction(
      'remove_badge',
      'user_badges',
      `${userId}-${badgeId}`,
      currentUser.id,
      { 
        target_user_id: userId,
        badge_id: badgeId,
        badge_name: badgeName
      },
      request
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing badge:', error)
    
    if (error instanceof Error && error.message === 'User badge not found') {
      return NextResponse.json(
        { error: 'User does not have this badge' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}