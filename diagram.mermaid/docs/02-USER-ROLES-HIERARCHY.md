# SwaedUAE User Roles & Hierarchy

## User Hierarchy Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SWAEDUAE USER HIERARCHY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 VOLUNTEERS (Social Media + UAE Pass)                        │
│  ├─ Login via: Facebook, Google, Apple ID                       │
│  ├─ Or: UAE Pass (government ID)                                │
│  ├─ Or: Email + Password (fallback)                             │
│  ├─ Permissions: Browse events, apply, track hours              │
│  └─ Role: VOLUNTEER                                             │
│                                                                 │
│  🏢 ORGANIZATIONS (Normal Login Only)                           │
│  ├─ Main Admin Login: Email + Password                          │
│  │  ├─ Permissions: Full organization control                   │
│  │  ├─ Create/edit events                                       │
│  │  ├─ View all volunteers                                      │
│  │  └─ Role: ORG_ADMIN                                          │
│  │                                                               │
│  ├─ Supervisors (Sub-accounts, no social login)                 │
│  │  ├─ Login: Email + Password (created by ORG_ADMIN)           │
│  │  ├─ Permissions: Limited (created/assigned by main admin)    │
│  │  ├─ View assigned events/volunteers                          │
│  │  └─ Role: ORG_SUPERVISOR                                     │
│  │                                                               │
│  └─ Organization Info                                           │
│     ├─ Organization name/license                                │
│     ├─ Verification status                                      │
│     └─ Multiple supervisors per org                             │
│                                                                 │
│  👨‍💼 SUPER ADMIN (Website Admin)                                 │
│  ├─ Login: Email + Password (secure)                            │
│  ├─ Permissions: Full system control                            │
│  ├─ Can create: Admins, Operators                               │
│  ├─ Approve organizations                                       │
│  └─ Role: SUPER_ADMIN                                           │
│                                                                 │
│  ├─ ADMINS (created by Super Admin)                             │
│  │  ├─ Login: Email + Password                                  │
│  │  ├─ Permissions: System management (assigned)                │
│  │  ├─ View analytics, reports                                  │
│  │  └─ Role: ADMIN                                              │
│  │                                                               │
│  └─ OPERATORS (monitoring team)                                 │
│     ├─ Login: Email + Password                                  │
│     ├─ Permissions: Read-only monitoring                        │
│     ├─ View system status, logs                                 │
│     └─ Role: OPERATOR                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Volunteer Role

### Overview
Volunteers are the primary users of the platform. They register to discover volunteer opportunities, participate in events, and build their volunteer portfolio.

### Role Code
```typescript
enum Role {
  VOLUNTEER = "VOLUNTEER"
}
```

### Authentication Methods
1. **Email + Password** (primary)
2. **Social Login:**
   - Facebook OAuth
   - Google OAuth
   - Apple ID
3. **UAE Pass** (government authentication - future integration)

### Permissions Matrix

| Feature | Access Level |
|---------|-------------|
| Browse Events | ✅ Full Access |
| Apply to Events | ✅ Full Access |
| Check-In/Out | ✅ Full Access |
| View Own Profile | ✅ Full Access |
| Edit Own Profile | ✅ Full Access |
| View Own Hours | ✅ Full Access |
| View Own Certificates | ✅ Full Access |
| View Other Profiles | ❌ No Access |
| Create Events | ❌ No Access |
| Approve Applications | ❌ No Access |
| Issue Certificates | ❌ No Access |
| Access Admin Panel | ❌ No Access |

### Key Features
- **Profile Management:**
  - Personal information (name, email, phone)
  - Emirates ID (optional)
  - Date of birth
  - Skills and interests
  - Profile picture
  - Guardian consent (if minor)

- **Event Discovery:**
  - Search and filter events
  - View event details
  - Apply with custom message
  - Track application status

- **Attendance Tracking:**
  - QR code check-in/out
  - GPS location verification
  - Automatic hour calculation
  - Attendance history

- **Certificate Collection:**
  - View earned certificates
  - Download PDF certificates
  - Share certificates
  - Verify certificate authenticity

- **Dashboard:**
  - Total volunteer hours
  - Events participated
  - Certificates earned
  - Impact statistics

### Data Access
- **Own data only:** Can only view and modify their own volunteer records
- **Public organization profiles:** Can view verified organization information
- **Public events:** Can view all published events

### Account States
1. **PENDING** - Email not verified
2. **ACTIVE** - Email verified, can participate
3. **SUSPENDED** - Temporarily disabled by admin
4. **INACTIVE** - Self-deactivated or long period of inactivity
5. **DELETED** - Account marked for deletion

---

## 2. Organization Roles

### 2.1 Organization Admin (ORG_ADMIN)

### Overview
The primary account holder for an organization. Has full control over the organization's presence on the platform.

### Role Code
```typescript
enum Role {
  ORG_ADMIN = "ORG_ADMIN"
}
```

### Authentication Methods
- **Email + Password only** (no social login)
- Two-factor authentication (recommended)

### Permissions Matrix

| Feature | Access Level |
|---------|-------------|
| Create Events | ✅ Full Access |
| Edit Own Events | ✅ Full Access |
| Delete Own Events | ✅ Full Access |
| View Applications | ✅ Full Access |
| Approve/Reject Applications | ✅ Full Access |
| Generate QR Codes | ✅ Full Access |
| Check-In Volunteers | ✅ Full Access |
| Issue Certificates | ✅ Full Access |
| View Analytics | ✅ Full Access |
| Manage Team Members | ✅ Full Access |
| Edit Organization Profile | ✅ Full Access |
| View Other Organizations | ❌ Limited (public info only) |
| Access Admin Panel | ❌ No Access |

### Key Features
- **Event Management:**
  - Create unlimited events
  - Edit event details
  - Publish/unpublish events
  - Cancel events
  - Duplicate events

- **Volunteer Management:**
  - Review applications
  - Approve/reject volunteers
  - Manage waitlists
  - Track attendance
  - Issue certificates

- **Team Management:**
  - Invite team members (Supervisors)
  - Assign roles and permissions
  - Remove team members
  - Monitor team activity

- **Analytics & Reporting:**
  - Event statistics
  - Volunteer demographics
  - Impact metrics
  - Custom reports
  - Export data

- **Communication:**
  - Message volunteers
  - Send event reminders
  - Bulk notifications
  - Email campaigns

### Account States
1. **PENDING_VERIFICATION** - Awaiting admin approval
2. **VERIFIED** - Admin approved, full access
3. **VERIFICATION_EXPIRED** - Need to renew verification
4. **SUSPENDED** - Disabled by admin
5. **REVOKED** - Verification revoked

---

### 2.2 Organization Supervisor (ORG_SUPERVISOR)

### Overview
Sub-accounts created by Organization Admins with limited permissions for specific tasks.

### Role Code
```typescript
enum Role {
  ORG_SUPERVISOR = "ORG_SUPERVISOR"
}
```

### Authentication Methods
- **Email + Password only** (created by ORG_ADMIN)
- No social login
- No self-registration

### Permissions Matrix (Configurable by ORG_ADMIN)

| Feature | Default Access | Can be Granted |
|---------|---------------|---------------|
| Create Events | ❌ No | ✅ Yes |
| Edit Assigned Events | ✅ Yes | ✅ Yes |
| View Applications | ✅ Yes (assigned events only) | ✅ Yes |
| Approve Applications | ⚠️ Limited | ✅ Yes |
| Check-In Volunteers | ✅ Yes | ✅ Yes |
| Issue Certificates | ❌ No | ✅ Yes |
| View Analytics | ⚠️ Read-only | ✅ Yes |
| Manage Team | ❌ No | ❌ No |
| Edit Organization | ❌ No | ❌ No |

### Key Features
- **Event Coordination:**
  - View assigned events
  - Edit event details (if permitted)
  - Monitor registrations
  - Manage attendance

- **Attendance Management:**
  - QR code scanning
  - Manual check-in/out
  - Verify hours
  - Export attendance

- **Limited Reporting:**
  - View event statistics
  - Download volunteer lists
  - Basic analytics

### Supervisor Types (Custom Roles)
Organizations can create custom supervisor roles:
1. **Event Coordinator** - Full event management
2. **Attendance Manager** - Check-in/out only
3. **Certificate Issuer** - Certificate management only
4. **Viewer** - Read-only access

---

## 3. Administrative Roles

### 3.1 Super Admin (SUPER_ADMIN)

### Overview
The highest level of system access. Can manage all aspects of the platform including creating other admins and operators.

### Role Code
```typescript
enum Role {
  SUPER_ADMIN = "SUPER_ADMIN"
}
```

### Authentication Methods
- **Email + Password only** (highly secure)
- **Mandatory 2FA** (cannot be disabled)
- IP whitelisting
- Session timeout: 4 hours

### Permissions Matrix

| Feature | Access Level |
|---------|-------------|
| All User Management | ✅ Full Access |
| All Organization Management | ✅ Full Access |
| All Event Management | ✅ Full Access |
| All Certificate Management | ✅ Full Access |
| Create Admins | ✅ Full Access |
| Create Operators | ✅ Full Access |
| System Settings | ✅ Full Access |
| Database Access | ✅ Full Access |
| Server Management | ✅ Full Access |
| Audit Logs | ✅ Full Access |
| Security Settings | ✅ Full Access |

### Key Responsibilities
1. **System Governance:**
   - Configure system settings
   - Manage feature flags
   - Set platform policies
   - Monitor system health

2. **User Management:**
   - Approve/reject organizations
   - Suspend/activate users
   - Handle escalations
   - Resolve disputes

3. **Operator Management:**
   - Create admin accounts
   - Create operator accounts
   - Assign permissions
   - Monitor admin activity

4. **Security:**
   - Configure security settings
   - Review audit logs
   - Manage IP whitelists
   - Handle security incidents

5. **Compliance:**
   - Ensure regulatory compliance
   - Generate compliance reports
   - Manage data retention
   - Handle data requests

### Account Creation
- **Cannot self-register**
- Created by system initialization script
- Or created by existing Super Admin

---

### 3.2 Admin (ADMIN)

### Overview
Standard administrative accounts with broad system access but cannot create other admins.

### Role Code
```typescript
enum Role {
  ADMIN = "ADMIN"
}
```

### Authentication Methods
- **Email + Password**
- **Mandatory 2FA**
- Session timeout: 4 hours

### Permissions Matrix

| Feature | Access Level |
|---------|-------------|
| User Management | ✅ Full Access |
| Organization Approval | ✅ Full Access |
| Event Moderation | ✅ Full Access |
| Certificate Verification | ✅ Full Access |
| Content Management | ✅ Full Access |
| View Analytics | ✅ Full Access |
| Support Tickets | ✅ Full Access |
| Create Admins | ❌ No Access |
| Create Operators | ❌ No Access |
| System Settings | ⚠️ Limited Access |
| Database Access | ❌ No Access |

### Key Responsibilities
1. **Organization Verification:**
   - Review applications
   - Verify documents
   - Approve/reject organizations
   - Monitor compliance

2. **Event Moderation:**
   - Review events
   - Approve/reject events
   - Handle reports
   - Ensure policy compliance

3. **User Support:**
   - Handle support tickets
   - Resolve issues
   - User account recovery
   - Escalate complex issues

4. **Certificate Management:**
   - Verify certificates
   - Handle disputes
   - Revoke fraudulent certificates
   - Maintain integrity

5. **Content Management:**
   - Update CMS content
   - Manage FAQ
   - Update help articles
   - Translate content

### Account Creation
- **Created by Super Admin only**
- Invitation email sent
- Mandatory password change on first login
- Mandatory 2FA setup

---

### 3.3 Operator (OPERATOR)

### Overview
Limited administrative access for specific operational tasks. Read-only access to most systems.

### Role Code
```typescript
enum Role {
  OPERATOR = "OPERATOR"
}
```

### Authentication Methods
- **Email + Password**
- **Recommended 2FA**
- Session timeout: 8 hours

### Permissions Matrix

| Feature | Access Level |
|---------|-------------|
| View Dashboard | ✅ Read-only |
| View Users | ✅ Read-only |
| View Organizations | ✅ Read-only |
| View Events | ✅ Read-only |
| View Analytics | ✅ Read-only |
| Support Tickets | ✅ Can respond |
| Content Moderation | ✅ Can flag |
| User Modification | ❌ No Access |
| Organization Approval | ❌ No Access |
| Event Approval | ❌ No Access |
| System Settings | ❌ No Access |

### Operator Specializations

Organizations can have different types of operators:

**1. Support Operator:**
- Handle support tickets
- Answer inquiries
- Basic troubleshooting
- Escalate complex issues

**2. Content Moderator:**
- Review flagged content
- Flag inappropriate events
- Monitor user reports
- Escalate violations

**3. Verification Operator:**
- Review verification documents
- Perform background checks
- Verify certificates
- Submit recommendations to admins

**4. Analytics Operator:**
- Access reports
- Generate analytics
- Export data
- Create visualizations

**5. Technical Operator:**
- Monitor system health
- View error logs
- Performance monitoring
- Escalate technical issues

### Key Responsibilities
1. **Monitoring:**
   - Watch system activity
   - Identify issues
   - Flag anomalies
   - Report to admins

2. **Support:**
   - Respond to tickets
   - Guide users
   - Document issues
   - Maintain knowledge base

3. **Reporting:**
   - Generate reports
   - Track metrics
   - Identify trends
   - Present findings

### Account Creation
- **Created by Super Admin or Admin**
- Role-specific permissions assigned
- Can have temporary access (expiry date)

---

## Role Comparison Table

| Feature | Volunteer | Org Admin | Org Supervisor | Admin | Super Admin | Operator |
|---------|-----------|-----------|----------------|-------|-------------|----------|
| **Authentication** |
| Social Login | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| UAE Pass | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Email/Password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2FA Required | ❌ | ⚠️ | ❌ | ✅ | ✅ | ⚠️ |
| **Volunteer Features** |
| Browse Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apply to Events | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Check-In/Out | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Certificates | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Organization Features** |
| Create Events | ❌ | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| Approve Applications | ❌ | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| Issue Certificates | ❌ | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| Manage Team | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Admin Features** |
| Verify Organizations | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Moderate Events | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Create Operators | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| System Settings | ❌ | ❌ | ❌ | ⚠️ | ✅ | ❌ |
| View Audit Logs | ❌ | ❌ | ❌ | ✅ | ✅ | ⚠️ |

**Legend:**
- ✅ Full Access
- ⚠️ Limited/Conditional Access
- ❌ No Access

---

## Role Transition & Escalation

### User Can Have Multiple Roles?
**No** - Each user account has exactly one role. However:
- A person can have multiple accounts with different emails
- Organizations can have multiple team members with different roles

### Role Changes
Users cannot change their own role. Role changes must be performed by:
- **VOLUNTEER → ORG_ADMIN:** User must register a new organization account
- **ORG_ADMIN → SUPER_ADMIN:** Impossible (different account types)
- **ADMIN → SUPER_ADMIN:** Can be promoted by existing Super Admin
- **OPERATOR → ADMIN:** Can be promoted by Super Admin

### Account Hierarchy
```
SUPER_ADMIN (can create) → ADMIN (can create) → OPERATOR
         ↓                        ↓
    ORG_ADMIN (can create) → ORG_SUPERVISOR
         ↓
    VOLUNTEER (self-register)
```

---

## Permission Inheritance

### No Inheritance
Roles do not inherit permissions. Each role has explicitly defined permissions.

### Exception: Data Access
- Super Admins can access all data
- Admins can access most data (except system configs)
- Operators have read-only access to assigned data
- Organizations can only access their own data
- Volunteers can only access their own data

---

## Role-Based Route Protection

### Route Access by Role

```typescript
// Public routes (no authentication required)
/
/events
/about
/contact
/verify-certificate

// Volunteer routes
/volunteer/dashboard
/volunteer/profile
/volunteer/calendar
/volunteer/certificates

// Organization routes
/organization/dashboard
/org/events
/org/applications
/org/certificates

// Admin routes
/admin/dashboard
/admin/users
/admin/organizations
/admin/events

// Super Admin routes
/admin/super
/admin/operators
/admin/settings
/admin/security
```

---

## Session & Token Management

### Token Expiration by Role

| Role | Access Token | Refresh Token | Session Timeout |
|------|--------------|---------------|-----------------|
| Volunteer | 7 days | 30 days | 30 days |
| Org Admin | 7 days | 30 days | 12 hours |
| Org Supervisor | 7 days | 30 days | 12 hours |
| Admin | 4 hours | 8 hours | 4 hours |
| Super Admin | 4 hours | 8 hours | 4 hours |
| Operator | 4 hours | 8 hours | 8 hours |

### Auto-Logout
- **Volunteers:** 30 days of inactivity
- **Organizations:** 12 hours of inactivity
- **Admins:** 4 hours of inactivity
- **Operators:** 8 hours of inactivity

---

## Database Role Representation

### Prisma Schema
```prisma
enum Role {
  VOLUNTEER
  ORG_ADMIN
  ORG_SUPERVISOR
  ADMIN
  SUPER_ADMIN
  OPERATOR
}

model User {
  id       String  @id @default(cuid())
  email    String  @unique
  role     Role    @default(VOLUNTEER)
  status   Status  @default(PENDING)

  // ... other fields
}

enum Status {
  PENDING              // Email not verified
  ACTIVE               // Active account
  SUSPENDED            // Temporarily disabled
  INACTIVE             // Long period of no activity
  DELETED              // Marked for deletion
}
```

---

## Best Practices

### Security
1. **Principle of Least Privilege:** Grant minimum necessary permissions
2. **Role Separation:** Don't mix volunteer and organizational roles
3. **Admin Accountability:** All admin actions logged in audit trail
4. **Regular Review:** Periodically review and update permissions
5. **Temporary Access:** Use expiry dates for temporary operators

### User Experience
1. **Clear Communication:** Users understand their role and permissions
2. **Helpful Errors:** Clear messages when access denied
3. **Role Indicators:** Visual badges showing user role
4. **Guided Onboarding:** Role-specific onboarding flows
5. **Progressive Disclosure:** Show features based on role

---

*Last Updated: January 2025*
*Document Version: 1.0*
