import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth0-server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;

    // Fetch notifications for the user
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json({
      notifications: result.rows || []
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { user } = authResult;

    const body = await request.json();
    const { action, notificationId } = body;

    if (action === 'markAsRead' && notificationId) {
      // Mark specific notification as read
      await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
        [notificationId, user.id]
      );
      
      return NextResponse.json({ success: true });
    } else if (action === 'markAllAsRead') {
      // Mark all notifications as read for the user
      await db.query(
        'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
        [user.id]
      );
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Delete notification (ensure it belongs to the user)
    await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, user.id]
    );
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}