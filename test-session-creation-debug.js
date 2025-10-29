const { Client } = require('pg');

const dbConfig = {
  user: 'swaeduae_user',
  host: 'localhost',
  database: 'swaeduae',
  password: 'swaeduae_password',
  port: 5432,
};

async function testSessionCreationDirectly() {
  console.log('🔍 Testing Direct Session Creation...');
  console.log('=====================================\n');

  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Database connected');

    // Test data
    const testUserId = '550e8400-e29b-41d4-a716-446655440011';
    const testToken = 'test-token-123';
    const testTokenHash = Buffer.from(testToken).toString('base64').slice(0, 64);
    const testIP = '127.0.0.1';
    const testUserAgent = 'Test Agent';
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log('📋 Test data:');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Token Hash: ${testTokenHash}`);
    console.log(`   IP: ${testIP}`);
    console.log(`   User Agent: ${testUserAgent}`);
    console.log(`   Expires: ${expiresAt}`);

    // 1. Check if user exists
    console.log('\n1️⃣ Checking if user exists...');
    const userCheck = await client.query('SELECT id, email FROM profiles WHERE id = $1', [testUserId]);
    
    if (userCheck.rows.length === 0) {
      console.log('❌ User not found in profiles table');
      return;
    }
    
    console.log(`✅ User found: ${userCheck.rows[0].email}`);

    // 2. Clear existing sessions
    console.log('\n2️⃣ Clearing existing sessions...');
    await client.query('DELETE FROM admin_sessions WHERE user_id = $1', [testUserId]);
    console.log('✅ Existing sessions cleared');

    // 3. Try to create session
    console.log('\n3️⃣ Creating session...');
    const sessionId = require('crypto').randomUUID();
    
    try {
      const result = await client.query(
        `INSERT INTO admin_sessions 
         (id, user_id, token_hash, ip_address, user_agent, created_at, last_activity, expires_at, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          sessionId,
          testUserId,
          testTokenHash,
          testIP,
          testUserAgent,
          now,
          now,
          expiresAt,
          true
        ]
      );

      console.log('✅ Session created successfully!');
      console.log('📋 Created session:', result.rows[0]);

    } catch (insertError) {
      console.error('❌ Error creating session:', insertError);
      console.error('   Code:', insertError.code);
      console.error('   Detail:', insertError.detail);
      console.error('   Constraint:', insertError.constraint);
    }

    // 4. Check sessions
    console.log('\n4️⃣ Checking sessions...');
    const sessions = await client.query('SELECT * FROM admin_sessions WHERE user_id = $1', [testUserId]);
    console.log(`📊 Sessions found: ${sessions.rows.length}`);
    
    sessions.rows.forEach((session, index) => {
      console.log(`   Session ${index + 1}:`);
      console.log(`     ID: ${session.id}`);
      console.log(`     User ID: ${session.user_id}`);
      console.log(`     Token Hash: ${session.token_hash}`);
      console.log(`     Active: ${session.is_active}`);
    });

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await client.end();
  }
}

testSessionCreationDirectly();