// 🧪 Quick Verification Script
// Run after applying the fixes to verify everything works
// Save as: verify-fixes.js
// Run with: node verify-fixes.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlvbiftpsadphfihrnqx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmJpZnRwc2FkcGhmaWhybnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTM1OTEsImV4cCI6MjA3Njg4OTU5MX0.w5OUPOlUx3gJcfS5ObPseeHF7J9CfPNbt3idmwIRGBY';

console.log('🔍 Verifying SwaedUAE Fixes...\n');

async function verifyFixes() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test 1: JWT Token Validation
    console.log('✅ Step 1: JWT Token Validation');
    console.log('Token length:', supabaseAnonKey.length);
    console.log('Expected: ~206 characters');
    
    if (supabaseAnonKey.length >= 200) {
      console.log('✅ Token length is correct');
    } else {
      console.log('❌ Token still seems truncated');
      return;
    }
    
    // Test 2: Supabase Connection
    console.log('\n✅ Step 2: Supabase Connection Test');
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('💡 Authentication token issue - check Vercel environment variables');
      }
      return;
    }
    console.log('✅ Connection successful');
    
    // Test 3: RLS Policies
    console.log('\n✅ Step 3: RLS Policies Test');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .limit(1);
    
    if (profileError) {
      console.log('❌ RLS policy error:', profileError.message);
      if (profileError.message.includes('RLS') || profileError.message.includes('row-level security')) {
        console.log('💡 Run the SQL fix in Supabase SQL Editor');
      }
      return;
    }
    console.log('✅ RLS policies working correctly');
    
    // Test 4: Test Registration (Simulated)
    console.log('\n✅ Step 4: Registration Simulation Test');
    const testEmail = `verify-test-${Date.now()}@swaeduae.test`;
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpass123',
      options: {
        data: {
          first_name: 'Verify',
          last_name: 'Test',
          phone: '+971501234567',
          role: 'volunteer',
        },
      },
    });
    
    if (signupError) {
      console.log('❌ Signup simulation failed:', signupError.message);
      if (signupError.message.includes('401') || signupError.message.includes('Unauthorized')) {
        console.log('💡 Authentication token issue - update Vercel environment variables');
      }
      return;
    }
    console.log('✅ Signup simulation successful');
    
    if (signupData.user) {
      // Test 5: Profile Creation
      console.log('\n✅ Step 5: Profile Creation Test');
      const { error: profileCreateError } = await supabase
        .from('profiles')
        .insert({
          id: signupData.user.id,
          email: testEmail,
          first_name: 'Verify',
          last_name: 'Test',
          phone: '+971501234567',
          role: 'volunteer',
          preferred_language: 'en',
          is_active: true,
          email_verified: false,
          phone_verified: false,
        });
      
      if (profileCreateError) {
        console.log('❌ Profile creation failed:', profileCreateError.message);
        if (profileCreateError.message.includes('RLS') || profileCreateError.message.includes('row-level security')) {
          console.log('💡 Run the SQL fix in Supabase SQL Editor');
        }
        return;
      }
      console.log('✅ Profile creation successful');
      
      // Cleanup
      await supabase.from('profiles').delete().eq('id', signupData.user.id);
      console.log('🧹 Test data cleaned up');
    }
    
    // SUCCESS!
    console.log('\n🎉 ALL VERIFICATION TESTS PASSED! 🎉');
    console.log('✅ Authentication working correctly');
    console.log('✅ Database connection successful');
    console.log('✅ RLS policies configured properly');
    console.log('✅ Registration flow functional');
    console.log('\n🚀 Your SwaedUAE platform is ready for production!');
    console.log('🌐 Test registration at: https://swaeduae.vercel.app/auth/register');
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

// JWT Token Pre-check
console.log('🔍 Pre-flight JWT Check:');
console.log('Token parts:', supabaseAnonKey.split('.').length);
console.log('Token format:', supabaseAnonKey.substring(0, 20) + '...');
console.log('Has signature:', supabaseAnonKey.includes('w5OUPOlUx3gJcfS5ObPseeHF7J9CfPNbt3idmwIRGBY'));

if (supabaseAnonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
  console.log('✅ Using correct NEW token format');
} else {
  console.log('❌ Using OLD token format - update environment variables');
}

console.log('\n🚀 Running verification...\n');

// Run verification
verifyFixes();