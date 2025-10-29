const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdminSessionsTable() {
  try {
    console.log('Creating admin_sessions table...');
    
    const createTableQuery = `
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
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ admin_sessions table created successfully');
    
    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);',
      'CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);',
      'CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);'
    ];
    
    for (const indexQuery of createIndexes) {
      await pool.query(indexQuery);
    }
    
    console.log('✅ Indexes created successfully');
    
    // Check if table was created
    const checkTable = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Table structure:');
    checkTable.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating admin_sessions table:', error);
  } finally {
    await pool.end();
  }
}

createAdminSessionsTable();