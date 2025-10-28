# SwaedUAE - Quick Reference Guide

## 📚 Documentation Quick Links

### Essential Documents
| # | Document | Purpose | When to Use |
|---|----------|---------|-------------|
| **01** | [Master Overview](01-MASTER-OVERVIEW.md) | Technology stack, architecture | Starting development, understanding system |
| **02** | [User Roles & Hierarchy](02-USER-ROLES-HIERARCHY.md) | Roles, permissions, access control | Implementing auth, features |
| **03** | [Authentication & Security](03-AUTHENTICATION-SECURITY.md) | Login, registration, security | Building auth system |
| **04** | [Volunteer Features](04-VOLUNTEER-FEATURES-WORKFLOWS.md) | Complete volunteer journey | Building volunteer portal |
| **05** | [Organization Features](05-ORGANIZATION-FEATURES-WORKFLOWS.md) | Organization management | Building org portal |
| **06** | [Admin Features](06-ADMIN-OPERATOR-FEATURES.md) | Admin panel, moderation | Building admin tools |
| **07** | [Events & Attendance](07-EVENT-ATTENDANCE-SYSTEM.md) | Event lifecycle, QR tracking | Building event system |
| **08** | [Certificates](08-CERTIFICATE-VERIFICATION-SYSTEM.md) | Certificate generation, verification | Building certificate system |
| **09** | [API Reference](09-API-ENDPOINTS-INTEGRATIONS.md) | All API endpoints | API development |
| **10** | [Deployment Roadmap](10-DEPLOYMENT-ROADMAP.md) | 26-week timeline | Project planning |

---

## 🎯 Common Tasks

### Task: Implement User Login
**Steps:**
1. Read `03-AUTHENTICATION-SECURITY.md` → Login Flow section
2. Check `02-USER-ROLES-HIERARCHY.md` → Role permissions
3. Refer to `09-API-ENDPOINTS-INTEGRATIONS.md` → `/api/auth/login`
4. Implement JWT token generation
5. Set up role-based redirects

### Task: Create Event Management
**Steps:**
1. Read `07-EVENT-ATTENDANCE-SYSTEM.md` → Event lifecycle
2. Check `05-ORGANIZATION-FEATURES-WORKFLOWS.md` → Event creation
3. Refer to `09-API-ENDPOINTS-INTEGRATIONS.md` → `/api/events` endpoints
4. Implement approval workflow
5. Set up notifications

### Task: Build QR Attendance System
**Steps:**
1. Read `07-EVENT-ATTENDANCE-SYSTEM.md` → QR code system
2. Check geofencing implementation
3. Refer to `04-VOLUNTEER-FEATURES-WORKFLOWS.md` → Check-in process
4. Implement GPS validation
5. Set up early departure detection

### Task: Generate Certificates
**Steps:**
1. Read `08-CERTIFICATE-VERIFICATION-SYSTEM.md` → Generation workflow
2. Check template system
3. Refer to `09-API-ENDPOINTS-INTEGRATIONS.md` → `/api/certificates`
4. Implement PDF generation
5. Set up QR verification

---

## 🔑 Key Concepts

### User Roles
```
VOLUNTEER → Browse, apply, check-in, collect certificates
ORG_ADMIN → Create events, approve volunteers, issue certificates
ORG_SUPERVISOR → Limited org access (configurable)
ADMIN → Moderate, verify, manage system
SUPER_ADMIN → Full system control
OPERATOR → Monitor and support
```

### Authentication Flow
```
Register → Email Verification → Login → JWT Token → Access Dashboard
```

### Event Lifecycle
```
Create → Approve → Publish → Applications → Approval → Event Day → 
Check-In → Participation → Check-Out → Certificate → Analytics
```

### Attendance Tracking
```
QR Scan → GPS Verify → Record Check-In → Monitor Location → 
30-Minute Rule → Check-Out → Calculate Hours → Issue Certificate
```

---

## 🛠️ Tech Stack Cheat Sheet

### Frontend
```bash
Framework:    Next.js 14+ (App Router)
UI:           React 18 + TypeScript
Styling:      Tailwind CSS + Radix UI
State:        TanStack React Query
Forms:        React Hook Form + Zod
Animation:    Framer Motion
```

### Backend
```bash
API:          Next.js API Routes
Database:     PostgreSQL + Prisma ORM
Auth:         NextAuth.js + JWT
Email:        Nodemailer
Storage:      AWS S3 / Local
```

### DevOps
```bash
Hosting:      Vercel / AWS
CI/CD:        GitHub Actions
Monitoring:   Sentry
Testing:      Jest + Playwright
```

---

## 📊 API Quick Reference

### Authentication
```
POST   /api/auth/register         - Register user
POST   /api/auth/login            - Login
POST   /api/auth/logout           - Logout
POST   /api/auth/refresh          - Refresh token
POST   /api/auth/forgot-password  - Password reset request
POST   /api/auth/reset-password   - Complete password reset
```

### Events
```
GET    /api/events                - List events
GET    /api/events/:id            - Get event details
POST   /api/events                - Create event (org)
PUT    /api/events/:id            - Update event
DELETE /api/events/:id            - Delete event
POST   /api/events/:id/register   - Apply to event
```

### Attendance
```
POST   /api/qr/generate           - Generate QR code
POST   /api/qr/scan               - Check-in/out
GET    /api/attendance/history    - Get records
```

### Certificates
```
GET    /api/certificates          - List certificates
POST   /api/certificates/generate - Issue certificate
POST   /api/certificates/verify   - Verify certificate
```

---

## 🚀 Development Workflow

### Local Setup
```bash
# Clone repository
git clone https://github.com/swaeduae/platform.git
cd platform

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

### Code Standards
```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test

# Type check
npm run type-check
```

---

## 🔒 Security Checklist

- [x] HTTPS/SSL encryption
- [x] JWT token authentication
- [x] bcrypt password hashing (10 rounds)
- [x] HTTP-only cookies
- [x] CSRF protection
- [x] XSS protection
- [x] SQL injection protection (Prisma)
- [x] Rate limiting
- [x] Input sanitization
- [x] 2FA for admins
- [x] Audit logging
- [x] IP whitelisting (admins)

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load | < 2s | TBD |
| API Response | < 500ms | TBD |
| Uptime | 99.9% | TBD |
| Mobile Score | > 95 | TBD |
| Test Coverage | > 80% | TBD |

---

## 🎯 Milestones

- [ ] **Week 6:** Foundation complete (auth, database)
- [ ] **Week 14:** Core features complete (events, attendance)
- [ ] **Week 20:** Advanced features complete (certificates, analytics)
- [ ] **Week 23:** Testing and polish complete
- [ ] **Week 25:** Production launch

**Current Phase:** [Update based on progress]

---

## 📞 Quick Contacts

- **Dev Team:** dev-team@swaeduae.ae
- **Support:** support@swaeduae.ae
- **General:** info@swaeduae.ae
- **GitHub:** https://github.com/swaeduae/platform

---

## 💡 Pro Tips

1. **Always check docs first** - Save time by referring to documentation
2. **Use TypeScript** - Catch errors early with type safety
3. **Test as you go** - Don't leave testing for the end
4. **Security first** - Never compromise on security
5. **Performance matters** - Optimize from the start
6. **Document your code** - Help your future self
7. **Follow conventions** - Consistency is key
8. **Ask questions** - Team collaboration is important

---

## 🔄 Update Log

| Date | Version | Changes |
|------|---------|---------|
| Jan 2025 | 1.0 | Initial documentation created |

---

*For detailed information, refer to the complete documentation files.*

*Last Updated: January 2025*
