import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { emailService } from '@/lib/email/service'

// Database connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'swaeduae',
  user: process.env.POSTGRES_USER || 'swaeduae_user',
  password: process.env.POSTGRES_PASSWORD,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Verification token is required' 
        },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const userQuery = `
      SELECT id, email, first_name, last_name, email_verified, token_expires_at
      FROM profiles 
      WHERE email_verification_token = $1
    `
    
    const userResult = await pool.query(userQuery, [token])

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid verification token' 
        },
        { status: 400 }
      )
    }

    const user = userResult.rows[0]

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Email is already verified',
          alreadyVerified: true
        }
      )
    }

    // Check if token has expired
    if (user.token_expires_at && new Date() > new Date(user.token_expires_at)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Verification token has expired. Please request a new verification email.' 
        },
        { status: 400 }
      )
    }

    // Update user as verified and clear verification token
    const updateQuery = `
      UPDATE profiles 
      SET email_verified = true, 
          email_verification_token = NULL, 
          token_expires_at = NULL,
          updated_at = NOW()
      WHERE id = $1
    `
    
    await pool.query(updateQuery, [user.id])

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.first_name, user.last_name)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      // Don't fail the verification if welcome email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Welcome to SwaedUAE.',
      user: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required' 
        },
        { status: 400 }
      )
    }

    // Find user by email
    const userQuery = `
      SELECT id, email, first_name, last_name, email_verified
      FROM profiles 
      WHERE email = $1
    `
    
    const userResult = await pool.query(userQuery, [email.toLowerCase().trim()])

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is already verified' 
        },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken()
    const verificationUrl = emailService.createVerificationUrl(verificationToken)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Update user with new verification token
    const updateQuery = `
      UPDATE profiles 
      SET email_verification_token = $1, 
          token_expires_at = $2,
          updated_at = NOW()
      WHERE id = $3
    `
    
    await pool.query(updateQuery, [verificationToken, expiresAt, user.id])

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      verificationToken,
      verificationUrl
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send verification email' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Resend verification email error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}