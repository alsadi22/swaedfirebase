const fetch = require('node-fetch').default || require('node-fetch');

// Simulate the verifyJWT function from middleware
async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [header, payload, signature] = parts;
    
    // Decode the payload
    const decodedPayload = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    
    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      throw new Error('Token expired');
    }

    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Simulate the hashToken function from SessionManager
function hashToken(token) {
  return Buffer.from(token).toString('base64').slice(0, 64);
}

async function testMiddlewareDetailed() {
  console.log('=== DETAILED MIDDLEWARE DEBUG ===\n');
  
  try {
    // Step 1: Login and get token
    console.log('Step 1: Getting admin token...');
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
    console.log('✅ Login successful');

    // Extract token from Set-Cookie header
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/admin_token=([^;]+)/);
    const token = tokenMatch[1];
    console.log('✅ Token extracted');

    // Step 2: Verify JWT token (same as middleware)
    console.log('\nStep 2: Verifying JWT token...');
    try {
      const decoded = await verifyJWT(token, process.env.JWT_SECRET || 'fallback-secret');
      console.log('✅ JWT verification successful');
      console.log('Decoded payload:', decoded);
      
      if (decoded.role !== 'admin') {
        console.error('❌ Role is not admin:', decoded.role);
        return;
      }
      console.log('✅ Role is admin');
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      return;
    }

    // Step 3: Check session in database (simulate SessionManager.validateSession)
    console.log('\nStep 3: Checking session in database...');
    const hashedToken = hashToken(token);
    console.log('Token hash:', hashedToken);

    // Use spawn to check database
    const { spawn } = require('child_process');
    
    const psqlCommand = spawn('sudo', [
      '-u', 'postgres', 'psql', '-d', 'swaeduae', '-t', '-c',
      `SELECT id, user_id, ip_address, expires_at > NOW() as is_valid FROM admin_sessions WHERE token_hash = '${hashedToken}' AND is_active = true;`
    ]);

    let dbOutput = '';
    psqlCommand.stdout.on('data', (data) => {
      dbOutput += data.toString();
    });

    psqlCommand.on('close', (code) => {
      console.log('Database query result:', dbOutput.trim());
      
      if (!dbOutput.trim()) {
        console.error('❌ No session found in database');
      } else {
        console.log('✅ Session found in database');
      }

      // Step 4: Test actual middleware endpoint
      console.log('\nStep 4: Testing actual middleware with cookie...');
      testActualMiddleware(token);
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

async function testActualMiddleware(token) {
  try {
    const response = await fetch('https://swaeduae.ae/admin/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (compatible; MiddlewareTest/1.0)'
      },
      redirect: 'manual' // Don't follow redirects
    });

    console.log('Middleware response status:', response.status);
    console.log('Middleware response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 307 || response.status === 302) {
      console.log('❌ Middleware redirected to:', response.headers.get('location'));
    } else if (response.status === 200) {
      console.log('✅ Middleware allowed access');
    } else {
      console.log('❓ Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('Middleware test failed:', error.message);
  }
}

testMiddlewareDetailed();