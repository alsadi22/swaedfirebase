const fetch = require('node-fetch');
const { Client } = require('pg');

async function testSessionCreation() {
  console.log('🔍 Testing Session Creation...');
  console.log('=====================================');

  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'swaeduae',
    user: 'swaeduae_user',
    password: 'swaeduae_password'
  });

  try {
    await client.connect();

    // 1. Login to get token
    console.log('\n1️⃣ Logging in to get token...');
    const loginResponse = await fetch('http://localhost:3001/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    if (loginResponse.status !== 200) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('📊 User:', loginData.user);

    // 2. Check for active sessions immediately after login
    console.log('\n2️⃣ Checking for active sessions...');
    const sessionQuery = 'SELECT COUNT(*) as count FROM admin_sessions WHERE user_id = $1 AND is_active = true';
    const sessionResult = await client.query(sessionQuery, [loginData.user.id]);
    console.log('📊 Active sessions after login:', sessionResult.rows[0].count);

    // 3. Test dashboard access (this should work if session was created)
    console.log('\n3️⃣ Testing dashboard access...');
    const dashboardResponse = await fetch('http://localhost:3001/admin/dashboard', {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    });
    console.log('🌐 Dashboard access status:', dashboardResponse.status);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await client.end();
  }
}

testSessionCreation();