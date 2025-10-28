import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAuth } from '@/lib/auth0-server'
import { BadgeService } from '@/lib/badge-service'

// GET - Retrieve volunteer hours for a user
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', or null for all
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = `
      SELECT 
        vh.id,
        vh.hours_logged,
        vh.date_logged,
        vh.status,
        vh.description,
        vh.verified_by,
        vh.verified_at,
        vh.created_at,
        e.title as event_title,
        e.id as event_id,
        o.name as organization_name,
        o.id as organization_id,
        u.first_name as verified_by_first_name,
        u.last_name as verified_by_last_name
      FROM volunteer_hours vh
      LEFT JOIN events e ON vh.event_id = e.id
      LEFT JOIN organizations o ON vh.organization_id = o.id
      LEFT JOIN users u ON vh.verified_by = u.id
      WHERE vh.user_id = $1
    `

    const params = [user.id]

    if (status) {
      query += ` AND vh.status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY vh.date_logged DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit.toString(), offset.toString())

    const result = await db.query(query, params)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM volunteer_hours WHERE user_id = $1'
    const countParams = [user.id]

    if (status) {
      countQuery += ` AND status = $${countParams.length + 1}`
      countParams.push(status)
    }

    const countResult = await db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0]?.total || '0')

    return NextResponse.json({
      hours: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching volunteer hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Log new volunteer hours
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const { 
      event_id, 
      organization_id, 
      hours_logged, 
      service_date, 
      start_time, 
      end_time, 
      description 
    } = await request.json()

    // Validate required fields
    if (!hours_logged || hours_logged <= 0) {
      return NextResponse.json({ error: 'Valid hours logged is required' }, { status: 400 })
    }

    if (!service_date) {
      return NextResponse.json({ error: 'Service date is required' }, { status: 400 })
    }

    if (!event_id && !organization_id) {
      return NextResponse.json({ error: 'Either event_id or organization_id is required' }, { status: 400 })
    }

    // If event_id is provided, get the organization_id from the event
    let finalOrganizationId = organization_id
    if (event_id && !organization_id) {
      const eventResult = await db.query('SELECT organization_id FROM events WHERE id = $1', [event_id])
      if (eventResult.rows.length === 0) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      finalOrganizationId = eventResult.rows[0].organization_id
    }

    // Insert volunteer hours record
    const result = await db.query(
      `INSERT INTO volunteer_hours 
       (user_id, event_id, organization_id, hours_logged, service_date, start_time, end_time, description, status, date_logged) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING *`,
      [
        user.id,
        event_id || null,
        finalOrganizationId,
        hours_logged,
        service_date,
        start_time || null,
        end_time || null,
        description || null,
        'pending' // Default status is pending approval
      ]
    )

    // Check for badge eligibility after logging hours
    try {
      await BadgeService.checkAndAwardBadges(user.id)
    } catch (error) {
      console.error('Error checking badges after logging volunteer hours:', error)
      // Don't fail the hours logging if badge checking fails
    }

    return NextResponse.json({
      message: 'Volunteer hours logged successfully',
      hours: result.rows[0]
    })
  } catch (error) {
    console.error('Error logging volunteer hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update volunteer hours (for approval/rejection by organizations)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const { id, status, verification_notes } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Hours record ID is required' }, { status: 400 })
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Check if user has permission to approve/reject hours
    // This should be an organization member or admin
    const hoursResult = await db.query(
      `SELECT vh.*, o.id as org_id 
       FROM volunteer_hours vh 
       JOIN organizations o ON vh.organization_id = o.id 
       WHERE vh.id = $1`,
      [id]
    )

    if (hoursResult.rows.length === 0) {
      return NextResponse.json({ error: 'Volunteer hours record not found' }, { status: 404 })
    }

    const hoursRecord = hoursResult.rows[0]

    // Check if user is admin or organization admin for approval operations
    const profileResult = await db.query(
      'SELECT user_type FROM profiles WHERE id = $1',
      [user.id]
    )

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const userType = profileResult.rows[0].user_type
    if (userType !== 'admin' && userType !== 'organization_admin') {
      return NextResponse.json({ error: 'Forbidden - admin access required' }, { status: 403 })
    }

    // Update the volunteer hours record
    const updateResult = await db.query(
      `UPDATE volunteer_hours 
       SET status = $1, verified_by = $2, verified_at = NOW(), verification_notes = $3 
       WHERE id = $4 
       RETURNING *`,
      [status, user.id, verification_notes || null, id]
    )

    // If approved, check for badge eligibility
    if (status === 'approved') {
      try {
        await BadgeService.checkAndAwardBadges(hoursRecord.user_id)
      } catch (error) {
        console.error('Error checking badges after approving volunteer hours:', error)
        // Don't fail the approval if badge checking fails
      }
    }

    return NextResponse.json({
      message: `Volunteer hours ${status} successfully`,
      hours: updateResult.rows[0]
    })
  } catch (error) {
    console.error('Error updating volunteer hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}