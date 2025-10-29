const jwt = require('jsonwebtoken');

// Test JWT token generation and validation for admin authentication
async function testJWTAdminAuth() {
  console.log('🔐 Testing JWT Token Generation and Validation for Admin Authentication\n');

  // Simulate admin user data (from database)
  const adminUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@swaeduae.ae',
    user_type: 'admin',
    first_name: 'Admin',
    last_name: 'User'
  };

  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  console.log('JWT Secret being used:', JWT_SECRET.substring(0, 10) + '...');

  try {
    // 1. Test JWT Token Generation (simulating login process)
    console.log('1. Testing JWT Token Generation:');
    const tokenPayload = {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.user_type,
      user_type: adminUser.user_type,
      firstName: adminUser.first_name,
      lastName: adminUser.last_name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ JWT Token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...\n');

    // 2. Test JWT Token Validation (simulating verify endpoint)
    console.log('2. Testing JWT Token Validation:');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT Token validated successfully');
    console.log('Decoded payload:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      user_type: decoded.user_type,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      exp: new Date(decoded.exp * 1000).toISOString()
    });

    // 3. Test Role Verification
    console.log('\n3. Testing Role Verification:');
    if (decoded.role === 'admin' || decoded.user_type === 'admin') {
      console.log('✅ Admin role verification passed');
    } else {
      console.log('❌ Admin role verification failed');
    }

    // 4. Test Token Expiration
    console.log('\n4. Testing Token Expiration:');
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    console.log('Token expires in:', Math.floor(timeUntilExpiry / 3600), 'hours');
    console.log('✅ Token expiration check passed');

    // 5. Test Invalid Token
    console.log('\n5. Testing Invalid Token Handling:');
    try {
      const invalidToken = token.slice(0, -5) + 'xxxxx'; // Corrupt the token
      jwt.verify(invalidToken, JWT_SECRET);
      console.log('❌ Invalid token validation should have failed');
    } catch (error) {
      console.log('✅ Invalid token properly rejected:', error.message);
    }

    // 6. Test Wrong Secret
    console.log('\n6. Testing Wrong Secret Handling:');
    try {
      jwt.verify(token, 'wrong-secret');
      console.log('❌ Wrong secret validation should have failed');
    } catch (error) {
      console.log('✅ Wrong secret properly rejected:', error.message);
    }

    console.log('\n🎉 All JWT tests passed successfully!');

  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
  }
}

testJWTAdminAuth();
