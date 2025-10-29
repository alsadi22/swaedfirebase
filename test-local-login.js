const fetch = require('node-fetch');

async function testLocalLogin() {
  console.log('🔍 Testing Local Login...');
  console.log('=====================================');

  try {
    const response = await fetch('http://localhost:3001/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        'x-real-ip': '203.0.113.1',
        'cf-connecting-ip': '198.51.100.1',
        'user-agent': 'Test-Agent/1.0'
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    console.log('🌐 Response status:', response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('📊 Response data:', data);
    } else {
      const text = await response.text();
      console.log('❌ Login failed:', text);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLocalLogin();