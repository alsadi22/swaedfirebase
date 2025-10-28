#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'swaeduae_db',
};

console.log('🔧 Setting up SwaedUAE Database...');
console.log('📋 Configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
});

async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    // Test connection
    console.log('\n🔌 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Read and execute schema
    console.log('\n📄 Reading database schema...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded successfully!');
    
    console.log('\n🏗️  Executing database schema...');
    await client.query(schema);
    console.log('✅ Database schema created successfully!');
    
    // Test some basic queries
    console.log('\n🧪 Testing database queries...');
    
    // Test profiles table
    const profilesResult = await client.query('SELECT COUNT(*) FROM profiles');
    console.log(`✅ Profiles table: ${profilesResult.rows[0].count} records`);
    
    // Test organizations table
    const orgsResult = await client.query('SELECT COUNT(*) FROM organizations');
    console.log(`✅ Organizations table: ${orgsResult.rows[0].count} records`);
    
    // Test events table
    const eventsResult = await client.query('SELECT COUNT(*) FROM events');
    console.log(`✅ Events table: ${eventsResult.rows[0].count} records`);
    
    // Test a sample query similar to what the app uses
    const sampleQuery = `
      SELECT e.*, o.name as organization_name 
      FROM events e 
      LEFT JOIN organizations o ON e.organization_id = o.id 
      WHERE e.start_date >= CURRENT_DATE 
      ORDER BY e.start_date ASC 
      LIMIT 5
    `;
    
    const sampleResult = await client.query(sampleQuery);
    console.log(`✅ Sample query executed: ${sampleResult.rows.length} upcoming events found`);
    
    if (sampleResult.rows.length > 0) {
      console.log('📅 Upcoming events:');
      sampleResult.rows.forEach(event => {
        console.log(`   - ${event.title} (${event.start_date})`);
      });
    }
    
    client.release();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure your PostgreSQL server is running');
    console.log('   2. Update your .env.local file with correct database credentials');
    console.log('   3. Start your application with: pnpm dev');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   - Make sure PostgreSQL is installed and running');
      console.error('   - Check if the database server is accessible');
      console.error('   - Verify your database credentials in .env.local');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Please create it first:');
      console.error(`   CREATE DATABASE ${dbConfig.database};`);
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed:');
      console.error('   - Check your username and password in .env.local');
      console.error('   - Make sure the user has proper permissions');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(console.error);