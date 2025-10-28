# SwaedUAE API Endpoints & Integrations

## API Architecture

**Base URL:** `https://swaeduae.ae/api`
**Authentication:** JWT Bearer Token
**Response Format:** JSON
**API Version:** v1

## Authentication Endpoints

### POST /api/auth/register
Register new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Ahmad",
  "lastName": "Mohammed",
  "role": "VOLUNTEER"
}
```

**Response:**
```json
{
  "success": true,
  "user": { "id": "user_123", "email": "user@example.com" },
  "message": "Verification email sent"
}
```

### POST /api/auth/login
User authentication

### POST /api/auth/logout
End user session

### POST /api/auth/refresh
Refresh JWT tokens

### POST /api/auth/forgot-password
Password reset request

### POST /api/auth/reset-password
Complete password reset

## User Endpoints

### GET /api/users/profile
Get current user profile

### PUT /api/users/profile
Update user profile

### GET /api/users/dashboard
Get dashboard statistics

## Event Endpoints

### GET /api/events
List all events (public)

**Query Parameters:**
```
?category=education
&location=dubai
&date=2025-01-20
&search=beach cleanup
&page=1
&limit=20
```

### GET /api/events/:id
Get event details

### POST /api/events
Create new event (Organization only)

### PUT /api/events/:id
Update event

### DELETE /api/events/:id
Delete event

### POST /api/events/:id/register
Apply to event (Volunteer)

### GET /api/events/:id/registrations
View applications (Organization)

## Attendance Endpoints

### POST /api/qr/generate
Generate QR code for event

### POST /api/qr/scan
Process QR check-in/out

**Request:**
```json
{
  "qrData": "encrypted_qr_string",
  "latitude": 25.2048,
  "longitude": 55.2708,
  "type": "checkin"
}
```

### GET /api/attendance/history
Get attendance records

## Certificate Endpoints

### GET /api/certificates
List user certificates

### POST /api/certificates/generate
Issue certificate (Organization)

### GET /api/certificates/:id
Get certificate details

### POST /api/certificates/verify
Verify certificate authenticity

## Admin Endpoints

### GET /api/admin/stats
System statistics

### GET /api/admin/users
List all users (paginated)

### PUT /api/admin/users/:id
Update user account

### POST /api/admin/organizations/:id/verify
Approve organization

### POST /api/admin/events/:id/approve
Approve event

### GET /api/admin/analytics
System analytics

### GET /api/admin/audit-logs
View audit trail

## Organization Endpoints

### GET /api/organizations/profile
Get organization profile

### POST /api/organizations/invite-member
Invite team member

### GET /api/admin/stats
Organization statistics

## Third-Party Integrations

### Email Service (Nodemailer)
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

### SMS Service (Future)
- Twilio integration
- SMS notifications
- OTP delivery

### Storage (AWS S3 / Local)
```javascript
const uploadFile = async (file) => {
  if (process.env.USE_S3) {
    return await s3.upload(file);
  }
  return await saveLocally(file);
};
```

### Calendar Sync
- Google Calendar API
- iCal export
- Outlook integration

### Social Login
- Google OAuth 2.0
- Facebook Login
- Apple Sign In

### UAE Pass (Future)
- Government authentication
- Verified identity
- Emirates ID integration

### Analytics
- Google Analytics
- Custom event tracking
- User behavior analysis

## API Rate Limiting

**Standard Users:**
- 100 requests per 15 minutes
- 1000 requests per day

**Organizations:**
- 500 requests per 15 minutes
- 10,000 requests per day

**Admins:**
- Unlimited

## Error Codes

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials",
    "status": 401
  }
}
```

**Common Error Codes:**
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

*Last Updated: January 2025*
