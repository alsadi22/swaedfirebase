const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
  host: 'localhost',
  user: 'swaeduae_user',
  password: process.env.DB_PASSWORD || 'swaeduae_password',
  database: 'swaeduae',
  port: 5432,
});

async function createTestVolunteer() {
  const client = await pool.connect();
  
  try {
    const email = 'testvolunteer@login.test';
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('Test user already exists, updating password...');
      await client.query(
        'UPDATE profiles SET password_hash = $1 WHERE email = $2',
        [hashedPassword, email]
      );
    } else {
      console.log('Creating new test user...');
      await client.query(`
        INSERT INTO profiles (
          email, password_hash, first_name, last_name, user_type,
          email_verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [
        email,
        hashedPassword,
        'Test',
        'Volunteer',
        'volunteer',
        true
      ]);
    }
    
    console.log('✅ Test volunteer created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('');
    console.log('You can now test login with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating test volunteer:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestVolunteer();