#!/usr/bin/env node

/**
 * PostgreSQL Database Initialization Script
 * This script creates the database schema and populates it with sample data
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

// Database configuration
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'swaeduae_db',
}

console.log('🚀 Initializing PostgreSQL database...')
console.log('📋 Configuration:', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
})

const pool = new Pool(config)

// Database schema
const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  emirates_id VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  nationality VARCHAR(100),
  emirate VARCHAR(50),
  city VARCHAR(100),
  user_type VARCHAR(20) DEFAULT 'volunteer' CHECK (user_type IN ('volunteer', 'student', 'organization', 'admin', 'super_admin')),
  preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
  role VARCHAR(20) DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'student', 'organization', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  type VARCHAR(20) CHECK (type IN ('ngo', 'charity', 'government', 'private', 'community')),
  emirate VARCHAR(50),
  city VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  description TEXT,
  description_ar TEXT,
  website VARCHAR(255),
  logo_url TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  category VARCHAR(100),
  cover_image_url TEXT,
  event_type VARCHAR(20) DEFAULT 'one_time' CHECK (event_type IN ('one_time', 'recurring', 'multi_session')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location_type VARCHAR(20) DEFAULT 'physical' CHECK (location_type IN ('physical', 'virtual', 'hybrid')),
  location VARCHAR(255),
  location_address TEXT,
  emirate VARCHAR(50),
  city VARCHAR(100),
  volunteer_capacity INTEGER,
  current_volunteers INTEGER DEFAULT 0,
  student_only BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_type VARCHAR(50) DEFAULT 'participation',
  hours_completed DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_organization_id ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_profile_id ON event_registrations(profile_id);
CREATE INDEX IF NOT EXISTS idx_certificates_profile_id ON certificates(profile_id);
CREATE INDEX IF NOT EXISTS idx_certificates_event_id ON certificates(event_id);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

// Sample data
const sampleData = `
-- Insert sample organizations
INSERT INTO organizations (id, name, type, emirate, city, contact_email, description, verification_status, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'UAE Red Crescent', 'charity', 'Abu Dhabi', 'Abu Dhabi', 'info@redcrescent.ae', 'Humanitarian organization providing aid and support', 'approved', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Dubai Cares', 'charity', 'Dubai', 'Dubai', 'contact@dubaicares.ae', 'Education-focused charity organization', 'approved', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sharjah Volunteer Centre', 'government', 'Sharjah', 'Sharjah', 'volunteers@sharjah.ae', 'Government volunteer coordination center', 'approved', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample profiles
INSERT INTO profiles (id, email, full_name, role, is_active, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'admin@swaeduae.com', 'System Administrator', 'admin', true, true),
  ('550e8400-e29b-41d4-a716-446655440012', 'volunteer1@example.com', 'Ahmed Al Mansouri', 'volunteer', true, true),
  ('550e8400-e29b-41d4-a716-446655440013', 'student1@example.com', 'Fatima Al Zahra', 'student', true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO events (id, organization_id, title, description, category, start_date, end_date, start_time, end_time, location, status, is_published, volunteer_capacity) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'Beach Cleanup Drive', 'Join us for a community beach cleanup to protect our marine environment', 'Environment', '2024-02-15', '2024-02-15', '08:00', '12:00', 'Jumeirah Beach, Dubai', 'published', true, 50),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Education Workshop for Children', 'Interactive learning workshop for underprivileged children', 'Education', '2024-02-20', '2024-02-20', '14:00', '17:00', 'Dubai Community Center', 'published', true, 25),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440003', 'Food Distribution Drive', 'Distribute meals to families in need during Ramadan', 'Community Service', '2024-03-01', '2024-03-01', '18:00', '21:00', 'Sharjah Central Mosque', 'published', true, 30),
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440001', 'Blood Donation Campaign', 'Annual blood donation drive to support local hospitals', 'Health', '2024-03-10', '2024-03-10', '09:00', '15:00', 'Abu Dhabi Medical Center', 'published', true, 40)
ON CONFLICT (id) DO NOTHING;

-- Insert sample registrations
INSERT INTO event_registrations (event_id, profile_id, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440012', 'registered'),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440013', 'registered'),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440012', 'registered')
ON CONFLICT (event_id, profile_id) DO NOTHING;
`

async function initializeDatabase() {
  let client
  
  try {
    console.log('🔌 Connecting to PostgreSQL...')
    client = await pool.connect()
    
    console.log('✅ Connected successfully!')
    console.log('🏗️  Creating database schema...')
    
    // Execute schema creation
    await client.query(schema)
    console.log('✅ Schema created successfully!')
    
    console.log('📊 Inserting sample data...')
    await client.query(sampleData)
    console.log('✅ Sample data inserted successfully!')
    
    // Test queries
    console.log('🧪 Running test queries...')
    
    const profilesResult = await client.query('SELECT COUNT(*) as count FROM profiles')
    console.log(`📊 Profiles: ${profilesResult.rows[0].count}`)
    
    const orgsResult = await client.query('SELECT COUNT(*) as count FROM organizations')
    console.log(`🏢 Organizations: ${orgsResult.rows[0].count}`)
    
    const eventsResult = await client.query('SELECT COUNT(*) as count FROM events')
    console.log(`📅 Events: ${eventsResult.rows[0].count}`)
    
    const upcomingEvents = await client.query(`
      SELECT title, start_date, location, organization_id 
      FROM events 
      WHERE start_date >= CURRENT_DATE AND status = 'published' 
      ORDER BY start_date 
      LIMIT 5
    `)
    
    console.log('🔮 Upcoming Events:')
    upcomingEvents.rows.forEach(event => {
      console.log(`  📅 ${event.title} - ${event.start_date} at ${event.location}`)
    })
    
    console.log('🎉 Database initialization completed successfully!')
    console.log('🌐 Your SwaedUAE platform is ready with PostgreSQL!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure PostgreSQL is running and accessible at:')
      console.log(`   Host: ${config.host}:${config.port}`)
      console.log(`   Database: ${config.database}`)
      console.log(`   User: ${config.user}`)
    } else if (error.code === '28P01') {
      console.log('💡 Authentication failed. Check your PostgreSQL credentials in .env.local')
    } else if (error.code === '3D000') {
      console.log('💡 Database does not exist. Create it first or check the database name in .env.local')
    }
    
    process.exit(1)
  } finally {
    if (client) {
      client.release()
    }
    await pool.end()
  }
}

// Run the initialization
initializeDatabase()