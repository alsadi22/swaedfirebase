import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAuth } from '@/lib/auth0-server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const result = await db.query(
      'SELECT id, status FROM event_registrations WHERE event_id = $1 AND profile_id = $2',
      [eventId, user.id]
    )

    return NextResponse.json({ 
      hasApplied: result.rows.length > 0,
      application: result.rows[0] || null
    })
  } catch (error) {
    console.error('Error checking application status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}