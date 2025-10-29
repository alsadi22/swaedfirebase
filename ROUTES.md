# SwaedUAE - Routes Documentation

**Last Updated:** January 2025  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Public Routes](#public-routes)
2. [Authentication Routes](#authentication-routes)
3. [Protected Routes](#protected-routes)
   - [Volunteer Routes](#volunteer-routes)
   - [Organization Routes](#organization-routes)
   - [Student Routes](#student-routes)
   - [Admin Routes](#admin-routes)
4. [API Routes](#api-routes)
5. [Route Protection Strategy](#route-protection-strategy)

---

## 🌐 Public Routes

These routes are accessible to all users without authentication:

| Route | Description | File |
|-------|-------------|------|
| `/` | Homepage | `app/page.tsx` |
| `/about` | About SwaedUAE | `app/about/page.tsx` |
| `/contact` | Contact page | `app/contact/page.tsx` |
| `/events` | Browse all events | `app/events/page.tsx` |
| `/events/[id]` | Event details (dynamic) | `app/events/[id]/page.tsx` |
| `/events/categories` | Events by category | `app/events/categories/page.tsx` |
| `/events/emirates` | Events by emirate | `app/events/emirates/page.tsx` |
| `/events/check-in` | Public check-in page | `app/events/check-in/page.tsx` |
| `/organizations` | Browse organizations | `app/organizations/page.tsx` |
| `/faq` | Frequently asked questions | `app/faq/page.tsx` |
| `/impact` | Platform impact stats | `app/impact/page.tsx` |
| `/privacy` | Privacy policy | `app/privacy/page.tsx` |
| `/terms` | Terms of service | `app/terms/page.tsx` |
| `/resources` | Resources page | `app/resources/page.tsx` |
| `/search` | Search functionality | `app/search/page.tsx` |
| `/offline` | PWA offline page | `app/offline/page.tsx` |
| `/verify-email` | Email verification | `app/verify-email/page.tsx` |

---

## 🔐 Authentication Routes

### General Authentication

| Route | Description | User Type | File |
|-------|-------------|-----------|------|
| `/auth/login` | Generic login (volunteer/student) | Volunteer/Student | `app/auth/login/page.tsx` |
| `/auth/register` | Generic registration | Volunteer/Student | `app/auth/register/page.tsx` |
| `/auth/forgot-password` | Password reset | All | `app/auth/forgot-password/page.tsx` |

### Volunteer Authentication

| Route | Description | File |
|-------|-------------|------|
| `/auth/volunteer/login` | Volunteer login | `app/auth/volunteer/login/page.tsx` |
| `/auth/volunteer/register` | Volunteer registration | `app/auth/volunteer/register/page.tsx` |

### Organization Authentication

| Route | Description | File |
|-------|-------------|------|
| `/auth/organization/login` | Organization login | `app/auth/organization/login/page.tsx` |
| `/auth/organization/register` | Organization registration | `app/auth/organization/register/page.tsx` |

**Note:** `/organization/login` and `/organization/register` redirect to `/auth/organization/*` for consistency.

### Admin Authentication

| Route | Description | File |
|-------|-------------|------|
| `/auth/admin/login` | Admin/Super Admin login | `app/auth/admin/login/page.tsx` |

---

## 🔒 Protected Routes

### Volunteer Routes

**Base Path:** `/volunteer/*`  
**Authentication Required:** Yes (auth_token cookie)  
**Redirect if Not Authenticated:** `/auth/volunteer/login`

| Route | Description | File |
|-------|-------------|------|
| `/volunteer/dashboard` | Volunteer dashboard | `app/volunteer/dashboard/page.tsx` |

**Generic Dashboard Routes (shared by volunteers):**

| Route | Description | File |
|-------|-------------|------|
| `/dashboard` | Main dashboard | `app/dashboard/page.tsx` |
| `/dashboard/achievements` | Achievements | `app/dashboard/achievements/page.tsx` |
| `/dashboard/applications` | Event applications | `app/dashboard/applications/page.tsx` |
| `/dashboard/badges` | Earned badges | `app/dashboard/badges/page.tsx` |
| `/dashboard/certificates` | Certificates | `app/dashboard/certificates/page.tsx` |
| `/dashboard/history` | Volunteer history | `app/dashboard/history/page.tsx` |
| `/dashboard/hours` | Hours tracking | `app/dashboard/hours/page.tsx` |
| `/dashboard/profile` | Profile management | `app/dashboard/profile/page.tsx` |
| `/dashboard/rewards` | Rewards | `app/dashboard/rewards/page.tsx` |
| `/dashboard/saved` | Saved events | `app/dashboard/saved/page.tsx` |
| `/dashboard/settings` | Settings | `app/dashboard/settings/page.tsx` |
| `/dashboard/stats` | Statistics | `app/dashboard/stats/page.tsx` |

---

### Organization Routes

**Base Path:** `/organization/*`  
**Authentication Required:** Yes (auth_token cookie)  
**Redirect if Not Authenticated:** `/auth/organization/login`

| Route | Description | File |
|-------|-------------|------|
| `/organization/dashboard` | Organization dashboard | `app/organization/dashboard/page.tsx` |
| `/organization/analytics` | Analytics & reports | `app/organization/analytics/page.tsx` |
| `/organization/events` | Manage events | `app/organization/events/page.tsx` |
| `/organization/events/create` | Create new event | `app/organization/events/create/page.tsx` |
| `/organization/settings` | Organization settings | `app/organization/settings/page.tsx` |
| `/organization/team` | Team management | `app/organization/team/page.tsx` |
| `/organization/volunteers` | Volunteer management | `app/organization/volunteers/page.tsx` |

---

### Student Routes

**Base Path:** `/student/*`  
**Authentication Required:** Yes (auth_token cookie)  
**Redirect if Not Authenticated:** `/auth/login`

| Route | Description | File |
|-------|-------------|------|
| `/student/dashboard` | Student dashboard | `app/student/dashboard/page.tsx` |
| `/student/academic` | Academic tracking | `app/student/academic/page.tsx` |
| `/student/guardian` | Guardian consent | `app/student/guardian/page.tsx` |
| `/student/transcripts` | Transcripts | `app/student/transcripts/page.tsx` |

---

### Admin Routes

**Base Path:** `/admin/*`  
**Authentication Required:** Yes (admin_token cookie + role='admin')  
**Redirect if Not Authenticated:** `/auth/admin/login`

| Route | Description | File |
|-------|-------------|------|
| `/admin/dashboard` | Admin dashboard | `app/admin/dashboard/page.tsx` |
| `/admin/audit-logs` | System audit logs | `app/admin/audit-logs/page.tsx` |
| `/admin/badges` | Badge management | `app/admin/badges/page.tsx` |
| `/admin/certificates` | Certificate management | `app/admin/certificates/page.tsx` |
| `/admin/events` | Event moderation | `app/admin/events/page.tsx` |
| `/admin/notifications` | Notification management | `app/admin/notifications/page.tsx` |
| `/admin/organizations` | Organization approval | `app/admin/organizations/page.tsx` |
| `/admin/performance` | System performance | `app/admin/performance/page.tsx` |
| `/admin/reports` | System reports | `app/admin/reports/page.tsx` |
| `/admin/settings` | System settings | `app/admin/settings/page.tsx` |
| `/admin/users` | User management | `app/admin/users/page.tsx` |

---

## 🔌 API Routes

### Admin API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/admin/audit-logs` | GET | Fetch audit logs | `app/api/admin/audit-logs/route.ts` |
| `/api/admin/auth` | POST | Admin authentication | `app/api/admin/auth/route.ts` |
| `/api/admin/check-access` | GET | Check admin access | `app/api/admin/check-access/route.ts` |
| `/api/admin/dashboard` | GET | Admin dashboard data | `app/api/admin/dashboard/route.ts` |
| `/api/admin/organizations` | GET/POST/PUT | Manage organizations | `app/api/admin/organizations/route.ts` |
| `/api/admin/sessions` | GET/POST/DELETE | Session management | `app/api/admin/sessions/route.ts` |
| `/api/admin/users` | GET/POST/PUT/DELETE | User management | `app/api/admin/users/route.ts` |
| `/api/admin/validate-session` | POST | Validate session | `app/api/admin/validate-session/route.ts` |
| `/api/admin/verify` | POST | Verify admin token | `app/api/admin/verify/route.ts` |

### Auth API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/auth/[...auth0]` | ALL | Auth0 catch-all handler | `app/api/auth/[...auth0]/route.ts` |
| `/api/auth/forgot-password` | POST | Password reset request | `app/api/auth/forgot-password/route.ts` |
| `/api/auth/user` | GET | Get current user | `app/api/auth/user/route.ts` |
| `/api/auth/verify-email` | POST | Email verification | `app/api/auth/verify-email/route.ts` |

### Events API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/events` | GET/POST | List/create events | `app/api/events/route.ts` |
| `/api/events/[id]` | GET/PUT/DELETE | Event operations | `app/api/events/[id]/route.ts` |
| `/api/events/check-in` | POST | QR check-in/out | `app/api/events/check-in/route.ts` |

### Applications API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/applications` | GET/POST | Event applications | `app/api/applications/route.ts` |
| `/api/applications/check` | GET | Check application status | `app/api/applications/check/route.ts` |

### Badges API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/badges` | GET | List badges | `app/api/badges/route.ts` |
| `/api/badges/award` | POST | Award badge | `app/api/badges/award/route.ts` |
| `/api/badges/check` | POST | Check badge eligibility | `app/api/badges/check/route.ts` |
| `/api/badges/stats` | GET | Badge statistics | `app/api/badges/stats/route.ts` |

### Organization API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/organization/analytics` | GET | Organization analytics | `app/api/organization/analytics/route.ts` |
| `/api/organization/dashboard` | GET | Dashboard data | `app/api/organization/dashboard/route.ts` |
| `/api/organization/events` | GET/POST | Organization events | `app/api/organization/events/route.ts` |

### Student API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/student/dashboard` | GET | Student dashboard | `app/api/student/dashboard/route.ts` |
| `/api/student/transcripts` | GET | Academic transcripts | `app/api/student/transcripts/route.ts` |

### Other API

| Route | Method | Description | File |
|-------|--------|-------------|------|
| `/api/health` | GET | Health check endpoint | `app/api/health/route.ts` |
| `/api/notifications` | GET/POST | Notifications | `app/api/notifications/route.ts` |
| `/api/profile` | GET/PUT | User profile | `app/api/profile/route.ts` |
| `/api/users/sync` | POST | User sync | `app/api/users/sync/route.ts` |
| `/api/volunteer-hours` | GET | Volunteer hours | `app/api/volunteer-hours/route.ts` |

---

## 🛡️ Route Protection Strategy

### Middleware Protection (`middleware.ts`)

The middleware protects routes at the edge level before pages load:

```typescript
// Public routes - no protection
- /, /about, /contact, /events*, /organizations, /faq, /impact, /privacy, /terms, /resources, /search, /offline

// Admin routes - JWT token verification (admin_token cookie + role='admin')
- /admin/*

// Organization routes - Basic auth check (auth_token cookie)
- /organization/*

// Volunteer routes - Basic auth check (auth_token cookie)
- /volunteer/*

// Student routes - Basic auth check (auth_token cookie)
- /student/*

// Dashboard routes - Basic auth check (auth_token cookie)
- /dashboard/*

// Notifications - Basic auth check (auth_token cookie)
- /notifications
```

### Page-Level Protection

Individual pages perform additional role and permission checks:

- **Admin pages**: Verify admin role and specific permissions
- **Organization pages**: Verify organization membership and status
- **Student pages**: Check guardian consent and academic status
- **Volunteer pages**: Verify volunteer status and profile completion

### API-Level Protection

API routes implement:
- JWT token validation
- Role-based access control
- Rate limiting (100-500 req/min based on role)
- Request validation

---

## 📝 Route Naming Conventions

### Consistency Rules

1. **Auth routes**: Always under `/auth/{role}/action`
   - ✅ `/auth/volunteer/login`
   - ✅ `/auth/organization/register`
   - ❌ `/organization/login` (redirects to auth)

2. **Dashboard routes**: Role-specific or generic
   - `/volunteer/dashboard` - Volunteer-specific
   - `/organization/dashboard` - Organization-specific
   - `/dashboard` - Generic volunteer dashboard

3. **API routes**: RESTful naming
   - GET `/api/events` - List events
   - POST `/api/events` - Create event
   - GET `/api/events/[id]` - Get specific event
   - PUT `/api/events/[id]` - Update event
   - DELETE `/api/events/[id]` - Delete event

---

## 🔄 Redirect Map

### Backward Compatibility Redirects

| Old Route | New Route | Status |
|-----------|-----------|--------|
| `/organization/login` | `/auth/organization/login` | 301 Permanent |
| `/organization/register` | `/auth/organization/register` | 301 Permanent |

---

## 🚀 Next.js App Router Features

### Dynamic Routes

- `/events/[id]` - Dynamic event ID
- `/api/events/[id]` - Dynamic API parameter

### Route Groups

- `(auth)` - Authentication pages group (potential)
- `(dashboard)` - Dashboard pages group (potential)

### Parallel Routes

Not currently implemented, but can be added for:
- Modal views
- Sidebars
- Multi-panel layouts

---

## 📚 Additional Resources

- [Next.js Routing Documentation](https://nextjs.org/docs/app/building-your-application/routing)
- [Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Document Maintained By:** Development Team  
**Last Reviewed:** January 2025  
**Next Review:** March 2025
