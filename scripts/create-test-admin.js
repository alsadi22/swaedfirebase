#!/usr/bin/env node

/**
 * Script to create a test admin user for the SwaedUAE platform
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

async function createTestAdmin() {
  console.log('Creating test admin user...')
  
  const testAdminData = {
    email: 'testadmin@swaeduae.com',
    password: 'AdminPassword123!',
    first_name: 'Test',
    last_name: 'Admin',
    user_type: 'admin',
    phone: '+971501234568',
    date_of_birth: '1990-01-15',
    gender: 'other',
    nationality: 'UAE',
    emirate: 'Dubai',
    city: 'Dubai'
  }

  try {
    // Check if admin already exists
    const existingAdmin = await db.query(
      'SELECT id FROM profiles WHERE email = $1',
      [testAdminData.email]
    )

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Test admin already exists!')
      console.log('📧 Email:', testAdminData.email)
      console.log('🔑 Password:', testAdminData.password)
      console.log('👤 User ID:', existingAdmin.rows[0].id)
      console.log('\n🚀 You can log in with the existing credentials above.')
      return
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(testAdminData.password, saltRounds)

    // Insert the new admin
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
      testAdminData.email,
      hashedPassword,
      testAdminData.first_name,
      testAdminData.last_name,
      testAdminData.user_type,
      testAdminData.phone,
      testAdminData.date_of_birth,
      testAdminData.gender,
      testAdminData.nationality,
      testAdminData.emirate,
      testAdminData.city
    ])

    const admin = result.rows[0]

    console.log('✅ Test admin created successfully!')
    console.log('📧 Email:', testAdminData.email)
    console.log('🔑 Password:', testAdminData.password)
    console.log('👤 User ID:', admin.id)
    console.log('🎯 User Type:', admin.user_type)
    console.log('📅 Created:', admin.created_at)
    
    console.log('\n🚀 You can now log in with:')
    console.log(`   Email: ${testAdminData.email}`)
    console.log(`   Password: ${testAdminData.password}`)
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error.message)
    process.exit(1)
  } finally {
    await db.end()
  }
}

// Run the script
if (require.main === module) {
  createTestAdmin()
    .then(() => {
      console.log('\n✨ Test admin creation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { createTestAdmin }