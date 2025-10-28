# SwaedUAE Event Management & Attendance Tracking System

## Event Lifecycle

### 1. Event Creation (Organization)
- Event details, requirements, capacity
- Location and geofencing setup
- Date, time, duration
- Volunteer requirements
- Approval workflow

### 2. Event Publishing
- Admin review and approval
- Public listing
- Search indexing
- Notification to matched volunteers

### 3. Volunteer Applications
- Application submission
- Organization review
- Approval/rejection workflow
- Waitlist management

### 4. Attendance Tracking
**QR Code System:**
- Unique QR per event
- Check-in validation
- GPS geofencing (100m radius)
- Real-time verification

**GPS Monitoring:**
- Continuous tracking during event
- 30-minute early departure rule
- Automatic alerts
- Location history logging

**Check-Out:**
- QR code validation
- Hour calculation
- Certificate eligibility
- Completion confirmation

### 5. Post-Event
- Hours verification
- Certificate issuance
- Feedback collection
- Impact reporting

## Technical Implementation

**QR Code Generation:**
```typescript
import QRCode from 'qrcode';

const eventQR = await QRCode.toDataURL({
  eventId: string,
  timestamp: number,
  checkpointType: 'checkin' | 'checkout'
});
```

**Geofencing:**
```typescript
function validateLocation(
  userLat: number,
  userLon: number,
  eventLat: number,
  eventLon: number,
  radiusMeters: number = 100
): boolean {
  const distance = calculateDistance(userLat, userLon, eventLat, eventLon);
  return distance <= radiusMeters;
}
```

*Last Updated: January 2025*
