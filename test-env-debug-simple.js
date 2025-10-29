const https = require('https');

async function testAPI() {
  console.log('🔍 Testing Admin API Endpoints...\n');

  try {
    // Test admin login
    console.log('1. Testing Admin Login API...');
    const loginResponse = await fetch('https://swaeduae.ae/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    console.log('📊 Login Status:', loginResponse.status);
    console.log('📋 Login Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginText = await loginResponse.text();
    console.log('📄 Login Response:', loginText);

    if (loginResponse.ok) {
      try {
        const loginData = JSON.parse(loginText);
        console.log('✅ Login successful:', loginData);
        
        // Extract token from Set-Cookie header
        const setCookieHeader = loginResponse.headers.get('set-cookie');
        if (setCookieHeader) {
          const tokenMatch = setCookieHeader.match(/admin_token=([^;]+)/);
          if (tokenMatch) {
            const token = tokenMatch[1];
            console.log('🔑 Extracted token:', token.substring(0, 20) + '...');
            
            // Test session validation
            console.log('\n2. Testing Session Validation API...');
            const validateResponse = await fetch('https://swaeduae.ae/api/admin/validate-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': `admin_token=${token}`
              }
            });
            
            console.log('📊 Validation Status:', validateResponse.status);
            console.log('📋 Validation Headers:', Object.fromEntries(validateResponse.headers.entries()));
            const validateText = await validateResponse.text();
            console.log('📄 Validation Response:', validateText);
            
            if (validateResponse.ok) {
              try {
                const validateData = JSON.parse(validateText);
                console.log('✅ Session validation successful:', validateData);
              } catch (parseError) {
                console.log('❌ Failed to parse validation response as JSON');
              }
            } else {
              console.log('❌ Session validation failed');
            }
          } else {
            console.log('❌ No admin_token found in Set-Cookie header');
          }
        } else {
          console.log('❌ No Set-Cookie header found');
        }
      } catch (parseError) {
        console.log('❌ Failed to parse login response as JSON:', parseError.message);
      }
    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();