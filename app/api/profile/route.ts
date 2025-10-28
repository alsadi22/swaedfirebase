import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAuth } from '@/lib/auth0-server'
import { BadgeService } from '@/lib/badge-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    const result = await db.query(
      'SELECT * FROM profiles WHERE id = $1',
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profile: result.rows[0]
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    const updateData = await request.json()
    const { first_name, last_name, phone, nationality, emirate, city } = updateData

    const result = await db.query(`
      UPDATE profiles 
      SET first_name = $1, last_name = $2, phone = $3, 
          nationality = $4, emirate = $5, city = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [first_name, last_name, phone, nationality, emirate, city, user.id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check for badge eligibility after profile update
    try {
      await BadgeService.checkAndAwardBadges(user.id)
    } catch (error) {
      console.error('Error checking badges after profile update:', error)
      // Don't fail the profile update if badge checking fails
    }

    return NextResponse.json({
      profile: result.rows[0],
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}