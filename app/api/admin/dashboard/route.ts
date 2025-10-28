import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAdmin } from '@/lib/auth0-server'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin authorization
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Load statistics
    const [usersResult, organizationsResult, eventsResult, volunteerProfilesResult] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM profiles'),
      db.query('SELECT COUNT(*) as count FROM organizations'),
      db.query('SELECT COUNT(*) as count FROM events'),
      db.query('SELECT total_hours FROM volunteer_profiles WHERE total_hours IS NOT NULL')
    ])

    const pendingOrgsResult = await db.query(
      'SELECT COUNT(*) as count FROM organizations WHERE verification_status = $1',
      ['pending']
    )

    const totalHours = volunteerProfilesResult.rows.reduce((sum: number, v: any) => sum + (v.total_hours || 0), 0)

    const stats = {
      totalUsers: parseInt(usersResult.rows[0].count) || 0,
      totalOrganizations: parseInt(organizationsResult.rows[0].count) || 0,
      totalEvents: parseInt(eventsResult.rows[0].count) || 0,
      pendingOrganizations: parseInt(pendingOrgsResult.rows[0].count) || 0,
      activeVolunteers: volunteerProfilesResult.rows.length || 0,
      totalHours: totalHours,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}