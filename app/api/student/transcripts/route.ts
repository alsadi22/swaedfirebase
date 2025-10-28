import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireUserType } from '@/lib/auth0-server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireUserType(['student']);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    // Fetch volunteer hours with event and organization details
    const hoursResult = await db.query(`
      SELECT 
        vh.id,
        vh.hours_logged,
        vh.date_logged,
        vh.status,
        e.title as event_title,
        o.name as organization_name
      FROM volunteer_hours vh
      JOIN events e ON vh.event_id = e.id
      JOIN organizations o ON e.organization_id = o.id
      WHERE vh.user_id = $1
      ORDER BY vh.date_logged DESC
    `, [user.id]);

    // Fetch certificates with event details
    const certsResult = await db.query(`
      SELECT 
        c.id,
        c.certificate_number,
        c.issue_date,
        c.hours_earned,
        e.title as event_title
      FROM certificates c
      JOIN events e ON c.event_id = e.id
      WHERE c.user_id = $1
      ORDER BY c.issue_date DESC
    `, [user.id]);

    // Map the data to match the expected interface
    const mappedHours = hoursResult.rows?.map((hour: any) => ({
      id: hour.id,
      hours_logged: hour.hours_logged,
      date_logged: hour.date_logged,
      status: hour.status,
      event: {
        title: hour.event_title,
        organization: { name: hour.organization_name }
      }
    })) || [];
    
    const mappedCerts = certsResult.rows?.map((cert: any) => ({
      id: cert.id,
      certificate_number: cert.certificate_number,
      issue_date: cert.issue_date,
      hours_earned: cert.hours_earned,
      event: { title: cert.event_title }
    })) || [];

    const totalHours = mappedHours?.filter((h: any) => h.status === 'approved')
      .reduce((sum: number, h: any) => sum + (h.hours_logged || 0), 0) || 0;

    return NextResponse.json({
      records: mappedHours,
      certificates: mappedCerts,
      totalHours
    });

  } catch (error) {
    console.error('Error fetching student transcript data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}