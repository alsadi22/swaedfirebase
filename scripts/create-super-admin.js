#!/usr/bin/env node

/**
 * Script to create a super admin user for the SwaedUAE platform
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

async function createSuperAdmin() {
  console.log('Creating super admin user...')
  
  const superAdminData = {
    email: 'admin@swaeduae.ae',
    password: 'vW%nTZhFOq(N',
    first_name: 'Super',
    last_name: 'Admin',
    user_type: 'admin',
    phone: '+971501234567',
    date_of_birth: '1985-01-01',
    gender: 'other',
    nationality: 'UAE',
    emirate: 'Dubai',
    city: 'Dubai'
  }

  try {
    // Check if admin already exists
    const existingAdmin = await db.query(
      'SELECT id FROM profiles WHERE email = $1',
      [superAdminData.email]
    )

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Super admin already exists!')
      console.log('📧 Email:', superAdminData.email)
      console.log('🔑 Password:', superAdminData.password)
      console.log('👤 User ID:', existingAdmin.rows[0].id)
      console.log('\n🚀 You can log in with the existing credentials above.')
      return existingAdmin.rows[0]
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(superAdminData.password, saltRounds)

    // Insert the new super admin
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
      superAdminData.email,
      hashedPassword,
      superAdminData.first_name,
      superAdminData.last_name,
      superAdminData.user_type,
      superAdminData.phone,
      superAdminData.date_of_birth,
      superAdminData.gender,
      superAdminData.nationality,
      superAdminData.emirate,
      superAdminData.city
    ])

    const admin = result.rows[0]

    console.log('✅ Super admin created successfully!')
    console.log('📧 Email:', superAdminData.email)
    console.log('🔑 Password:', superAdminData.password)
    console.log('👤 User ID:', admin.id)
    console.log('🎯 User Type:', admin.user_type)
    console.log('📅 Created:', admin.created_at)
    
    console.log('\n🚀 You can now log in with:')
    console.log(`   Email: ${superAdminData.email}`)
    console.log(`   Password: ${superAdminData.password}`)
    
    return admin
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message)
    process.exit(1)
  } finally {
    await db.end()
  }
}

// Run the script if called directly
if (require.main === module) {
  createSuperAdmin()
    .then(() => {
      console.log('\n✨ Super admin creation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { createSuperAdmin }