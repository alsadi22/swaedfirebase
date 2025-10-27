'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getEvent, createApplication, checkExistingApplication, getUserProfile } from '@/lib/services/firestore';
import type { Event, Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const eventId = params?.id as string;

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
    }
  }, [eventId, user]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const fetchedEvent = await getEvent(eventId);
      setEvent(fetchedEvent);

      // Check if user already applied
      if (user && fetchedEvent) {
        const application = await checkExistingApplication(user.id, eventId);
        setExistingApplication(application);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      router.push('/login?redirect=/events/' + eventId);
      return;
    }

    if (!event) return;

    // Check if event is full
    if (event.capacity.currentVolunteers >= event.capacity.maxVolunteers) {
      alert(t('events.eventFull', 'This event is full. Applications are closed.'));
      return;
    }

    try {
      setApplying(true);

      const userProfile = await getUserProfile(user.id);
      if (!userProfile) {
        alert(t('events.completeProfile', 'Please complete your profile first'));
        router.push('/profile/setup');
        return;
      }

      await createApplication({
        eventId,
        userId: user.id,
        status: 'PENDING',
        message: applicationMessage,
      });

      alert(t('events.applicationSuccess', 'Application submitted successfully!'));
      await loadEventDetails(); // Reload to show updated status
      setShowApplicationForm(false);
      setApplicationMessage('');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(t('events.applicationError', 'Failed to submit application. Please try again.'));
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM d, yyyy h:mm a');
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      EDUCATION: 'Education',
      ENVIRONMENT: 'Environment',
      HEALTH: 'Health',
      COMMUNITY_SERVICE: 'Community Service',
      ANIMAL_WELFARE: 'Animal Welfare',
      ARTS_CULTURE: 'Arts & Culture',
      SPORTS_RECREATION: 'Sports & Recreation',
      EMERGENCY_RESPONSE: 'Emergency Response',
    };
    return labels[category] || category;
  };

  const getApplicationStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      WAITLISTED: { label: 'Waitlisted', color: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('events.notFound', 'Event Not Found')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('events.notFoundDesc', 'The event you are looking for does not exist or has been removed.')}
            </p>
            <Link href="/events">
              <Button>{t('events.backToEvents', 'Back to Events')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEventFull = event.capacity.currentVolunteers >= event.capacity.maxVolunteers;
  const canApply = user && event.status === 'PUBLISHED' && !isEventFull && !existingApplication;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/events" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('common.back', 'Back')}
        </Link>

        {/* Event Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getCategoryLabel(event.category)}
                  </span>
                  <span className="text-sm text-gray-500">{event.location.emirate}</span>
                </div>
                <CardTitle className="text-3xl mb-2">
                  { language === 'ar' && event.titleAr ? event.titleAr : event.title}
                </CardTitle>
                <CardDescription className="text-lg">{event.organizationName}</CardDescription>
              </div>
            </div>

            {/* Application Status */}
            {existingApplication && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t('events.applicationStatus', 'Your Application Status')}:</span>
                  {getApplicationStatusBadge(existingApplication.status)}
                </div>
                {existingApplication.responseMessage && (
                  <p className="mt-2 text-sm text-gray-600">
                    <strong>{t('events.organizationResponse', 'Organization Response')}:</strong>{' '}
                    {existingApplication.responseMessage}
                  </p>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('events.description', 'Description')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                { language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('events.eventDetails', 'Event Details')}</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{t('events.startDate', 'Start Date')}</p>
                      <p className="text-gray-600">{formatDate(event.dateTime.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{t('events.endDate', 'End Date')}</p>
                      <p className="text-gray-600">{formatDate(event.dateTime.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{t('events.registrationDeadline', 'Registration Deadline')}</p>
                      <p className="text-gray-600">{formatDate(event.dateTime.registrationDeadline)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{t('events.capacity', 'Capacity')}</p>
                      <p className="text-gray-600">
                        {event.capacity.currentVolunteers} / {event.capacity.maxVolunteers} {t('events.volunteers', 'volunteers')}
                      </p>
                      {isEventFull && (
                        <span className="text-sm text-red-600 font-medium">{t('events.full', 'Event is full')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">{t('events.location', 'Location')}</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{t('events.address', 'Address')}</p>
                      <p className="text-gray-600">{event.location.address}</p>
                      <p className="text-gray-600">{event.location.emirate}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-3">{t('events.requirements', 'Requirements')}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>{t('events.minAge', 'Minimum Age')}:</strong> {event.requirements.minAge} {t('events.years', 'years')}
                  </p>
                  {event.requirements.skills && event.requirements.skills.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-900 mb-1">{t('events.requiredSkills', 'Required Skills')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.requirements.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {event.requirements.additionalInfo && (
                    <p className="text-gray-600 mt-2">
                      <strong>{t('events.additionalInfo', 'Additional Info')}:</strong> {event.requirements.additionalInfo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Application Section */}
            {canApply && !showApplicationForm && (
              <div className="mt-6 pt-6 border-t">
                <Button onClick={() => setShowApplicationForm(true)} className="w-full" size="lg">
                  {t('events.applyNow', 'Apply for this Event')}
                </Button>
              </div>
            )}

            {showApplicationForm && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">{t('events.applicationForm', 'Application Form')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('events.applicationMessage', 'Why do you want to volunteer for this event?')} ({t('common.optional', 'Optional')})
                    </label>
                    <textarea
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('events.applicationPlaceholder', 'Tell the organization why you\'re interested...')}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleApply} disabled={applying} className="flex-1">
                      {applying ? t('common.submitting', 'Submitting...') : t('events.submitApplication', 'Submit Application')}
                    </Button>
                    <Button
                      onClick={() => setShowApplicationForm(false)}
                      variant="outline"
                      disabled={applying}
                    >
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="mt-6 pt-6 border-t">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    {t('events.loginToApply', 'Please log in to apply for this event')}
                  </p>
                  <Link href={`/login?redirect=/events/${eventId}`}>
                    <Button className="w-full">{t('auth.login', 'Log In')}</Button>
                  </Link>
                </div>
              </div>
            )}

            {isEventFull && !existingApplication && (
              <div className="mt-6 pt-6 border-t">
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-red-800 font-medium">
                    {t('events.eventFullMessage', 'This event has reached its maximum capacity. Applications are closed.')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
