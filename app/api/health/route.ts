import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const dbResult = await db.query('SELECT NOW() as current_time, version() as db_version')
    const dbInfo = dbResult.rows?.[0]

    // Check basic table counts
    const profilesResult = await db.query('SELECT COUNT(*) as count FROM profiles')
    const eventsResult = await db.query('SELECT COUNT(*) as count FROM events')
    const orgsResult = await db.query('SELECT COUNT(*) as count FROM organizations')

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        server_time: dbInfo?.current_time,
        version: dbInfo?.db_version,
        tables: {
          profiles: parseInt(profilesResult.rows?.[0]?.count || '0'),
          events: parseInt(eventsResult.rows?.[0]?.count || '0'),
          organizations: parseInt(orgsResult.rows?.[0]?.count || '0')
        }
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime()
    }, { status: 503 })
  }
}