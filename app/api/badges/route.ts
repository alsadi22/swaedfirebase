import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth0-server'
import { db } from '@/lib/database'
import { BadgeService } from '@/lib/badge-service'
import { AuditLogger } from '@/lib/audit-logger'

// GET /api/badges - Get all badges or badges for a specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const adminView = searchParams.get('adminView') === 'true'

    // Get current user for authentication
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentUser } = authResult;

    // If requesting specific user's badges or admin view, check permissions
    if (userId || adminView) {
      // Check if user is requesting their own badges or is admin
      if (userId && userId !== currentUser.id) {
        // Check if current user is admin
        const profileResult = await db.query(
          'SELECT user_type FROM profiles WHERE id = $1',
          [currentUser.id]
        )
        
        const userType = profileResult.rows?.[0]?.user_type
        if (!['admin', 'super_admin'].includes(userType)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      // Admin view - get all badges
      if (adminView && ['admin', 'super_admin'].includes(currentUser.user_type)) {
        const badges = await BadgeService.getAllBadges()
        
        // Log admin action
        await AuditLogger.logAdminAction(
          'view_all_badges',
          'badges',
          'all',
          currentUser.id,
          undefined,
          request
        )

        return NextResponse.json({ badges })
      }

      // Get badges for specific user
      const targetUserId = userId || currentUser.id
      const badges = await BadgeService.getBadgesForUser(targetUserId)
      
      return NextResponse.json({ badges })
    }

    // Default: get badges for current user
    const badges = await BadgeService.getBadgesForUser(currentUser.id)
    return NextResponse.json({ badges })

  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/badges - Create a new badge (admin only)
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

    const badgeData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'description', 'tier', 'criteria', 'points']
    for (const field of requiredFields) {
      if (!badgeData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate tier
    if (!['bronze', 'silver', 'gold', 'platinum'].includes(badgeData.tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be bronze, silver, gold, or platinum' },
        { status: 400 }
      )
    }

    // Set defaults
    badgeData.name_ar = badgeData.name_ar || badgeData.name
    badgeData.description_ar = badgeData.description_ar || badgeData.description
    badgeData.icon_url = badgeData.icon_url || ''
    badgeData.is_active = badgeData.is_active !== undefined ? badgeData.is_active : true

    const badge = await BadgeService.createBadge(badgeData)

    // Log admin action
    await AuditLogger.logAdminAction(
      'create_badge',
      'badges',
      badge.id.toString(),
      currentUser.id,
      { name: badge.name, tier: badge.tier },
      request
    )

    return NextResponse.json({ badge }, { status: 201 })

  } catch (error) {
    console.error('Error creating badge:', error)
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Badge with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/badges - Update a badge (admin only)
export async function PUT(request: NextRequest) {
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
    const badgeId = searchParams.get('id')

    if (!badgeId) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      )
    }

    const badgeData = await request.json()

    // Validate tier if provided
    if (badgeData.tier && !['bronze', 'silver', 'gold', 'platinum'].includes(badgeData.tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be bronze, silver, gold, or platinum' },
        { status: 400 }
      )
    }

    const badge = await BadgeService.updateBadge(parseInt(badgeId), badgeData)

    // Log admin action
    await AuditLogger.logAdminAction(
      'update_badge',
      'badges',
      badgeId,
      currentUser.id,
      { name: badge.name, tier: badge.tier },
      request
    )

    return NextResponse.json({ badge })

  } catch (error) {
    console.error('Error updating badge:', error)
    
    if (error instanceof Error && error.message === 'Badge not found') {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Badge with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/badges - Delete a badge (admin only)
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
    const badgeId = searchParams.get('id')

    if (!badgeId) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      )
    }

    await BadgeService.deleteBadge(parseInt(badgeId))

    // Log admin action
    await AuditLogger.logAdminAction(
      'delete_badge',
      'badges',
      badgeId,
      currentUser.id,
      undefined,
      request
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting badge:', error)
    
    if (error instanceof Error && error.message === 'Badge not found') {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}