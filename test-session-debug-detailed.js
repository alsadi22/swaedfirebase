const fetch = require('node-fetch');

async function testSessionCreationDetailed() {
  console.log('🔍 Testing Session Creation with Detailed Debugging...');
  console.log('=====================================');

  try {
    // 1. Login and capture all response details
    console.log('\n1️⃣ Logging in with detailed response capture...');
    const loginResponse = await fetch('http://localhost:3001/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    console.log('📊 Login Response Status:', loginResponse.status);
    console.log('📊 Login Response Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginData = await loginResponse.json();
    console.log('📊 Login Response Data:', JSON.stringify(loginData, null, 2));

    if (loginResponse.status !== 200) {
      console.error('❌ Login failed');
      return;
    }

    // 2. Extract token and make authenticated request to check sessions
    const token = loginResponse.headers.get('set-cookie')?.match(/token=([^;]+)/)?.[1];
    console.log('\n2️⃣ Extracted Token:', token ? 'Present' : 'Missing');

    // 3. Check sessions with detailed logging
    console.log('\n3️⃣ Checking sessions with authenticated request...');
    const sessionsResponse = await fetch('http://localhost:3001/api/admin/sessions', {
      headers: {
        'Cookie': `token=${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Sessions Response Status:', sessionsResponse.status);
    console.log('📊 Sessions Response Headers:', Object.fromEntries(sessionsResponse.headers.entries()));
    
    const sessionsText = await sessionsResponse.text();
    console.log('📊 Sessions Response Text:', sessionsText);

    // Try to parse as JSON if possible
    try {
      const sessionsData = JSON.parse(sessionsText);
      console.log('📊 Sessions Data (parsed):', JSON.stringify(sessionsData, null, 2));
    } catch (parseError) {
      console.log('⚠️ Could not parse sessions response as JSON');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSessionCreationDetailed();