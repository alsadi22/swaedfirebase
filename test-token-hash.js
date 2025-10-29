const fetch = require('node-fetch').default || require('node-fetch');

// Simulate the hashToken function from SessionManager
function hashToken(token) {
  return Buffer.from(token).toString('base64').slice(0, 64);
}

async function testTokenHashing() {
  console.log('=== TOKEN HASHING DEBUG ===\n');
  
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
    console.log('Login response:', loginData);

    // Extract token from Set-Cookie header
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);

    if (!setCookieHeader) {
      console.error('No Set-Cookie header found');
      return;
    }

    // Parse the admin_token from the cookie
    const tokenMatch = setCookieHeader.match(/admin_token=([^;]+)/);
    if (!tokenMatch) {
      console.error('No admin_token found in cookie');
      return;
    }

    const token = tokenMatch[1];
    console.log('Extracted token:', token.substring(0, 50) + '...');

    // Step 2: Hash the token using the same method as SessionManager
    const hashedToken = hashToken(token);
    console.log('Hashed token:', hashedToken);

    // Step 3: Check if this hash exists in the database
    console.log('\nStep 3: Checking database for this token hash...');
    
    // We'll use curl to check the database via a simple query
    const { spawn } = require('child_process');
    
    const psqlCommand = spawn('sudo', [
      '-u', 'postgres', 'psql', '-d', 'swaeduae', '-t', '-c',
      `SELECT COUNT(*) FROM admin_sessions WHERE token_hash = '${hashedToken}' AND is_active = true AND expires_at > NOW();`
    ]);

    let output = '';
    psqlCommand.stdout.on('data', (data) => {
      output += data.toString();
    });

    psqlCommand.on('close', (code) => {
      const count = parseInt(output.trim());
      console.log('Sessions found with this token hash:', count);
      
      if (count === 0) {
        console.error('❌ No active sessions found with this token hash!');
        console.log('This explains why the middleware authentication fails.');
      } else {
        console.log('✅ Session found in database');
      }
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTokenHashing();