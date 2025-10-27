'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getEvent, getUserProfile } from '@/lib/services/firestore';
import type { Event } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EventQRCodes } from '@/components/events/QRCodeDisplay';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function EventQRCodesPage() {
  const params = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const eventId = params?.id as string;

  useEffect(() => {
    if (user && eventId) {
      loadEvent();
    }
  }, [user, eventId]);

  const loadEvent = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load event
      const eventData = await getEvent(eventId);
      
      if (!eventData) {
        setAuthorized(false);
        return;
      }

      // Check if user is authorized (belongs to the organization)
      const userProfile = await getUserProfile(user.id);
      if (userProfile?.organizationId === eventData.organizationId) {
        setEvent(eventData);
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM d, yyyy h:mm a');
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

  if (!authorized || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {t('common.unauthorized', 'Unauthorized Access')}
            </h2>
            <p className="mt-2 text-gray-600">
              {t('org.qrNotAuthorized', 'You do not have permission to view QR codes for this event')}
            </p>
            <Link href="/organization/dashboard">
              <Button className="mt-4">{t('common.backToDashboard', 'Back to Dashboard')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/organization/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('common.back', 'Back')}
        </Link>

        {/* Event Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription>{event.organizationName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">{t('events.startDate', 'Start Date')}:</span>
                <p className="text-gray-900">{formatDate(event.dateTime.startDate)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('events.endDate', 'End Date')}:</span>
                <p className="text-gray-900">{formatDate(event.dateTime.endDate)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('events.location', 'Location')}:</span>
                <p className="text-gray-900">{event.location.address}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('events.capacity', 'Capacity')}:</span>
                <p className="text-gray-900">
                  {event.capacity.currentVolunteers} / {event.capacity.maxVolunteers} {t('events.volunteers', 'volunteers')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('org.qrInstructions', 'How to Use QR Codes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>{t('org.qrInstruction1', 'Print or display the Check-In QR code at the event entrance')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>{t('org.qrInstruction2', 'Volunteers scan the Check-In code when they arrive')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>{t('org.qrInstruction3', 'Display the Check-Out QR code at the exit point')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>{t('org.qrInstruction4', 'Volunteers scan the Check-Out code when leaving')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">5.</span>
                <span>{t('org.qrInstruction5', 'The system automatically calculates volunteer hours based on check-in/out times')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* QR Codes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('org.attendanceQRCodes', 'Attendance QR Codes')}
          </h2>
          <EventQRCodes
            eventId={event.id}
            checkInCode={event.qrCodes.checkIn}
            checkOutCode={event.qrCodes.checkOut}
            eventTitle={event.title}
          />
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('org.geofencingInfo', 'Geofencing Information')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">{t('org.geofenceRadius', 'Geofence Radius')}:</span>{' '}
                {event.geofence.radius} {t('org.meters', 'meters')}
              </p>
              <p>
                <span className="font-medium">{t('org.strictMode', 'Strict Mode')}:</span>{' '}
                {event.geofence.strictMode ? t('common.yes', 'Yes') : t('common.no', 'No')}
              </p>
              <p>
                <span className="font-medium">{t('org.allowManualCheckIn', 'Allow Manual Check-In')}:</span>{' '}
                {event.geofence.allowManualCheckIn ? t('common.yes', 'Yes') : t('common.no', 'No')}
              </p>
              {event.geofence.strictMode && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-xs">
                    <strong>{t('common.note', 'Note')}:</strong>{' '}
                    {t('org.strictModeNote', 'Strict mode is enabled. Volunteers must be within the geofence radius to check in/out successfully.')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
