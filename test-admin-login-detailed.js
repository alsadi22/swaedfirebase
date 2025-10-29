const https = require('https');
const { URL } = require('url');

// Test admin login with detailed debugging
async function testAdminLogin() {
  console.log('🔍 Testing admin login on production site...\n');

  const loginData = JSON.stringify({
    email: 'admin@swaeduae.ae',
    password: 'admin123'
  });

  const options = {
    hostname: 'swaeduae.ae',
    port: 443,
    path: '/api/admin/auth',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData),
      'User-Agent': 'Mozilla/5.0 (compatible; AdminTest/1.0)',
      'Accept': 'application/json'
    },
    rejectUnauthorized: false // For testing purposes
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📋 Response Headers:`, res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log(`📄 Raw Response: ${data}`);
          
          if (data) {
            const response = JSON.parse(data);
            console.log(`✅ Parsed Response:`, response);
            
            if (res.statusCode === 200 && response.success) {
              console.log('🎉 Login successful!');
              console.log('👤 User data:', response.user);
              
              // Check for cookies
              const cookies = res.headers['set-cookie'];
              if (cookies) {
                console.log('🍪 Cookies set:', cookies);
              } else {
                console.log('⚠️  No cookies set in response');
              }
            } else {
              console.log('❌ Login failed:', response.error || 'Unknown error');
            }
          } else {
            console.log('⚠️  Empty response body');
          }
          
          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        } catch (parseError) {
          console.error('❌ Failed to parse response:', parseError);
          console.log('📄 Raw response data:', data);
          resolve({ statusCode: res.statusCode, data, headers: res.headers, parseError });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Set timeout
    req.setTimeout(10000);

    console.log('📤 Sending login request...');
    console.log('📧 Email: admin@swaeduae.ae');
    console.log('🔑 Password: [REDACTED]');
    
    req.write(loginData);
    req.end();
  });
}

// Run the test
testAdminLogin()
  .then((result) => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });