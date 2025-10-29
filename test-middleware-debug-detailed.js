const fetch = require('node-fetch').default || require('node-fetch');

// Simulate the verifyJWT function from middleware
async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

// Simulate the hashToken function from SessionManager
function hashToken(token) {
  return Buffer.from(token).toString('base64').slice(0, 64);
}

async function testMiddlewareDebugDetailed() {
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

    // Step 2: Verify JWT token (middleware step 1)
    console.log('\nStep 2: Verifying JWT token...');
    try {
      const decoded = await verifyJWT(token, process.env.JWT_SECRET || 'fallback-secret');
      console.log('✅ JWT verification successful');
      console.log('Decoded payload:', decoded);
      
      if (decoded.role === 'admin') {
        console.log('✅ Role is admin');
      } else {
        console.log('❌ Role is not admin:', decoded.role);
        return;
      }
    } catch (error) {
      console.log('❌ JWT verification failed:', error.message);
      return;
    }

    // Step 3: Check session in database (middleware step 2)
    console.log('\nStep 3: Checking session in database...');
    const hashedToken = hashToken(token);
    
    const { spawn } = require('child_process');
    
    const psqlCommand = spawn('sudo', [
      '-u', 'postgres', 'psql', '-d', 'swaeduae', '-t', '-c',
      `SELECT id, user_id, ip_address, expires_at > NOW() as is_valid, is_active FROM admin_sessions WHERE token_hash = '${hashedToken}' AND is_active = true ORDER BY created_at DESC LIMIT 1;`
    ]);

    let dbOutput = '';
    psqlCommand.stdout.on('data', (data) => {
      dbOutput += data.toString();
    });

    psqlCommand.on('close', (code) => {
      const sessionData = dbOutput.trim();
      console.log('Database session query result:', sessionData);
      
      if (sessionData) {
        console.log('✅ Session found in database');
        
        // Parse the session data
        const parts = sessionData.split('|').map(p => p.trim());
        if (parts.length >= 5) {
          const [id, userId, ipAddress, isValid, isActive] = parts;
          console.log('Session details:');
          console.log('  ID:', id);
          console.log('  User ID:', userId);
          console.log('  IP Address:', ipAddress);
          console.log('  Is Valid (not expired):', isValid);
          console.log('  Is Active:', isActive);
          
          if (isValid === 't' && isActive === 't') {
            console.log('✅ Session is valid and active');
          } else {
            console.log('❌ Session is invalid or inactive');
          }
        }
      } else {
        console.log('❌ No session found in database');
      }

      // Step 4: Test actual middleware endpoint
      console.log('\nStep 4: Testing actual middleware endpoint...');
      testActualMiddleware(token);
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

async function testActualMiddleware(token) {
  try {
    // Add detailed logging by making the request with verbose headers
    const response = await fetch('https://swaeduae.ae/admin/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (compatible; MiddlewareTest/1.0)',
        'X-Debug': 'true'
      },
      redirect: 'manual'
    });

    console.log('Middleware response status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Middleware allowed access');
    } else if (response.status === 307 || response.status === 302) {
      const location = response.headers.get('location');
      console.log('❌ Middleware redirected to:', location);
      
      // Check if there are any error logs we can examine
      console.log('\nStep 5: Checking PM2 logs for middleware errors...');
      checkPM2Logs();
    } else {
      console.log('❓ Unexpected middleware response');
    }

  } catch (error) {
    console.error('Middleware test failed:', error.message);
  }
}

function checkPM2Logs() {
  const { spawn } = require('child_process');
  
  const pm2Command = spawn('pm2', ['logs', 'swaeduae-platform', '--lines', '10']);

  let output = '';
  pm2Command.stdout.on('data', (data) => {
    output += data.toString();
  });

  pm2Command.stderr.on('data', (data) => {
    output += data.toString();
  });

  pm2Command.on('close', (code) => {
    console.log('Recent PM2 logs:');
    console.log(output);
  });
}

testMiddlewareDebugDetailed();