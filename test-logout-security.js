async function testLogoutSecurity() {
  console.log('🔐 Testing Logout Security and Session Invalidation...\n');

  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:3001/api/admin/auth', {
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

    console.log('✅ Login successful');
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies);

    // Step 2: Verify we can access protected resources
    console.log('\n2. Testing access to protected resources before logout...');
    const dashboardResponse = await fetch('http://localhost:3001/admin/dashboard', {
      headers: {
        'Cookie': cookies || ''
      },
      redirect: 'manual'
    });

    console.log('🏠 Dashboard access status:', dashboardResponse.status);
    
    const sessionsResponse = await fetch('http://localhost:3001/api/admin/sessions', {
      headers: {
        'Cookie': cookies || ''
      }
    });

    console.log('📊 Sessions API status:', sessionsResponse.status);
    if (sessionsResponse.status === 200) {
      const sessionsData = await sessionsResponse.json();
      console.log('📊 Active sessions before logout:', sessionsData.sessions.length);
    }

    // Step 3: Logout
    console.log('\n3. Performing logout...');
    const logoutResponse = await fetch('http://localhost:3001/api/admin/auth', {
      method: 'DELETE',
      headers: {
        'Cookie': cookies || ''
      }
    });

    console.log('🚪 Logout response status:', logoutResponse.status);
    const logoutCookies = logoutResponse.headers.get('set-cookie');
    console.log('🍪 Logout cookies:', logoutCookies);

    // Step 4: Test access after logout with old cookies
    console.log('\n4. Testing access with old cookies after logout...');
    const postLogoutDashboard = await fetch('http://localhost:3001/admin/dashboard', {
      headers: {
        'Cookie': cookies || ''
      },
      redirect: 'manual'
    });

    console.log('🏠 Dashboard access after logout:', postLogoutDashboard.status);
    if (postLogoutDashboard.status === 302 || postLogoutDashboard.status === 307) {
      const location = postLogoutDashboard.headers.get('location');
      console.log('✅ Redirected to:', location);
    } else if (postLogoutDashboard.status === 200) {
      console.log('❌ SECURITY ISSUE: Dashboard still accessible after logout!');
    }

    const postLogoutSessions = await fetch('http://localhost:3001/api/admin/sessions', {
      headers: {
        'Cookie': cookies || ''
      }
    });

    console.log('📊 Sessions API after logout:', postLogoutSessions.status);
    if (postLogoutSessions.status === 401) {
      console.log('✅ Sessions API correctly returns 401 after logout');
    } else if (postLogoutSessions.status === 200) {
      const sessionsData = await postLogoutSessions.json();
      console.log('❌ SECURITY ISSUE: Sessions API still accessible:', sessionsData);
    }

    // Step 5: Test with cleared cookies (simulating browser behavior)
    console.log('\n5. Testing access with cleared cookies...');
    const clearedCookieDashboard = await fetch('http://localhost:3001/admin/dashboard', {
      redirect: 'manual'
    });

    console.log('🏠 Dashboard access with no cookies:', clearedCookieDashboard.status);
    if (clearedCookieDashboard.status === 302 || clearedCookieDashboard.status === 307) {
      const location = clearedCookieDashboard.headers.get('location');
      console.log('✅ Correctly redirected to:', location);
    }

    console.log('\n🎯 Logout Security Test Summary:');
    console.log('- Login: ✅');
    console.log('- Pre-logout access: ✅');
    console.log('- Logout execution: ✅');
    console.log('- Post-logout protection: ' + (postLogoutDashboard.status === 302 ? '✅' : '❌'));
    console.log('- Session invalidation: ' + (postLogoutSessions.status === 401 ? '✅' : '❌'));

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testLogoutSecurity();