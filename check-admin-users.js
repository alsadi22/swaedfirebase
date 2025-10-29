require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Database configuration
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'swaeduae',
};

const pool = new Pool(config);

async function checkAdminUsers() {
  try {
    console.log('Checking admin users in database...');
    
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT id, email, first_name, last_name, user_type FROM profiles WHERE user_type = $1 LIMIT 10',
      ['admin']
    );
    
    console.log(`Found ${result.rows.length} admin users:`);
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.first_name} ${user.last_name}, Type: ${user.user_type}`);
    });
    
    if (result.rows.length === 0) {
      console.log('\nNo admin users found. Let\'s check all user types:');
      
      const allUsersResult = await client.query(
        'SELECT email, user_type FROM profiles LIMIT 10'
      );
      
      console.log(`Found ${allUsersResult.rows.length} total users:`);
      allUsersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Type: ${user.user_type}`);
      });
    }
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin users:', error);
    process.exit(1);
  }
}

checkAdminUsers();