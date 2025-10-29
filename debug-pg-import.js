#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

console.log('🔍 Debugging PostgreSQL Module Import');
console.log('=====================================');

// Check Node.js version
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Check if we're in server environment
console.log('Window object:', typeof window);
console.log('Process type:', typeof process);

console.log('\n📦 Checking PostgreSQL module...');

try {
  // Try to require pg module
  console.log('Attempting to require pg...');
  const pg = require('pg');
  console.log('✅ PostgreSQL module loaded successfully!');
  console.log('pg.Pool available:', typeof pg.Pool);
  console.log('pg.Client available:', typeof pg.Client);
  
  // Try to create a pool
  console.log('\n🏊 Testing Pool creation...');
  const pool = new pg.Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: String(process.env.POSTGRES_PASSWORD || ''),
    database: process.env.POSTGRES_DB || 'swaeduae',
    min: 1,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  console.log('✅ Pool created successfully!');
  
  // Test connection
  console.log('\n🔌 Testing database connection...');
  const client = await pool.connect();
  console.log('✅ Database connection successful!');
  
  const result = await client.query('SELECT NOW() as current_time');
  console.log('✅ Query executed successfully:', result.rows[0]);
  
  client.release();
  await pool.end();
  
} catch (error) {
  console.error('❌ PostgreSQL module error:', error.message);
  console.error('Error code:', error.code);
  console.error('Error stack:', error.stack);
  
  // Check if it's a module not found error
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('\n🔍 Checking module installation...');
    const fs = require('fs');
    const path = require('path');
    
    const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'pg');
    console.log('Checking path:', nodeModulesPath);
    console.log('pg module exists:', fs.existsSync(nodeModulesPath));
    
    if (fs.existsSync(nodeModulesPath)) {
      const packagePath = path.join(nodeModulesPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log('pg version:', packageInfo.version);
      }
    }
  }
}

console.log('\n🌍 Environment Variables:');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('NODE_ENV:', process.env.NODE_ENV);