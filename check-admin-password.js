const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'swaeduae_user',
  password: 'swaeduae_password',
  database: 'swaeduae'
});

async function checkAdminPassword() {
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, user_type FROM profiles WHERE email = $1',
      ['admin@swaeduae.ae']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('👤 Admin user found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  User Type:', user.user_type);
      console.log('  Has password hash:', !!user.password_hash);
      console.log('  Password hash length:', user.password_hash ? user.password_hash.length : 0);
      if (user.password_hash) {
        console.log('  Password hash starts with:', user.password_hash.substring(0, 10));
      }
      
      // Test password verification
      const testPassword = 'admin123';
      console.log('\n🧪 Testing password verification...');
      console.log('  Testing password:', testPassword);
      
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log('  Password valid:', isValid);
      
      if (!isValid) {
        console.log('\n🔧 Password verification failed - updating hash...');
        const newHash = await bcrypt.hash(testPassword, 12);
        
        await pool.query(
          'UPDATE profiles SET password_hash = $1 WHERE email = $2',
          [newHash, 'admin@swaeduae.ae']
        );
        
        console.log('✅ Password hash updated');
        
        // Verify the new hash
        const verifyResult = await bcrypt.compare(testPassword, newHash);
        console.log('  New hash verification:', verifyResult);
      } else {
        console.log('✅ Password verification successful');
      }
      
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkAdminPassword();