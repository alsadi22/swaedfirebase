import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { auth0_id, email, name, user_type = 'student' } = body

    if (!auth0_id || !email) {
      return NextResponse.json(
        { error: 'auth0_id and email are required' },
        { status: 400 }
      )
    }

    // Split name into first and last name
    const nameParts = name ? name.split(' ') : ['', '']
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    const normalizedEmail = email.toLowerCase().trim()

    console.log(`[SYNC] Processing user: ${normalizedEmail} (Auth0 ID: ${auth0_id})`)

    // Check if user already exists by auth0_id
    const existingUser = await db.query(
      'SELECT id, email, user_type FROM profiles WHERE id = $1',
      [auth0_id]
    )

    if (existingUser.rows.length > 0) {
      console.log(`[SYNC] User ${auth0_id} exists, updating...`)
      
      // User exists, update their information
      const user = existingUser.rows[0]
      
      // Update user information (but preserve existing user_type if it's admin/super_admin)
      const finalUserType = (user.user_type === 'admin' || user.user_type === 'super_admin') 
        ? user.user_type 
        : user_type

      await db.query(
        `UPDATE profiles 
         SET email = $1, first_name = $2, last_name = $3, user_type = $4, auth_provider = $5, status = $6, updated_at = NOW()
         WHERE id = $7`,
        [normalizedEmail, firstName, lastName, finalUserType, 'auth0', 'active', auth0_id]
      )

      console.log(`[SYNC] User ${auth0_id} updated successfully`)

      return NextResponse.json({
        success: true,
        user: {
          id: auth0_id,
          email: normalizedEmail,
          first_name: firstName,
          last_name: lastName,
          user_type: finalUserType
        }
      })
    } else {
      console.log(`[SYNC] User ${auth0_id} not found by ID, checking by email...`)
      
      // Check if user exists by email (for migration purposes)
      const emailUser = await db.query(
        'SELECT id, user_type FROM profiles WHERE email = $1',
        [normalizedEmail]
      )

      if (emailUser.rows.length > 0) {
        console.log(`[SYNC] User found by email, updating ID from ${emailUser.rows[0].id} to ${auth0_id}...`)
        
        // User exists with different ID, update the ID to match Auth0
        const existingUserType = emailUser.rows[0].user_type
        const finalUserType = (existingUserType === 'admin' || existingUserType === 'super_admin') 
          ? existingUserType 
          : user_type

        await db.query(
          `UPDATE profiles 
           SET id = $1, first_name = $2, last_name = $3, user_type = $4, auth_provider = $5, status = $6, updated_at = NOW()
           WHERE email = $7`,
          [auth0_id, firstName, lastName, finalUserType, 'auth0', 'active', normalizedEmail]
        )

        console.log(`[SYNC] User email ${normalizedEmail} migrated to Auth0 ID ${auth0_id}`)

        return NextResponse.json({
          success: true,
          user: {
            id: auth0_id,
            email: normalizedEmail,
            first_name: firstName,
            last_name: lastName,
            user_type: finalUserType
          }
        })
      } else {
        console.log(`[SYNC] New user, creating: ${normalizedEmail}`)
        
        // Create new user (no password_hash needed for Auth0 users)
        const result = await db.query(
          `INSERT INTO profiles (id, email, first_name, last_name, user_type, auth_provider, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING id, email, first_name, last_name, user_type`,
          [auth0_id, normalizedEmail, firstName, lastName, user_type, 'auth0', 'active']
        )

        console.log(`[SYNC] User ${auth0_id} created successfully`)

        return NextResponse.json({
          success: true,
          user: result.rows[0]
        })
      }
    }
  } catch (error) {
    console.error('[SYNC] Error syncing user with database:', error)
    return NextResponse.json(
      { error: 'Failed to sync user with database', details: (error as any).message },
      { status: 500 }
    )
  }
}