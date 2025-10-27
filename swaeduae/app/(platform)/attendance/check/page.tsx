'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t as tFunc } from '@/lib/i18n/translations';
import { useRouter } from 'next/navigation';
import { QRScanner } from '@/components/attendance/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getCurrentLocation, 
  validateGeofence, 
  getLocationErrorMessage 
} from '@/lib/services/location';
import {
  getEvent,
  getUserProfile,
  updateUserProfile,
  checkExistingAttendance,
  createAttendance,
  updateAttendance,
  createNotification,
} from '@/lib/services/firestore';
import type { Event, GeoLocation } from '@/types';

type ScanStep = 'scanning' | 'validating' | 'success' | 'error';

export default function AttendanceCheckPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = (key: string, fallback?: string) => tFunc(language, key, fallback);
  const router = useRouter();
  
  const [step, setStep] = useState<ScanStep>('scanning');
  const [scanActive, setScanActive] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCheckIn, setIsCheckIn] = useState(true);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (qrData: string) => {
    if (!user || processing) return;

    try {
      setProcessing(true);
      setScanActive(false);
      setStep('validating');

      // Parse QR code
      const qrPattern = /^SWAEDUAE-(CHECKIN|CHECKOUT)-(\d+)$/;
      const match = qrData.match(qrPattern);

      if (!match) {
        throw new Error('Invalid QR code. Please scan a valid event QR code.');
      }

      const action = match[1];
      const timestamp = parseInt(match[2]);
      setIsCheckIn(action === 'CHECKIN');

      // Extract event ID from QR code (in real implementation, encode event ID in QR)
      // For now, we'll need to find the event by QR code
      // This is a simplified version - in production, encode event ID in QR code
      
      // Get user location
      let userLocation: GeoLocation;
      try {
        userLocation = await getCurrentLocation();
        setLocation(userLocation);
      } catch (locationError: any) {
        throw new Error(getLocationErrorMessage(locationError));
      }

      // For this implementation, we need to match QR code to event
      // In production, encode event ID directly in QR code
      // For now, search for event with this QR code
      const eventData = await findEventByQRCode(qrData);
      if (!eventData) {
        throw new Error('Event not found. Please contact the organization.');
      }

      setEvent(eventData);

      // Validate location against geofence
      const locationValidation = validateGeofence(
        userLocation,
        eventData.location.coordinates,
        eventData.geofence.radius,
        eventData.geofence.strictMode
      );

      if (!locationValidation.valid) {
        throw new Error(locationValidation.message);
      }

      // Check existing attendance
      const existingAttendance = await checkExistingAttendance(user.id, eventData.id);

      if (action === 'CHECKIN') {
        // Handle check-in
        if (existingAttendance && existingAttendance.status !== 'ABSENT') {
          throw new Error('You have already checked in to this event.');
        }

        // Create attendance record
        const attendanceId = await createAttendance({
          eventId: eventData.id,
          userId: user.id,
          status: 'CHECKED_IN',
          checkIn: {
            timestamp: new Date(),
            location: userLocation,
            method: 'QR_CODE',
          },
          hoursCompleted: 0,
        });

        // Send notification to organization
        await createNotification({
          userId: eventData.createdBy,
          type: 'INFO',
          title: 'Volunteer Checked In',
          message: `A volunteer has checked in to your event: ${eventData.title}`,
          read: false,
          actionUrl: `/organization/events/${eventData.id}/attendance`,
        });

        setSuccessMessage(
          `Successfully checked in to ${eventData.title}! Distance from event: ${Math.round(locationValidation.distance)}m`
        );
      } else {
        // Handle check-out
        if (!existingAttendance) {
          throw new Error('No check-in record found. Please check in first.');
        }

        if (existingAttendance.status === 'CHECKED_OUT') {
          throw new Error('You have already checked out from this event.');
        }

        // Calculate hours
        const checkInTime = existingAttendance.checkIn.timestamp instanceof Date
          ? existingAttendance.checkIn.timestamp
          : (existingAttendance.checkIn.timestamp as any).toDate();
        
        const checkOutTime = new Date();
        const hoursCompleted = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        // Update attendance record
        await updateAttendance(existingAttendance.id, {
          status: 'CHECKED_OUT',
          checkOut: {
            timestamp: checkOutTime,
            location: userLocation,
            method: 'QR_CODE',
          },
          hoursCompleted: Math.max(0, hoursCompleted),
        });

        // Update user's total hours
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          await updateUserProfile(user.id, {
            totalHours: (userProfile.totalHours || 0) + hoursCompleted,
            totalEvents: (userProfile.totalEvents || 0) + 1,
          });
        }

        // Send notification
        await createNotification({
          userId: eventData.createdBy,
          type: 'SUCCESS',
          title: 'Volunteer Checked Out',
          message: `A volunteer has checked out from your event: ${eventData.title}`,
          read: false,
          actionUrl: `/organization/events/${eventData.id}/attendance`,
        });

        setSuccessMessage(
          `Successfully checked out from ${eventData.title}! You volunteered for ${hoursCompleted.toFixed(2)} hours.`
        );
      }

      setStep('success');
    } catch (error: any) {
      console.error('Scan error:', error);
      setErrorMessage(error.message || 'Failed to process QR code. Please try again.');
      setStep('error');
    } finally {
      setProcessing(false);
    }
  };

  const findEventByQRCode = async (qrCode: string): Promise<Event | null> => {
    // This is a simplified implementation
    // In production, you would:
    // 1. Encode event ID in QR code
    // 2. Or maintain a mapping of QR codes to events in Firestore
    
    // For now, we'll return null and let error handling deal with it
    // This should be implemented properly in production
    return null;
  };

  const handleScanError = (error: string) => {
    setErrorMessage(error);
    setStep('error');
  };

  const resetScanner = () => {
    setStep('scanning');
    setScanActive(true);
    setErrorMessage('');
    setSuccessMessage('');
    setEvent(null);
    setLocation(null);
    setProcessing(false);
  };

  const goToDashboard = () => {
    router.push('/volunteer/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to check in to events</p>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('attendance.eventCheckIn', 'Event Check-In/Out')}
          </h1>
          <p className="text-gray-600">
            {t('attendance.scanQRCode', 'Scan the event QR code to check in or check out')}
          </p>
        </div>

        {/* Scanning */}
        {step === 'scanning' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('attendance.scanQRTitle', 'Scan QR Code')}</CardTitle>
              <CardDescription>
                {t('attendance.scanQRDesc', 'Point your camera at the QR code displayed at the event')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRScanner
                onScan={handleScan}
                onError={handleScanError}
                active={scanActive}
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  {t('attendance.instructions', 'Instructions')}:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t('attendance.instruction1', 'Allow camera access when prompted')}</li>
                  <li>• {t('attendance.instruction2', 'Hold your device steady')}</li>
                  <li>• {t('attendance.instruction3', 'Position the QR code within the frame')}</li>
                  <li>• {t('attendance.instruction4', 'Ensure good lighting for best results')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validating */}
        {step === 'validating' && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('attendance.validating', 'Validating...')}
              </h3>
              <p className="text-gray-600">
                {t('attendance.validatingDesc', 'Checking your location and event details')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {step === 'success' && (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isCheckIn 
                  ? t('attendance.checkInSuccess', 'Checked In Successfully!')
                  : t('attendance.checkOutSuccess', 'Checked Out Successfully!')}
              </h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              
              {event && (
                <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-2">{t('attendance.eventDetails', 'Event Details')}:</h4>
                  <p className="text-sm text-gray-700"><strong>{t('common.event', 'Event')}:</strong> {event.title}</p>
                  <p className="text-sm text-gray-700"><strong>{t('common.organization', 'Organization')}:</strong> {event.organizationName}</p>
                  {location && (
                    <p className="text-sm text-gray-700"><strong>{t('attendance.location', 'Location')}:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={resetScanner} variant="outline" className="flex-1">
                  {t('attendance.scanAnother', 'Scan Another QR Code')}
                </Button>
                <Button onClick={goToDashboard} className="flex-1">
                  {t('attendance.goToDashboard', 'Go to Dashboard')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {step === 'error' && (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('attendance.scanError', 'Scan Error')}
              </h3>
              <p className="text-red-600 mb-6">{errorMessage}</p>
              <div className="flex gap-3">
                <Button onClick={resetScanner} className="flex-1">
                  {t('attendance.tryAgain', 'Try Again')}
                </Button>
                <Button onClick={goToDashboard} variant="outline" className="flex-1">
                  {t('attendance.goToDashboard', 'Go to Dashboard')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
