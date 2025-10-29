async function testMiddlewareIssue() {
  console.log('🔍 Testing middleware behavior after logout...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch('https://swaeduae.ae/api/admin/auth', {
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

    // Step 2: Test middleware before logout
    console.log('\n2️⃣ Testing middleware before logout...');
    const beforeLogoutTest = await fetch('https://swaeduae.ae/admin/dashboard', {
      headers: { 'Cookie': `admin_token=${token}` },
      redirect: 'manual'
    });
    
    console.log('🛡️ Before logout - Status:', beforeLogoutTest.status);
    if (beforeLogoutTest.status === 500) {
      console.log('🤔 Getting 500 even before logout - this might be a dashboard issue');
      const errorText = await beforeLogoutTest.text();
      console.log('Error preview:', errorText.substring(0, 200) + '...');
    }

    // Step 3: Logout
    console.log('\n3️⃣ Performing logout...');
    const logoutResponse = await fetch('https://swaeduae.ae/api/admin/auth', {
      method: 'DELETE',
      headers: { 'Cookie': `admin_token=${token}` }
    });

    console.log('🚪 Logout status:', logoutResponse.status);

    // Step 4: Test middleware after logout
    console.log('\n4️⃣ Testing middleware after logout...');
    const afterLogoutTest = await fetch('https://swaeduae.ae/admin/dashboard', {
      headers: { 'Cookie': `admin_token=${token}` },
      redirect: 'manual'
    });
    
    console.log('🛡️ After logout - Status:', afterLogoutTest.status);
    
    if (afterLogoutTest.status === 302 || afterLogoutTest.status === 307) {
      const location = afterLogoutTest.headers.get('location');
      console.log('✅ Middleware correctly redirects to:', location);
    } else if (afterLogoutTest.status === 500) {
      console.log('❌ Still getting 500 - this suggests middleware is not working');
      const errorText = await afterLogoutTest.text();
      console.log('Error preview:', errorText.substring(0, 200) + '...');
    } else if (afterLogoutTest.status === 200) {
      console.log('❌ SECURITY ISSUE: Still getting 200 - access granted!');
    }

    // Step 5: Test with no token at all
    console.log('\n5️⃣ Testing middleware with no token...');
    const noTokenTest = await fetch('https://swaeduae.ae/admin/dashboard', {
      redirect: 'manual'
    });
    
    console.log('🛡️ No token - Status:', noTokenTest.status);
    if (noTokenTest.status === 302 || noTokenTest.status === 307) {
      const location = noTokenTest.headers.get('location');
      console.log('✅ No token correctly redirects to:', location);
    } else {
      console.log('❌ No token should redirect but got:', noTokenTest.status);
    }

    // Step 6: Test with cleared cookies
    console.log('\n6️⃣ Testing with cleared cookies...');
    const clearedCookiesTest = await fetch('https://swaeduae.ae/admin/dashboard', {
      headers: { 'Cookie': 'admin_token=' },
      redirect: 'manual'
    });
    
    console.log('🛡️ Cleared cookies - Status:', clearedCookiesTest.status);
    if (clearedCookiesTest.status === 302 || clearedCookiesTest.status === 307) {
      const location = clearedCookiesTest.headers.get('location');
      console.log('✅ Cleared cookies correctly redirects to:', location);
    } else {
      console.log('❌ Cleared cookies should redirect but got:', clearedCookiesTest.status);
    }

    // Step 7: Test a different admin route
    console.log('\n7️⃣ Testing different admin route after logout...');
    const settingsTest = await fetch('https://swaeduae.ae/admin/settings', {
      headers: { 'Cookie': `admin_token=${token}` },
      redirect: 'manual'
    });
    
    console.log('🛡️ Settings route - Status:', settingsTest.status);
    if (settingsTest.status === 302 || settingsTest.status === 307) {
      const location = settingsTest.headers.get('location');
      console.log('✅ Settings route correctly redirects to:', location);
    } else {
      console.log('❌ Settings route status:', settingsTest.status);
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testMiddlewareIssue();