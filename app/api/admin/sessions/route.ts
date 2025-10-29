import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/session-manager'
import { getAdminUser } from '@/lib/admin-auth'

// GET /api/admin/sessions - Get active sessions for current admin
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser()
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessions = await SessionManager.getActiveSessions(adminUser.id)
    
    return NextResponse.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        isActive: session.isActive
      }))
    })
  } catch (error) {
    console.error('Error fetching admin sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/sessions/:sessionId - Invalidate a specific session
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await getAdminUser()
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Verify the session belongs to the current admin
    const sessions = await SessionManager.getActiveSessions(adminUser.id)
    const sessionExists = sessions.some(session => session.id === sessionId)
    
    if (!sessionExists) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    await SessionManager.invalidateSession(sessionId)
    
    return NextResponse.json({
      success: true,
      message: 'Session invalidated successfully'
    })
  } catch (error) {
    console.error('Error invalidating admin session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}