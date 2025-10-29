import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAuth } from '@/lib/auth0-server'
import { BadgeService } from '@/lib/badge-service'
import { cacheMiddlewares } from '@/lib/cache-middleware'
import { performanceMonitor } from '@/lib/performance-monitor'

async function applicationsGetHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const authResult = await requireAuth()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    // Get user's applications/registrations
    const dbStartTime = Date.now()
    const result = await db.query(`
      SELECT 
        er.id,
        er.status,
        er.registration_date,
        er.notes,
        e.title as event_title,
        e.description as event_description,
        e.start_date,
        e.end_date,
        e.location,
        e.category,
        o.name as organization_name
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE er.profile_id = $1
      ORDER BY er.registration_date DESC
    `, [user.id])
    const dbEndTime = Date.now()
    
    // Record database performance
    await performanceMonitor.recordDatabaseMetrics({
      query: 'user_applications',
      duration: dbEndTime - dbStartTime,
      timestamp: Date.now(),
      success: true
    })

    const response = NextResponse.json({
      applications: result.rows || []
    })
    
    // Record API performance
    await performanceMonitor.recordAPIMetrics({
      endpoint: '/api/applications',
      method: 'GET',
      statusCode: 200,
      responseTime: Date.now() - startTime,
      timestamp: Date.now(),
      userId: user.id
    })

    return response
  } catch (error) {
    console.error('Applications API error:', error)
    
    // Record API performance for error case
    await performanceMonitor.recordAPIMetrics({
      endpoint: '/api/applications',
      method: 'GET',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      timestamp: Date.now()
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply user-specific caching to GET requests
export const GET = cacheMiddlewares.userSpecific(applicationsGetHandler)

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    const { event_id, status = 'pending' } = await request.json()

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Check if user has already applied
    const existingApplication = await db.query(
      'SELECT id FROM event_registrations WHERE event_id = $1 AND profile_id = $2',
      [event_id, user.id]
    )

    if (existingApplication.rows.length > 0) {
      return NextResponse.json({ error: 'You have already applied to this event' }, { status: 400 })
    }

    // Create new application
    const result = await db.query(
      'INSERT INTO event_registrations (event_id, profile_id, status, registration_date) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [event_id, user.id, status]
    )

    // Check for badge eligibility after event registration
    try {
      await BadgeService.checkAndAwardBadges(user.id)
    } catch (error) {
      console.error('Error checking badges after event registration:', error)
      // Don't fail the registration if badge checking fails
    }

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      application: result.rows[0]
    })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}