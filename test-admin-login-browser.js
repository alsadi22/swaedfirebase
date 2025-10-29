async function testAdminLoginBrowser() {
  console.log('🔍 Testing admin login flow as browser would...\n');

  try {
    // Step 1: Test login API
    console.log('1️⃣ Testing login API...');
    const loginResponse = await fetch('https://swaeduae.ae/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        email: 'admin@swaeduae.ae',
        password: 'admin123'
      })
    });

    console.log('📊 Login API Status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);

    // Extract cookie
    const cookies = loginResponse.headers.get('set-cookie');
    const tokenMatch = cookies?.match(/admin_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      console.log('❌ No token found in cookies');
      return;
    }

    console.log('🍪 Token extracted successfully');

    // Step 2: Test accessing admin login page (should redirect if authenticated)
    console.log('\n2️⃣ Testing admin login page access...');
    const loginPageResponse = await fetch('https://swaeduae.ae/auth/admin/login', {
      headers: { 
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'manual'
    });

    console.log('📊 Login page status:', loginPageResponse.status);
    if (loginPageResponse.status === 302 || loginPageResponse.status === 307) {
      const location = loginPageResponse.headers.get('location');
      console.log('🔄 Redirects to:', location);
    }

    // Step 3: Test accessing admin dashboard
    console.log('\n3️⃣ Testing admin dashboard access...');
    const dashboardResponse = await fetch('https://swaeduae.ae/admin/dashboard', {
      headers: { 
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'manual'
    });

    console.log('📊 Dashboard status:', dashboardResponse.status);
    
    if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard accessible');
      const dashboardText = await dashboardResponse.text();
      if (dashboardText.includes('Admin Dashboard') || dashboardText.includes('dashboard')) {
        console.log('✅ Dashboard content looks correct');
      } else {
        console.log('⚠️ Dashboard content might be incorrect');
        console.log('Preview:', dashboardText.substring(0, 200) + '...');
      }
    } else if (dashboardResponse.status === 302 || dashboardResponse.status === 307) {
      const location = dashboardResponse.headers.get('location');
      console.log('🔄 Dashboard redirects to:', location);
    } else if (dashboardResponse.status === 500) {
      console.log('❌ Dashboard returns 500 error');
      const errorText = await dashboardResponse.text();
      console.log('Error preview:', errorText.substring(0, 200) + '...');
    }

    // Step 4: Test other admin routes
    console.log('\n4️⃣ Testing other admin routes...');
    const routes = ['/admin/users', '/admin/settings', '/admin/audit-logs'];
    
    for (const route of routes) {
      const routeResponse = await fetch(`https://swaeduae.ae${route}`, {
        headers: { 
          'Cookie': `admin_token=${token}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        redirect: 'manual'
      });
      
      console.log(`📊 ${route} status:`, routeResponse.status);
      
      if (routeResponse.status === 302 || routeResponse.status === 307) {
        const location = routeResponse.headers.get('location');
        console.log(`   🔄 Redirects to: ${location}`);
      }
    }

    // Step 5: Check if there are any console errors in the browser
    console.log('\n5️⃣ Testing for JavaScript errors...');
    const jsTestResponse = await fetch('https://swaeduae.ae/auth/admin/login', {
      headers: { 
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (jsTestResponse.status === 200) {
      const htmlContent = await jsTestResponse.text();
      
      // Check for common error indicators
      if (htmlContent.includes('ChunkLoadError') || htmlContent.includes('Loading chunk')) {
        console.log('⚠️ Potential chunk loading error detected');
      }
      
      if (htmlContent.includes('_next/static')) {
        console.log('✅ Static assets seem to be loading');
      }
      
      if (htmlContent.includes('admin@swaeduae.ae')) {
        console.log('✅ Login form appears to be rendered correctly');
      }
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testAdminLoginBrowser();