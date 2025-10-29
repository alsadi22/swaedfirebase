import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import crypto from 'crypto'
import { emailService } from '@/lib/email/service'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Check if user exists
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name FROM profiles WHERE email = $1',
        [email.toLowerCase().trim()]
      )

      // Always return success to prevent email enumeration
      if (userResult.rows.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.'
        })
      }

      const user = userResult.rows[0]

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

      // Store reset token in database
      await client.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         ON CONFLICT (user_id) 
         DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()`,
        [user.id, resetToken, resetTokenExpiry]
      )

      // Send reset email
      const resetUrl = `${process.env.NEXTAUTH_URL || 'https://swaeduae.ae'}/auth/reset-password?token=${resetToken}`
      
      try {
        await emailService.sendPasswordResetEmail({
          to: user.email,
          firstName: user.first_name || 'User',
          resetUrl
        })
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        // Don't expose email sending errors to the user
      }

      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}