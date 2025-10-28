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

    // Get volunteer hours
    const hoursResult = await db.query(
      'SELECT hours_logged FROM volunteer_hours WHERE user_id = $1 AND status = $2',
      [user.id, 'approved']
    );

    const totalHours = hoursResult.rows?.reduce((sum: number, h: any) => sum + (h.hours_logged || 0), 0) || 0;

    // Get badges
    const badgesResult = await db.query(
      'SELECT id FROM user_badges WHERE user_id = $1',
      [user.id]
    );

    // Get student profile
    const studentProfileResult = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    );

    const studentProfile = studentProfileResult.rows?.[0];

    // Get upcoming events
    const eventsResult = await db.query(
      `SELECT ea.*, e.* FROM event_applications ea 
       JOIN events e ON ea.event_id = e.id 
       WHERE ea.user_id = $1 AND ea.status = $2 AND e.start_date >= $3 
       ORDER BY e.start_date ASC LIMIT 3`,
      [user.id, 'approved', new Date().toISOString()]
    );

    const stats = {
      totalHours,
      eventsCompleted: Math.floor(totalHours / 4), // Assuming 4 hours per event average
      badgesEarned: badgesResult.rows?.length || 0,
      academicCredits: studentProfile?.academic_credits || 0,
      currentGPA: studentProfile?.current_gpa || 0,
    };

    const upcomingEvents = eventsResult.rows || [];
    
    // Mock recent activity for now - could be enhanced with actual activity tracking
    const recentActivity = [
      { type: 'event', message: 'Completed Beach Cleanup Event', date: '2 days ago' },
      { type: 'badge', message: 'Earned Community Hero Badge', date: '5 days ago' },
      { type: 'credit', message: 'Academic credit approved: 2.0', date: '1 week ago' },
    ];

    return NextResponse.json({
      stats,
      upcomingEvents,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}