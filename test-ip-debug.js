const fetch = require('node-fetch').default || require('node-fetch');

// Simulate the getClientIP function from SessionManager
function getClientIP(headers) {
  const forwarded = headers['x-forwarded-for'];
  const realIP = headers['x-real-ip'];
  const cfConnectingIP = headers['cf-connecting-ip'];
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return '127.0.0.1';
}

// Simulate the hashToken function from SessionManager
function hashToken(token) {
  return Buffer.from(token).toString('base64').slice(0, 64);
}

async function testIPDebug() {
  console.log('=== IP ADDRESS DEBUG ===\n');
  
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

    // Step 2: Check what IP was stored during session creation
    console.log('\nStep 2: Checking stored IP address in database...');
    const hashedToken = hashToken(token);
    
    const { spawn } = require('child_process');
    
    const psqlCommand = spawn('sudo', [
      '-u', 'postgres', 'psql', '-d', 'swaeduae', '-t', '-c',
      `SELECT ip_address FROM admin_sessions WHERE token_hash = '${hashedToken}' AND is_active = true ORDER BY created_at DESC LIMIT 1;`
    ]);

    let dbOutput = '';
    psqlCommand.stdout.on('data', (data) => {
      dbOutput += data.toString();
    });

    psqlCommand.on('close', (code) => {
      const storedIP = dbOutput.trim();
      console.log('Stored IP address:', storedIP);

      // Step 3: Test what IP would be detected during middleware validation
      console.log('\nStep 3: Testing IP detection during middleware request...');
      testMiddlewareIP(token, storedIP);
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

async function testMiddlewareIP(token, storedIP) {
  try {
    // Make a request to the admin dashboard and capture the headers
    const response = await fetch('https://swaeduae.ae/admin/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${token}`,
        'User-Agent': 'Mozilla/5.0 (compatible; IPTest/1.0)'
      },
      redirect: 'manual'
    });

    console.log('Request headers that would be sent to middleware:');
    console.log('- x-forwarded-for:', response.request?.headers?.['x-forwarded-for'] || 'not set');
    console.log('- x-real-ip:', response.request?.headers?.['x-real-ip'] || 'not set');
    console.log('- cf-connecting-ip:', response.request?.headers?.['cf-connecting-ip'] || 'not set');

    // Simulate what getClientIP would return
    const detectedIP = getClientIP({
      'x-forwarded-for': response.request?.headers?.['x-forwarded-for'],
      'x-real-ip': response.request?.headers?.['x-real-ip'],
      'cf-connecting-ip': response.request?.headers?.['cf-connecting-ip']
    });

    console.log('\nIP Comparison:');
    console.log('Stored IP:', storedIP);
    console.log('Detected IP:', detectedIP);
    console.log('Match:', storedIP === detectedIP ? '✅ YES' : '❌ NO');

    if (storedIP !== detectedIP) {
      console.log('\n❌ IP MISMATCH DETECTED!');
      console.log('This is likely causing the session validation to fail.');
      console.log('The middleware detects a different IP than what was stored during login.');
    }

    // Step 4: Check if there are any security events logged
    console.log('\nStep 4: Checking for security events...');
    checkSecurityEvents();

  } catch (error) {
    console.error('Middleware IP test failed:', error.message);
  }
}

function checkSecurityEvents() {
  const { spawn } = require('child_process');
  
  const psqlCommand = spawn('sudo', [
    '-u', 'postgres', 'psql', '-d', 'swaeduae', '-t', '-c',
    `SELECT event, details, created_at FROM audit_logs WHERE event = 'ip_change' ORDER BY created_at DESC LIMIT 5;`
  ]);

  let output = '';
  psqlCommand.stdout.on('data', (data) => {
    output += data.toString();
  });

  psqlCommand.on('close', (code) => {
    if (output.trim()) {
      console.log('Recent IP change events:');
      console.log(output);
    } else {
      console.log('No IP change events found');
    }
  });
}

testIPDebug();