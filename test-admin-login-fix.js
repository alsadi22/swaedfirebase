#!/usr/bin/env node

/**
 * Test script to verify admin login with correct credentials
 */

const https = require('https');

const BASE_URL = 'https://swaeduae.ae';

// Correct admin credentials from the database
const ADMIN_CREDENTIALS = {
  email: 'admin@swaeduae.ae',
  password: 'vW%nTZhFOq(N'
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login with Correct Credentials');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Admin Login
    console.log('\n1. Testing admin login...');
    const loginOptions = {
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Script/1.0'
      }
    };

    const loginResponse = await makeRequest(loginOptions, ADMIN_CREDENTIALS);
    console.log(`   Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode === 200) {
      console.log('   ✅ Login successful!');
      
      // Extract cookie from response
      const setCookieHeader = loginResponse.headers['set-cookie'];
      let adminToken = null;
      
      if (setCookieHeader) {
        const tokenCookie = setCookieHeader.find(cookie => cookie.includes('admin_token='));
        if (tokenCookie) {
          adminToken = tokenCookie.split(';')[0];
          console.log('   ✅ Admin token cookie received');
          console.log(`   Cookie: ${adminToken}`);
        }
      }
      
      // Test 2: Verify token works
      if (adminToken) {
        console.log('\n2. Testing token verification...');
        const verifyOptions = {
          hostname: 'swaeduae.ae',
          port: 443,
          path: '/api/admin/verify',
          method: 'GET',
          headers: {
            'Cookie': adminToken,
            'User-Agent': 'Admin-Test-Script/1.0'
          }
        };

        const verifyResponse = await makeRequest(verifyOptions);
        console.log(`   Status: ${verifyResponse.statusCode}`);
        
        if (verifyResponse.statusCode === 200) {
          console.log('   ✅ Token verification successful!');
          console.log('   Response:', verifyResponse.body);
        } else {
          console.log('   ❌ Token verification failed');
          console.log('   Response:', verifyResponse.body);
        }

        // Test 3: Access admin dashboard API
        console.log('\n3. Testing admin dashboard API access...');
        const dashboardOptions = {
          hostname: 'swaeduae.ae',
          port: 443,
          path: '/api/admin/dashboard',
          method: 'GET',
          headers: {
            'Cookie': adminToken,
            'User-Agent': 'Admin-Test-Script/1.0'
          }
        };

        const dashboardResponse = await makeRequest(dashboardOptions);
        console.log(`   Status: ${dashboardResponse.statusCode}`);
        
        if (dashboardResponse.statusCode === 200) {
          console.log('   ✅ Dashboard API access successful!');
          console.log('   Response preview:', dashboardResponse.body.substring(0, 200) + '...');
        } else {
          console.log('   ❌ Dashboard API access failed');
          console.log('   Response:', dashboardResponse.body);
        }
      }
      
    } else {
      console.log('   ❌ Login failed');
      console.log('   Response:', loginResponse.body);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminLogin().then(() => {
  console.log('\n🏁 Admin login test completed');
}).catch(console.error);