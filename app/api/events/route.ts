import { NextRequest, NextResponse } from 'next/server'
import { cacheMiddlewares } from '@/lib/cache-middleware'
import { performanceMonitor } from '@/lib/performance-monitor'

async function eventsHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '6'

    // Use direct PostgreSQL connection instead of the db helper
    const { Pool } = require('pg')
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: String(process.env.POSTGRES_PASSWORD || ''),
      database: process.env.POSTGRES_DB || 'swaeduae',
    })

    let query = `
      SELECT id, title, description, start_date, location, created_at
      FROM events 
      WHERE start_date >= CURRENT_DATE
      ORDER BY start_date ASC LIMIT $1
    `
    let params: any[] = [parseInt(limit)]

    console.log('Events API - Query:', query)
    console.log('Events API - Params:', params)

    const dbStartTime = Date.now()
    const result = await pool.query(query, params)
    const dbEndTime = Date.now()
    
    // Record database performance
    await performanceMonitor.recordDatabaseMetrics({
      query: 'events_list',
      duration: dbEndTime - dbStartTime,
      timestamp: Date.now(),
      success: true
    })
    
    await pool.end()
    
    console.log('Events API - Result:', result)
    console.log('Events API - Rows count:', result?.rows?.length || 0)

    const response = NextResponse.json({
      events: result.rows || []
    })
    
    // Record API performance
    await performanceMonitor.recordAPIMetrics({
      endpoint: '/api/events',
      method: 'GET',
      statusCode: 200,
      responseTime: Date.now() - startTime,
      timestamp: Date.now()
    })

    return response
  } catch (error) {
    console.error('Events API error:', error)
    
    // Record API performance for error case
    await performanceMonitor.recordAPIMetrics({
      endpoint: '/api/events',
      method: 'GET',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      timestamp: Date.now()
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply caching middleware to the handler
export const GET = cacheMiddlewares.events(eventsHandler)