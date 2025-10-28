#!/usr/bin/env node

/**
 * Test Database Connection Script
 * This script tests the application's connection to PostgreSQL
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

// Database configuration
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'swaeduae',
}

async function testDatabaseConnection() {
  console.log('🧪 Testing SwaedUAE Database Connection...')
  console.log('📋 Configuration:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
  })
  
  const pool = new Pool(config)
  
  try {
    // Test connection
    console.log('\n🔌 Testing database connection...')
    const client = await pool.connect()
    console.log('✅ Connected successfully!')
    
    // Test 1: Query profiles
    console.log('\n📊 Testing profiles query...')
    const profilesResult = await client.query('SELECT email, full_name, role FROM profiles ORDER BY created_at')
    console.log(`✅ Found ${profilesResult.rows.length} profiles:`)
    profilesResult.rows.forEach(profile => {
      console.log(`   - ${profile.full_name} (${profile.email}) - ${profile.role}`)
    })
    
    // Test 2: Query organizations
    console.log('\n🏢 Testing organizations query...')
    const orgsResult = await client.query('SELECT name, contact_email, status FROM organizations ORDER BY created_at')
    console.log(`✅ Found ${orgsResult.rows.length} organizations:`)
    orgsResult.rows.forEach(org => {
      console.log(`   - ${org.name} (${org.contact_email}) - ${org.status}`)
    })
    
    // Test 3: Query events
    console.log('\n📅 Testing events query...')
    const eventsResult = await client.query('SELECT title, category, start_date, location FROM events ORDER BY start_date')
    console.log(`✅ Found ${eventsResult.rows.length} events:`)
    eventsResult.rows.forEach(event => {
      console.log(`   - ${event.title} (${event.category}) - ${event.start_date}`)
    })
    
    // Test 4: Test upcoming events
    console.log('\n🔍 Testing upcoming events query...')
    const upcomingResult = await client.query(`
      SELECT title, category, start_date, location, status 
      FROM events 
      WHERE start_date >= CURRENT_DATE 
      ORDER BY start_date 
      LIMIT 3
    `)
    console.log(`✅ Found ${upcomingResult.rows.length} upcoming events:`)
    upcomingResult.rows.forEach(event => {
      console.log(`   - ${event.title} on ${event.start_date} at ${event.location}`)
    })
    
    // Test 5: Test event registrations
    console.log('\n👥 Testing event registrations query...')
    const registrationsResult = await client.query(`
      SELECT er.status, p.full_name, e.title 
      FROM event_registrations er
      JOIN profiles p ON er.user_id = p.id
      JOIN events e ON er.event_id = e.id
      ORDER BY er.registration_date
    `)
    console.log(`✅ Found ${registrationsResult.rows.length} registrations:`)
    registrationsResult.rows.forEach(reg => {
      console.log(`   - ${reg.full_name} registered for "${reg.title}" (${reg.status})`)
    })
    
    client.release()
    
    console.log('\n🎉 All database tests passed successfully!')
    console.log('✅ PostgreSQL integration is working correctly!')
    console.log('🌐 Your SwaedUAE platform is ready with real database!')
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testDatabaseConnection()