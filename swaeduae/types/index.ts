/**
 * TypeScript Type Definitions for SwaedUAE Platform
 */

import { Timestamp } from 'firebase/firestore';

// User Roles
export type UserRole =
  | 'VOLUNTEER'
  | 'ORG_ADMIN'
  | 'ORG_SUPERVISOR'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'OPERATOR';

// User Status
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

// Organization Verification Status
export type OrgVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

// Event Status
export type EventStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

// Application Status
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';

// Attendance Status
export type AttendanceStatus = 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT' | 'VIOLATION';

// Certificate Status
export type CertificateStatus = 'ISSUED' | 'REVOKED' | 'EXPIRED';

// Violation Types
export type ViolationType = 'EARLY_DEPARTURE' | 'UNAUTHORIZED_EXIT' | 'GPS_SPOOFING' | 'EXTENDED_ABSENCE';

// Violation Severity
export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

// Event Categories
export type EventCategory =
  | 'EDUCATION'
  | 'ENVIRONMENT'
  | 'HEALTH'
  | 'COMMUNITY_SERVICE'
  | 'ANIMAL_WELFARE'
  | 'ARTS_CULTURE'
  | 'SPORTS_RECREATION'
  | 'EMERGENCY_RESPONSE';

// Location Coordinates
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// User Interface
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  profilePicture?: string;
  phoneNumber?: string;
  emiratesId?: string;
  dateOfBirth?: Date | Timestamp;
  nationality?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  interests?: EventCategory[];
  totalHours: number;
  totalEvents: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  emailVerified: boolean;
  organizationId?: string; // For organization members
}

// Organization Interface
export interface Organization {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  phone: string;
  website?: string;
  description: string;
  descriptionAr?: string;
  logo?: string;
  verificationStatus: OrgVerificationStatus;
  verificationDate?: Date | Timestamp;
  verificationDocuments?: string[]; // URLs to uploaded documents
  tradeLicenseNumber?: string;
  address: {
    street: string;
    city: string;
    emirate: string;
    poBox?: string;
  };
  adminUserId: string; // Main organization admin
  members: string[]; // Array of user IDs
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Event Interface
export interface Event {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  organizationId: string;
  organizationName: string;
  category: EventCategory;
  status: EventStatus;
  images?: string[];
  location: {
    address: string;
    addressAr?: string;
    emirate: string;
    coordinates: GeoLocation;
  };
  geofence: {
    radius: number; // in meters
    strictMode: boolean;
    allowManualCheckIn: boolean;
  };
  dateTime: {
    startDate: Date | Timestamp;
    endDate: Date | Timestamp;
    registrationDeadline: Date | Timestamp;
  };
  capacity: {
    maxVolunteers: number;
    currentVolunteers: number;
    waitlistEnabled: boolean;
  };
  requirements: {
    minAge: number;
    skills?: string[];
    additionalInfo?: string;
  };
  qrCodes: {
    checkIn: string;
    checkOut: string;
  };
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Application Interface
export interface Application {
  id: string;
  eventId: string;
  userId: string;
  status: ApplicationStatus;
  message?: string; // Volunteer's application message
  responseMessage?: string; // Organization's response
  appliedAt: Date | Timestamp;
  respondedAt?: Date | Timestamp;
  respondedBy?: string;
}

// Attendance Record Interface
export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  checkIn: {
    timestamp: Date | Timestamp;
    location: GeoLocation;
    method: 'QR_CODE' | 'MANUAL';
  };
  checkOut?: {
    timestamp: Date | Timestamp;
    location: GeoLocation;
    method: 'QR_CODE' | 'MANUAL';
  };
  hoursCompleted: number;
  violations?: Violation[];
  notes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Violation Interface
export interface Violation {
  type: ViolationType;
  severity: ViolationSeverity;
  timestamp: Date | Timestamp;
  location?: GeoLocation;
  description: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date | Timestamp;
  resolutionNotes?: string;
}

// Certificate Interface
export interface Certificate {
  id: string;
  userId: string;
  eventId: string;
  organizationId: string;
  certificateNumber: string;
  status: CertificateStatus;
  hoursCompleted: number;
  issueDate: Date | Timestamp;
  expiryDate?: Date | Timestamp;
  verificationCode: string;
  pdfUrl: string;
  metadata: {
    volunteerName: string;
    eventTitle: string;
    organizationName: string;
    eventDate: Date | Timestamp;
  };
  revokedAt?: Date | Timestamp;
  revokedBy?: string;
  revokedReason?: string;
  createdAt: Date | Timestamp;
}

// Badge Interface
export interface Badge {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  icon: string;
  category: 'HOURS' | 'EVENTS' | 'CATEGORY' | 'SPECIAL';
  criteria: {
    type: string;
    value: number;
  };
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// User Badge Achievement
export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: Date | Timestamp;
  progress?: number;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date | Timestamp;
}

// Audit Log Interface
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date | Timestamp;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// Filter and Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EventFilters {
  category?: EventCategory;
  emirate?: string;
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
  status?: EventStatus;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterVolunteerFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber: string;
  dateOfBirth: Date;
  nationality: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface RegisterOrganizationFormData {
  organizationName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  website?: string;
  description: string;
  tradeLicenseNumber: string;
  address: {
    street: string;
    city: string;
    emirate: string;
    poBox?: string;
  };
}

export interface CreateEventFormData {
  title: string;
  description: string;
  category: EventCategory;
  location: {
    address: string;
    emirate: string;
    coordinates: GeoLocation;
  };
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxVolunteers: number;
  minAge: number;
  requirements?: string;
  geofenceRadius: number;
}
