# SwaedUAE Authentication & Security Workflows

## Table of Contents
1. [Authentication Overview](#authentication-overview)
2. [Volunteer Authentication](#volunteer-authentication)
3. [Organization Authentication](#organization-authentication)
4. [Admin Authentication](#admin-authentication)
5. [Security Measures](#security-measures)
6. [Session Management](#session-management)
7. [Password Policies](#password-policies)
8. [Two-Factor Authentication](#two-factor-authentication)

---

## Authentication Overview

### Supported Authentication Methods

```
┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATION METHODS BY ROLE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  VOLUNTEERS:                                                 │
│    ✅ Email + Password                                       │
│    ✅ Facebook OAuth                                         │
│    ✅ Google OAuth                                           │
│    ✅ Apple ID                                               │
│    🔜 UAE Pass (future)                                      │
│                                                              │
│  ORGANIZATIONS (Admin & Supervisors):                        │
│    ✅ Email + Password                                       │
│    ❌ No Social Login                                        │
│    ❌ No UAE Pass                                            │
│    ⚠️  2FA Recommended                                       │
│                                                              │
│  ADMINS (Super Admin, Admin, Operator):                      │
│    ✅ Email + Password                                       │
│    ❌ No Social Login                                        │
│    ✅ Mandatory 2FA                                          │
│    ✅ IP Whitelisting                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow Architecture

```
┌──────────────┐
│   Client     │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. Login Request
       │ (email, password)
       ↓
┌──────────────┐
│  API Route   │
│  /api/auth   │
└──────┬───────┘
       │
       │ 2. Validate Credentials
       ↓
┌──────────────┐
│   Database   │
│  (Prisma)    │
└──────┬───────┘
       │
       │ 3. bcrypt Compare
       ↓
┌──────────────┐
│  Password    │
│  Verification│
└──────┬───────┘
       │
       │ 4. Generate JWT
       ↓
┌──────────────┐
│  JWT Token   │
│  Generation  │
└──────┬───────┘
       │
       │ 5. Set HTTP-only Cookie
       ↓
┌──────────────┐
│   Response   │
│  + Redirect  │
└──────────────┘
```

---

## Volunteer Authentication

### Registration Flow (`/volunteer/register`)

**Step 1: Account Creation**
```typescript
POST /api/auth/register

Request Body:
{
  email: string,
  password: string,
  confirmPassword: string,
  firstName: string,
  lastName: string,
  role: "VOLUNTEER"
}

Validation:
- Email must be unique
- Email format validation
- Password minimum 8 characters
- Password must match confirmPassword
- Names required
```

**Step 2: Personal Information (Optional)**
```typescript
PUT /api/users/profile

Request Body:
{
  emiratesId?: string,    // Format: 784-XXXX-XXXXXXX-X
  phone?: string,
  dateOfBirth?: Date,
  profilePicture?: File
}

Validation:
- Emirates ID format check
- Phone number format
- Date of birth (check if minor)
```

**Step 3: Minor Handling**
```typescript
// If age < 18
POST /api/auth/guardian-consent

Request Body:
{
  guardianName: string,
  guardianRelationship: string,
  guardianContact: string,
  guardianEmiratesId: string,
  guardianEmail: string,
  digitalSignature: string
}

Process:
1. Create guardian record
2. Send verification email to guardian
3. Link guardian to minor volunteer
4. Require guardian approval before activation
```

**Step 4: Email Verification**
```typescript
POST /api/auth/send-verification

Process:
1. Generate unique verification token
2. Create verification record in database
3. Send email with verification link
4. Token expires in 24 hours

Email Content:
- Subject: "Verify your SwaedUAE account"
- Link: https://swaeduae.ae/verify-email?token=XXXXXX
- Expiry notice
```

**Step 5: Email Verification Confirmation**
```typescript
GET /api/auth/verify-email?token=XXXXXX

Process:
1. Validate token exists and not expired
2. Update user status: PENDING → ACTIVE
3. Delete verification token
4. Send welcome email
5. Auto-login user (optional)
```

### Login Flow (`/volunteer/login`)

**Standard Login Process:**
```typescript
POST /api/auth/login

Request Body:
{
  email: string,
  password: string,
  rememberMe?: boolean
}

Process:
1. Find user by email
2. Check if email verified (status = ACTIVE)
3. Compare password using bcrypt
4. Generate JWT access token (7-day expiration)
5. Generate JWT refresh token (30-day expiration)
6. Set HTTP-only cookies
7. Return user data + redirect URL

Response:
{
  success: true,
  user: {
    id: string,
    email: string,
    role: "VOLUNTEER",
    firstName: string,
    lastName: string
  },
  redirectUrl: "/volunteer/dashboard"
}
```

**Social Login (OAuth 2.0):**

**Google OAuth:**
```typescript
GET /api/auth/google

Process:
1. Redirect to Google OAuth consent screen
2. User authorizes application
3. Google redirects back with auth code
4. Exchange code for access token
5. Fetch user profile from Google
6. Check if user exists by email
7. If exists: Login
8. If not: Create new user with VOLUNTEER role
9. Generate JWT tokens
10. Set cookies and redirect
```

**Facebook OAuth:**
```typescript
GET /api/auth/facebook

Process:
1. Redirect to Facebook login dialog
2. User authorizes application
3. Facebook redirects with auth code
4. Exchange code for access token
5. Fetch user profile from Facebook Graph API
6. Check if user exists by email
7. If exists: Login
8. If not: Create new user
9. Generate tokens and redirect
```

**Apple ID:**
```typescript
GET /api/auth/apple

Process:
1. Initialize Sign in with Apple flow
2. User authenticates with Apple ID
3. Receive Apple identity token
4. Verify token signature
5. Extract user email (may be private relay)
6. Check if user exists
7. Create or login user
8. Generate tokens and redirect
```

**UAE Pass (Future Integration):**
```typescript
GET /api/auth/uaepass

Planned Process:
1. Redirect to UAE Pass authentication
2. User authenticates with Emirates ID
3. Receive verified user data
4. Create/login user with verified status
5. Mark Emirates ID as verified
6. Generate tokens and redirect
```

### Password Recovery Flow

**Step 1: Request Reset**
```typescript
POST /api/auth/forgot-password

Request Body:
{
  email: string
}

Process:
1. Check if user exists
2. Generate secure reset token (crypto.randomBytes)
3. Save token with 1-hour expiry
4. Send reset email
5. Return success (even if email not found - security)

Email Content:
- Subject: "Reset your SwaedUAE password"
- Link: https://swaeduae.ae/reset-password?token=XXXXXX
- Token expires in 1 hour
- Ignore if didn't request
```

**Step 2: Reset Password**
```typescript
POST /api/auth/reset-password

Request Body:
{
  token: string,
  newPassword: string,
  confirmPassword: string
}

Process:
1. Validate token exists and not expired
2. Validate password strength
3. Validate passwords match
4. Hash new password with bcrypt
5. Update user password
6. Delete reset token
7. Invalidate all existing sessions
8. Send password changed confirmation email
9. Redirect to login
```

### Failed Login Handling

```typescript
POST /api/auth/login

Failed Attempt Tracking:
1. Increment failed_attempts counter
2. Log IP address and timestamp
3. After 5 failed attempts:
   - Lock account for 15 minutes
   - Send security alert email
4. After 10 failed attempts:
   - Suspend account (status = SUSPENDED)
   - Send admin notification
   - Require admin unlock or email verification
```

---

## Organization Authentication

### Registration Flow (`/organization/register`)

**Step 1: Organization Account Creation**
```typescript
POST /api/auth/register-organization

Request Body:
{
  email: string,
  password: string,
  confirmPassword: string,
  organizationName: string,
  organizationDescription: string,
  category: string,
  phoneNumber: string
}

Validation:
- Email unique
- Password strength requirements
- Organization name unique
- Phone number required
```

**Step 2: Legal & Verification Information**
```typescript
PUT /api/organizations/verification-info

Request Body:
{
  licenseNumber: string,
  physicalAddress: {
    street: string,
    city: string,
    emirate: string,
    poBox: string,
    country: "UAE"
  },
  registrationDate: Date,
  websiteUrl?: string
}

Validation:
- License number format
- UAE address validation
- Registration date in past
```

**Step 3: Document Upload**
```typescript
POST /api/organizations/upload-documents

Request (multipart/form-data):
- logo: File (PNG/JPG, max 5MB)
- tradeLicense: File (PDF, max 10MB)
- proofOfAddress: File (PDF, max 10MB)
- additionalDocs: File[] (optional)

Process:
1. Validate file types and sizes
2. Scan for malware (optional)
3. Upload to S3 or local storage
4. Generate unique file names
5. Save file references in database
6. Return file URLs
```

**Step 4: Verification Queue**
```typescript
POST /api/organizations/submit-verification

Process:
1. Set organization status: PENDING_VERIFICATION
2. Send confirmation email to organization
3. Send notification to admins
4. Add to admin verification queue
5. Set estimated review time (3-5 business days)

Organization receives:
- Confirmation email
- Application reference number
- Expected review timeline
- What happens next
```

### Login Flow (`/organization/login`)

```typescript
POST /api/auth/login

Request Body:
{
  email: string,
  password: string,
  role: "ORG_ADMIN"
}

Process:
1. Validate credentials
2. Check verification status
3. If PENDING_VERIFICATION:
   - Allow limited access
   - Show banner: "Verification Pending"
   - Redirect to /organization/dashboard (limited features)
4. If VERIFIED:
   - Full access granted
   - Redirect to /organization/dashboard
5. If SUSPENDED:
   - Deny access
   - Show error: "Account suspended. Contact support."
6. If REJECTED:
   - Deny access
   - Show rejection reason
   - Allow re-application

Token Generation:
- Access token: 7 days
- Refresh token: 30 days
- Role: ORG_ADMIN
```

### Organization Team Member Invitation

**Invite Team Member (by ORG_ADMIN):**
```typescript
POST /api/organizations/invite-member

Request Body:
{
  email: string,
  firstName: string,
  lastName: string,
  role: "ORG_SUPERVISOR",
  permissions: {
    canCreateEvents: boolean,
    canEditEvents: boolean,
    canApproveApplications: boolean,
    canCheckInVolunteers: boolean,
    canIssueCertificates: boolean,
    canViewAnalytics: boolean
  },
  department?: string
}

Process:
1. Check if inviter is ORG_ADMIN
2. Generate invitation token
3. Create pending user record
4. Send invitation email
5. Token expires in 7 days

Invitation Email:
- Organization name
- Invitation link
- Role description
- Expires in 7 days
```

**Accept Invitation:**
```typescript
POST /api/auth/accept-invitation

Request Body:
{
  token: string,
  password: string,
  confirmPassword: string
}

Process:
1. Validate invitation token
2. Create user account
3. Set role: ORG_SUPERVISOR
4. Link to parent organization
5. Apply assigned permissions
6. Delete invitation token
7. Auto-login user
8. Redirect to /org/dashboard
```

---

## Admin Authentication

### Admin Account Creation (by Super Admin)

**Create Admin Account:**
```typescript
POST /api/admin/operators/create

Request Body:
{
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  role: "ADMIN" | "SUPER_ADMIN" | "OPERATOR",
  department?: string,
  permissions?: string[]  // For OPERATOR role
}

Process:
1. Only SUPER_ADMIN can execute
2. Generate temporary password (crypto.randomBytes)
3. Create user account with status: PENDING_ACTIVATION
4. Send invitation email with temp password
5. Require password change on first login
6. Require 2FA setup on first login
```

**Admin Activation (First Login):**
```typescript
POST /api/auth/admin/first-login

Request Body:
{
  email: string,
  temporaryPassword: string,
  newPassword: string,
  confirmPassword: string
}

Process:
1. Validate temporary password
2. Validate new password strength (min 12 chars)
3. Update password
4. Set status: ACTIVE
5. Force 2FA setup (cannot proceed without it)
6. Redirect to 2FA setup page
```

### Admin Login Flow (`/admin/dashboard`)

**Step 1: Email & Password**
```typescript
POST /api/auth/admin/login

Request Body:
{
  email: string,
  password: string
}

Process:
1. Validate credentials
2. Check if admin role (ADMIN/SUPER_ADMIN/OPERATOR)
3. Check account status (ACTIVE required)
4. Check IP address:
   - If whitelisted → proceed
   - If blacklisted → deny access
   - If unknown → send security alert to Super Admin
5. If valid → generate temporary session token
6. Require 2FA verification (next step)
7. DO NOT grant full access yet
```

**Step 2: Mandatory 2FA Verification**
```typescript
POST /api/auth/admin/verify-2fa

Request Body:
{
  sessionToken: string,
  twoFactorCode: string  // 6-digit code
}

Process:
1. Validate session token (5-minute expiry)
2. Verify 2FA code from authenticator app
3. If valid:
   - Generate admin JWT tokens
   - Access token: 4 hours (shorter than users)
   - Refresh token: 8 hours
   - Log login in audit trail
   - Redirect based on role:
     * SUPER_ADMIN → /admin/super
     * ADMIN → /admin/dashboard
     * OPERATOR → assigned dashboard
```

### Admin Security Features

**IP Whitelisting:**
```typescript
// Check IP on every admin login
POST /api/auth/admin/check-ip

Process:
1. Get requester IP address
2. Check against whitelist in database
3. If not whitelisted:
   - Send security alert to Super Admin
   - Require additional verification:
     * Email code
     * 2FA code
     * Answer security question
4. Log IP attempt in audit trail
```

**Session Monitoring:**
```typescript
// Track admin sessions
POST /api/auth/admin/track-session

Tracked Data:
- Session ID
- User ID
- IP address
- User agent
- Login timestamp
- Last activity timestamp
- Session status (active/expired)

Auto-Logout Triggers:
- 30 minutes of inactivity
- 4 hours absolute limit
- IP address change
- Suspicious activity detected
```

**Failed Login Monitoring:**
```typescript
// More strict than regular users
POST /api/auth/admin/login

Failed Attempt Handling:
1. After 3 failed attempts:
   - Lock account for 30 minutes
   - Send alert to Super Admin
2. After 5 failed attempts:
   - Suspend account
   - Require Super Admin unlock
   - Log security incident
```

---

## Security Measures

### Password Hashing

```typescript
// Password hashing with bcrypt
import bcrypt from 'bcryptjs';

// Registration
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Login
const isValid = await bcrypt.compare(password, user.hashedPassword);
```

### JWT Token Implementation

```typescript
// Generate JWT tokens
import jwt from 'jsonwebtoken';

// Access Token
const accessToken = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }  // 7 days for volunteers/orgs, 4h for admins
);

// Refresh Token
const refreshToken = jwt.sign(
  {
    userId: user.id,
    type: 'refresh'
  },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '30d' }  // 30 days for volunteers/orgs, 8h for admins
);

// Verify Token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### HTTP-Only Cookies

```typescript
// Set secure cookies
res.setHeader('Set-Cookie', [
  `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
  `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/api/auth/refresh`
]);
```

### Rate Limiting

```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit';

// Login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests
  message: 'Too many requests. Please try again later.',
});
```

### Input Sanitization

```typescript
// Sanitize user input
import validator from 'validator';

function sanitizeInput(input: string): string {
  return validator.escape(validator.trim(input));
}

// Email validation
function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

// Emirates ID validation
function validateEmiratesId(id: string): boolean {
  const pattern = /^784-\d{4}-\d{7}-\d$/;
  return pattern.test(id);
}
```

### CSRF Protection

```typescript
// CSRF token generation
import { randomBytes } from 'crypto';

function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// Validate CSRF token
function validateCsrfToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}
```

---

## Session Management

### Session Storage

```typescript
// Session data stored in JWT
interface SessionData {
  userId: string;
  email: string;
  role: Role;
  iat: number;  // Issued at
  exp: number;  // Expires at
}

// Optional: Server-side session storage (Redis)
interface ServerSession {
  sessionId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}
```

### Token Refresh Flow

```typescript
POST /api/auth/refresh

Request:
- Refresh token from HTTP-only cookie

Process:
1. Verify refresh token
2. Check if token in blacklist
3. Check user still exists and active
4. Generate new access token
5. Optionally rotate refresh token
6. Set new cookies
7. Return success

Response:
{
  success: true,
  expiresAt: timestamp
}
```

### Logout Flow

```typescript
POST /api/auth/logout

Process:
1. Get access and refresh tokens
2. Add tokens to blacklist (Redis)
3. Clear HTTP-only cookies
4. Invalidate server-side session
5. Log logout event
6. Redirect to login page

Response:
{
  success: true,
  redirectUrl: "/login"
}
```

---

## Password Policies

### Password Requirements

**Volunteers & Organizations:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Admins:**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot reuse last 5 passwords
- Expires every 90 days

```typescript
// Password validation
function validatePassword(password: string, isAdmin: boolean = false): boolean {
  const minLength = isAdmin ? 12 : 8;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= minLength;

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
}
```

---

## Two-Factor Authentication

### 2FA Setup Flow (`/auth/setup-2fa`)

```typescript
POST /api/auth/setup-2fa

Process:
1. Generate secret key
2. Create QR code with otpauth URL
3. Return QR code and secret to user
4. User scans QR with authenticator app

QR Code Data:
otpauth://totp/SwaedUAE:user@email.com?secret=XXXXXX&issuer=SwaedUAE
```

**Verify 2FA Setup:**
```typescript
POST /api/auth/verify-2fa-setup

Request Body:
{
  secret: string,
  code: string  // 6-digit code from app
}

Process:
1. Verify code against secret
2. If valid:
   - Save secret to user account
   - Enable 2FA for user
   - Generate 10 backup codes
   - Return backup codes (one-time display)
3. If invalid:
   - Return error, allow retry
```

### 2FA Login Verification

```typescript
POST /api/auth/verify-2fa-login

Request Body:
{
  sessionToken: string,  // From initial login
  code: string  // 6-digit code
}

Process:
1. Retrieve user's 2FA secret
2. Verify code using TOTP algorithm
3. Check if code already used (prevent replay)
4. If valid:
   - Complete login process
   - Generate full JWT tokens
   - Redirect to dashboard
5. If invalid:
   - Increment failed 2FA attempts
   - After 5 failed attempts, lock account
```

### Backup Codes

```typescript
// Generate backup codes
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Use backup code
POST /api/auth/use-backup-code

Request Body:
{
  sessionToken: string,
  backupCode: string
}

Process:
1. Retrieve user's backup codes
2. Hash provided code and compare
3. If match found:
   - Mark code as used
   - Complete login
   - Warn user: "X backup codes remaining"
4. Suggest regenerating codes if low
```

---

## Audit Trail

### Login Activity Logging

```typescript
// Log all authentication events
interface AuthAuditLog {
  id: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PASSWORD_RESET' | '2FA_ENABLED';
  ipAddress: string;
  userAgent: string;
  location?: string;  // IP geolocation
  success: boolean;
  failureReason?: string;
  timestamp: Date;
}

// Example: Log failed login
await prisma.authAuditLog.create({
  data: {
    userId: user.id,
    action: 'FAILED_LOGIN',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    success: false,
    failureReason: 'Invalid password',
    timestamp: new Date()
  }
});
```

### Admin Action Logging

```typescript
// Log all admin actions
interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: 'USER' | 'ORGANIZATION' | 'EVENT' | 'CERTIFICATE';
  targetId: string;
  changes: JSON;  // Before/after values
  ipAddress: string;
  timestamp: Date;
}
```

---

## Security Best Practices

### Implementation Checklist

✅ **Authentication:**
- [x] Strong password requirements
- [x] Bcrypt password hashing (10 rounds)
- [x] JWT token-based sessions
- [x] HTTP-only cookies for tokens
- [x] Email verification
- [x] 2FA for admins (mandatory)
- [x] 2FA for orgs (recommended)

✅ **Authorization:**
- [x] Role-based access control (RBAC)
- [x] Route protection middleware
- [x] API endpoint authorization
- [x] Principle of least privilege

✅ **Data Protection:**
- [x] HTTPS/SSL encryption
- [x] Input sanitization
- [x] SQL injection protection (Prisma)
- [x] XSS protection
- [x] CSRF tokens

✅ **Monitoring:**
- [x] Failed login attempt tracking
- [x] IP address logging
- [x] Audit trail for all actions
- [x] Security alerts for admins
- [x] Session monitoring

✅ **Compliance:**
- [x] UAE data protection
- [x] GDPR-ready architecture
- [x] Right to erasure
- [x] Data portability
- [x] Consent management

---

*Last Updated: January 2025*
*Document Version: 1.0*
