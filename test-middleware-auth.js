const https = require('https');

console.log('🛡️ Testing Middleware Authentication for Admin Routes\n');

// Test configuration
const baseUrl = 'https://swaeduae.ae';
const testRoutes = [
  '/admin/dashboard',
  '/admin/organizations',
  '/admin/audit-logs',
  '/admin/notifications',
  '/api/admin/verify',
  '/api/admin/dashboard',
  '/api/admin/organizations',
  '/api/admin/audit-logs'
];

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Test 1: Check middleware behavior for admin routes without authentication
async function testUnauthenticatedAccess() {
  console.log('1. Testing Unauthenticated Access to Admin Routes:');
  
  for (const route of testRoutes) {
    try {
      const response = await makeRequest(`${baseUrl}${route}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Admin-Auth-Test/1.0'
        }
      });
      
      const isApiRoute = route.startsWith('/api/');
      const expectedStatus = isApiRoute ? 401 : 302; // API routes return 401, pages redirect (302)
      
      if (response.statusCode === expectedStatus) {
        console.log(`  ✅ ${route}: ${response.statusCode} (Expected: ${expectedStatus})`);
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        console.log(`  ✅ ${route}: ${response.statusCode} (Properly blocked)`);
      } else if (response.statusCode === 302 && response.headers.location?.includes('/auth/admin/login')) {
        console.log(`  ✅ ${route}: ${response.statusCode} (Redirected to admin login)`);
      } else {
        console.log(`  ❌ ${route}: ${response.statusCode} (Unexpected response)`);
      }
    } catch (error) {
      console.log(`  ❌ ${route}: Error - ${error.message}`);
    }
  }
  console.log('');
}

// Test 2: Login and get admin token
async function loginAndGetToken() {
  console.log('2. Testing Admin Login and Token Retrieval:');
  
  try {
    const loginResponse = await makeRequest(`${baseUrl}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Auth-Test/1.0'
      }
    });
    
    // Send login request with credentials
    const loginData = JSON.stringify({
      email: 'admin@swaeduae.ae',
      password: 'vW%nTZhFOq(N)'
    });
    
    const loginReq = https.request(`${baseUrl}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData),
        'User-Agent': 'Admin-Auth-Test/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('  ✅ Admin login successful');
          const cookies = res.headers['set-cookie'];
          if (cookies && cookies.some(cookie => cookie.includes('admin_token'))) {
            console.log('  ✅ Admin token cookie set');
            const adminTokenCookie = cookies.find(cookie => cookie.includes('admin_token'));
            console.log(`  📝 Cookie: ${adminTokenCookie.substring(0, 100)}...`);
            
            // Extract token for authenticated tests
            const tokenMatch = adminTokenCookie.match(/admin_token=([^;]+)/);
            if (tokenMatch) {
              testAuthenticatedAccess(tokenMatch[1]);
            }
          } else {
            console.log('  ❌ Admin token cookie not found');
          }
        } else {
          console.log(`  ❌ Admin login failed: ${res.statusCode}`);
          console.log(`  📝 Response: ${data}`);
        }
      });
    });
    
    loginReq.on('error', (error) => {
      console.log(`  ❌ Login request error: ${error.message}`);
    });
    
    loginReq.write(loginData);
    loginReq.end();
    
  } catch (error) {
    console.log(`  ❌ Login test error: ${error.message}`);
  }
}

// Test 3: Check authenticated access with admin token
async function testAuthenticatedAccess(adminToken) {
  console.log('\n3. Testing Authenticated Access with Admin Token:');
  
  for (const route of testRoutes) {
    try {
      const response = await makeRequest(`${baseUrl}${route}`, {
        method: 'GET',
        headers: {
          'Cookie': `admin_token=${adminToken}`,
          'User-Agent': 'Admin-Auth-Test/1.0'
        }
      });
      
      if (response.statusCode === 200) {
        console.log(`  ✅ ${route}: ${response.statusCode} (Access granted)`);
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        console.log(`  ❌ ${route}: ${response.statusCode} (Access denied with valid token)`);
      } else {
        console.log(`  ⚠️ ${route}: ${response.statusCode} (Unexpected response)`);
      }
    } catch (error) {
      console.log(`  ❌ ${route}: Error - ${error.message}`);
    }
  }
}

// Test 4: Check middleware configuration
async function testMiddlewareConfiguration() {
  console.log('\n4. Testing Middleware Configuration:');
  
  // Test that middleware doesn't interfere with public routes
  const publicRoutes = ['/', '/about', '/events', '/auth/volunteer/login'];
  
  for (const route of publicRoutes) {
    try {
      const response = await makeRequest(`${baseUrl}${route}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Admin-Auth-Test/1.0'
        }
      });
      
      if (response.statusCode === 200 || response.statusCode === 302) {
        console.log(`  ✅ ${route}: ${response.statusCode} (Public access allowed)`);
      } else {
        console.log(`  ❌ ${route}: ${response.statusCode} (Public access blocked)`);
      }
    } catch (error) {
      console.log(`  ❌ ${route}: Error - ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testUnauthenticatedAccess();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await loginAndGetToken();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await testMiddlewareConfiguration();
    
    console.log('\n🎉 Middleware authentication tests completed!');
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runAllTests();