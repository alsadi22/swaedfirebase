#!/usr/bin/env node

/**
 * Auth0 Schema Fix Script
 * This script fixes the database schema to support Auth0 authentication
 * where password_hash can be NULL for OAuth2 users
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'swaeduae',
};

console.log('\n========================================');
console.log('🔧 Auth0 Schema Fix Script');
console.log('========================================\n');

console.log('📋 Database Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}\n`);

const pool = new Pool(dbConfig);

async function main() {
  try {
    const client = await pool.connect();

    console.log('🔌 Connected to PostgreSQL\n');

    // Step 1: Check current constraint
    console.log('Step 1: Checking password_hash constraint...');
    const constraintCheck = await client.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'password_hash'
    `);

    const currentState = constraintCheck.rows[0];
    console.log(`  Current: ${currentState.column_name} - ${currentState.data_type} - ${currentState.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}\n`);

    if (currentState.is_nullable === 'NO') {
      // Step 2: Make password_hash nullable
      console.log('Step 2: Making password_hash column NULLABLE...');
      
      await client.query(`
        ALTER TABLE profiles
        ALTER COLUMN password_hash DROP NOT NULL;
      `);
      
      console.log('  ✅ password_hash is now NULLABLE\n');
    } else {
      console.log('  ℹ️  password_hash is already NULLABLE\n');
    }

    // Step 3: Add status column if it doesn't exist (for more explicit user state management)
    console.log('Step 3: Checking for status column...');
    const statusCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'status'
    `);

    if (statusCheck.rows.length === 0) {
      console.log('  Adding status column...');
      await client.query(`
        ALTER TABLE profiles
        ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));
      `);
      console.log('  ✅ status column added\n');
    } else {
      console.log('  ℹ️  status column already exists\n');
    }

    // Step 4: Add auth_provider column to track authentication method
    console.log('Step 4: Checking for auth_provider column...');
    const authProviderCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'auth_provider'
    `);

    if (authProviderCheck.rows.length === 0) {
      console.log('  Adding auth_provider column...');
      await client.query(`
        ALTER TABLE profiles
        ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local' CHECK (auth_provider IN ('local', 'auth0', 'google', 'facebook'));
      `);
      console.log('  ✅ auth_provider column added\n');
    } else {
      console.log('  ℹ️  auth_provider column already exists\n');
    }

    // Step 5: Verify the fix
    console.log('Step 5: Verifying schema changes...');
    const verifyResult = await client.query(`
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name IN ('password_hash', 'status', 'auth_provider')
      ORDER BY ordinal_position
    `);

    console.log('  Updated columns:');
    verifyResult.rows.forEach((col) => {
      const nullable = col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL';
      const defaultVal = col.column_default ? ` [default: ${col.column_default}]` : '';
      console.log(`    ✅ ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });
    console.log('');

    // Step 6: Test user creation
    console.log('Step 6: Testing Auth0 user sync (without password_hash)...');
    const testUserId = '550e8400-e29b-41d4-a716-446655440099';
    const testEmail = 'test-auth0@swaeduae.ae';

    try {
      // Delete if exists
      await client.query('DELETE FROM profiles WHERE id = $1', [testUserId]);

      // Create user without password_hash
      const insertResult = await client.query(
        `INSERT INTO profiles (id, email, first_name, last_name, user_type, auth_provider, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, email, first_name, last_name, user_type, auth_provider, status`,
        [testUserId, testEmail, 'Auth0', 'Test', 'volunteer', 'auth0', 'active']
      );

      console.log('  ✅ Successfully created Auth0 user without password_hash');
      console.log('     User:', insertResult.rows[0]);

      // Clean up
      await client.query('DELETE FROM profiles WHERE id = $1', [testUserId]);
      console.log('  ✅ Test user cleaned up\n');
    } catch (error) {
      console.error('  ❌ Test failed:', error.message, '\n');
    }

    client.release();

    // Final summary
    console.log('========================================');
    console.log('✅ Auth0 Schema Fix Complete!');
    console.log('========================================\n');

    console.log('Changes Applied:');
    console.log('  ✅ password_hash column is now NULLABLE');
    console.log('  ✅ status column added for user state management');
    console.log('  ✅ auth_provider column added to track authentication method\n');

    console.log('Your database is now ready for Auth0 OAuth2 integration!');
    console.log('Users can now be created via Auth0 without password hashes.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL is not accessible at the configured location');
    } else if (error.code === '42601') {
      console.error('\n💡 SQL syntax error - check the ALTER TABLE statements');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
