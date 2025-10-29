async function testAuthenticatedSessions() {
  console.log('🔍 Testing authenticated sessions API access...\n');

  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
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
      console.log('❌ Login failed:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('❌ Error:', errorText);
      return;
    }

    console.log('✅ Login successful');
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies);

    // Step 2: Test sessions API with authentication
    console.log('\n2. Testing sessions API with authentication...');
    const sessionsResponse = await fetch('http://localhost:3001/api/admin/sessions', {
      headers: {
        'Cookie': cookies || ''
      }
    });

    console.log('📊 Sessions API response status:', sessionsResponse.status);
    console.log('📊 Sessions API response headers:', Object.fromEntries(sessionsResponse.headers.entries()));
    
    if (sessionsResponse.status === 200) {
      const sessionsData = await sessionsResponse.json();
      console.log('📊 Sessions API response:', JSON.stringify(sessionsData, null, 2));
    } else {
      const errorText = await sessionsResponse.text();
      console.log('❌ Sessions API error:', errorText);
    }

    // Step 3: Test without cookies to confirm 401
    console.log('\n3. Testing sessions API without authentication...');
    const unauthResponse = await fetch('http://localhost:3001/api/admin/sessions');
    console.log('🚫 Unauthenticated response status:', unauthResponse.status);
    
    if (unauthResponse.status === 401) {
      const errorData = await unauthResponse.json();
      console.log('✅ Correctly returns 401:', errorData);
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testAuthenticatedSessions();