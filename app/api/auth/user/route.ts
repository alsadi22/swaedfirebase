import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth0-server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: session.user
    })
  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}