// Debug script to test PostgreSQL driver loading in PM2 context
console.log('=== PostgreSQL Driver Debug in PM2 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('typeof window:', typeof window);

// Test PostgreSQL driver loading
try {
  const pg = require('pg');
  console.log('✅ PostgreSQL driver loaded successfully');
  console.log('Pool constructor available:', !!pg.Pool);
  
  // Test environment variables
  console.log('\n=== PostgreSQL Environment Variables ===');
  console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
  console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
  console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
  console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '[HIDDEN]' : 'undefined');
  console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
  
  // Test pool creation
  const pool = new pg.Pool({
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
  
  console.log('✅ PostgreSQL pool created successfully');
  
  // Test connection
  pool.query('SELECT version()', (err, result) => {
    if (err) {
      console.error('❌ PostgreSQL connection error:', err.message);
    } else {
      console.log('✅ PostgreSQL connection successful');
      console.log('Database version:', result.rows[0].version);
    }
    pool.end();
  });
  
} catch (error) {
  console.error('❌ PostgreSQL driver error:', error.message);
  console.error('Stack trace:', error.stack);
}