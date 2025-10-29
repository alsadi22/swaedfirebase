import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/session-manager'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    console.log('🔍 Validating session for token:', token.substring(0, 20) + '...')

    // Validate session
    const session = await SessionManager.validateSession(token, request)
    
    if (session) {
      console.log('✅ Session validation successful')
      return NextResponse.json({ 
        valid: true, 
        session: {
          id: session.id,
          userId: session.userId,
          isActive: session.isActive,
          expiresAt: session.expiresAt
        }
      })
    } else {
      console.log('❌ Session validation failed')
      return NextResponse.json(
        { valid: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('❌ Error validating session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}