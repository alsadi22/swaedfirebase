# SwaedUAE Authentication System Documentation

## Overview

The SwaedUAE platform implements a comprehensive authentication system with multi-role support, social login integration, and UAE-specific validation requirements. The system is built using Firebase Authentication with Next.js 14 and TypeScript.

## Authentication Features

### 1. Multi-Method Authentication

#### Email/Password Authentication
- Standard email and password authentication
- Password complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

#### Social Login Providers
- **Google OAuth**: Sign in with Google account
- **Facebook OAuth**: Sign in with Facebook account
- **Apple Sign In**: Sign in with Apple ID

### 2. User Roles

The platform supports five distinct user roles with hierarchical permissions:

#### VOLUNTEER (Level 1)
- Browse and search events
- Apply to volunteer opportunities
- Track volunteer hours
- View and download certificates
- Manage personal profile

#### ORG_SUPERVISOR (Level 2)
- All volunteer permissions
- Oversee event attendance
- Approve volunteer check-ins
- View organization reports

#### ORG_ADMIN (Level 3)
- All supervisor permissions
- Create and manage events
- Review volunteer applications
- Issue certificates
- Manage organization settings
- Invite team members

#### ADMIN (Level 5)
- Verify organizations
- Approve events
- Manage users
- Access platform analytics
- Generate reports

#### SUPER_ADMIN (Level 6)
- Full system control
- System configuration
- Audit log access
- User role management

### 3. UAE-Specific Validation

#### Emirates ID Format
- Pattern: `784-YYYY-NNNNNNN-N`
- Example: `784-2000-1234567-1`
- Auto-formatting as user types

#### UAE Phone Number Format
- Pattern: `+971-XXXXXXXXX`
- Validates UAE country code and 9-digit number

### 4. Security Features

#### Email Verification
- Required for account activation
- Verification link sent to registered email
- Resend verification option available

#### Password Reset
- Secure password recovery flow
- Reset link sent via email
- Token-based authentication

#### Session Management
- JWT token-based authentication
- Secure session handling
- Automatic token refresh

## Authentication Pages

### 1. Login Page (`/auth/login`)

**Features:**
- Email/password login form
- Social login buttons
- "Remember me" option
- Forgot password link
- Link to registration

**Validation:**
- Email format validation
- Required field validation
- Error message display

### 2. Registration Page (`/auth/register`)

**Features:**
- Role selector (Volunteer or Organization)
- Separate registration forms based on role
- Social login for volunteers
- Email-only registration for organizations
- Terms and privacy policy acceptance

**Volunteer Registration Fields:**
- Full name
- Email address
- Password & confirmation
- Phone number (+971 format)
- Date of birth (minimum age 16)
- Nationality
- Gender
- Emirates ID (optional)

**Organization Registration Fields:**
- Organization name (English & Arabic)
- Email address
- Password & confirmation
- Phone number
- Website (optional)
- Description (minimum 50 characters)
- Trade license number
- Full address (street, city, emirate, P.O. box)

### 3. Forgot Password Page (`/auth/forgot-password`)

**Features:**
- Email input for password recovery
- Send reset link button
- Success confirmation
- Back to login link

### 4. Email Verification Page (`/auth/verify-email`)

**Features:**
- Verification status display
- Resend verification email button
- Instructions for email checking
- Continue to dashboard button

### 5. Dashboard Page (`/dashboard`)

**Features:**
- Role-specific dashboard views
- Protected route (requires authentication)
- Email verification requirement
- User statistics and metrics

**Dashboard Views by Role:**
- **Volunteer Dashboard**: Hours, events, certificates, rank
- **Organization Dashboard**: Active events, volunteers, hours contributed
- **Admin Dashboard**: Total users, organizations, events, system stats

## Components

### 1. SocialLoginButtons

Reusable component for social authentication.

**Usage:**
```tsx
<SocialLoginButtons
  mode="login" // or "register"
  onSuccess={() => router.push('/dashboard')}
  onError={(error) => setError(error)}
/>
```

### 2. RoleSelector

Visual role selection for registration.

**Usage:**
```tsx
<RoleSelector
  selectedRole={selectedRole}
  onRoleChange={setSelectedRole}
/>
```

### 3. EmiratesIDInput

Specialized input with auto-formatting for Emirates ID.

**Usage:**
```tsx
<EmiratesIDInput
  value={emiratesId}
  onChange={(value) => setValue('emiratesId', value)}
  error={errors.emiratesId?.message}
  required={false}
/>
```

### 4. ProtectedRoute

Wrapper component for route protection.

**Usage:**
```tsx
<ProtectedRoute
  requiredRoles={['ADMIN', 'SUPER_ADMIN']}
  redirectTo="/auth/login"
  requireEmailVerification={true}
>
  <YourComponent />
</ProtectedRoute>
```

### 5. UserMenu

Navigation dropdown for authenticated users.

**Features:**
- User profile display
- Role badge
- Quick navigation links
- Sign out button
- Role-specific menu items

## Authentication Context

### AuthContext Provider

Provides authentication state and methods throughout the application.

**Available Methods:**
- `signIn(email, password)`: Email/password login
- `signUp(email, password, userData)`: User registration
- `signInWithGoogle()`: Google OAuth
- `signInWithFacebook()`: Facebook OAuth
- `signInWithApple()`: Apple Sign In
- `signOut()`: User logout
- `resetPassword(email)`: Send password reset email
- `sendVerificationEmail()`: Resend verification email
- `refreshUser()`: Refresh user data from Firestore

**Available State:**
- `user`: User data from Firestore
- `firebaseUser`: Firebase Auth user object
- `loading`: Authentication loading state

## Middleware & Access Control

### Authentication Middleware (`lib/middleware/auth.ts`)

**Functions:**
- `hasRole(userRole, requiredRoles)`: Check if user has required role
- `isAdmin(userRole)`: Check admin privileges
- `isOrganizationMember(userRole)`: Check organization membership
- `isVolunteer(userRole)`: Check volunteer status
- `hasMinimumRoleLevel(userRole, minimumRole)`: Check role hierarchy
- `getAccessibleRoutes(userRole)`: Get allowed routes for role
- `canAccessRoute(userRole, route)`: Validate route access
- `getDefaultRoute(userRole)`: Get default redirect based on role

## Validation Schemas

### Form Validation with Zod

All forms use Zod schemas for type-safe validation:

```typescript
// Login validation
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Volunteer registration validation
const volunteerRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: nameSchema,
  phoneNumber: phoneSchema,
  dateOfBirth: z.date(),
  // ... more fields
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

## Error Handling

### Error Messages

User-friendly error messages for common scenarios:
- Invalid credentials
- Email already in use
- Weak password
- Network errors
- Invalid Emirates ID format
- Invalid phone number format

### Error Display

Errors are displayed using consistent alert components:
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
    <span className="text-sm">{error}</span>
  </div>
)}
```

## Security Best Practices

1. **Password Security**
   - Passwords hashed with bcrypt
   - Minimum complexity requirements
   - Never stored in plain text

2. **Session Security**
   - JWT tokens for session management
   - Secure HTTP-only cookies
   - Automatic token refresh

3. **Input Validation**
   - Client-side validation with Zod
   - Server-side validation in Cloud Functions
   - XSS protection through input sanitization

4. **Firebase Security Rules**
   - Role-based access control in Firestore
   - Secure Storage rules
   - Rate limiting (to be implemented)

5. **HTTPS Enforcement**
   - All communications over HTTPS
   - Secure credentials transmission
   - SSL/TLS certificate validation

## Testing

### Manual Testing Checklist

- [ ] Email/password registration
- [ ] Email/password login
- [ ] Google social login
- [ ] Facebook social login
- [ ] Apple social login
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Role-based access control
- [ ] Protected route redirects
- [ ] Emirates ID validation
- [ ] Phone number validation
- [ ] Form error handling
- [ ] User menu functionality
- [ ] Sign out functionality

### E2E Testing (To Be Implemented)

```typescript
// Example test
describe('Authentication Flow', () => {
  it('should register a new volunteer', async () => {
    await page.goto('/auth/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Test@123');
    // ... more test steps
  });
});
```

## Deployment Considerations

### Environment Variables

Required environment variables for authentication:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### Firebase Configuration

1. Enable authentication providers in Firebase Console
2. Configure OAuth redirect URLs
3. Set up email templates for verification
4. Configure password reset settings

## Future Enhancements

### Planned Features

1. **UAE Pass Integration**
   - Government authentication system
   - Emirates ID verification
   - Single sign-on

2. **Two-Factor Authentication**
   - SMS verification
   - Authenticator app support
   - Backup codes

3. **Biometric Authentication**
   - Fingerprint support
   - Face ID support
   - Mobile-specific authentication

4. **Account Linking**
   - Link multiple social accounts
   - Merge duplicate accounts
   - Account recovery options

5. **Enhanced Security**
   - Device management
   - Login history
   - Suspicious activity alerts

## Support & Documentation

### Getting Help

- **Developer Documentation**: `/docs/`
- **API Reference**: Firebase documentation
- **Support**: Contact development team

### Related Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Project README](./README.md)
- [Development Checklist](./CHECKLIST.md)

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintainer**: SwaedUAE Development Team
