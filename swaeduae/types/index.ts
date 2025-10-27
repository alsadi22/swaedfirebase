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

// ============================================================================
// PHASE 2: ENHANCED FEATURES TYPE DEFINITIONS
// ============================================================================

// Volunteer Portfolio & Skills
export interface VolunteerSkill {
  id: string;
  userId: string;
  name: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  verified: boolean;
  endorsements: SkillEndorsement[];
  createdAt: Date | Timestamp;
}

export interface SkillEndorsement {
  endorsedBy: string;
  endorserName: string;
  endorserRole: UserRole;
  organizationId?: string;
  endorsedAt: Date | Timestamp;
  message?: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  eventId?: string;
  organizationName: string;
  date: Date | Timestamp;
  hours?: number;
  images?: string[];
  skills: string[];
  impact?: string;
  createdAt: Date | Timestamp;
}

export interface VolunteerExperience {
  id: string;
  userId: string;
  organizationId: string;
  organizationName: string;
  role: string;
  description: string;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  hoursCompleted: number;
  skills: string[];
  achievements: string[];
  current: boolean;
  createdAt: Date | Timestamp;
}

export interface VolunteerProfile {
  userId: string;
  bio?: string;
  bioAr?: string;
  skills: string[];
  interests: EventCategory[];
  availability: {
    daysOfWeek: number[];
    timeSlots: string[];
    maxHoursPerWeek?: number;
  };
  preferences: {
    remoteVolunteering: boolean;
    travelDistance: number;
    preferredEmirates: string[];
  };
  privacySettings: {
    profileVisibility: 'PUBLIC' | 'VOLUNTEERS_ONLY' | 'PRIVATE';
    showEmail: boolean;
    showPhone: boolean;
    showStatistics: boolean;
  };
  completionPercentage: number;
  updatedAt: Date | Timestamp;
}

// Achievements & Gamification
export interface Achievement {
  id: string;
  userId: string;
  badgeId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date | Timestamp;
  tier?: number;
  createdAt: Date | Timestamp;
}

export interface VolunteerGoal {
  id: string;
  userId: string;
  type: 'HOURS' | 'EVENTS' | 'CATEGORY' | 'SKILL' | 'CUSTOM';
  title: string;
  description?: string;
  target: number;
  current: number;
  deadline?: Date | Timestamp;
  completed: boolean;
  completedAt?: Date | Timestamp;
  category?: EventCategory;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  profilePicture?: string;
  totalHours: number;
  totalEvents: number;
  badgeCount: number;
  rank: number;
  achievementPoints: number;
}

// Organization Analytics
export interface EventAnalytics {
  eventId: string;
  registrations: number;
  approvals: number;
  rejections: number;
  attendance: number;
  completions: number;
  noShows: number;
  averageHours: number;
  totalHoursVolunteered: number;
  conversionRate: number;
  attendanceRate: number;
  volunteerSatisfaction?: number;
  topSkills: { skill: string; count: number }[];
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    nationalities: Record<string, number>;
  };
  periodComparison?: {
    registrationsChange: number;
    attendanceChange: number;
    completionChange: number;
  };
}

export interface OrganizationAnalytics {
  organizationId: string;
  period: {
    startDate: Date | Timestamp;
    endDate: Date | Timestamp;
  };
  metrics: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalVolunteers: number;
    newVolunteers: number;
    returningVolunteers: number;
    totalHours: number;
    avgVolunteersPerEvent: number;
    avgHoursPerVolunteer: number;
    volunteerRetentionRate: number;
  };
  performance: {
    eventApprovalRate: number;
    volunteerShowRate: number;
    volunteerSatisfaction: number;
    organizationRating: number;
  };
  trends: {
    date: string;
    volunteers: number;
    hours: number;
    events: number;
  }[];
}

// Volunteer Matching
export interface VolunteerMatch {
  userId: string;
  matchScore: number;
  factors: {
    skillMatch: number;
    availabilityMatch: number;
    locationMatch: number;
    interestMatch: number;
    experienceMatch: number;
    reliabilityScore: number;
  };
  volunteer: {
    displayName: string;
    profilePicture?: string;
    totalHours: number;
    totalEvents: number;
    skills: string[];
    availability: string;
  };
  recommendation: string;
}

export interface MatchingCriteria {
  eventId: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minHours?: number;
  minEvents?: number;
  categories?: EventCategory[];
  maxDistance?: number;
  availability?: {
    date: Date;
    time: string;
  };
}

// Team Collaboration
export interface TeamMember {
  userId: string;
  displayName: string;
  role: UserRole;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  joinedAt: Date | Timestamp;
  permissions: TeamPermission[];
}

export type TeamPermission =
  | 'CREATE_EVENTS'
  | 'EDIT_EVENTS'
  | 'DELETE_EVENTS'
  | 'MANAGE_APPLICATIONS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_TEAM'
  | 'SEND_NOTIFICATIONS';

export interface TeamTask {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  assignedTo: string[];
  eventId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | Timestamp;
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
}

export interface TeamMessage {
  id: string;
  organizationId: string;
  senderId: string;
  senderName: string;
  message: string;
  eventId?: string;
  attachments?: string[];
  createdAt: Date | Timestamp;
  readBy: string[];
}

// Payment & Subscriptions
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentType = 'CERTIFICATE' | 'DONATION' | 'SUBSCRIPTION';
export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface Payment {
  id: string;
  userId: string;
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  certificateId?: string;
  subscriptionId?: string;
  donationId?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
}

export interface Subscription {
  id: string;
  organizationId: string;
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date | Timestamp;
  currentPeriodEnd: Date | Timestamp;
  cancelAtPeriodEnd: boolean;
  features: string[];
  pricing: {
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Donation {
  id: string;
  donorId?: string;
  donorEmail?: string;
  donorName?: string;
  organizationId: string;
  amount: number;
  currency: string;
  paymentId: string;
  recurring: boolean;
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  message?: string;
  anonymous: boolean;
  taxReceipt: boolean;
  taxReceiptUrl?: string;
  createdAt: Date | Timestamp;
}

// Resource Center
export interface Resource {
  id: string;
  type: 'GUIDE' | 'FAQ' | 'TUTORIAL' | 'DOCUMENT' | 'VIDEO';
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  content: string;
  contentAr?: string;
  category: string;
  tags: string[];
  fileUrl?: string;
  videoUrl?: string;
  order: number;
  featured: boolean;
  views: number;
  helpful: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface FAQ {
  id: string;
  question: string;
  questionAr?: string;
  answer: string;
  answerAr?: string;
  category: string;
  order: number;
  helpful: number;
  views: number;
  createdAt: Date | Timestamp;
}

// Reports
export interface CustomReport {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'EVENT' | 'VOLUNTEER' | 'FINANCIAL' | 'IMPACT' | 'CUSTOM';
  filters: Record<string, any>;
  metrics: string[];
  schedule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    dayOfWeek?: number;
    time: string;
    enabled: boolean;
  };
  recipients: string[];
  format: 'PDF' | 'EXCEL' | 'CSV';
  lastGenerated?: Date | Timestamp;
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}


// ============================================================================
// PHASE 3: SOCIAL & COMMUNITY + ADVANCED SECURITY TYPE DEFINITIONS
// ============================================================================

// ===========================
// SOCIAL & COMMUNITY FEATURES
// ===========================

// Forum & Discussion
export type ForumPostStatus = 'ACTIVE' | 'LOCKED' | 'ARCHIVED' | 'DELETED';
export type ForumCategory = 
  | 'GENERAL' 
  | 'EVENT_DISCUSSION' 
  | 'VOLUNTEER_TIPS' 
  | 'ORGANIZATION_SHOWCASE'
  | 'PARTNERSHIPS'
  | 'Q_AND_A'
  | 'ANNOUNCEMENTS';

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorProfilePicture?: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  category: ForumCategory;
  tags: string[];
  status: ForumPostStatus;
  pinned: boolean;
  locked: boolean;
  views: number;
  likes: string[]; // Array of user IDs who liked
  commentsCount: number;
  eventId?: string; // If related to specific event
  organizationId?: string; // If posted by organization
  attachments?: {
    type: 'IMAGE' | 'DOCUMENT' | 'LINK';
    url: string;
    name: string;
  }[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastActivityAt: Date | Timestamp;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorProfilePicture?: string;
  content: string;
  contentAr?: string;
  parentCommentId?: string; // For nested replies
  likes: string[];
  reported: boolean;
  reportCount: number;
  deleted: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface ForumReport {
  id: string;
  reportedBy: string;
  reportedItemType: 'POST' | 'COMMENT';
  reportedItemId: string;
  reason: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISINFORMATION' | 'OTHER';
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  reviewedBy?: string;
  reviewedAt?: Date | Timestamp;
  resolution?: string;
  createdAt: Date | Timestamp;
}

// Partnerships
export type PartnershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type PartnershipType = 'COLLABORATION' | 'RESOURCE_SHARING' | 'EVENT_COHOST' | 'FUNDING';

export interface Partnership {
  id: string;
  organizationId1: string;
  organizationId2: string;
  organization1Name: string;
  organization2Name: string;
  type: PartnershipType;
  status: PartnershipStatus;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  terms?: string;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  benefits: {
    organization1: string[];
    organization2: string[];
  };
  sharedResources?: {
    type: 'VOLUNTEERS' | 'EQUIPMENT' | 'VENUE' | 'FUNDING' | 'EXPERTISE';
    description: string;
  }[];
  jointEvents: string[]; // Array of event IDs
  documents?: string[]; // Contract URLs
  initiatedBy: string;
  approvedBy?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface PartnershipInvitation {
  id: string;
  fromOrganizationId: string;
  toOrganizationId: string;
  message: string;
  proposedType: PartnershipType;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: Date | Timestamp;
  respondedAt?: Date | Timestamp;
  createdAt: Date | Timestamp;
}

// Mentorship Program
export type MentorshipStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'TERMINATED';
export type MentorshipAreaOfExpertise = 
  | 'EVENT_MANAGEMENT'
  | 'VOLUNTEER_COORDINATION'
  | 'FUNDRAISING'
  | 'COMMUNITY_OUTREACH'
  | 'LEADERSHIP'
  | 'SKILL_DEVELOPMENT'
  | 'NONPROFIT_OPERATIONS';

export interface MentorProfile {
  userId: string;
  displayName: string;
  bio: string;
  bioAr?: string;
  areasOfExpertise: MentorshipAreaOfExpertise[];
  yearsOfExperience: number;
  organizationAffiliation?: string;
  languages: string[];
  availableHoursPerMonth: number;
  maxMentees: number;
  currentMentees: number;
  totalMentorshipHours: number;
  rating: number;
  reviewCount: number;
  certifications?: {
    name: string;
    issuer: string;
    year: number;
  }[];
  verified: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  areaOfInterest: MentorshipAreaOfExpertise;
  goals: string;
  preferredSchedule: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  message?: string;
  responseMessage?: string;
  respondedAt?: Date | Timestamp;
  createdAt: Date | Timestamp;
}

export interface MentorshipSession {
  id: string;
  mentorshipId: string;
  mentorId: string;
  menteeId: string;
  scheduledDate: Date | Timestamp;
  duration: number; // in minutes
  topic: string;
  notes?: string;
  menteeNotes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  completedAt?: Date | Timestamp;
  rating?: number;
  feedback?: string;
  createdAt: Date | Timestamp;
}

export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  status: MentorshipStatus;
  areaOfFocus: MentorshipAreaOfExpertise;
  goals: string[];
  progress: {
    goalsAchieved: number;
    totalHours: number;
    sessionsCompleted: number;
  };
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  milestones: {
    title: string;
    achieved: boolean;
    achievedAt?: Date | Timestamp;
  }[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Social Networking
export interface VolunteerConnection {
  id: string;
  userId1: string;
  userId2: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  initiatedBy: string;
  connectedAt?: Date | Timestamp;
  sharedEvents: string[];
  createdAt: Date | Timestamp;
}

export interface SocialActivity {
  id: string;
  userId: string;
  activityType: 
    | 'EVENT_JOINED'
    | 'EVENT_COMPLETED'
    | 'BADGE_EARNED'
    | 'MILESTONE_REACHED'
    | 'POST_CREATED'
    | 'MENTORSHIP_STARTED'
    | 'PARTNERSHIP_FORMED';
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  entityId?: string; // Event ID, Badge ID, etc.
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'PRIVATE';
  likes: string[];
  comments: {
    userId: string;
    comment: string;
    createdAt: Date | Timestamp;
  }[];
  createdAt: Date | Timestamp;
}

export interface CommunityEvent {
  id: string;
  organizerId: string;
  organizerType: 'USER' | 'ORGANIZATION' | 'PLATFORM';
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: 'NETWORKING' | 'WORKSHOP' | 'WEBINAR' | 'MEETUP' | 'CONFERENCE';
  format: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  dateTime: {
    startDate: Date | Timestamp;
    endDate: Date | Timestamp;
  };
  location?: {
    address: string;
    emirate: string;
    coordinates?: GeoLocation;
  };
  virtualLink?: string;
  capacity?: number;
  registeredCount: number;
  targetAudience: ('VOLUNTEERS' | 'ORGANIZATIONS' | 'MENTORS' | 'ALL')[];
  topics: string[];
  speakers?: {
    name: string;
    title: string;
    bio: string;
    profilePicture?: string;
  }[];
  agenda?: {
    time: string;
    title: string;
    description?: string;
  }[];
  registrationDeadline?: Date | Timestamp;
  cost?: number;
  currency?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface CommunityEventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'REFUNDED';
  paymentId?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  registeredAt: Date | Timestamp;
  attendedAt?: Date | Timestamp;
}

// ================================
// ADVANCED SECURITY & COMPLIANCE
// ================================

// Two-Factor Authentication
export type TwoFactorMethod = 'SMS' | 'EMAIL' | 'AUTHENTICATOR_APP';

export interface TwoFactorAuth {
  userId: string;
  enabled: boolean;
  method: TwoFactorMethod;
  phoneNumber?: string;
  email?: string;
  secret?: string; // For TOTP authenticator apps
  backupCodes: string[];
  backupCodesUsed: string[];
  lastUsedAt?: Date | Timestamp;
  enabledAt?: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface TwoFactorVerification {
  id: string;
  userId: string;
  code: string;
  method: TwoFactorMethod;
  purpose: 'LOGIN' | 'SENSITIVE_ACTION' | 'PASSWORD_RESET' | 'ACCOUNT_DELETION';
  verified: boolean;
  expiresAt: Date | Timestamp;
  verifiedAt?: Date | Timestamp;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date | Timestamp;
}

// Enhanced Security Logging
export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOGOUT'
    | 'PASSWORD_CHANGE'
    | 'EMAIL_CHANGE'
    | 'PHONE_CHANGE'
    | 'TWO_FACTOR_ENABLED'
    | 'TWO_FACTOR_DISABLED'
    | 'ACCOUNT_LOCKED'
    | 'ACCOUNT_UNLOCKED'
    | 'SUSPICIOUS_ACTIVITY'
    | 'PERMISSION_CHANGE'
    | 'DATA_EXPORT'
    | 'DATA_DELETION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country: string;
    city?: string;
    coordinates?: GeoLocation;
  };
  deviceInfo?: {
    type: 'DESKTOP' | 'MOBILE' | 'TABLET';
    os: string;
    browser: string;
  };
  metadata?: Record<string, any>;
  flagged: boolean;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date | Timestamp;
  timestamp: Date | Timestamp;
}

export interface LoginAttempt {
  id: string;
  userId?: string;
  email: string;
  success: boolean;
  failureReason?: string;
  ipAddress: string;
  userAgent: string;
  twoFactorRequired: boolean;
  twoFactorPassed?: boolean;
  location?: {
    country: string;
    city?: string;
  };
  timestamp: Date | Timestamp;
}

export interface AccountLock {
  userId: string;
  locked: boolean;
  reason: 'MULTIPLE_FAILED_ATTEMPTS' | 'SUSPICIOUS_ACTIVITY' | 'ADMIN_ACTION' | 'GDPR_REQUEST';
  lockedAt?: Date | Timestamp;
  lockedBy?: string;
  unlockAt?: Date | Timestamp;
  attempts: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// GDPR Compliance
export type GDPRRequestType = 
  | 'DATA_EXPORT'
  | 'DATA_DELETION'
  | 'DATA_RECTIFICATION'
  | 'RESTRICTION_OF_PROCESSING'
  | 'DATA_PORTABILITY'
  | 'OBJECT_TO_PROCESSING';

export type GDPRRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface GDPRRequest {
  id: string;
  userId: string;
  requestType: GDPRRequestType;
  status: GDPRRequestStatus;
  description?: string;
  requestedData?: string[]; // Specific data categories requested
  responseData?: {
    exportUrl?: string;
    deletionConfirmed?: boolean;
    rectificationDetails?: Record<string, any>;
  };
  verificationMethod: 'EMAIL' | 'IDENTITY_DOCUMENT';
  verified: boolean;
  verifiedAt?: Date | Timestamp;
  completedAt?: Date | Timestamp;
  rejectionReason?: string;
  assignedTo?: string;
  notes?: string;
  deadlineDate: Date | Timestamp; // 30 days by GDPR law
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number; // in days
  deletionMethod: 'SOFT_DELETE' | 'HARD_DELETE' | 'ANONYMIZE';
  legalBasis: string;
  exceptions?: string[];
  autoDelete: boolean;
  lastReviewed: Date | Timestamp;
  reviewedBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 
    | 'TERMS_OF_SERVICE'
    | 'PRIVACY_POLICY'
    | 'MARKETING_EMAILS'
    | 'DATA_PROCESSING'
    | 'COOKIES'
    | 'THIRD_PARTY_SHARING';
  granted: boolean;
  version: string; // Policy version
  grantedAt?: Date | Timestamp;
  revokedAt?: Date | Timestamp;
  ipAddress?: string;
  method: 'WEB' | 'MOBILE' | 'EMAIL' | 'IN_PERSON';
  createdAt: Date | Timestamp;
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients?: string[];
  thirdCountryTransfers?: {
    country: string;
    safeguards: string;
  }[];
  retentionPeriod: string;
  securityMeasures: string[];
  dpoReviewed: boolean;
  reviewedAt?: Date | Timestamp;
  lastUpdated: Date | Timestamp;
}

// Data Encryption & Security
export interface EncryptedField {
  id: string;
  entityType: string; // 'USER', 'ORGANIZATION', etc.
  entityId: string;
  fieldName: string;
  encryptedValue: string;
  encryptionMethod: 'AES_256' | 'RSA_2048' | 'BCRYPT';
  keyVersion: string;
  iv?: string; // Initialization vector
  encryptedAt: Date | Timestamp;
  lastAccessedAt?: Date | Timestamp;
  accessCount: number;
}

export interface DataAccessLog {
  id: string;
  userId: string;
  accessedEntityType: string;
  accessedEntityId: string;
  accessedFields: string[];
  accessType: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT';
  purpose?: string;
  ipAddress: string;
  userAgent: string;
  authorized: boolean;
  denialReason?: string;
  timestamp: Date | Timestamp;
}

export interface SecurityConfiguration {
  id: string;
  configKey: string;
  value: string | number | boolean;
  category: 
    | 'PASSWORD_POLICY'
    | 'SESSION_MANAGEMENT'
    | 'RATE_LIMITING'
    | 'ENCRYPTION'
    | 'AUDIT_LOGGING'
    | 'ACCESS_CONTROL';
  description: string;
  lastModifiedBy: string;
  lastModifiedAt: Date | Timestamp;
}

// Legal Compliance & Documents
export type LegalDocumentType = 
  | 'TERMS_OF_SERVICE'
  | 'PRIVACY_POLICY'
  | 'COOKIE_POLICY'
  | 'DATA_PROCESSING_AGREEMENT'
  | 'VOLUNTEER_AGREEMENT'
  | 'ORGANIZATION_AGREEMENT'
  | 'PARTNERSHIP_CONTRACT'
  | 'GDPR_COMPLIANCE_STATEMENT';

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  version: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  effectiveDate: Date | Timestamp;
  expiryDate?: Date | Timestamp;
  status: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  requiresAcceptance: boolean;
  documentUrl?: string;
  documentUrlAr?: string;
  previousVersionId?: string;
  approvedBy: string;
  approvedAt: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface LegalAcknowledgment {
  id: string;
  userId: string;
  documentId: string;
  documentType: LegalDocumentType;
  documentVersion: string;
  acknowledged: boolean;
  acknowledgedAt?: Date | Timestamp;
  ipAddress?: string;
  method: 'WEB' | 'MOBILE' | 'EMAIL';
  signature?: string; // Digital signature
  createdAt: Date | Timestamp;
}

export interface ComplianceCheck {
  id: string;
  checkType: 
    | 'GDPR_COMPLIANCE'
    | 'DATA_RETENTION'
    | 'CONSENT_VERIFICATION'
    | 'SECURITY_AUDIT'
    | 'ACCESS_CONTROL_REVIEW'
    | 'ENCRYPTION_VALIDATION';
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'IN_PROGRESS';
  findings: {
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation?: string;
  }[];
  performedBy: string;
  performedAt: Date | Timestamp;
  nextCheckDue: Date | Timestamp;
  reportUrl?: string;
  createdAt: Date | Timestamp;
}

// =========================
// MOBILE & PWA FEATURES
// =========================

// Push Notifications
export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceType: 'ANDROID' | 'IOS' | 'DESKTOP';
  deviceName?: string;
  browser?: string;
  enabled: boolean;
  createdAt: Date | Timestamp;
  lastUsedAt: Date | Timestamp;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
  tag?: string;
  requireInteraction: boolean;
  silent: boolean;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CLICKED';
  sentAt?: Date | Timestamp;
  deliveredAt?: Date | Timestamp;
  clickedAt?: Date | Timestamp;
  error?: string;
  createdAt: Date | Timestamp;
}

// Offline Data Sync
export interface OfflineQueue {
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  status: 'PENDING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  retryCount: number;
  error?: string;
  createdAt: Date | Timestamp;
  syncedAt?: Date | Timestamp;
}

export interface SyncStatus {
  userId: string;
  lastSyncAt?: Date | Timestamp;
  syncInProgress: boolean;
  pendingActions: number;
  failedActions: number;
  conflicts: number;
  dataVersion: string;
}

export interface CachedData {
  id: string;
  userId: string;
  dataType: string;
  data: Record<string, any>;
  expiresAt: Date | Timestamp;
  version: string;
  cachedAt: Date | Timestamp;
}

// PWA Configuration
export interface PWASettings {
  userId: string;
  installPromptShown: boolean;
  installPromptAccepted: boolean;
  installed: boolean;
  installedAt?: Date | Timestamp;
  installSource?: 'BROWSER_PROMPT' | 'CUSTOM_PROMPT' | 'APP_STORE';
  enableOfflineMode: boolean;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
  preferredTheme: 'LIGHT' | 'DARK' | 'AUTO';
  dataUsageMode: 'FULL' | 'WIFI_ONLY' | 'MINIMAL';
  cacheSize: number; // in MB
  lastCacheCleared?: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface AppUpdate {
  id: string;
  version: string;
  releaseDate: Date | Timestamp;
  features: string[];
  bugFixes: string[];
  breakingChanges: string[];
  required: boolean;
  updateUrl?: string;
  releaseNotes: string;
  releaseNotesAr?: string;
  downloadSize?: number;
  status: 'AVAILABLE' | 'DOWNLOADING' | 'READY' | 'INSTALLED';
}

// Mobile-Specific Preferences
export interface MobilePreferences {
  userId: string;
  biometricAuth: boolean;
  autoCheckIn: boolean;
  locationSharing: boolean;
  hapticFeedback: boolean;
  notificationSound: boolean;
  dataRoaming: boolean;
  downloadQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  autoDownloadUpdates: boolean;
  batteryOptimization: boolean;
  updatedAt: Date | Timestamp;
}

// Analytics & Metrics
export interface UserEngagementMetrics {
  userId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: Date | Timestamp;
  metrics: {
    sessionCount: number;
    averageSessionDuration: number;
    screenViews: Record<string, number>;
    actionsPerformed: Record<string, number>;
    eventsInteractedWith: number;
    forumPostsCreated: number;
    commentsPosted: number;
    connectionsAdded: number;
    hoursVolunteered: number;
  };
  deviceInfo: {
    platform: 'WEB' | 'ANDROID' | 'IOS' | 'PWA';
    browser?: string;
    appVersion?: string;
  };
  createdAt: Date | Timestamp;
}

// Integration Extensions for existing types
export interface UserExtended extends User {
  // Social features
  connections?: string[];
  following?: string[];
  followers?: string[];
  forumPosts?: number;
  forumReputation?: number;
  
  // Security features
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date | Timestamp;
  securityScore?: number;
  
  // Mobile/PWA
  pwaInstalled?: boolean;
  pushNotificationsEnabled?: boolean;
  lastActiveDevice?: 'WEB' | 'ANDROID' | 'IOS' | 'PWA';
}

export interface OrganizationExtended extends Organization {
  // Partnership features
  partnerships?: string[];
  partnershipScore?: number;
  
  // Legal compliance
  complianceScore?: number;
  lastComplianceCheck?: Date | Timestamp;
  gdprCompliant: boolean;
  
  // Community engagement
  forumPresence?: number;
  communityEventsHosted?: number;
}
