const https = require('https');

// Test admin dashboard access with authenticated session
async function testAdminDashboardAccess() {
  console.log('🔍 Testing admin dashboard access...\n');

  // First, login to get the admin token
  console.log('📤 Step 1: Logging in to get admin token...');
  
  const loginData = JSON.stringify({
    email: 'admin@swaeduae.ae',
    password: 'admin123'
  });

  const loginOptions = {
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
    rejectUnauthorized: false
  };

  return new Promise((resolve, reject) => {
    const loginReq = https.request(loginOptions, (loginRes) => {
      console.log(`📊 Login Status: ${loginRes.statusCode}`);

      let loginData = '';
      loginRes.on('data', (chunk) => {
        loginData += chunk;
      });

      loginRes.on('end', () => {
        try {
          const loginResponse = JSON.parse(loginData);
          
          if (loginRes.statusCode === 200 && loginResponse.success) {
            console.log('✅ Login successful!');
            
            // Extract the admin token from cookies
            const cookies = loginRes.headers['set-cookie'];
            let adminToken = null;
            
            if (cookies) {
              for (const cookie of cookies) {
                if (cookie.startsWith('admin_token=')) {
                  adminToken = cookie.split(';')[0].split('=')[1];
                  break;
                }
              }
            }
            
            if (!adminToken) {
              console.log('❌ No admin token found in cookies');
              resolve({ success: false, error: 'No admin token' });
              return;
            }
            
            console.log('🍪 Admin token extracted:', adminToken.substring(0, 20) + '...');
            
            // Now test dashboard access
            console.log('\n📤 Step 2: Testing admin dashboard access...');
            
            const dashboardOptions = {
              hostname: 'swaeduae.ae',
              port: 443,
              path: '/admin/dashboard',
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AdminTest/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cookie': `admin_token=${adminToken}`
              },
              rejectUnauthorized: false
            };
            
            const dashboardReq = https.request(dashboardOptions, (dashboardRes) => {
              console.log(`📊 Dashboard Status: ${dashboardRes.statusCode}`);
              console.log(`📋 Dashboard Headers:`, dashboardRes.headers);
              
              let dashboardData = '';
              dashboardRes.on('data', (chunk) => {
                dashboardData += chunk;
              });
              
              dashboardRes.on('end', () => {
                if (dashboardRes.statusCode === 200) {
                  console.log('✅ Admin dashboard access successful!');
                  console.log('📄 Response length:', dashboardData.length, 'characters');
                  
                  // Check if it contains admin dashboard content
                  if (dashboardData.includes('admin') || dashboardData.includes('dashboard') || dashboardData.includes('Admin')) {
                    console.log('🎉 Dashboard content detected!');
                  } else {
                    console.log('⚠️  Dashboard content not clearly detected');
                  }
                  
                  resolve({ success: true, statusCode: dashboardRes.statusCode, contentLength: dashboardData.length });
                } else if (dashboardRes.statusCode === 302 || dashboardRes.statusCode === 301) {
                  const location = dashboardRes.headers.location;
                  console.log(`🔄 Redirected to: ${location}`);
                  
                  if (location && location.includes('/admin/login')) {
                    console.log('❌ Redirected to login - authentication failed');
                    resolve({ success: false, error: 'Redirected to login', location });
                  } else {
                    console.log('✅ Redirected to valid admin page');
                    resolve({ success: true, statusCode: dashboardRes.statusCode, location });
                  }
                } else {
                  console.log('❌ Dashboard access failed');
                  resolve({ success: false, statusCode: dashboardRes.statusCode, error: 'Access denied' });
                }
              });
            });
            
            dashboardReq.on('error', (error) => {
              console.error('❌ Dashboard request error:', error);
              resolve({ success: false, error: error.message });
            });
            
            dashboardReq.setTimeout(10000);
            dashboardReq.end();
            
          } else {
            console.log('❌ Login failed:', loginResponse.error || 'Unknown error');
            resolve({ success: false, error: loginResponse.error });
          }
        } catch (parseError) {
          console.error('❌ Failed to parse login response:', parseError);
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });

    loginReq.on('error', (error) => {
      console.error('❌ Login request error:', error);
      reject(error);
    });

    loginReq.setTimeout(10000);
    loginReq.write(loginData);
    loginReq.end();
  });
}

// Run the test
testAdminDashboardAccess()
  .then((result) => {
    console.log('\n✅ Test completed:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });