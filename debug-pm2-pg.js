#!/usr/bin/env node

// This script simulates the exact environment that PM2 uses for the Next.js app
console.log('🔍 Debugging PostgreSQL in PM2 Context');
console.log('======================================');

// Simulate PM2 environment
process.env.NODE_ENV = 'production';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_USER = 'swaeduae_user';
process.env.POSTGRES_PASSWORD = 'swaeduae_password';
process.env.POSTGRES_DB = 'swaeduae';

console.log('Environment setup complete');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test the exact same logic as in lib/database.ts
console.log('\n📦 Testing PostgreSQL import (server-side check)...');

let Pool;
let mockUsed = false;

// Only import pg on server-side (same check as in database.ts)
if (typeof window === 'undefined') {
  try {
    console.log('Attempting to require pg...');
    const pg = require('pg');
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

// Test pool creation (same logic as database.ts)
const pool = Pool ? new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: String(process.env.POSTGRES_PASSWORD || ''),
  database: process.env.POSTGRES_DB || 'swaeduae',
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}) : null;

console.log('Pool created:', !!pool);
console.log('Mock used:', mockUsed);

if (pool) {
  console.log('\n🔌 Testing database connection...');
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
} else {
  console.log('❌ No pool available - using mock implementation');
}

// Test the DatabaseClient class logic
console.log('\n🏗️ Testing DatabaseClient simulation...');

class TestDatabaseClient {
  constructor() {
    this.pool = pool;
  }

  async query(text, params) {
    // Server-side: use real PostgreSQL
    if (typeof window === 'undefined' && this.pool) {
      try {
        const client = await this.pool.connect();
        try {
          const result = await client.query(text, params);
          return result; // Return full result object with rows property
        } catch (error) {
          console.error('Database query error:', error);
          throw error;
        } finally {
          client.release();
        }
      } catch (poolError) {
        console.error('Database pool connection error:', poolError);
        // Return a valid structure even on connection failure
        return { rows: [], error: poolError };
      }
    }
    
    // Client-side or no pool: return mock data
    console.log('Mock query (client-side):', text, params);
    return { rows: [] };
  }
}

const testDb = new TestDatabaseClient();
try {
  const result = await testDb.query('SELECT COUNT(*) as count FROM profiles WHERE user_type = $1', ['admin']);
  console.log('✅ Test query result:', result.rows);
} catch (error) {
  console.error('❌ Test query failed:', error.message);
}