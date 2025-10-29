const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testPasswordVerification() {
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM profiles WHERE email = $1',
      ['admin@swaeduae.ae']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const testPassword = 'vW%nTZhFOq(N';
      
      console.log('Testing password verification...');
      console.log('Password hash:', user.password_hash);
      console.log('Test password:', testPassword);
      
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log('Password verification result:', isValid);
      
      // Also test with a wrong password
      const wrongPassword = 'wrongpassword';
      const isWrongValid = await bcrypt.compare(wrongPassword, user.password_hash);
      console.log('Wrong password verification result:', isWrongValid);
      
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testPasswordVerification();