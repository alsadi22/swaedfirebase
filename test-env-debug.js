const https = require('https');

async function testEnvironmentVariables() {
  console.log('🔍 Testing environment variables in production...\n');

  try {
    const response = await fetch('https://swaeduae.ae/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    console.log('📊 Login API Response Status:', response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Login successful');
      
      // Extract token from Set-Cookie header
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('🍪 Set-Cookie header:', setCookieHeader);
      
      if (setCookieHeader) {
        const tokenMatch = setCookieHeader.match(/admin_token=([^;]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          console.log('🔑 Extracted token:', token.substring(0, 20) + '...');
          
          // Test session validation API
          console.log('\n🔍 Testing session validation API...');
          const validateResponse = await fetch('https://swaeduae.ae/api/admin/validate-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `admin_token=${token}`
            }
          });
          
          console.log('📊 Validation API Status:', validateResponse.status);
          const validationData = await validateResponse.json();
          console.log('📋 Validation Response:', JSON.stringify(validationData, null, 2));
        }
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Login failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Error testing environment:', error.message);
  }
}

testEnvironmentVariables();