import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('auth0-session')

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Try to decode the session cookie to get user info
    // For now, we'll extract the user ID from a custom session cookie if available
    const userIdCookie = cookieStore.get('user_id')
    
    if (!userIdCookie) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Fetch user from database
    const users = await db.query(
      'SELECT id, email, first_name, last_name, user_type, status, auth_provider FROM profiles WHERE id = $1',
      [userIdCookie.value]
    )

    if (users.rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = users.rows[0]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        user_type: user.user_type,
        status: user.status,
        auth_provider: user.auth_provider
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[ME] API error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
