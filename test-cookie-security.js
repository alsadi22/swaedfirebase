const https = require('https');
const http = require('http');

// Test HTTP-only cookie implementation and security
async function testCookieSecurity() {
  console.log('🍪 Testing HTTP-only Cookie Implementation and Security\n');

  const baseUrl = 'https://swaeduae.ae';
  const adminCredentials = {
    email: 'admin@swaeduae.ae',
    password: 'vW%nTZhFOq(N'
  };

  try {
    // 1. Test Admin Login and Cookie Setting
    console.log('1. Testing Admin Login and Cookie Setting:');
    
    const loginResponse = await makeRequest('POST', `${baseUrl}/api/admin/auth`, {
      email: adminCredentials.email,
      password: adminCredentials.password
    });

    if (loginResponse.statusCode === 200) {
      console.log('✅ Admin login successful');
      
      // Check for Set-Cookie header
      const setCookieHeader = loginResponse.headers['set-cookie'];
      if (setCookieHeader) {
        console.log('✅ Set-Cookie header found');
        
        // Parse cookie attributes
        const cookieString = setCookieHeader.find(cookie => cookie.includes('admin_token'));
        if (cookieString) {
          console.log('✅ admin_token cookie found');
          console.log('Cookie attributes:', cookieString);
          
          // Check security attributes
          const hasHttpOnly = cookieString.includes('HttpOnly');
          const hasSecure = cookieString.includes('Secure');
          const hasSameSite = cookieString.includes('SameSite');
          const hasMaxAge = cookieString.includes('Max-Age') || cookieString.includes('max-age');
          
          console.log('Security attributes check:');
          console.log(`  HttpOnly: ${hasHttpOnly ? '✅' : '❌'}`);
          console.log(`  Secure: ${hasSecure ? '✅' : '❌'}`);
          console.log(`  SameSite: ${hasSameSite ? '✅' : '❌'}`);
          console.log(`  MaxAge/Expires: ${hasMaxAge ? '✅' : '❌'}`);
          
          if (hasHttpOnly && hasSecure && hasSameSite && hasMaxAge) {
            console.log('✅ All security attributes present');
          } else {
            console.log('⚠️  Some security attributes missing');
          }
        } else {
          console.log('❌ admin_token cookie not found in Set-Cookie header');
        }
      } else {
        console.log('❌ No Set-Cookie header found');
      }
    } else {
      console.log('❌ Admin login failed:', loginResponse.statusCode);
    }

    // 2. Test Cookie-based Authentication
    console.log('\n2. Testing Cookie-based Authentication:');
    
    // Extract cookie from login response
    const cookieHeader = loginResponse.headers['set-cookie'];
    let adminToken = '';
    
    if (cookieHeader) {
      const tokenCookie = cookieHeader.find(cookie => cookie.includes('admin_token'));
      if (tokenCookie) {
        adminToken = tokenCookie.split(';')[0]; // Get just the token part
        console.log('✅ Admin token extracted for testing');
      }
    }

    if (adminToken) {
      // Test accessing admin verify endpoint with cookie
      const verifyResponse = await makeRequest('GET', `${baseUrl}/api/admin/verify`, null, {
        'Cookie': adminToken
      });

      if (verifyResponse.statusCode === 200) {
        console.log('✅ Cookie-based authentication successful');
        const verifyData = JSON.parse(verifyResponse.body);
        console.log('User data:', {
          email: verifyData.user?.email,
          role: verifyData.user?.role
        });
      } else {
        console.log('❌ Cookie-based authentication failed:', verifyResponse.statusCode);
      }

      // Test accessing admin dashboard endpoint with cookie
      const dashboardResponse = await makeRequest('GET', `${baseUrl}/api/admin/dashboard`, null, {
        'Cookie': adminToken
      });

      if (dashboardResponse.statusCode === 200) {
        console.log('✅ Admin dashboard access with cookie successful');
      } else {
        console.log('❌ Admin dashboard access failed:', dashboardResponse.statusCode);
      }
    }

    // 3. Test Cookie Security - Access without cookie
    console.log('\n3. Testing Access Control without Cookie:');
    
    const unauthorizedVerifyResponse = await makeRequest('GET', `${baseUrl}/api/admin/verify`);
    if (unauthorizedVerifyResponse.statusCode === 401) {
      console.log('✅ Unauthorized access properly blocked (401)');
    } else {
      console.log('❌ Unauthorized access not properly blocked:', unauthorizedVerifyResponse.statusCode);
    }

    const unauthorizedDashboardResponse = await makeRequest('GET', `${baseUrl}/api/admin/dashboard`);
    if (unauthorizedDashboardResponse.statusCode === 401) {
      console.log('✅ Unauthorized dashboard access properly blocked (401)');
    } else {
      console.log('❌ Unauthorized dashboard access not properly blocked:', unauthorizedDashboardResponse.statusCode);
    }

    // 4. Test Admin Logout and Cookie Clearing
    console.log('\n4. Testing Admin Logout and Cookie Clearing:');
    
    if (adminToken) {
      const logoutResponse = await makeRequest('DELETE', `${baseUrl}/api/admin/auth`, null, {
        'Cookie': adminToken
      });

      if (logoutResponse.statusCode === 200) {
        console.log('✅ Admin logout successful');
        
        // Check if logout response clears the cookie
        const logoutSetCookie = logoutResponse.headers['set-cookie'];
        if (logoutSetCookie) {
          const clearCookie = logoutSetCookie.find(cookie => 
            cookie.includes('admin_token') && (cookie.includes('Max-Age=0') || cookie.includes('expires='))
          );
          if (clearCookie) {
            console.log('✅ Cookie properly cleared on logout');
          } else {
            console.log('⚠️  Cookie clearing not detected');
          }
        }
      } else {
        console.log('❌ Admin logout failed:', logoutResponse.statusCode);
      }
    }

    console.log('\n🎉 Cookie security tests completed!');

  } catch (error) {
    console.error('❌ Cookie security test failed:', error.message);
  }
}

// Helper function to make HTTP requests
function makeRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const requestModule = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cookie-Security-Test/1.0',
        ...headers
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = requestModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

testCookieSecurity();
