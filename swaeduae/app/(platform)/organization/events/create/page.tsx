'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { getUserProfile, getOrganization, createEvent } from '@/lib/services/firestore';
import type { User, Organization, EventCategory, GeoLocation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'COMMUNITY_SERVICE', label: 'Community Service' },
  { value: 'ANIMAL_WELFARE', label: 'Animal Welfare' },
  { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
  { value: 'SPORTS_RECREATION', label: 'Sports & Recreation' },
  { value: 'EMERGENCY_RESPONSE', label: 'Emergency Response' },
];

export default function CreateEventPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [category, setCategory] = useState<EventCategory>('COMMUNITY_SERVICE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [address, setAddress] = useState('');
  const [addressAr, setAddressAr] = useState('');
  const [emirate, setEmirate] = useState('Dubai');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState('10');
  const [minAge, setMinAge] = useState('18');
  const [skills, setSkills] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState('100');
  const [strictMode, setStrictMode] = useState(true);
  const [allowManualCheckIn, setAllowManualCheckIn] = useState(false);
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrganizationData();
    }
  }, [user]);

  const loadOrganizationData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      if (profile?.organizationId) {
        const org = await getOrganization(profile.organizationId);
        setOrganization(org);
      }
    } catch (error) {
      console.error('Error loading organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !organization) {
      alert(t('org.notAuthorized', 'You are not authorized to create events'));
      return;
    }

    // Validation
    if (!title || !description || !startDate || !endDate || !registrationDeadline || !address) {
      alert(t('org.fillRequired', 'Please fill in all required fields'));
      return;
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const regDeadline = new Date(registrationDeadline);

    if (end <= start) {
      alert(t('org.endDateError', 'End date must be after start date'));
      return;
    }

    if (regDeadline >= start) {
      alert(t('org.deadlineError', 'Registration deadline must be before start date'));
      return;
    }

    try {
      setSubmitting(true);

      // Parse coordinates
      const coords: GeoLocation = {
        latitude: latitude ? parseFloat(latitude) : 25.2048,
        longitude: longitude ? parseFloat(longitude) : 55.2708,
      };

      // Parse skills
      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Generate QR codes (placeholder - will be replaced with actual QR generation)
      const qrCodeCheckIn = `SWAEDUAE-CHECKIN-${Date.now()}`;
      const qrCodeCheckOut = `SWAEDUAE-CHECKOUT-${Date.now()}`;

      const eventData = {
        title,
        titleAr: titleAr || undefined,
        description,
        descriptionAr: descriptionAr || undefined,
        organizationId: organization.id,
        organizationName: organization.name,
        category,
        status: organization.verificationStatus === 'VERIFIED' ? 'PENDING_APPROVAL' : 'PENDING_APPROVAL',
        location: {
          address,
          addressAr: addressAr || undefined,
          emirate,
          coordinates: coords,
        },
        geofence: {
          radius: parseInt(geofenceRadius),
          strictMode,
          allowManualCheckIn,
        },
        dateTime: {
          startDate: start,
          endDate: end,
          registrationDeadline: regDeadline,
        },
        capacity: {
          maxVolunteers: parseInt(maxVolunteers),
          currentVolunteers: 0,
          waitlistEnabled,
        },
        requirements: {
          minAge: parseInt(minAge),
          skills: skillsArray.length > 0 ? skillsArray : undefined,
          additionalInfo: additionalInfo || undefined,
        },
        qrCodes: {
          checkIn: qrCodeCheckIn,
          checkOut: qrCodeCheckOut,
        },
        createdBy: user.uid,
      };

      const eventId = await createEvent(eventData as any);

      alert(t('org.eventCreated', 'Event created successfully! It is now pending admin approval.'));
      router.push('/organization/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      alert(t('org.eventCreateError', 'Failed to create event. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('org.noOrganization', 'No Organization Found')}
            </h2>
            <p className="text-gray-600">
              {t('org.cannotCreateEvents', 'You must be part of an organization to create events')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('org.createNewEvent', 'Create New Event')}</CardTitle>
            <CardDescription>
              {t('org.createEventDesc', 'Fill in the details below to create a new volunteer event')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('org.basicInfo', 'Basic Information')}</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('org.eventTitle', 'Event Title')} *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder={t('org.eventTitlePlaceholder', 'Enter event title')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="titleAr">{t('org.eventTitleAr', 'Event Title (Arabic)')}</Label>
                    <Input
                      id="titleAr"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder={t('org.eventTitleArPlaceholder', 'أدخل عنوان الحدث')}
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">{t('org.category', 'Category')} *</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EventCategory)}
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">{t('org.description', 'Description')} *</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('org.descriptionPlaceholder', 'Describe the event details...')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descriptionAr">{t('org.descriptionAr', 'Description (Arabic)')}</Label>
                    <textarea
                      id="descriptionAr"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('org.descriptionArPlaceholder', 'اكتب وصف الحدث...')}
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('org.dateTime', 'Date & Time')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">{t('org.startDate', 'Start Date')} *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">{t('org.endDate', 'End Date')} *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="registrationDeadline">{t('org.registrationDeadline', 'Registration Deadline')} *</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={registrationDeadline}
                      onChange={(e) => setRegistrationDeadline(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('org.location', 'Location')}</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t('org.address', 'Address')} *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder={t('org.addressPlaceholder', 'Enter full address')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressAr">{t('org.addressAr', 'Address (Arabic)')}</Label>
                    <Input
                      id="addressAr"
                      value={addressAr}
                      onChange={(e) => setAddressAr(e.target.value)}
                      placeholder={t('org.addressArPlaceholder', 'أدخل العنوان')}
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emirate">{t('org.emirate', 'Emirate')} *</Label>
                      <select
                        id="emirate"
                        value={emirate}
                        onChange={(e) => setEmirate(e.target.value)}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {EMIRATES.map((em) => (
                          <option key={em} value={em}>
                            {em}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="latitude">{t('org.latitude', 'Latitude')}</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="25.2048"
                      />
                    </div>

                    <div>
                      <Label htmlFor="longitude">{t('org.longitude', 'Longitude')}</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="55.2708"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity & Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('org.capacityRequirements', 'Capacity & Requirements')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxVolunteers">{t('org.maxVolunteers', 'Maximum Volunteers')} *</Label>
                    <Input
                      id="maxVolunteers"
                      type="number"
                      min="1"
                      value={maxVolunteers}
                      onChange={(e) => setMaxVolunteers(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="minAge">{t('org.minAge', 'Minimum Age')} *</Label>
                    <Input
                      id="minAge"
                      type="number"
                      min="0"
                      max="100"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="skills">{t('org.requiredSkills', 'Required Skills (comma-separated)')}</Label>
                    <Input
                      id="skills"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder={t('org.skillsPlaceholder', 'e.g., Teaching, First Aid, Arabic Language')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="additionalInfo">{t('org.additionalInfo', 'Additional Requirements')}</Label>
                    <textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('org.additionalInfoPlaceholder', 'Any additional requirements or information...')}
                    />
                  </div>
                </div>
              </div>

              {/* Geofencing Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('org.geofencingSettings', 'Geofencing & Attendance Settings')}</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="geofenceRadius">{t('org.geofenceRadius', 'Geofence Radius (meters)')}</Label>
                    <Input
                      id="geofenceRadius"
                      type="number"
                      min="10"
                      max="1000"
                      value={geofenceRadius}
                      onChange={(e) => setGeofenceRadius(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('org.geofenceRadiusHelp', 'Volunteers must be within this radius to check in/out')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="strictMode"
                      checked={strictMode}
                      onChange={(e) => setStrictMode(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="strictMode" className="font-normal">
                      {t('org.strictMode', 'Strict Mode (Enforce geofencing at all times)')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowManualCheckIn"
                      checked={allowManualCheckIn}
                      onChange={(e) => setAllowManualCheckIn(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="allowManualCheckIn" className="font-normal">
                      {t('org.allowManualCheckIn', 'Allow manual check-in/out by supervisors')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="waitlistEnabled"
                      checked={waitlistEnabled}
                      onChange={(e) => setWaitlistEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="waitlistEnabled" className="font-normal">
                      {t('org.waitlistEnabled', 'Enable waitlist when event is full')}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? t('common.creating', 'Creating...') : t('org.createEvent', 'Create Event')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
