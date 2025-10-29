#!/usr/bin/env node

// Test database connection in production environment
console.log('🔍 Testing Database Connection in Production');
console.log('============================================');

// Load environment variables
require('dotenv').config({ path: '.env' });

console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);

async function testDatabaseConnection() {
  try {
    console.log('\n📦 Testing PostgreSQL module import...');
    
    // Test the exact same logic as in lib/database.ts
    let Pool;
    let mockUsed = false;

    // Only import pg on server-side (same check as in database.ts)
    if (typeof window === 'undefined') {
      try {
        console.log('Attempting to require pg using eval...');
        const pg = eval('require')('pg');
        Pool = pg.Pool;
        console.log('✅ PostgreSQL driver loaded successfully');
      } catch (error) {
        console.warn('❌ PostgreSQL driver not available, using mock implementation');
        console.error('Error details:', error.message);
        mockUsed = true;
      }
    } else {
      console.log('Client-side detected, skipping pg import');
    }

    if (mockUsed) {
      console.log('❌ Database connection test failed - using mock implementation');
      return;
    }

    // Test pool creation (same logic as database.ts)
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: String(process.env.POSTGRES_PASSWORD || ''),
      database: process.env.POSTGRES_DB || 'swaeduae',
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log('✅ Pool created successfully');

    console.log('\n🔌 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
    client.release();

    console.log('\n👤 Testing admin user query...');
    const adminResult = await pool.query(
      'SELECT id, email, user_type FROM profiles WHERE email = $1',
      ['admin@swaeduae.ae']
    );
    
    if (adminResult.rows.length > 0) {
      console.log('✅ Admin user found:', adminResult.rows[0]);
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n🔐 Testing admin sessions...');
    const sessionResult = await pool.query(
      'SELECT COUNT(*) as count FROM admin_sessions WHERE is_active = true'
    );
    console.log('Active admin sessions:', sessionResult.rows[0].count);

    await pool.end();
    console.log('✅ Database connection test completed successfully');

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDatabaseConnection().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('Test execution failed:', error);
});