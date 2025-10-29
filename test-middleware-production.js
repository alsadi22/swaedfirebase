#!/usr/bin/env node

// Test middleware functionality with real database connection
console.log('🔍 Testing Middleware with Real Database');
console.log('=======================================');

const https = require('https');
const crypto = require('crypto');

// Production site configuration
const PRODUCTION_URL = 'https://swaeduae.ae';
const LOGIN_PATH = '/auth/admin/login';
const MIDDLEWARE_TEST_PATH = '/admin/dashboard';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin@swaeduae.ae',
  password: 'Admin123!'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : require('http');
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MiddlewareTest/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        ...options.headers
      }
    };

    if (options.body) {
      requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Extract cookies from response headers
function extractCookies(headers) {
  const cookies = [];
  const setCookieHeaders = headers['set-cookie'] || [];
  
  setCookieHeaders.forEach(cookie => {
    const cookieParts = cookie.split(';')[0];
    cookies.push(cookieParts);
  });
  
  return cookies.join('; ');
}

async function testMiddlewareWithDatabase() {
  try {
    console.log('\n🔐 Step 1: Getting login page...');
    const loginPageUrl = PRODUCTION_URL + LOGIN_PATH;
    const loginPageResponse = await makeRequest(loginPageUrl);
    
    if (loginPageResponse.statusCode !== 200) {
      console.log(`❌ Login page not accessible: ${loginPageResponse.statusCode}`);
      return;
    }
    
    console.log('✅ Login page accessible');
    const cookies = extractCookies(loginPageResponse.headers);
    
    console.log('\n🔑 Step 2: Attempting login...');
    const loginData = new URLSearchParams({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password
    });
    
    const loginResponse = await makeRequest(loginPageUrl, {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Referer': loginPageUrl,
        'Origin': PRODUCTION_URL
      },
      body: loginData.toString()
    });
    
    console.log(`Login response status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode === 302 || loginResponse.statusCode === 307) {
      const location = loginResponse.headers.location;
      console.log(`Redirect to: ${location}`);
      
      if (location && location.includes('/admin/dashboard')) {
        console.log('✅ Login successful - redirected to admin dashboard');
        
        // Get the session cookies
        const sessionCookies = extractCookies(loginResponse.headers) || cookies;
        console.log('Session cookies set:', !!sessionCookies);
        
        console.log('\n🛡️ Step 3: Testing middleware protection...');
        
        // Test accessing admin dashboard with session
        const dashboardResponse = await makeRequest(PRODUCTION_URL + MIDDLEWARE_TEST_PATH, {
          headers: {
            'Cookie': sessionCookies
          }
        });
        
        console.log(`Dashboard access status: ${dashboardResponse.statusCode}`);
        
        if (dashboardResponse.statusCode === 200) {
          console.log('✅ Middleware allowed access - database connection working!');
          console.log('🎉 MIDDLEWARE TEST SUCCESSFUL!');
          
          // Check if the page contains admin content
          if (dashboardResponse.body.includes('admin') || dashboardResponse.body.includes('dashboard')) {
            console.log('✅ Admin dashboard content loaded');
          }
          
        } else if (dashboardResponse.statusCode === 302 || dashboardResponse.statusCode === 307) {
          const redirectLocation = dashboardResponse.headers.location;
          console.log(`❌ Middleware blocked access - redirected to: ${redirectLocation}`);
          
          if (redirectLocation && redirectLocation.includes('/login')) {
            console.log('❌ Session validation failed - still using mock database');
          }
        } else {
          console.log(`❌ Unexpected dashboard response: ${dashboardResponse.statusCode}`);
        }
        
        console.log('\n🔄 Step 4: Testing without cookies (should be blocked)...');
        const noAuthResponse = await makeRequest(PRODUCTION_URL + MIDDLEWARE_TEST_PATH);
        
        if (noAuthResponse.statusCode === 302 || noAuthResponse.statusCode === 307) {
          console.log('✅ Middleware correctly blocks unauthenticated access');
        } else {
          console.log(`⚠️ Unexpected response for unauthenticated request: ${noAuthResponse.statusCode}`);
        }
        
      } else if (location && location.includes('/login')) {
        console.log('❌ Login failed - redirected back to login page');
      } else {
        console.log(`⚠️ Unexpected redirect: ${location}`);
      }
    } else if (loginResponse.statusCode === 200) {
      console.log('❌ Login failed - stayed on login page');
    } else {
      console.log(`❌ Unexpected login response: ${loginResponse.statusCode}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testMiddlewareWithDatabase().then(() => {
  console.log('\n🏁 Middleware test completed');
}).catch(error => {
  console.error('Test execution failed:', error);
});