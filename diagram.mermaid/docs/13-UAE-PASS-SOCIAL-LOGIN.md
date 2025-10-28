# SwaedUAE UAE Pass & Social Login Integration

## Overview

SwaedUAE supports multiple authentication methods including UAE Pass (government authentication) and social login providers (Google, Facebook, Apple) for seamless user onboarding.

---

## 1. UAE Pass Integration

### What is UAE Pass?

UAE Pass is the official digital identity for UAE residents, issued by the UAE government. It provides secure,  verified authentication using Emirates ID.

**Benefits:**
- ✅ Government-verified identity
- ✅ Automatic Emirates ID verification
- ✅ Trusted authentication
- ✅ Simplified registration (no manual verification needed)
- ✅ Single sign-on for government services

### UAE Pass Login Flow

**Endpoint:** `/api/auth/uaepass`

```
User clicks "Login with UAE Pass"
        ↓
Redirect to UAE Pass portal
        ↓
User authenticates with UAE Pass app/credentials
        ↓
UAE Pass returns authorization code
        ↓
Callback: `/api/auth/uaepass/callback`
        ↓
Exchange code for access token
        ↓
Fetch user profile from UAE Pass
        ↓
Create/update user account
        ↓
Issue JWT token
        ↓
Redirect to dashboard
```

### UAE Pass API Endpoints

**GET /api/auth/uaepass** - Initiate UAE Pass login

**GET /api/auth/uaepass/callback** - Handle UAE Pass callback

```typescript
// User data received from UAE Pass
{
  uuid: "uaepass-user-id",
  sub: "784-2000-1234567-8", // Emirates ID
  name: "Ahmad Mohammed Al-Rashid",
  email: "ahmad@example.com",
  mobile: "+971501234567",
  gender: "Male",
  nationalityAr: "إماراتي",
  nationalityEn: "Emirati",
  dob: "2000-05-15",
  cardHolderSignatureImage: "base64-image-string",
  emiratesIdExpiryDate: "2025-12-31",
  firstnameEN: "Ahmad",
  lastnameEN: "Al-Rashid",
  fullnameAR: "أحمد محمد الراشد"
}
```

### UI Component

```
Login Page - Authentication Options
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────┐
│ 🇦🇪 LOGIN WITH UAE PASS (Recommended)                       │
│ Secure government-verified login                            │
│ [Login with UAE Pass →]                                     │
└─────────────────────────────────────────────────────────────┘

Or continue with:

[🔵 Continue with Google]
[📘 Continue with Facebook]
[🍎 Continue with Apple]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Or use email:
[Email/Password Login →]
```

---

## 2. Social Login - Google

### Google OAuth 2.0 Flow

**Endpoint:** `/api/auth/social/google`

**Callback:** `/api/auth/social/google/callback`

```typescript
// Google user data
{
  id: "google-user-id",
  email: "user@gmail.com",
  verified_email: true,
  name: "Ahmad Mohammed",
  given_name: "Ahmad",
  family_name: "Mohammed",
  picture: "https://lh3.googleusercontent.com/...",
  locale: "en"
}
```

---

## 3. Social Login - Facebook

**Endpoint:** `/api/auth/social/facebook`

**Callback:** `/api/auth/social/facebook/callback`

```typescript
// Facebook user data
{
  id: "facebook-user-id",
  email: "user@example.com",
  name: "Ahmad Mohammed",
  first_name: "Ahmad",
  last_name: "Mohammed",
  picture: {
    data: {
      url: "https://platform-lookaside.fbsbx.com/..."
    }
  }
}
```

---

## 4. Social Login - Apple

**Endpoint:** `/api/auth/social/apple`

**Callback:** `/api/auth/social/apple/callback`

```typescript
// Apple user data
{
  sub: "apple-user-id",
  email: "user@privaterelay.appleid.com",
  email_verified: true,
  is_private_email: true,
  real_user_status: 1
}
```

**Note:** Apple may provide private relay email addresses

---

## 5. Social Account Linking

Users can link multiple social accounts to one SwaedUAE account:

```
Profile Settings → Connected Accounts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Connected Accounts:
☑ UAE Pass - 784-****-****567-8 (Primary)
☑ Google - ahmad@gmail.com
☐ Facebook - Not connected [Connect]
☐ Apple - Not connected [Connect]

Benefits of linking accounts:
• Login with any connected account
• Recover access if you lose one method
• Verified identity across platforms
```

---

## 6. Admin Settings for Social Login

**Endpoint:** `/api/admin/settings/social-login`

```
Admin Panel → Social Login Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enable/Disable Social Providers:
☑ UAE Pass (Recommended for UAE users)
☑ Google
☑ Facebook  
☑ Apple

Configuration:
Each provider requires API keys/credentials configured in environment variables.

[Save Settings]
```

---

*Last Updated: January 2025*
*Document Version: 1.0 - Complete*
