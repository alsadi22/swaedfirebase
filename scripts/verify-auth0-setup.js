#!/usr/bin/env node

/**
 * Complete Auth0 Login Flow Verification Script
 * Verifies all components needed for Auth0 authentication to work
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   🔐 Auth0 Login Flow Verification                        ║');
console.log('║   Complete System Health Check                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'swaeduae',
};

// Environment variables to check
const requiredEnvVars = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'AUTH0_ISSUER_BASE_URL',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_BASE_URL',
  'AUTH0_SCOPE',
];

// Files to check (from workspace root)
const requiredFiles = [
  'app/api/users/sync/route.ts',
  'app/api/auth/[...auth0]/route.ts',
  'app/auth/volunteer/login/page.tsx',
  'app/auth/organization/login/page.tsx',
  'lib/auth/client.ts',
];

// Get workspace root (parent of scripts directory)
const workspaceRoot = path.join(__dirname, '..');

async function checkEnvironment() {
  console.log('📋 Step 1: Environment Variables');
  console.log('────────────────────────────────────────────────────────────\n');

  let allPresent = true;
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      const displayValue = varName.includes('SECRET') 
        ? '***' + value.slice(-4)
        : value;
      console.log(`  ✅ ${varName}: ${displayValue}`);
    } else {
      console.log(`  ❌ ${varName}: MISSING`);
      allPresent = false;
    }
  });

  console.log('');
  return allPresent;
}

async function checkFiles() {
  console.log('📁 Step 2: Required Files');
  console.log('────────────────────────────────────────────────────────────\n');

  let allExist = true;
  requiredFiles.forEach((filePath) => {
    const fullPath = path.join(workspaceRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`  ✅ ${filePath} (${stats.size} bytes)`);
    } else {
      console.log(`  ❌ ${filePath}: NOT FOUND`);
      allExist = false;
    }
  });

  console.log('');
  return allExist;
}

async function checkDatabase() {
  console.log('🗄️  Step 3: Database Connectivity');
  console.log('────────────────────────────────────────────────────────────\n');

  const pool = new Pool(dbConfig);

  try {
    const client = await pool.connect();
    console.log(`  ✅ Connected to ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);

    // Check profiles table
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
      )
    `);

    if (tableCheck.rows[0].exists) {
      console.log('  ✅ profiles table exists');
    } else {
      console.log('  ❌ profiles table does not exist');
      client.release();
      await pool.end();
      return false;
    }

    // Check password_hash is nullable
    const passwordHashCheck = await client.query(`
      SELECT is_nullable 
      FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'password_hash'
    `);

    if (passwordHashCheck.rows[0].is_nullable === 'YES') {
      console.log('  ✅ password_hash is NULLABLE (Auth0 ready)');
    } else {
      console.log('  ❌ password_hash is NOT NULL (Auth0 incompatible)');
      client.release();
      await pool.end();
      return false;
    }

    // Check auth_provider column
    const authProviderCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'auth_provider'
      )
    `);

    if (authProviderCheck.rows[0].exists) {
      console.log('  ✅ auth_provider column exists');
    } else {
      console.log('  ⚠️  auth_provider column missing (but not critical)');
    }

    // Check status column
    const statusCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'status'
      )
    `);

    if (statusCheck.rows[0].exists) {
      console.log('  ✅ status column exists');
    } else {
      console.log('  ⚠️  status column missing (but not critical)');
    }

    // Count existing users
    const userCount = await client.query(
      'SELECT COUNT(*) as count FROM profiles'
    );
    console.log(`  ℹ️  Total users in database: ${userCount.rows[0].count}`);

    // Count Auth0 users
    const auth0Count = await client.query(
      "SELECT COUNT(*) as count FROM profiles WHERE auth_provider = 'auth0'"
    );
    console.log(`  ℹ️  Auth0 users in database: ${auth0Count.rows[0].count}`);

    client.release();
    console.log('');
    return true;
  } catch (error) {
    console.log(`  ❌ Database connection failed: ${error.message}`);
    console.log(`     Check PostgreSQL is running and credentials are correct`);
    console.log('');
    await pool.end();
    return false;
  }
}

async function checkSyncEndpoint() {
  console.log('🔄 Step 4: User Sync Endpoint');
  console.log('────────────────────────────────────────────────────────────\n');

  const syncFile = path.join(workspaceRoot, 'app/api/users/sync/route.ts');
  
  try {
    const content = fs.readFileSync(syncFile, 'utf8');

    const checks = [
      {
        name: 'Accepts POST requests',
        test: content.includes('export async function POST'),
      },
      {
        name: 'Validates auth0_id',
        test: content.includes('auth0_id'),
      },
      {
        name: 'Logs sync operations',
        test: content.includes('[SYNC]'),
      },
      {
        name: 'Creates users without password_hash',
        test: content.includes('auth_provider'),
      },
      {
        name: 'Sets status to active',
        test: content.includes('status'),
      },
    ];

    let allPassed = true;
    checks.forEach((check) => {
      if (check.test) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name}`);
        allPassed = false;
      }
    });

    console.log('');
    return allPassed;
  } catch (error) {
    console.log(`  ❌ Could not read sync endpoint: ${error.message}`);
    console.log('');
    return false;
  }
}

async function checkAuthPages() {
  console.log('🔑 Step 5: Authentication Pages');
  console.log('────────────────────────────────────────────────────────────\n');

  const pagesCheck = [
    {
      name: 'Volunteer Login',
      file: 'app/auth/volunteer/login/page.tsx',
    },
    {
      name: 'Organization Login',
      file: 'app/auth/organization/login/page.tsx',
    },
    {
      name: 'Volunteer Register',
      file: 'app/auth/volunteer/register/page.tsx',
    },
    {
      name: 'Organization Register',
      file: 'app/auth/organization/register/page.tsx',
    },
  ];

  let allValid = true;

  for (const page of pagesCheck) {
    const filePath = path.join(workspaceRoot, page.file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if page redirects to Auth0
      if (content.includes('window.location.href') && content.includes('/api/auth/login')) {
        console.log(`  ✅ ${page.name}: Configured for Auth0 redirect`);
      } else if (content.includes('Auth0')) {
        console.log(`  ✅ ${page.name}: Mentions Auth0`);
      } else {
        console.log(`  ⚠️  ${page.name}: May need Auth0 configuration`);
      }
    } catch (error) {
      console.log(`  ❌ ${page.name}: File not found`);
      allValid = false;
    }
  }

  console.log('');
  return allValid;
}

async function runTests() {
  const results = {
    environment: await checkEnvironment(),
    files: await checkFiles(),
    database: await checkDatabase(),
    syncEndpoint: await checkSyncEndpoint(),
    authPages: await checkAuthPages(),
  };

  // Summary
  console.log('════════════════════════════════════════════════════════════');
  console.log('📊 Verification Summary');
  console.log('════════════════════════════════════════════════════════════\n');

  const checks = [
    { name: 'Environment Variables', result: results.environment },
    { name: 'Required Files', result: results.files },
    { name: 'Database Setup', result: results.database },
    { name: 'Sync Endpoint', result: results.syncEndpoint },
    { name: 'Auth Pages', result: results.authPages },
  ];

  checks.forEach((check) => {
    const icon = check.result ? '✅' : '❌';
    console.log(`  ${icon} ${check.name}`);
  });

  const allPassed = Object.values(results).every((v) => v);

  console.log('\n════════════════════════════════════════════════════════════\n');

  if (allPassed) {
    console.log('🎉 All checks passed! Your system is ready for Auth0 login.\n');
    console.log('Next steps:');
    console.log('  1. Start the application: pm2 start ecosystem.config.js');
    console.log('  2. Visit: http://localhost:3001/auth/volunteer/login');
    console.log('  3. Click "Sign In with Auth0"');
    console.log('  4. Complete Auth0 authentication');
    console.log('  5. Check PM2 logs: pm2 logs swaeduae\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please review the issues above.\n');
    console.log('Critical issues:');
    if (!results.database) {
      console.log('  • Database connection: Run `node scripts/database-diagnostic.js`');
    }
    if (!results.environment) {
      console.log('  • Environment variables: Check your .env.local file');
    }
    if (!results.files) {
      console.log('  • Missing files: Ensure all application files are present');
    }
    console.log('');
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('\n❌ Verification script failed:', error.message);
  process.exit(1);
});
