async function testTokenDebug() {
  console.log('🔍 Debugging token validation issue...\n');

  try {
    // Step 1: Login and get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch('https://swaeduae.ae/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Extract token from cookie
    const cookies = loginResponse.headers.get('set-cookie');
    const tokenMatch = cookies?.match(/admin_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      console.log('❌ No token found');
      return;
    }

    console.log('🍪 Token extracted:', token.substring(0, 20) + '...');

    // Step 2: Decode the JWT token manually
    console.log('\n2️⃣ Decoding JWT token...');
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('❌ Invalid JWT format');
        return;
      }

      const [header, payload, signature] = parts;
      
      // Decode header
      const decodedHeader = JSON.parse(atob(header.replace(/-/g, '+').replace(/_/g, '/')));
      console.log('📋 JWT Header:', decodedHeader);

      // Decode payload
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      console.log('📋 JWT Payload:', decodedPayload);

      // Check expiration
      const now = Date.now() / 1000;
      console.log('⏰ Current time:', now);
      console.log('⏰ Token expires:', decodedPayload.exp);
      console.log('⏰ Time until expiry:', decodedPayload.exp - now, 'seconds');

      if (decodedPayload.exp && now >= decodedPayload.exp) {
        console.log('❌ Token is expired');
      } else {
        console.log('✅ Token is not expired');
      }

      if (decodedPayload.role === 'admin') {
        console.log('✅ Token has admin role');
      } else {
        console.log('❌ Token does not have admin role:', decodedPayload.role);
      }

    } catch (error) {
      console.log('❌ Error decoding JWT:', error.message);
    }

    // Step 3: Test database session validation
    console.log('\n3️⃣ Testing database session...');
    const sessionCheckResponse = await fetch('https://swaeduae.ae/api/admin/validate-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `admin_token=${token}`
      }
    });

    console.log('📊 Session validation status:', sessionCheckResponse.status);
    
    if (sessionCheckResponse.status === 200) {
      const sessionData = await sessionCheckResponse.json();
      console.log('✅ Session validation result:', sessionData);
    } else {
      const errorText = await sessionCheckResponse.text();
      console.log('❌ Session validation failed:', errorText);
    }

    // Step 4: Test middleware directly with different headers
    console.log('\n4️⃣ Testing middleware with various headers...');
    
    const testCases = [
      { name: 'Basic cookie', headers: { 'Cookie': `admin_token=${token}` } },
      { name: 'With User-Agent', headers: { 
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }},
      { name: 'With all headers', headers: { 
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br'
      }}
    ];

    for (const testCase of testCases) {
      const response = await fetch('https://swaeduae.ae/admin/dashboard', {
        headers: testCase.headers,
        redirect: 'manual'
      });
      
      console.log(`📊 ${testCase.name}: ${response.status}`);
      if (response.status === 302 || response.status === 307) {
        console.log(`   🔄 Redirects to: ${response.headers.get('location')}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

testTokenDebug();