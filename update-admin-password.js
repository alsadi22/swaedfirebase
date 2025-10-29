const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateAdminPassword() {
  try {
    const password = 'vW%nTZhFOq(N';
    const saltRounds = 12;
    
    console.log('Generating new password hash...');
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('New password hash:', passwordHash);
    
    // Update the admin user's password
    const result = await pool.query(
      'UPDATE profiles SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [passwordHash, 'admin@swaeduae.ae']
    );
    
    if (result.rows.length > 0) {
      console.log('Password updated successfully for:', result.rows[0].email);
      
      // Verify the new password works
      const isValid = await bcrypt.compare(password, passwordHash);
      console.log('Password verification test:', isValid);
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();