import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAdmin } from '@/lib/auth0-server'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin authorization
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Fetch all organizations
    const organizationsResult = await db.query(
      'SELECT * FROM organizations ORDER BY created_at DESC'
    )

    return NextResponse.json({ organizations: organizationsResult.rows || [] })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin authorization
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    const body = await request.json()
    const { orgId, action, rejectionReason } = body

    if (!orgId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve') {
      await db.query(
        'UPDATE organizations SET verification_status = $1, verification_date = $2, verified_by = $3 WHERE id = $4',
        ['approved', new Date().toISOString(), user.id, orgId]
      )
    } else if (action === 'reject') {
      if (!rejectionReason?.trim()) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
      }

      await db.query(
        'UPDATE organizations SET verification_status = $1, verification_date = $2, verified_by = $3, rejection_reason = $4 WHERE id = $5',
        ['rejected', new Date().toISOString(), user.id, rejectionReason, orgId]
      )
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}