const fetch = require('node-fetch');

async function testSimpleLogin() {
  console.log('🔍 Testing Simple Login (No Headers)...');
  console.log('=====================================');

  try {
    const response = await fetch('http://localhost:3001/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

testSimpleLogin();