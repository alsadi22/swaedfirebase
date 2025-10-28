import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireOrganization } from '@/lib/auth0-server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganization();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    // Get organization membership
    const orgMemberResult = await db.query(
      'SELECT organization_id FROM organization_members WHERE user_id = $1',
      [user.id]
    )

    const orgMember = orgMemberResult.rows?.[0]
    if (!orgMember) {
      return NextResponse.json({ error: 'Not a member of any organization' }, { status: 403 })
    }

    // Get organization data
    const orgDataResult = await db.query(
      'SELECT * FROM organizations WHERE id = $1',
      [orgMember.organization_id]
    )

    const organization = orgDataResult.rows?.[0]
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get events data
    const eventsResult = await db.query(
      'SELECT * FROM events WHERE organization_id = $1',
      [orgMember.organization_id]
    )

    const events = eventsResult.rows || []
    const activeEvents = events.filter((e: any) => e.status === 'published' || e.status === 'ongoing')

    const stats = {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      totalVolunteers: events.reduce((sum: number, e: any) => sum + (e.current_volunteers || 0), 0),
      pendingApplications: 0,
    }

    return NextResponse.json({ organization, stats })
  } catch (error) {
    console.error('Error fetching organization dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}