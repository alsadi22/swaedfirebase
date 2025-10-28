import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth0-server';
import { calculateDistance } from '@/lib/utils';
import { BadgeService } from '@/lib/badge-service';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const sessionId = searchParams.get('sessionId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Fetch event details
    const eventResult = await db.query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    );
    
    const event = eventResult.rows?.[0];
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let session = null;
    if (sessionId) {
      const sessionResult = await db.query(
        'SELECT * FROM event_sessions WHERE id = $1',
        [sessionId]
      );
      session = sessionResult.rows?.[0];
    }

    return NextResponse.json({
      event,
      session,
      user
    });

  } catch (error) {
    console.error('Error fetching check-in data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const body = await request.json();
    const { eventId, sessionId, location } = body;

    if (!eventId || !location) {
      return NextResponse.json({ error: 'Event ID and location are required' }, { status: 400 });
    }

    // Fetch event details
    const eventResult = await db.query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    );
    
    const event = eventResult.rows?.[0];
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let session = null;
    if (sessionId) {
      const sessionResult = await db.query(
        'SELECT * FROM event_sessions WHERE id = $1',
        [sessionId]
      );
      session = sessionResult.rows?.[0];
    }

    // Validate GPS location
    const eventLocation = event.location_coordinates || session?.location_coordinates;
    if (eventLocation) {
      const eventLat = eventLocation.lat || eventLocation.latitude;
      const eventLng = eventLocation.lng || eventLocation.longitude;
      const radius = event.geofence_radius || 500;

      const distance = calculateDistance(location.lat, location.lng, eventLat, eventLng);
      
      if (distance > radius) {
        return NextResponse.json({
          error: 'location_too_far',
          message: `You are ${Math.round(distance)}m away. Please be within ${radius}m of the event location.`,
          distance: Math.round(distance),
          radius
        }, { status: 400 });
      }
    }

    // Check if already checked in
    const existingAttendanceResult = await db.query(
      'SELECT * FROM attendance WHERE event_id = $1 AND volunteer_id = $2 AND status = $3',
      [eventId, user.id, 'checked_in']
    );

    const existingAttendance = existingAttendanceResult.rows?.[0];

    if (existingAttendance) {
      return NextResponse.json({
        success: true,
        message: 'You are already checked in!',
        alreadyCheckedIn: true
      });
    }

    // Create attendance record
    await db.query(
      `INSERT INTO attendance (event_id, event_session_id, volunteer_id, check_in_time, 
       check_in_method, check_in_location, location_verified, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        eventId,
        sessionId,
        user.id,
        new Date().toISOString(),
        'qr_code',
        JSON.stringify(location),
        true,
        'checked_in'
      ]
    );

    // Update event volunteer count
    await db.query(
      'UPDATE events SET volunteer_count = volunteer_count + 1 WHERE id = $1',
      [eventId]
    );

    // Trigger badge checking after successful check-in
    try {
      await BadgeService.checkAndAwardBadges(user.id);
    } catch (badgeError) {
      console.error('Error checking badges after check-in:', badgeError);
      // Don't fail the check-in if badge checking fails
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in successful! Enjoy the event.'
    });

  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}