#!/usr/bin/env node

/**
 * Script to create a test user for the SwaedUAE platform
 * This script directly uses the database connection and bcrypt for password hashing
 */

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Database configuration
const db = new Pool({
  user: process.env.POSTGRES_USER || 'swaeduae_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'swaeduae',
  password: process.env.POSTGRES_PASSWORD || 'swaeduae_password',
  port: process.env.POSTGRES_PORT || 5432,
})

async function createTestUser() {
  console.log('Creating test user...')
  
  const testUserData = {
    email: 'testuser@swaeduae.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    user_type: 'student',
    phone: '+971501234567',
    date_of_birth: '2000-01-15',
    gender: 'other',
    nationality: 'UAE',
    emirate: 'Dubai',
    city: 'Dubai'
  }

  try {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM profiles WHERE email = $1',
      [testUserData.email]
    )

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Test user already exists!')
      console.log('📧 Email:', testUserData.email)
      console.log('🔑 Password:', testUserData.password)
      console.log('👤 User ID:', existingUser.rows[0].id)
      console.log('\n🚀 You can log in with the existing credentials above.')
      return
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(testUserData.password, saltRounds)

    // Insert the new user
    const result = await db.query(`
      INSERT INTO profiles (
        email, password_hash, first_name, last_name, user_type, 
        phone, date_of_birth, gender, nationality, emirate, city,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING id, email, first_name, last_name, user_type, phone, 
                date_of_birth, gender, nationality, emirate, city, 
                created_at, updated_at
    `, [
      testUserData.email,
      hashedPassword,
      testUserData.first_name,
      testUserData.last_name,
      testUserData.user_type,
      testUserData.phone,
      testUserData.date_of_birth,
      testUserData.gender,
      testUserData.nationality,
      testUserData.emirate,
      testUserData.city
    ])

    const user = result.rows[0]

    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', testUserData.email)
    console.log('🔑 Password:', testUserData.password)
    console.log('👤 User ID:', user.id)
    console.log('🎯 User Type:', user.user_type)
    console.log('📅 Created:', user.created_at)
    
    console.log('\n🚀 You can now log in with:')
    console.log(`   Email: ${testUserData.email}`)
    console.log(`   Password: ${testUserData.password}`)
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message)
    process.exit(1)
  } finally {
    await db.end()
  }
}

// Run the script
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('\n✨ Test user creation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { createTestUser }