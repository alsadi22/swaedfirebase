#!/usr/bin/env node

// Debug script to check environment variables in PM2 context
console.log('=== PM2 Environment Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

console.log('\n=== PostgreSQL Environment Variables ===');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '[HIDDEN]' : 'undefined');
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[HIDDEN]' : 'undefined');

console.log('\n=== Testing PostgreSQL Driver ===');
try {
  const pg = require('pg');
  console.log('✅ PostgreSQL driver (pg) loaded successfully');
  
  // Test pool creation
  const Pool = pg.Pool;
  const testPool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: String(process.env.POSTGRES_PASSWORD || ''),
    database: process.env.POSTGRES_DB || 'swaeduae',
    min: 1,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  console.log('✅ PostgreSQL pool created successfully');
  
  // Test connection
  testPool.connect()
    .then(client => {
      console.log('✅ PostgreSQL connection successful');
      return client.query('SELECT NOW() as current_time');
    })
    .then(result => {
      console.log('✅ PostgreSQL query successful:', result.rows[0]);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ PostgreSQL connection/query failed:', error.message);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ PostgreSQL driver not available:', error.message);
  process.exit(1);
}