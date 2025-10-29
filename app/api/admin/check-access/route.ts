import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth0-server'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin authorization
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      }
    })
  } catch (error) {
    console.error('Admin access check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}