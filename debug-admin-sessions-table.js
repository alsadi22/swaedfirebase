const { Pool } = require('pg');

const pool = new Pool({
  user: 'swaeduae',
  host: 'localhost',
  database: 'swaeduae',
  password: 'swaeduae_password',
  port: 5432,
});

async function debugAdminSessionsTable() {
  try {
    console.log('🔍 Checking admin_sessions table structure...');
    
    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_sessions'
      );
    `);
    
    console.log('Table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Get table structure
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'admin_sessions'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Table structure:');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
      });
      
      // Check constraints
      const constraints = await pool.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'admin_sessions';
      `);
      
      console.log('\n🔒 Constraints:');
      constraints.rows.forEach(constraint => {
        console.log(`  ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
      
      // Check foreign key references
      const foreignKeys = await pool.query(`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'admin_sessions';
      `);
      
      console.log('\n🔗 Foreign keys:');
      foreignKeys.rows.forEach(fk => {
        console.log(`  ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
      
      // Test a simple insert to see what happens
      console.log('\n🧪 Testing simple insert...');
      try {
        const testResult = await pool.query(`
          INSERT INTO admin_sessions 
          (id, user_id, token_hash, ip_address, user_agent, created_at, last_activity, expires_at, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id;
        `, [
          'test-session-id',
          '6769b586-e717-4d73-92d7-a72d319c69c7', // Known admin user ID
          'test-token-hash',
          '127.0.0.1',
          'test-user-agent',
          new Date(),
          new Date(),
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          true
        ]);
        
        console.log('✅ Test insert successful:', testResult.rows[0]);
        
        // Clean up test record
        await pool.query('DELETE FROM admin_sessions WHERE id = $1', ['test-session-id']);
        console.log('🧹 Test record cleaned up');
        
      } catch (insertError) {
        console.error('❌ Test insert failed:', insertError.message);
        console.error('Error details:', {
          code: insertError.code,
          detail: insertError.detail,
          hint: insertError.hint,
          position: insertError.position,
          where: insertError.where,
          file: insertError.file,
          line: insertError.line,
          routine: insertError.routine
        });
      }
    } else {
      console.log('❌ admin_sessions table does not exist!');
    }
    
  } catch (error) {
    console.error('Error debugging admin_sessions table:', error);
  } finally {
    await pool.end();
  }
}

debugAdminSessionsTable();