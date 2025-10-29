const https = require('https');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: 'swaeduae_user',
  host: 'localhost',
  database: 'swaeduae',
  password: 'swaeduae_password',
  port: 5432,
});

// Function to make HTTPS requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Function to hash token (same as in SessionManager)
function hashToken(token) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function testSessionValidation() {
  try {
    console.log('🔍 Testing session validation process...\n');

    // Step 1: Login to get admin token
    console.log('Step 1: Logging in as admin...');
    const loginOptions = {
      hostname: 'swaeduae.ae',
      port: 443,
      path: '/api/admin/auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Session-Validation/1.0'
      }
    };

    const loginData = JSON.stringify({
      email: 'admin@swaeduae.ae',
      password: 'admin123'
    });

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Login Status:', loginResponse.statusCode);

    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed');
      console.log('Response:', loginResponse.body);
      return;
    }

    // Extract admin_token from Set-Cookie header
    const setCookieHeader = loginResponse.headers['set-cookie'];
    let adminToken = null;
    
    if (setCookieHeader) {
      for (const cookie of setCookieHeader) {
        if (cookie.startsWith('admin_token=')) {
          adminToken = cookie.split('admin_token=')[1].split(';')[0];
          break;
        }
      }
    }

    if (!adminToken) {
      console.log('❌ No admin_token found in response');
      return;
    }

    console.log('✅ Login successful, admin_token obtained');
    console.log('Token preview:', adminToken.substring(0, 20) + '...');

    // Step 2: Check if session exists in database
    console.log('\nStep 2: Checking session in database...');
    const tokenHash = hashToken(adminToken);
    console.log('Token hash preview:', tokenHash.substring(0, 20) + '...');

    const sessionQuery = `
      SELECT id, user_id, ip_address, created_at, expires_at, is_active,
             CASE WHEN expires_at > NOW() THEN 'valid' ELSE 'expired' END as status
      FROM admin_sessions 
      WHERE token_hash = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const sessionResult = await pool.query(sessionQuery, [tokenHash]);
    
    if (sessionResult.rows.length === 0) {
      console.log('❌ No session found in database for this token');
      
      // Check recent sessions
      const recentSessionsQuery = `
        SELECT id, user_id, LEFT(token_hash, 20) as token_preview, ip_address, created_at, expires_at, is_active
        FROM admin_sessions 
        WHERE created_at > NOW() - INTERVAL '1 hour'
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      const recentSessions = await pool.query(recentSessionsQuery);
      console.log('\nRecent sessions in database:');
      console.log(recentSessions.rows);
      
    } else {
      const session = sessionResult.rows[0];
      console.log('✅ Session found in database:');
      console.log({
        id: session.id,
        user_id: session.user_id,
        ip_address: session.ip_address,
        created_at: session.created_at,
        expires_at: session.expires_at,
        is_active: session.is_active,
        status: session.status
      });

      // Step 3: Test middleware validation by accessing dashboard
      console.log('\nStep 3: Testing dashboard access with token...');
      const dashboardOptions = {
        hostname: 'swaeduae.ae',
        port: 443,
        path: '/admin/dashboard',
        method: 'GET',
        headers: {
          'Cookie': `admin_token=${adminToken}`,
          'User-Agent': 'Test-Session-Validation/1.0'
        }
      };

      const dashboardResponse = await makeRequest(dashboardOptions);
      console.log('Dashboard Access Status:', dashboardResponse.statusCode);
      
      if (dashboardResponse.statusCode === 200) {
        console.log('✅ Dashboard access successful');
      } else if (dashboardResponse.statusCode === 307 || dashboardResponse.statusCode === 302) {
        console.log('❌ Dashboard access redirected to:', dashboardResponse.headers.location);
      } else {
        console.log('❌ Dashboard access failed');
        console.log('Response preview:', dashboardResponse.body.substring(0, 200));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testSessionValidation();