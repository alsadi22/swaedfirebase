// Import the compiled JavaScript version or use dynamic import
// Since this is a TypeScript module, we'll use a different approach
const fetch = require('node-fetch').default || require('node-fetch');

// Mock NextRequest object to simulate middleware
class MockNextRequest {
  constructor(cookies = {}) {
    this.cookies = {
      get: (name) => cookies[name] ? { value: cookies[name] } : undefined
    };
    this.ip = '127.0.0.1';
    this.headers = new Map();
    this.headers.set('x-forwarded-for', '127.0.0.1');
  }
}

// Edge Runtime compatible JWT verification (same as middleware)
async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [header, payload, signature] = parts;
    
    // Decode the payload
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      throw new Error('Token expired');
    }

    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function testMiddlewareAuth() {
  console.log('=== MIDDLEWARE AUTHENTICATION DEBUG ===\n');

  try {
    // Step 1: Login to get a token
    console.log('Step 1: Getting admin token via login API...');
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

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    // Extract token from Set-Cookie header
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);

    if (!setCookieHeader) {
      console.error('No Set-Cookie header found!');
      return;
    }

    // Parse the admin_token from the cookie
    const tokenMatch = setCookieHeader.match(/admin_token=([^;]+)/);
    if (!tokenMatch) {
      console.error('No admin_token found in Set-Cookie header!');
      return;
    }

    const token = tokenMatch[1];
    console.log('Extracted token:', token.substring(0, 50) + '...\n');

    // Step 2: Verify JWT token (same logic as middleware)
    console.log('Step 2: Verifying JWT token...');
    try {
      const decoded = await verifyJWT(token, process.env.JWT_SECRET || 'fallback-secret');
      console.log('Decoded token:', decoded);
      
      if (decoded.role !== 'admin') {
        console.error('Token role is not admin:', decoded.role);
        return;
      }
      console.log('✓ Token role is admin\n');
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return;
    }

    // Step 3: Test session validation (same logic as middleware)
    console.log('Step 3: Testing session validation...');
    // Skip session validation test since we can't import SessionManager directly
    console.log('⚠️ Skipping session validation test (TypeScript module import issue)');
    console.log('Will test via actual middleware endpoint instead\n');

    // Step 4: Test actual middleware endpoint
    console.log('\nStep 4: Testing actual admin dashboard access...');
    const dashboardResponse = await fetch('https://swaeduae.ae/admin/dashboard', {
      headers: {
        'Cookie': `admin_token=${token}`
      },
      redirect: 'manual' // Don't follow redirects
    });

    console.log('Dashboard response status:', dashboardResponse.status);
    console.log('Dashboard response headers:', Object.fromEntries(dashboardResponse.headers.entries()));

    if (dashboardResponse.status === 307 || dashboardResponse.status === 302) {
      console.log('Redirect location:', dashboardResponse.headers.get('location'));
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testMiddlewareAuth();