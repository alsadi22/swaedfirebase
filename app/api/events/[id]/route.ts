import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Get event details with organization information
    const eventResult = await db.query(`
      SELECT 
        e.*,
        o.name as organization_name,
        o.description as organization_description,
        o.website as organization_website,
        o.contact_email as organization_email
      FROM events e
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.id = $1
    `, [eventId])

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const event = eventResult.rows[0]

    // Get current volunteer count
    const volunteerCountResult = await db.query(`
      SELECT COUNT(*) as count
      FROM event_registrations
      WHERE event_id = $1 AND status = 'approved'
    `, [eventId])

    const currentVolunteers = parseInt(volunteerCountResult.rows[0]?.count || '0')

    return NextResponse.json({
      event: {
        ...event,
        current_volunteers: currentVolunteers
      }
    })
  } catch (error) {
    console.error('Event details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}