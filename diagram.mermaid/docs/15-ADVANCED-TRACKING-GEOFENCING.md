# SwaedUAE Advanced Tracking & Geofencing

## Overview

SwaedUAE implements sophisticated geofencing and location tracking to ensure attendance accuracy and detect policy violations.

---

## 1. Geofencing System

### Geofence Configuration

```typescript
// Event geofence settings
{
  eventId: "uuid",
  centerPoint: {
    latitude: 25.2048,
    longitude: 55.2708
  },
  radius: 100, // meters (default)
  minRadius: 50, // minimum allowed
  maxRadius: 500, // maximum allowed
  strictMode: true, // require GPS for check-in/out
  allowManualOverride: false // org can manually check in
}
```

### Geofence Validation

**API:** `POST /api/geofencing/check`

```typescript
// Request
{
  eventId: "uuid",
  volunteerId: "uuid",
  location: {
    latitude: 25.2050,
    longitude: 55.2710,
    accuracy: 10
  }
}

// Response
{
  inside: true,
  distance: 28.5, // meters from center
  status: "INSIDE_FENCE",
  accuracy: "HIGH",
  warnings: []
}
```

---

## 2. Geofence Violations

### Violation Types

**1. Early Departure**
- Left geofence before event end time
- Left before minimum attendance time (default: 30 min)

**2. Unauthorized Exit**
- Left geofence without checking out
- Returned after leaving

**3. GPS Spoofing Detection**
- Impossible movement speed
- Location jumping
- Accuracy too perfect

**4. Extended Absence**
- Outside geofence for > 15 minutes
- Suspected abandonment

### Violation Tracking

**Database Model: `geofence_violations`**

```typescript
{
  id: "uuid",
  volunteerId: "uuid",
  eventId: "uuid",
  violationType: "EARLY_DEPARTURE",
  detectedAt: "2025-01-26T15:45:00Z",
  location: { lat: 25.2100, lng: 55.2750 },
  distance: 450, // meters from geofence
  severity: "MEDIUM",
  resolved: false,
  resolution: null,
  notes: "Volunteer left 30 minutes early"
}
```

### Violation Alerts

```
⚠️ Geofence Violation Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Event: Beach Cleanup - Jumeirah
Volunteer: Fatima Hassan
Type: Early Departure

Details:
- Left geofence at: 15:45 (30 min early)
- Distance when detected: 450m from event
- Time on-site: 5.2 hours (of 7.0 expected)

Action Required:
○ Approve hours (5.2 hrs)
○ Contact volunteer for explanation
○ Flag for review
○ Other: [____________]

[Save Decision]
```

---

## 3. Real-Time Location Tracking

### Tracking Frequency

- **Check-in:** Single GPS point required
- **During event:** Every 30 seconds
- **Check-out:** Single GPS point required

### Location Updates

**Database Model: `VolunteerLocationTracking`**

```typescript
{
  id: "uuid",
  volunteerId: "uuid",
  eventId: "uuid",
  latitude: 25.2048,
  longitude: 55.2708,
  accuracy: 10,
  timestamp: "2025-01-26T10:30:00Z",
  speed: 0,
  heading: 0,
  insideGeofence: true,
  distanceFromCenter: 45
}
```

### Movement Analytics

```
Volunteer Movement Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ahmad Mohammed - Beach Cleanup Event
Total Time: 6.75 hours
Tracking Points: 810 locations

Movement Summary:
- Time inside geofence: 6.75 hrs (100%)
- Average distance from center: 42m
- Maximum distance: 95m (within 100m fence)
- Movement pattern: Stationary with minor movement
- GPS accuracy: Average 8m (Excellent)

Timeline:
09:05 - Checked in (GPS verified)
09:05-12:30 - Active on-site (stable position)
12:30-13:00 - Lunch break (minor movement)
13:00-15:50 - Active on-site (stable position)
15:50 - Checked out (GPS verified)

Compliance: ✅ No violations detected
```

---

## 4. Early Departure Detection

### Early Departure Rules

**Trigger Conditions:**
1. Volunteer exits geofence
2. Before event end time
3. Before minimum attendance (30 min default)

**Database Model: `early_departures`**

```typescript
{
  id: "uuid",
  eventId: "uuid",
  volunteerId: "uuid",
  scheduledEndTime: "2025-01-26T16:00:00Z",
  actualDepartureTime: "2025-01-26T15:30:00Z",
  minutesEarly: 30,
  reason: null,
  approvedByOrg: false,
  penaltyApplied: false
}
```

### Volunteer View

```
⚠️ Early Departure Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You left the Beach Cleanup event 30 minutes early.

Scheduled end: 4:00 PM
Your departure: 3:30 PM

This may affect your volunteer hours credit.
If you had an emergency or valid reason, please explain:

Reason (optional):
[____________________________________________]

Your hours will be reviewed by the organization.

[Submit Explanation]
```

---

## 5. Location Alerts

**Database Model: `location_alerts`**

```typescript
{
  id: "uuid",
  eventId: "uuid",
  volunteerId: "uuid",
  alertType: "APPROACHING_BOUNDARY",
  triggeredAt: "2025-01-26T15:40:00Z",
  location: { lat: 25.2048, lng: 55.2708 },
  distance: 85, // meters from center
  notificationSent: true,
  acknowledged: false
}
```

### Alert Types

**1. Approaching Boundary**
- Within 10m of geofence edge
- Warning notification sent

**2. Boundary Crossed**
- Left geofence area
- Immediate alert

**3. Extended Absence**
- Outside for > 15 minutes
- Flag for review

**4. Returned After Exit**
- Re-entered geofence
- Track unusual pattern

---

## 6. Geofencing Statistics

**API:** `GET /api/geofencing/stats`

```typescript
{
  totalEvents: 24,
  eventsWithGeofencing: 24,
  totalVolunteers: 456,
  compliance: {
    rate: 0.94, // 94% compliance
    violations: 27,
    earlyDepartures: 15,
    unauthorizedExits: 8,
    gpsIssues: 4
  },
  accuracy: {
    averageGPSAccuracy: 12, // meters
    highAccuracy: 0.89, // 89% < 20m accuracy
    mediumAccuracy: 0.09,
    lowAccuracy: 0.02
  }
}
```

---

## 7. Privacy & Data Protection

**Privacy Controls:**
- Location tracked ONLY during events
- Data deleted after 90 days (configurable)
- Volunteers can view their own tracking data
- Organizations see aggregate data only
- GPS tracking clearly disclosed
- Opt-in consent required

**Data Retention:**
```
Location Data Retention Policy:
- Active event: Real-time tracking
- Completed event: 90 days
- After 90 days: Aggregate stats only
- Individual coordinates: Deleted
```

---

*Last Updated: January 2025*
*Document Version: 1.0 - Complete*
