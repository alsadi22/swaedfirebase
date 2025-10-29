import { NextRequest } from 'next/server';

// Define Auth0User interface
interface Auth0User {
  sub: string;
  email: string;
  name: string;
  user_type?: string;
}

// Database sync function
async function syncUserWithDatabase(user: Auth0User): Promise<void> {
  try {
    const response = await fetch(`${process.env.AUTH0_BASE_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth0_id: user.sub,
        email: user.email,
        name: user.name,
        user_type: user.user_type || 'student', // Default to student if not specified
      }),
    });

    if (!response.ok) {
      console.error('Failed to sync user with database:', response.statusText);
    }
  } catch (error) {
    console.error('Error syncing user with database:', error);
  }
}

// Simple Auth0 route handler for Next.js App Router
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip Auth0 handling for admin routes entirely
  if (pathname.includes('/admin')) {
    return new Response('Not handled by Auth0', { status: 404 });
  }
  
  // Handle different Auth0 routes
  // Only handle Auth0 login for non-admin routes
  if (pathname.includes('/login') && !pathname.includes('/admin/')) {
    // Get user_type and returnTo from query parameters
    const userType = url.searchParams.get('user_type');
    const returnTo = url.searchParams.get('returnTo');
    
    // Create state parameter to preserve user_type and returnTo
    const state = JSON.stringify({
      user_type: userType,
      returnTo: returnTo
    });
    
    // Redirect to Auth0 login
    const loginUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.AUTH0_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(`${process.env.AUTH0_BASE_URL}/api/auth/callback`)}&` +
      `scope=${encodeURIComponent(process.env.AUTH0_SCOPE || 'openid profile email')}&` +
      `state=${encodeURIComponent(state)}`;
    
    return Response.redirect(loginUrl);
  }
  
  if (pathname.includes('/logout')) {
    // Redirect to Auth0 logout
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3001';
    const logoutUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout?` +
      `client_id=${process.env.AUTH0_CLIENT_ID}&` +
      `returnTo=${encodeURIComponent(baseUrl)}`;
    
    return Response.redirect(logoutUrl);
  }
  
  if (pathname.includes('/callback')) {
    // Handle Auth0 callback
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code) {
      return new Response('Missing authorization code', { status: 400 });
    }
    
    // Parse state parameter to get user_type and returnTo
    let userType = null;
    let returnTo = '/dashboard';
    
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        userType = stateData.user_type;
        returnTo = stateData.returnTo || '/dashboard';
      } catch (error) {
        console.error('Error parsing state parameter:', error);
      }
    }
    
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          code: code,
          redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
        }),
      });
      
      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', await tokenResponse.text());
        return new Response('Token exchange failed', { status: 500 });
      }
      
      const tokens = await tokenResponse.json();
      
      // Get user info
      const userResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });
      
      if (!userResponse.ok) {
        console.error('User info fetch failed:', await userResponse.text());
        return new Response('User info fetch failed', { status: 500 });
      }
      
      const user = await userResponse.json();
      
      // Sync user with database, using userType from state if provided
      const auth0User: Auth0User = {
        sub: user.sub || '',
        email: user.email || '',
        name: user.name || '',
        user_type: userType || user.user_type || 'student'
      };
      
      console.log('[AUTH0-CALLBACK] Syncing user with database:', auth0User.email);
      await syncUserWithDatabase(auth0User);
      
      // Set session cookie and user_id cookie, then redirect to appropriate page
      const redirectUrl = `${process.env.AUTH0_BASE_URL}${returnTo}`;
      
      // Set multiple cookies
      const cookies = [
        `auth0-session=${tokens.id_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`,
        `user_id=${user.sub}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
      ];
      
      console.log('[AUTH0-CALLBACK] Redirecting to:', redirectUrl);
      
      const response = new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          'Set-Cookie': cookies.join(', ')
        }
      });
      
      return response;
      
    } catch (error) {
      console.error('Callback error:', error);
      return new Response('Authentication failed', { status: 500 });
    }
  }
  
  // Default response
  return new Response('Auth0 handler', { status: 200 });
}