#!/usr/bin/env node

// Test admin login on production site after database fix
console.log('🔍 Testing Admin Login on Production Site');
console.log('==========================================');

const https = require('https');
const http = require('http');

// Production site configuration
const PRODUCTION_URL = 'https://swaeduae.ae';
const ADMIN_LOGIN_PATH = '/auth/admin/login';
const ADMIN_DASHBOARD_PATH = '/admin/dashboard';

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
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdminLoginTest/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
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

// Extract CSRF token from HTML
function extractCSRFToken(html) {
  const csrfMatch = html.match(/name="csrf[^"]*"\s+value="([^"]+)"/i) || 
                   html.match(/csrf[^"]*":\s*"([^"]+)"/i) ||
                   html.match(/_token[^"]*"\s+value="([^"]+)"/i);
  return csrfMatch ? csrfMatch[1] : null;
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

async function testProductionSite() {
  try {
    console.log('\n🌐 Step 1: Testing production site accessibility...');
    const homeResponse = await makeRequest(PRODUCTION_URL);
    console.log(`✅ Production site accessible: ${homeResponse.statusCode}`);
    
    console.log('\n🔐 Step 2: Accessing admin login page...');
    const loginPageUrl = PRODUCTION_URL + ADMIN_LOGIN_PATH;
    const loginPageResponse = await makeRequest(loginPageUrl);
    
    if (loginPageResponse.statusCode === 200) {
      console.log('✅ Admin login page accessible');
      
      // Extract CSRF token if present
      const csrfToken = extractCSRFToken(loginPageResponse.body);
      console.log(`CSRF Token: ${csrfToken ? 'Found' : 'Not found'}`);
      
      // Extract cookies
      const cookies = extractCookies(loginPageResponse.headers);
      console.log(`Cookies: ${cookies ? 'Set' : 'None'}`);
      
      console.log('\n🔑 Step 3: Attempting admin login...');
      
      // Prepare login data
      const loginData = new URLSearchParams({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password
      });
      
      if (csrfToken) {
        loginData.append('_token', csrfToken);
      }
      
      // Attempt login
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
          
          // Test dashboard access
          console.log('\n📊 Step 4: Testing admin dashboard access...');
          const dashboardCookies = extractCookies(loginResponse.headers) || cookies;
          
          const dashboardResponse = await makeRequest(PRODUCTION_URL + ADMIN_DASHBOARD_PATH, {
            headers: {
              'Cookie': dashboardCookies
            }
          });
          
          if (dashboardResponse.statusCode === 200) {
            console.log('✅ Admin dashboard accessible');
            console.log('🎉 ADMIN LOGIN TEST SUCCESSFUL!');
          } else {
            console.log(`❌ Admin dashboard not accessible: ${dashboardResponse.statusCode}`);
          }
          
        } else if (location && location.includes('/login')) {
          console.log('❌ Login failed - redirected back to login page');
          console.log('This indicates authentication failure');
        } else {
          console.log(`⚠️ Unexpected redirect: ${location}`);
        }
      } else if (loginResponse.statusCode === 200) {
        console.log('❌ Login failed - stayed on login page');
        
        // Check for error messages
        if (loginResponse.body.includes('Invalid') || loginResponse.body.includes('error')) {
          console.log('Error message found in response');
        }
      } else {
        console.log(`❌ Unexpected login response: ${loginResponse.statusCode}`);
      }
      
    } else {
      console.log(`❌ Admin login page not accessible: ${loginPageResponse.statusCode}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('DNS resolution failed - check if swaeduae.ae is accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Connection refused - server may be down');
    } else if (error.code === 'CERT_HAS_EXPIRED') {
      console.log('SSL certificate has expired');
    }
  }
}

// Run the test
testProductionSite().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('Test execution failed:', error);
});