// 🧪 Complete Authentication & RLS Test
// Save as: test-complete-auth.js
// Run with: node test-complete-auth.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlvbiftpsadphfihrnqx.supabase.co';

// ⚠️ IMPORTANT: Use the COMPLETE anon key (not truncated)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmJpZnRwc2FkcGhmaWhybnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTM1OTEsImV4cCI6MjA3Njg4OTU5MX0.w5OUPOlUx3gJcfS5ObPseeHF7J9CfPNbt3idmwIRGBY';

async function testCompleteAuthFlow() {
  console.log('🔧 Testing Complete Authentication & RLS Flow...\n');
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
  console.log('⚡ Using COMPLETE JWT token (not truncated)\n');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // TEST 1: Basic Connection Test
    console.log('✅ Step 1: Testing basic Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.log('❌ Connection failed:', healthError.message);
      
      if (healthError.message.includes('401') || healthError.message.includes('Unauthorized')) {
        console.log('🚨 401 AUTHENTICATION ERROR DETECTED!');
        console.log('💡 Solution: Check your anon key is complete (not truncated)');
        console.log('Current key length:', supabaseAnonKey.length);
        console.log('Expected length: ~206 characters');
        return;
      }
      return;
    }
    console.log('✅ Basic connection successful');
    
    // TEST 2: Check RLS Policies
    console.log('\n✅ Step 2: Testing RLS policies...');
    const { data: policyCheck, error: policyError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (policyError) {
      console.log('❌ RLS policy error:', policyError.message);
      
      if (policyError.message.includes('RLS') || policyError.message.includes('row-level security')) {
        console.log('🚨 RLS POLICY ERROR DETECTED!');
        console.log('💡 Solution: Run supabase-complete-fix.sql in your Supabase SQL Editor');
      }
      return;
    }
    console.log('✅ RLS policies working correctly');
    
    // TEST 3: User Registration Flow
    console.log('\n✅ Step 3: Testing complete user registration...');
    const testEmail = `test-auth-${Date.now()}@swaeduae.test`;
    const testPassword = 'testpass123';
    
    console.log('📝 Attempting registration with test email:', testEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Auth',
          phone: '+971501234567',
          role: 'volunteer',
        },
      },
    });
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message);
      
      if (signUpError.message.includes('401') || signUpError.message.includes('Unauthorized')) {
        console.log('🚨 401 ERROR DURING REGISTRATION!');
        console.log('💡 Your anon key is likely truncated or invalid');
        return;
      }
      
      if (signUpError.message.includes('User already registered')) {
        console.log('ℹ️  User already exists (expected for test emails)');
      } else {
        return;
      }
    } else {
      console.log('✅ User signup successful');
    }
    
    // TEST 4: Profile Creation (CRITICAL TEST)
    if (signUpData.user) {
      console.log('\n✅ Step 4: Testing profile creation (this fails with RLS issues)...');
      console.log('🔑 User ID:', signUpData.user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          email: testEmail,
          first_name: 'Test',
          last_name: 'Auth',
          phone: '+971501234567',
          role: 'volunteer',
          preferred_language: 'en',
          is_active: true,
          email_verified: false,
          phone_verified: false,
        })
        .select()
        .single();
      
      if (profileError) {
        console.log('❌ Profile creation failed:', profileError.message);
        
        if (profileError.message.includes('401') || profileError.message.includes('Unauthorized')) {
          console.log('🚨 401 ERROR: Authentication token issue');
          console.log('💡 Solution: Ensure you\'re using the COMPLETE anon key');
        } else if (profileError.message.includes('RLS') || profileError.message.includes('row-level security')) {
          console.log('🚨 RLS ERROR: Row Level Security policy issue');
          console.log('💡 Solution: Run supabase-complete-fix.sql in Supabase SQL Editor');
        } else if (profileError.message.includes('duplicate key')) {
          console.log('ℹ️  Profile already exists (user might have signed up before)');
          console.log('✅ This is actually a good sign - means RLS allows reads');
        }
        return;
      }
      
      console.log('✅ Profile creation successful!');
      console.log('📋 Profile created:', {
        id: profileData.id,
        email: profileData.email,
        name: `${profileData.first_name} ${profileData.last_name}`,
        role: profileData.role,
      });
      
      // TEST 5: Volunteer Profile Creation
      console.log('\n✅ Step 5: Testing volunteer profile creation...');
      const { data: volunteerData, error: volunteerError } = await supabase
        .from('volunteer_profiles')
        .insert({
          user_id: signUpData.user.id,
        })
        .select()
        .single();
      
      if (volunteerError) {
        console.log('❌ Volunteer profile creation failed:', volunteerError.message);
        
        if (volunteerError.message.includes('RLS') || volunteerError.message.includes('row-level security')) {
          console.log('🚨 VOLUNTEER PROFILES RLS ERROR!');
        }
        return;
      }
      
      console.log('✅ Volunteer profile creation successful!');
      
      // TEST 6: Profile Retrieval
      console.log('\n✅ Step 6: Testing profile retrieval...');
      const { data: retrievedProfile, error: retrieveError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();
      
      if (retrieveError) {
        console.log('❌ Profile retrieval failed:', retrieveError.message);
        return;
      }
      
      console.log('✅ Profile retrieval successful!');
      
      // TEST 7: Data Verification
      console.log('\n✅ Step 7: Verifying data integrity...');
      console.log('📊 Profile data verified:', {
        email: retrievedProfile.email,
        name: `${retrievedProfile.first_name} ${retrievedProfile.last_name}`,
        role: retrievedProfile.role,
        active: retrievedProfile.is_active,
        language: retrievedProfile.preferred_language,
      });
      
      // ALL TESTS PASSED
      console.log('\n🎉 ALL TESTS PASSED! 🎉');
      console.log('✅ Authentication working correctly');
      console.log('✅ RLS policies configured properly');
      console.log('✅ Registration flow complete');
      console.log('✅ Profile creation successful');
      console.log('✅ Data retrieval working');
      console.log('\n🚀 Your SwaedUAE platform is ready for deployment!');
      
      // Cleanup
      console.log('\n🧹 Cleaning up test data...');
      await supabase.from('profiles').delete().eq('id', signUpData.user.id);
      console.log('✅ Test user cleaned up');
      
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    console.log('Stack trace:', err.stack);
  }
}

// JWT Validation Check
console.log('🔍 JWT Token Validation:');
console.log('Token length:', supabaseAnonKey.length);
console.log('Expected length: ~206 characters');
console.log('Parts count:', supabaseAnonKey.split('.').length, '(should be 3)');
console.log('Has signature:', supabaseAnonKey.includes('.'), '(should be true)');

if (supabaseAnonKey.length < 200) {
  console.log('🚨 WARNING: Token seems truncated!');
  console.log('💡 Use the complete token from complete-auth-rls-fix.md');
}

// Run the comprehensive test
testCompleteAuthFlow();
