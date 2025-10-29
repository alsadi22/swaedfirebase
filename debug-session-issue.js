const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Database configuration
const pool = new Pool({
  user: 'swaeduae_user',
  host: 'localhost',
  database: 'swaeduae',
  password: 'swaeduae_password',
  port: 5432,
});

const BASE_URL = 'https://swaeduae.ae';
const TEST_ADMIN = {
  email: 'admin@swaeduae.ae',
  password: 'vW%nTZhFOq(N'
};

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function debugSessionIssue() {
  console.log('🔍 Debugging Session Management Issue...');
  console.log('=====================================\n');

  try {
    // Step 1: Login and get token
    console.log('1️⃣ Logging in to get token...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_ADMIN),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    // Extract token from Set-Cookie header
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader?.match(/admin_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      console.log('❌ No token found in response');
      return;
    }

    console.log('✅ Login successful, token obtained');
    
    // Decode token to get user ID
    const decoded = jwt.decode(token);
    console.log('📋 Token decoded:', { userId: decoded.userId, email: decoded.email });

    // Step 2: Check sessions in database before logout
    const tokenHash = hashToken(token);
    console.log('\n2️⃣ Checking sessions in database before logout...');
    
    const sessionsBeforeResult = await pool.query(
      'SELECT id, user_id, token_hash, is_active, expires_at FROM admin_sessions WHERE user_id = $1',
      [decoded.userId]
    );
    
    console.log('📊 Sessions before logout:', sessionsBeforeResult.rows.length);
    sessionsBeforeResult.rows.forEach(session => {
      console.log(`   - Session ${session.id}: active=${session.is_active}, expires=${session.expires_at}`);
      console.log(`   - Token hash matches: ${session.token_hash === tokenHash}`);
    });

    // Step 3: Logout
    console.log('\n3️⃣ Performing logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'DELETE',
      headers: {
        'Cookie': `admin_token=${token}`,
      },
    });

    if (!logoutResponse.ok) {
      console.log('❌ Logout failed:', logoutResponse.status);
      return;
    }

    console.log('✅ Logout successful');

    // Step 4: Check sessions in database after logout
    console.log('\n4️⃣ Checking sessions in database after logout...');
    
    const sessionsAfterResult = await pool.query(
      'SELECT id, user_id, token_hash, is_active, expires_at FROM admin_sessions WHERE user_id = $1',
      [decoded.userId]
    );
    
    console.log('📊 Sessions after logout:', sessionsAfterResult.rows.length);
    sessionsAfterResult.rows.forEach(session => {
      console.log(`   - Session ${session.id}: active=${session.is_active}, expires=${session.expires_at}`);
      console.log(`   - Token hash matches: ${session.token_hash === tokenHash}`);
    });

    // Step 5: Test token validation directly
    console.log('\n5️⃣ Testing token validation...');
    
    // Check if any active sessions exist for this token
    const activeSessionResult = await pool.query(
      'SELECT * FROM admin_sessions WHERE token_hash = $1 AND is_active = true AND expires_at > NOW()',
      [tokenHash]
    );
    
    console.log('🔍 Active sessions for this token:', activeSessionResult.rows.length);
    if (activeSessionResult.rows.length > 0) {
      console.log('❌ Found active session - this is the problem!');
      activeSessionResult.rows.forEach(session => {
        console.log(`   - Session ${session.id}: active=${session.is_active}`);
      });
    } else {
      console.log('✅ No active sessions found - session invalidation worked');
    }

    // Step 6: Test middleware validation
    console.log('\n6️⃣ Testing middleware validation...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: {
        'Cookie': `admin_token=${token}`,
      },
      redirect: 'manual' // Don't follow redirects
    });

    console.log('🌐 Dashboard access status:', dashboardResponse.status);
    if (dashboardResponse.status === 302 || dashboardResponse.status === 307) {
      const location = dashboardResponse.headers.get('location');
      console.log('✅ Redirected to:', location);
    } else if (dashboardResponse.status === 200) {
      console.log('❌ Dashboard accessible - middleware not working properly');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await pool.end();
  }
}

debugSessionIssue();