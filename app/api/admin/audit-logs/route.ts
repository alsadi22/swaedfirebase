import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireAdmin } from '@/lib/auth0-server'
import { AuditLogger } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin authorization
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user
    // Log the audit log access
    await AuditLogger.logAdminAction(
      'view_audit_logs',
      'audit_logs',
      'system',
      user.id,
      { accessed_at: new Date().toISOString() },
      request
    )

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build filters
    const filters: any = {
      limit,
      offset
    }

    if (userId) filters.userId = userId
    if (action) filters.action = action
    if (resourceType) filters.resourceType = resourceType
    if (resourceId) filters.resourceId = resourceId
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)

    // Get audit logs
    const logs = await AuditLogger.getLogs(filters)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1'
    const countParams: any[] = []
    let paramCount = 0

    if (filters.userId) {
      paramCount++
      countQuery += ` AND user_id = $${paramCount}`
      countParams.push(filters.userId)
    }

    if (filters.action) {
      paramCount++
      countQuery += ` AND action = $${paramCount}`
      countParams.push(filters.action)
    }

    if (filters.resourceType) {
      paramCount++
      countQuery += ` AND resource_type = $${paramCount}`
      countParams.push(filters.resourceType)
    }

    if (filters.resourceId) {
      paramCount++
      countQuery += ` AND resource_id = $${paramCount}`
      countParams.push(filters.resourceId)
    }

    if (filters.startDate) {
      paramCount++
      countQuery += ` AND created_at >= $${paramCount}`
      countParams.push(filters.startDate)
    }

    if (filters.endDate) {
      paramCount++
      countQuery += ` AND created_at <= $${paramCount}`
      countParams.push(filters.endDate)
    }

    const countResult = await db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0]?.total || '0')

    // Enhance logs with user information
    const enhancedLogs = await Promise.all(
      logs.map(async (log: any) => {
        if (log.user_id) {
          try {
            const userResult = await db.query(
              'SELECT full_name, email FROM profiles WHERE id = $1',
              [log.user_id]
            )
            const userInfo = userResult.rows[0]
            return {
              ...log,
              user_name: userInfo?.full_name || 'Unknown User',
              user_email: userInfo?.email || 'Unknown Email'
            }
          } catch (error) {
            return {
              ...log,
              user_name: 'Unknown User',
              user_email: 'Unknown Email'
            }
          }
        }
        return log
      })
    )

    return NextResponse.json({
      logs: enhancedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin authorization
    const authResult = await requireAdmin()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user

    const body = await request.json()
    const { action, timeframe } = body

    if (action === 'getStats') {
      const stats = await AuditLogger.getStats(timeframe || 'week')
      
      // Log the stats access
      await AuditLogger.logAdminAction(
        'view_audit_stats',
        'audit_logs',
        'system',
        user.id,
        { timeframe, accessed_at: new Date().toISOString() },
        request
      )

      return NextResponse.json({ stats })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error processing audit logs request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}