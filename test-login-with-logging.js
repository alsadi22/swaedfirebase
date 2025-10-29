const { Client } = require('pg');

const BASE_URL = 'https://swaeduae.ae';

const TEST_ADMIN = {
  email: 'admin@swaeduae.ae',
  password: 'vW%nTZhFOq(N'
};

const dbConfig = {
  user: 'swaeduae_user',
  host: 'localhost',
  database: 'swaeduae',
  password: 'swaeduae_password',
  port: 5432,
};

async function testLoginWithLogging() {
  console.log('🔍 Testing Login with Session Logging...');
  console.log('=====================================\n');

  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Database connected');

    // 1. Clear existing sessions before test
    console.log('\n1️⃣ Clearing existing sessions...');
    await client.query('DELETE FROM admin_sessions WHERE user_id = $1', ['550e8400-e29b-41d4-a716-446655440011']);
    console.log('✅ Existing sessions cleared');

    // 2. Check sessions before login
    console.log('\n2️⃣ Checking sessions before login...');
    const beforeLogin = await client.query('SELECT COUNT(*) FROM admin_sessions WHERE is_active = true');
    console.log(`📊 Active sessions before login: ${beforeLogin.rows[0].count}`);

    // 3. Perform login
    console.log('\n3️⃣ Performing login...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Session-Creation/1.0',
        'X-Forwarded-For': '192.168.1.100'
      },
      body: JSON.stringify(TEST_ADMIN),
    });

    console.log(`🌐 Login response status: ${loginResponse.status}`);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`📋 Response data:`, loginData);

    const cookies = loginResponse.headers.get('set-cookie');
    console.log(`🍪 Cookies:`, cookies);

    // 4. Check sessions immediately after login
    console.log('\n4️⃣ Checking sessions immediately after login...');
    const afterLogin = await client.query('SELECT * FROM admin_sessions WHERE is_active = true ORDER BY created_at DESC');
    console.log(`📊 Active sessions after login: ${afterLogin.rows.length}`);
    
    if (afterLogin.rows.length > 0) {
      console.log('✅ Sessions found:');
      afterLogin.rows.forEach((session, index) => {
        console.log(`   Session ${index + 1}:`);
        console.log(`     ID: ${session.id}`);
        console.log(`     User ID: ${session.user_id}`);
        console.log(`     Token Hash: ${session.token_hash}`);
        console.log(`     IP: ${session.ip_address}`);
        console.log(`     User Agent: ${session.user_agent}`);
        console.log(`     Created: ${session.created_at}`);
        console.log(`     Active: ${session.is_active}`);
      });
    } else {
      console.log('❌ No sessions found after login');
    }

    // 5. Wait a moment and check again
    console.log('\n5️⃣ Waiting 2 seconds and checking again...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const afterWait = await client.query('SELECT * FROM admin_sessions WHERE is_active = true ORDER BY created_at DESC');
    console.log(`📊 Active sessions after wait: ${afterWait.rows.length}`);

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await client.end();
  }
}

testLoginWithLogging();