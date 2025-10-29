// Debug script to test PostgreSQL loading in Next.js context
console.log('Starting PostgreSQL debug test...');

// Test 1: Check if we're in server environment
console.log('1. Environment check:');
console.log('   typeof window:', typeof window);
console.log('   NODE_ENV:', process.env.NODE_ENV);

// Test 2: Try to load pg module
console.log('2. Loading pg module:');
let Pool;
try {
  const pg = require('pg');
  Pool = pg.Pool;
  console.log('   ✓ pg module loaded successfully');
  console.log('   Pool constructor:', typeof Pool);
} catch (error) {
  console.log('   ✗ Error loading pg:', error.message);
  console.log('   Error stack:', error.stack);
}

// Test 3: Check environment variables
console.log('3. Environment variables:');
console.log('   POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('   POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('   POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('   POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('   POSTGRES_DB:', process.env.POSTGRES_DB);

// Test 4: Try to create pool
console.log('4. Creating pool:');
if (Pool) {
  try {
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: String(process.env.POSTGRES_PASSWORD || ''),
      database: process.env.POSTGRES_DB || 'swaeduae',
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    console.log('   ✓ Pool created successfully');
    
    // Test 5: Try to connect
    console.log('5. Testing connection:');
    pool.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.log('   ✗ Connection failed:', err.message);
      } else {
        console.log('   ✓ Connection successful:', result.rows[0]);
      }
      pool.end();
    });
  } catch (error) {
    console.log('   ✗ Error creating pool:', error.message);
  }
} else {
  console.log('   ✗ Pool not available (pg module not loaded)');
}