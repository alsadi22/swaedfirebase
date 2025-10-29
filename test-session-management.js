const https = require('https');

// Test configuration
const BASE_URL = 'https://swaeduae.ae';
const TEST_ADMIN = {
  email: 'admin@swaeduae.ae',
  password: 'vW%nTZhFOq(N' // Correct admin password from create-super-admin.js
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Helper function to extract cookies
function extractCookies(headers) {
  const cookies = {};
  const setCookieHeader = headers['set-cookie'];
  if (setCookieHeader) {
    setCookieHeader.forEach(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      cookies[name] = value;
    });
  }
  return cookies;
}

async function runTests() {
  console.log('🚀 Starting Session Management Tests on Production Site');
  console.log('====================================================');
  
  let adminToken = null;
  let cookies = {};

  try {
    // Test 1: Admin Login
    console.log('\n1️⃣ Testing Admin Login...');
    const loginResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SessionTest/1.0'
      }
    }, TEST_ADMIN);

    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful');
      cookies = extractCookies(loginResponse.headers);
      adminToken = cookies.admin_token;
      console.log(`   Token received: ${adminToken ? 'Yes' : 'No'}`);
    } else {
      console.log('   ❌ Login failed');
      console.log('   Response:', loginResponse.body);
      return;
    }

    // Test 2: Token Verification
    console.log('\n2️⃣ Testing Token Verification...');
    const verifyResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/verify',
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${adminToken}`,
        'User-Agent': 'SessionTest/1.0'
      }
    });

    console.log(`   Status: ${verifyResponse.status}`);
    if (verifyResponse.status === 200) {
      console.log('   ✅ Token verification successful');
      console.log('   User:', verifyResponse.body);
    } else {
      console.log('   ❌ Token verification failed');
    }

    // Test 3: Dashboard Access
    console.log('\n3️⃣ Testing Dashboard Access...');
    const dashboardResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/admin/dashboard',
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${adminToken}`,
        'User-Agent': 'SessionTest/1.0'
      }
    });

    console.log(`   Status: ${dashboardResponse.status}`);
    if (dashboardResponse.status === 200) {
      console.log('   ✅ Dashboard access successful');
    } else {
      console.log('   ❌ Dashboard access failed');
    }

    // Test 4: Sessions Retrieval
    console.log('\n4️⃣ Testing Sessions Retrieval...');
    const sessionsResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/sessions',
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${adminToken}`,
        'User-Agent': 'SessionTest/1.0'
      }
    });

    console.log(`   Status: ${sessionsResponse.status}`);
    if (sessionsResponse.status === 200 && sessionsResponse.body.success) {
      console.log('   ✅ Sessions retrieval successful');
      console.log(`   Active sessions: ${sessionsResponse.body.sessions?.length || 0}`);
    } else {
      console.log('   ❌ Sessions retrieval failed');
      console.log('   Response:', sessionsResponse.body);
    }

    // Test 5: Multiple Login Sessions
    console.log('\n5️⃣ Testing Multiple Login Sessions...');
    const secondLoginResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SessionTest/2.0'
      }
    }, TEST_ADMIN);

    console.log(`   Status: ${secondLoginResponse.status}`);
    if (secondLoginResponse.status === 200) {
      console.log('   ✅ Second login successful');
    } else {
      console.log('   ❌ Second login failed');
    }

    // Test 6: Admin Logout with Session Cleanup
    console.log('\n6️⃣ Testing Admin Logout with Session Cleanup...');
    const logoutResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/auth',
      method: 'DELETE',
      headers: {
        'Cookie': `admin_token=${adminToken}`,
        'User-Agent': 'SessionTest/1.0'
      }
    });

    console.log(`   Status: ${logoutResponse.status}`);
    console.log('   Response:', logoutResponse.body);
    if (logoutResponse.status === 200) {
      console.log('   ✅ Logout successful');
    } else {
      console.log('   ❌ Logout failed');
    }

    // Test 7: Token Invalidation After Logout
    console.log('\n7️⃣ Testing Token Invalidation After Logout...');
    
    // Wait a moment for session cleanup to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const postLogoutVerifyResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/verify',
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${adminToken}`,
        'User-Agent': 'SessionTest/1.0'
      }
    });

    console.log(`   Status: ${postLogoutVerifyResponse.status}`);
    if (postLogoutVerifyResponse.status === 401) {
      console.log('   ✅ Token properly invalidated after logout');
    } else {
      console.log('   ❌ Token still valid after logout (potential security issue)');
      console.log('   Response:', postLogoutVerifyResponse.body);
    }

    // Test 8: Dashboard Access After Logout
    console.log('\n8️⃣ Testing Dashboard Access After Logout...');
    const postLogoutDashboardResponse = await makeRequest({
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/admin/dashboard',
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${adminToken}`,
        'User-Agent': 'SessionTest/1.0'
      }
    });

    console.log(`   Status: ${postLogoutDashboardResponse.status}`);
    if (postLogoutDashboardResponse.status === 302 || postLogoutDashboardResponse.status === 401) {
      console.log('   ✅ Dashboard access properly blocked after logout');
    } else {
      console.log('   ❌ Dashboard still accessible after logout (security issue)');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  console.log('\n🎉 Session Management Test Complete!');
  console.log('=====================================');
}

// Run the tests
runTests().catch(console.error);