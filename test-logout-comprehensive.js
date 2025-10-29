const { Pool } = require('pg');

const BASE_URL = 'https://swaeduae.ae';

// Database connection
const pool = new Pool({
  user: 'swaeduae_user',
  host: 'localhost',
  database: 'swaeduae',
  password: 'swaeduae_password',
  port: 5432,
});

async function testLogoutComprehensive() {
  console.log('🔍 Comprehensive logout security test...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    const tokenMatch = cookies?.match(/admin_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      console.log('❌ No token found in cookies');
      return;
    }

    console.log('✅ Login successful, token obtained');

    // Decode JWT to get user info
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('👤 User ID from token:', decoded.userId);

    // Step 2: Check initial session state
    console.log('\n2️⃣ Checking initial session state...');
    
    // Check database sessions
    const initialSessions = await pool.query(
      'SELECT id, user_id, is_active, expires_at FROM admin_sessions WHERE user_id = $1',
      [decoded.userId]
    );
    
    console.log('📊 Initial sessions in database:', initialSessions.rows.length);
    initialSessions.rows.forEach(session => {
      console.log(`   - Session ${session.id}: active=${session.is_active}`);
    });

    // Test API access
    const initialApiTest = await fetch(`${BASE_URL}/api/admin/sessions`, {
      headers: { 'Cookie': `admin_token=${token}` }
    });
    console.log('🔗 Initial API access status:', initialApiTest.status);

    // Test middleware protection
    const initialMiddlewareTest = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Cookie': `admin_token=${token}` },
      redirect: 'manual'
    });
    console.log('🛡️ Initial middleware test status:', initialMiddlewareTest.status);

    // Step 3: Logout
    console.log('\n3️⃣ Performing logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'DELETE',
      headers: { 'Cookie': `admin_token=${token}` }
    });

    console.log('🚪 Logout status:', logoutResponse.status);
    if (logoutResponse.status === 200) {
      console.log('✅ Logout API call successful');
    } else {
      console.log('❌ Logout API call failed');
      return;
    }

    // Step 4: Check session state after logout
    console.log('\n4️⃣ Checking session state after logout...');
    
    // Check database sessions
    const postLogoutSessions = await pool.query(
      'SELECT id, user_id, is_active, expires_at FROM admin_sessions WHERE user_id = $1',
      [decoded.userId]
    );
    
    console.log('📊 Sessions in database after logout:', postLogoutSessions.rows.length);
    let hasActiveSessions = false;
    postLogoutSessions.rows.forEach(session => {
      console.log(`   - Session ${session.id}: active=${session.is_active}`);
      if (session.is_active) {
        hasActiveSessions = true;
      }
    });

    if (hasActiveSessions) {
      console.log('❌ SECURITY ISSUE: Active sessions still exist in database!');
    } else {
      console.log('✅ All sessions properly deactivated in database');
    }

    // Step 5: Test token validation after logout
    console.log('\n5️⃣ Testing token validation after logout...');

    // Test JWT validity (should still be valid until expiry)
    try {
      const jwtVerify = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      console.log('🔑 JWT token is still valid (expected)');
    } catch (error) {
      console.log('🔑 JWT token is invalid:', error.message);
    }

    // Test API access (should be 401)
    const postLogoutApiTest = await fetch(`${BASE_URL}/api/admin/sessions`, {
      headers: { 'Cookie': `admin_token=${token}` }
    });
    console.log('🔗 Post-logout API access status:', postLogoutApiTest.status);
    
    if (postLogoutApiTest.status === 401) {
      console.log('✅ API correctly rejects invalidated session');
    } else {
      console.log('❌ SECURITY ISSUE: API still accepts invalidated session!');
    }

    // Test middleware protection (should redirect to login)
    const postLogoutMiddlewareTest = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Cookie': `admin_token=${token}` },
      redirect: 'manual'
    });
    console.log('🛡️ Post-logout middleware test status:', postLogoutMiddlewareTest.status);
    
    if (postLogoutMiddlewareTest.status === 302 || postLogoutMiddlewareTest.status === 307) {
      const location = postLogoutMiddlewareTest.headers.get('location');
      console.log('✅ Middleware correctly redirects to:', location);
    } else if (postLogoutMiddlewareTest.status === 200) {
      console.log('❌ SECURITY ISSUE: Middleware still allows access!');
    } else {
      console.log('🤔 Unexpected middleware response status');
    }

    // Step 6: Test SessionManager.validateSession directly
    console.log('\n6️⃣ Testing SessionManager validation...');
    
    // Check if there are any active sessions for this token hash
    const crypto = require('crypto');
    const tokenHash = Buffer.from(token).toString('base64').slice(0, 64);
    
    const activeSessionCheck = await pool.query(
      'SELECT * FROM admin_sessions WHERE token_hash = $1 AND is_active = true AND expires_at > NOW()',
      [tokenHash]
    );
    
    console.log('🔍 Active sessions for token hash:', activeSessionCheck.rows.length);
    if (activeSessionCheck.rows.length > 0) {
      console.log('❌ FOUND THE ISSUE: Session still active in database for this token!');
      activeSessionCheck.rows.forEach(session => {
        console.log(`   - Session ${session.id}: active=${session.is_active}, user=${session.user_id}`);
      });
    } else {
      console.log('✅ No active sessions found for this token hash');
    }

    // Summary
    console.log('\n📋 SECURITY TEST SUMMARY:');
    console.log('================================');
    console.log(`Database sessions deactivated: ${!hasActiveSessions ? '✅' : '❌'}`);
    console.log(`API rejects token: ${postLogoutApiTest.status === 401 ? '✅' : '❌'}`);
    console.log(`Middleware redirects: ${(postLogoutMiddlewareTest.status === 302 || postLogoutMiddlewareTest.status === 307) ? '✅' : '❌'}`);
    console.log(`Token hash sessions cleared: ${activeSessionCheck.rows.length === 0 ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await pool.end();
  }
}

testLogoutComprehensive();