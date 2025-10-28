const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'swaeduae',
  user: process.env.POSTGRES_USER || 'swaeduae_user',
  password: process.env.POSTGRES_PASSWORD || 'swaeduae_password',
});

async function fixUserIdMismatch() {
  const client = await pool.connect();
  
  try {
    console.log('Starting user ID fix process...');
    
    // First, let's check the current user data
    const currentUser = await client.query(
      'SELECT id, email, user_type, status FROM profiles WHERE email = $1',
      ['alsadi22@gmail.com']
    );
    
    if (currentUser.rows.length === 0) {
      console.log('User not found in database');
      return;
    }
    
    const user = currentUser.rows[0];
    console.log('Current user data:', user);
    
    // Check if the ID is already in Auth0 format
    if (user.id.includes('|')) {
      console.log('User ID is already in Auth0 format');
      return;
    }
    
    // Generate a temporary Auth0-like ID for testing
    // In a real scenario, this would come from the Auth0 session
    const tempAuth0Id = `google-oauth2|${Date.now()}`;
    
    console.log(`Updating user ID from ${user.id} to ${tempAuth0Id}`);
    
    // Begin transaction
    await client.query('BEGIN');
    
    try {
      // Update all foreign key references first
      const tables = [
        'academic_records',
        'applications',
        'audit_logs',
        'certificates',
        'event_registrations',
        'guardians',
        'notifications',
        'user_badges',
        'user_notification_preferences',
        'volunteer_hours'
      ];
      
      for (const table of tables) {
        const updateResult = await client.query(
          `UPDATE ${table} SET user_id = $1 WHERE user_id = $2`,
          [tempAuth0Id, user.id]
        );
        console.log(`Updated ${updateResult.rowCount} rows in ${table}`);
      }
      
      // Update the main profiles table
      const profileUpdate = await client.query(
        'UPDATE profiles SET id = $1 WHERE email = $2 RETURNING *',
        [tempAuth0Id, 'alsadi22@gmail.com']
      );
      
      if (profileUpdate.rows.length > 0) {
        console.log('Successfully updated user profile:', profileUpdate.rows[0]);
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('Transaction committed successfully');
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('Transaction rolled back due to error:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Error fixing user ID:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixUserIdMismatch().catch(console.error);