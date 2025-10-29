import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/database'
import { authRateLimiter } from '@/lib/rate-limiter'
import { SessionManager } from '@/lib/session-manager'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for admin login attempts
    const rateLimitResult = authRateLimiter.check(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts, please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '500',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Query the database for the admin user
    const result = await db.query(
      'SELECT * FROM profiles WHERE email = $1 AND user_type = $2',
      [email, 'admin']
    )

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = result[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: 'admin',
        firstName: user.first_name,
        lastName: user.last_name
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // Create session in database
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') || 
                    '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    try {
      await SessionManager.createSession(user.id, token, clientIP, userAgent)
      console.log('✅ Session created successfully for user:', user.id)
    } catch (sessionError) {
      console.error('❌ Failed to create session:', sessionError)
      // Continue with login even if session creation fails
    }

    // Log successful admin login to audit logs
    await db.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, new_values) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        user.id,
        'admin_login',
        'auth',
        user.id,
        clientIP,
        userAgent,
        JSON.stringify({ email: user.email, loginTime: new Date().toISOString() })
      ]
    )

    // Prepare response data
    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        user_type: user.user_type
      }
    }

    // Create response with cookie
    const response = NextResponse.json(responseData)
    
    // Set HTTP-only cookie with the JWT token
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const token = cookieStore.get('admin_token')?.value

    if (token) {
      try {
        // Verify and decode the token to get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
        
        // Invalidate all sessions for this user
        await SessionManager.invalidateAllUserSessions(decoded.userId)
        
        // Log the logout action
        await db.query(
          'INSERT INTO audit_logs (user_id, action, new_values, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
          [
            decoded.userId,
            'admin_logout',
            JSON.stringify({ email: decoded.email }),
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            request.headers.get('user-agent') || 'unknown'
          ]
        )
      } catch (tokenError) {
        console.error('Error processing token during logout:', tokenError)
        // Continue with logout even if token processing fails
      }
    }

    // Clear the admin token cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    })
    
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0) // Expire immediately
    })

    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    
    // Even if there's an error, clear the cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    })
    
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0)
    })

    return response
  }
}