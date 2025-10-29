const { Pool } = require('pg');

async function createAdminSessionsTable() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'swaeduae_user',
    password: 'swaeduae_password',
    database: 'swaeduae'
  });

  try {
    console.log('🔧 Creating admin_sessions table...');
    
    const schema = `
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN DEFAULT true
      );

      -- Create indexes separately (PostgreSQL syntax)
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
    `;
    
    await pool.query(schema);
    console.log('✅ admin_sessions table created successfully');
    
    // Test the table structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'admin_sessions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Table structure:');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // Test insertion
    console.log('\n🧪 Testing insertion...');
    const testInsert = await pool.query(`
      INSERT INTO admin_sessions (user_id, token_hash, expires_at)
      VALUES (
        (SELECT id FROM profiles WHERE email = 'admin@swaeduae.ae' LIMIT 1),
        'test_token_hash',
        NOW() + INTERVAL '1 hour'
      )
      RETURNING id;
    `);
    
    console.log('✅ Test insertion successful, session ID:', testInsert.rows[0].id);
    
    // Clean up test data
    await pool.query('DELETE FROM admin_sessions WHERE token_hash = $1', ['test_token_hash']);
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error creating admin_sessions table:', error);
    console.error('Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      where: error.where,
      file: error.file,
      line: error.line,
      routine: error.routine
    });
  } finally {
    await pool.end();
  }
}

createAdminSessionsTable();