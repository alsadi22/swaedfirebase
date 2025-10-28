#!/usr/bin/env node

/**
 * Script to create a test user for the SwaedUAE platform
 * This script uses the existing auth functions to properly hash passwords
 */

import { signUp } from '../lib/auth.js'

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
    const result = await signUp(testUserData)
    
    if (result.error) {
      console.error('❌ Failed to create test user:', result.error)
      process.exit(1)
    }

    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', testUserData.email)
    console.log('🔑 Password:', testUserData.password)
    console.log('👤 User ID:', result.user.id)
    console.log('🎯 User Type:', result.user.user_type)
    console.log('📅 Created:', result.user.created_at)
    
    console.log('\n🚀 You can now log in with:')
    console.log(`   Email: ${testUserData.email}`)
    console.log(`   Password: ${testUserData.password}`)
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
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

export { createTestUser }