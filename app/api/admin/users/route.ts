import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAdmin } from '@/lib/auth0-server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const filterRole = searchParams.get('role')

    let query = `
      SELECT id, first_name, last_name, email, user_type, status, created_at
      FROM profiles
      ORDER BY created_at DESC
    `
    let params: any[] = []

    if (filterRole && filterRole !== 'all') {
      query = `
        SELECT id, first_name, last_name, email, role, is_active, created_at
        FROM profiles
        WHERE role = $1
        ORDER BY created_at DESC
      `
      params = [filterRole]
    }

    const result = await db.query(query, params)
    return NextResponse.json({ users: result.rows })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { userId, status } = await request.json()

    if (!userId || typeof status !== 'string') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    await db.query(
      'UPDATE profiles SET status = $1 WHERE id = $2',
      [status, userId]
    )

    return NextResponse.json({ message: 'User status updated successfully' })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}