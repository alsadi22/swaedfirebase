import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '6'
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'published'

    let query = `
      SELECT id, title, description, start_date, start_time, end_time, 
             location, category, organization_id, max_participants, 
             current_participants, status, created_at
      FROM events 
      WHERE status = $1 AND start_date >= CURRENT_DATE
    `
    let params: any[] = [status]

    if (category && category !== 'all') {
      query += ' AND category = $3'
      params.push(category)
    }

    query += ' ORDER BY start_date ASC LIMIT $' + (params.length + 1)
    params.push(parseInt(limit))

    console.log('Events API - Query:', query)
    console.log('Events API - Params:', params)

    const result = await db.query(query, params)
    
    console.log('Events API - Result:', result)
    console.log('Events API - Rows count:', result?.rows?.length || 0)

    return NextResponse.json({
      events: result.rows || []
    })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}