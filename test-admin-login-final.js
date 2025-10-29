const fetch = require('node-fetch').default || require('node-fetch');

async function testAdminLoginFinal() {
  console.log('=== FINAL ADMIN LOGIN TEST ===\n');
  
  try {
    // Step 1: Login
    console.log('Step 1: Attempting admin login...');
    const loginResponse = await fetch('https://swaeduae.ae/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.error('❌ Login failed');
      const errorData = await loginResponse.text();
      console.error('Error:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Extract token from Set-Cookie header
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/admin_token=([^;]+)/);
    
    if (!tokenMatch) {
      console.error('❌ No admin token found in response');
      return;
    }

    const token = tokenMatch[1];
    console.log('✅ Token extracted');

    // Step 2: Test admin dashboard access
    console.log('\nStep 2: Testing admin dashboard access...');
    const dashboardResponse = await fetch('https://swaeduae.ae/admin/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (compatible; AdminTest/1.0)'
      },
      redirect: 'manual'
    });

    console.log('Dashboard response status:', dashboardResponse.status);
    console.log('Dashboard response headers:');
    dashboardResponse.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    if (dashboardResponse.status === 200) {
      console.log('✅ SUCCESS! Admin dashboard accessible');
      console.log('🎉 Admin login is now working correctly!');
    } else if (dashboardResponse.status === 307 || dashboardResponse.status === 302) {
      const location = dashboardResponse.headers.get('location');
      console.log('❌ Still redirecting to:', location);
      
      if (location && location.includes('/auth/admin/login')) {
        console.log('❌ Still being redirected to login page');
        console.log('The IP validation fix may not have resolved the issue completely');
      }
    } else {
      console.log('❓ Unexpected response status');
    }

    // Step 3: Test other admin routes
    console.log('\nStep 3: Testing other admin routes...');
    const routes = [
      '/admin/users',
      '/admin/events',
      '/admin/settings'
    ];

    for (const route of routes) {
      const response = await fetch(`https://swaeduae.ae${route}`, {
        method: 'GET',
        headers: {
          'Cookie': `admin_token=${token}`,
          'User-Agent': 'Mozilla/5.0 (compatible; AdminTest/1.0)'
        },
        redirect: 'manual'
      });

      console.log(`${route}: ${response.status} ${response.status === 200 ? '✅' : response.status === 307 ? '❌ (redirect)' : '❓'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminLoginFinal();