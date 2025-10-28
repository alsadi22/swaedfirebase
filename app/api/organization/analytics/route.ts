import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireOrganization } from '@/lib/auth0-server';

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
    );

    const orgMember = orgMemberResult.rows?.[0];
    if (!orgMember) {
      return NextResponse.json({ error: 'Not a member of any organization' }, { status: 403 });
    }

    const organizationId = orgMember.organization_id;

    // Get events data
    const eventsResult = await db.query(
      'SELECT id, status FROM events WHERE organization_id = $1',
      [organizationId]
    );

    // Get applications data
    const applicationsResult = await db.query(`
      SELECT ea.status, ea.user_id 
      FROM event_applications ea
      JOIN events e ON ea.event_id = e.id
      WHERE e.organization_id = $1
    `, [organizationId]);

    // Get volunteer hours data
    const hoursResult = await db.query(`
      SELECT vh.hours_logged 
      FROM volunteer_hours vh
      JOIN events e ON vh.event_id = e.id
      WHERE e.organization_id = $1 AND vh.status = 'approved'
    `, [organizationId]);

    const events = eventsResult.rows || [];
    const applications = applicationsResult.rows || [];
    const hours = hoursResult.rows || [];

    // Calculate statistics
    const totalHours = hours.reduce((sum: number, h: any) => sum + (h.hours_logged || 0), 0);
    const totalVolunteers = new Set(
      applications.filter((a: any) => a.status === 'approved').map((a: any) => a.user_id)
    ).size;

    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter((e: any) => e.status === 'published' || e.status === 'in_progress').length,
      totalApplications: applications.length,
      totalHours: totalHours,
      totalVolunteers: totalVolunteers,
    };

    // Events by status
    const statusCounts = events.reduce((acc: any, e: any) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

    const eventData = Object.entries(statusCounts || {}).map(([status, count]) => ({
      status,
      count,
    }));

    // Applications by status
    const appStatusCounts = applications.reduce((acc: any, a: any) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const applicationData = Object.entries(appStatusCounts || {}).map(([status, count]) => ({
      status,
      count,
    }));

    return NextResponse.json({
      stats,
      eventData,
      applicationData
    });

  } catch (error) {
    console.error('Error fetching organization analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}