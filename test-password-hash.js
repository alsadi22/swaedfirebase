const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: 'swaeduae_user',
  host: 'localhost',
  database: 'swaeduae',
  password: process.env.DB_PASSWORD || 'swaeduae_password',
  port: 5432,
});

async function testPasswordHash() {
  console.log('🔍 Testing password hash verification...\n');

  try {
    // Get the admin user from database
    const result = await pool.query(
      'SELECT id, email, password_hash FROM profiles WHERE email = $1 AND user_type = $2',
      ['admin@swaeduae.ae', 'admin']
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }

    const user = result.rows[0];
    console.log('👤 Found admin user:', user.email);
    console.log('🔑 Password hash length:', user.password_hash ? user.password_hash.length : 'NULL');
    console.log('🔑 Password hash preview:', user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'NULL');

    // Test different passwords
    const testPasswords = [
      'Admin123!',
      'admin123',
      'Admin123',
      'admin@123',
      'swaeduae123',
      'password123'
    ];

    console.log('\n🧪 Testing password combinations:');
    
    for (const password of testPasswords) {
      try {
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log(`🔐 "${password}": ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        if (isValid) {
          console.log(`🎉 Found correct password: ${password}`);
          break;
        }
      } catch (error) {
        console.log(`🔐 "${password}": ❌ ERROR - ${error.message}`);
      }
    }

    // Also test if we can generate a new hash for Admin123!
    console.log('\n🔧 Testing hash generation for "Admin123!":');
    const newHash = await bcrypt.hash('Admin123!', 12);
    console.log('🆕 New hash:', newHash.substring(0, 20) + '...');
    
    const testNewHash = await bcrypt.compare('Admin123!', newHash);
    console.log('✅ New hash verification:', testNewHash ? 'WORKS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testPasswordHash();