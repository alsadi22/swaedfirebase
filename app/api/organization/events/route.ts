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

    // Get events with application counts
    const eventsResult = await db.query(`
      SELECT 
        e.id,
        e.title,
        e.category,
        e.status,
        e.start_date,
        e.max_volunteers,
        COUNT(ea.id) as application_count
      FROM events e
      LEFT JOIN event_applications ea ON e.id = ea.event_id
      WHERE e.organization_id = $1
      GROUP BY e.id, e.title, e.category, e.status, e.start_date, e.max_volunteers
      ORDER BY e.start_date DESC
    `, [organizationId]);

    const formattedEvents = eventsResult.rows.map((row: any) => ({
      ...row,
      applications: [{ count: parseInt(row.application_count) || 0 }]
    }));

    return NextResponse.json({ events: formattedEvents });

  } catch (error) {
    console.error('Error fetching organization events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}