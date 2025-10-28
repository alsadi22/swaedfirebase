# Auth0 Configuration Guide

This guide explains how to configure Auth0 to handle user types (volunteer/organization) and store them as user metadata.

## 1. Create Login Action

### Step 1: Navigate to Actions
1. Go to Auth0 Dashboard
2. Navigate to **Actions** > **Flows**
3. Click on **Login** flow

### Step 2: Create New Action
1. Click **Add Action** (+ button)
2. Select **Build Custom**
3. Name: `Handle User Type`
4. Trigger: `Pre User Registration`

### Step 3: Action Code
Replace the default code with:

```javascript
/**
 * Handler that will be called during the execution of a PreUserRegistration flow.
 * 
 * @param {Event} event - Details about the context and user that is attempting to register.
 * @param {PreUserRegistrationAPI} api - Interface whose methods can be used to change the behavior of the registration.
 */
exports.onExecutePreUserRegistration = async (event, api) => {
  console.log('Pre User Registration event:', JSON.stringify(event, null, 2));
  
  // Try to get user_type from different possible sources
  let userType = null;
  
  // Check if user_type is in the request body (form data)
  if (event.request && event.request.body && event.request.body.user_type) {
    userType = event.request.body.user_type;
  }
  // Check if user_type is in query parameters
  else if (event.request && event.request.query && event.request.query.user_type) {
    userType = event.request.query.user_type;
  }
  // Check if user_type is in user metadata
  else if (event.user && event.user.user_metadata && event.user.user_metadata.user_type) {
    userType = event.user.user_metadata.user_type;
  }
  // Check if user_type is in app metadata
  else if (event.user && event.user.app_metadata && event.user.app_metadata.user_type) {
    userType = event.user.app_metadata.user_type;
  }
  
  console.log('Detected user_type:', userType);
  
  if (userType) {
    // Set user metadata
    api.user.setUserMetadata('user_type', userType);
    
    // Set app metadata for easier access
    api.user.setAppMetadata('user_type', userType);
    
    // Assign role based on user type
    if (userType === 'student') {
      api.user.setAppMetadata('role', 'student');
    } else if (userType === 'volunteer') {
      api.user.setAppMetadata('role', 'volunteer');
    } else if (userType === 'organization') {
      api.user.setAppMetadata('role', 'organization');
    }
    
    console.log('User metadata and role set successfully for user_type:', userType);
  } else {
    console.log('No user_type found in request, skipping metadata assignment');
  }
};
  
  console.log('Login attempt with user_type:', userType);
  
  if (userType && (userType === 'volunteer' || userType === 'organization')) {
    // Set the user_type in user metadata (editable by user)
    api.user.setUserMetadata('user_type', userType);
    
    // Also set it in app metadata (not editable by user, more secure)
    api.user.setAppMetadata('user_type', userType);
    
    console.log('Set user_type metadata:', userType);
  } else if (!event.user.user_metadata?.user_type && !event.user.app_metadata?.user_type) {
    // If no user_type is provided and user doesn't have one set, default to volunteer
    api.user.setUserMetadata('user_type', 'volunteer');
    api.user.setAppMetadata('user_type', 'volunteer');
    
    console.log('Set default user_type: volunteer');
  }
  
  // Optional: Add custom claims to the token
  if (event.user.app_metadata?.user_type) {
    api.idToken.setCustomClaim('user_type', event.user.app_metadata.user_type);
    api.accessToken.setCustomClaim('user_type', event.user.app_metadata.user_type);
  }
};
```

### Step 4: Deploy Action
1. Click **Deploy**
2. The action is now available to add to flows

## 2. Add Action to Login Flow

### Step 1: Navigate to Login Flow
1. Go to **Actions** > **Flows**
2. Click on **Login** flow

### Step 2: Add Action to Flow
1. Find your `Set User Type Metadata` action in the right panel
2. Drag it into the flow (typically after the **Start** node)
3. Click **Apply** to save the flow

## 3. Application Configuration

### Step 1: Application Settings
In your Auth0 application settings, configure:

**Allowed Callback URLs:**
```
http://localhost:3001/api/auth/callback,
https://yourdomain.com/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3001,
https://yourdomain.com
```

**Allowed Web Origins:**
```
http://localhost:3001,
https://yourdomain.com
```

### Step 2: Advanced Settings
- **Grant Types:** Ensure `Authorization Code` is enabled
- **Token Endpoint Authentication Method:** `Post`

## 4. Test the Configuration

### Step 1: Test Volunteer Login
Navigate to:
```
http://localhost:3001/api/auth/login?user_type=volunteer&screen_hint=signup
```

### Step 2: Test Organization Login
Navigate to:
```
http://localhost:3001/api/auth/login?user_type=organization&screen_hint=signup
```

### Step 3: Verify User Metadata
After login, check the user profile in Auth0 dashboard:
1. Go to **User Management** > **Users**
2. Find the test user
3. Check the **Metadata** section for `user_type`

## 5. Application Integration

The user metadata will be available in your Next.js application through the Auth0 user object:

```javascript
import { useUser } from '@auth0/nextjs-auth0/client';

function MyComponent() {
  const { user, error, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  
  if (user) {
    // Access user type from custom claims
    const userType = user['user_type'];
    console.log('User type:', userType);
    
    // Or access from user metadata (if included in token)
    const userMetadata = user.user_metadata;
    console.log('User metadata:', userMetadata);
  }
  
  return <div>Welcome {user?.name}</div>;
}
```

## 6. Troubleshooting

### Common Issues:
1. **Action not triggering:** Ensure the action is properly added to the Login flow
2. **Metadata not appearing:** Check that the action code is deployed and error-free
3. **Custom claims not in token:** Verify the custom claim names and ensure they're set correctly

### Debug Steps:
1. Check Auth0 logs in **Monitoring** > **Logs**
2. Use `console.log` in your action for debugging
3. Test with different user_type values

## 7. Security Considerations

- Use `app_metadata` for sensitive data that users shouldn't modify
- Use `user_metadata` for data that users can edit
- Validate `user_type` values to prevent injection
- Consider rate limiting on login endpoints

## Next Steps

After completing this configuration:
1. Test the login flows with both user types
2. Verify that user metadata is correctly stored
3. Update your application to use the user type information
4. Implement role-based access control based on user types