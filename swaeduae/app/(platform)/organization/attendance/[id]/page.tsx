'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEvent, getEventAttendances, getEventApplications, updateAttendance, createAttendance, getUserProfile } from '@/lib/services/firestore';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import type { Event, Attendance, Application, User } from '@/types';

interface AttendanceWithUser extends Attendance {
  user?: User;
}

export default function OrganizationAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [event, setEvent] = useState<Event | null>(null);
  const [attendances, setAttendances] = useState<AttendanceWithUser[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    registered: 0,
    checkedIn: 0,
    checkedOut: 0,
    absent: 0,
    lateArrivals: 0,
  });

  useEffect(() => {
    loadEventData();
    setupRealtimeListener();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      
      // Load event details
      const eventData = await getEvent(eventId);
      if (!eventData) {
        console.error('Event not found');
        return;
      }

      // Check if user has permission to view this event
      if (eventData.organizationId !== user?.organizationId && user?.role !== 'ADMIN') {
        router.push('/unauthorized');
        return;
      }

      setEvent(eventData);

      // Load applications
      const appsData = await getEventApplications(eventId);
      const approvedApps = appsData.filter(app => app.status === 'APPROVED');
      setApplications(approvedApps);

      // Load attendances
      const attendancesData = await getEventAttendances(eventId);
      
      // Load user details for each attendance
      const attendancesWithUsers = await Promise.all(
        attendancesData.map(async (attendance) => {
          const userProfile = await getUserProfile(attendance.userId);
          return { ...attendance, user: userProfile };
        })
      );

      setAttendances(attendancesWithUsers);

      // Calculate statistics
      calculateStats(approvedApps, attendancesWithUsers, eventData);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    if (!eventId) return;

    const attendancesRef = collection(db, 'attendances');
    const q = query(
      attendancesRef,
      where('eventId', '==', eventId),
      orderBy('checkIn.timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const attendancesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Attendance[];

      // Load user details
      const attendancesWithUsers = await Promise.all(
        attendancesData.map(async (attendance) => {
          const userProfile = await getUserProfile(attendance.userId);
          return { ...attendance, user: userProfile };
        })
      );

      setAttendances(attendancesWithUsers);

      // Recalculate stats
      if (event && applications.length > 0) {
        calculateStats(applications, attendancesWithUsers, event);
      }
    });

    return () => unsubscribe();
  };

  const calculateStats = (
    apps: Application[],
    atts: AttendanceWithUser[],
    evt: Event
  ) => {
    const checkedIn = atts.filter(a => a.status === 'CHECKED_IN').length;
    const checkedOut = atts.filter(a => a.status === 'CHECKED_OUT').length;
    const registered = apps.length;
    const absent = registered - atts.length;

    // Calculate late arrivals (arrived more than 15 minutes after start time)
    const startTime = evt.dateTime.startDate.toDate
      ? evt.dateTime.startDate.toDate()
      : new Date(evt.dateTime.startDate);
    const lateThreshold = new Date(startTime.getTime() + 15 * 60 * 1000);
    
    const lateArrivals = atts.filter(a => {
      const checkInTime = a.checkIn.timestamp.toDate
        ? a.checkIn.timestamp.toDate()
        : new Date(a.checkIn.timestamp);
      return checkInTime > lateThreshold;
    }).length;

    setStats({
      registered,
      checkedIn,
      checkedOut,
      absent,
      lateArrivals,
    });
  };

  const handleManualCheckIn = async (userId: string) => {
    if (!eventId || !event) return;

    try {
      // Check if already checked in
      const existing = attendances.find(a => a.userId === userId);
      if (existing) {
        alert(t('attendance.alreadyCheckedIn'));
        return;
      }

      await createAttendance({
        eventId,
        userId,
        status: 'CHECKED_IN',
        checkIn: {
          timestamp: new Date(),
          location: event.location.coordinates,
          method: 'MANUAL',
        },
        hoursCompleted: 0,
      });

      alert(t('attendance.checkInSuccess'));
    } catch (error) {
      console.error('Error with manual check-in:', error);
      alert(t('attendance.checkInError'));
    }
  };

  const handleManualCheckOut = async (attendanceId: string) => {
    if (!event) return;

    try {
      const attendance = attendances.find(a => a.id === attendanceId);
      if (!attendance) return;

      const checkInTime = attendance.checkIn.timestamp.toDate
        ? attendance.checkIn.timestamp.toDate()
        : new Date(attendance.checkIn.timestamp);
      const checkOutTime = new Date();
      const hoursCompleted = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      await updateAttendance(attendanceId, {
        status: 'CHECKED_OUT',
        checkOut: {
          timestamp: checkOutTime,
          location: event.location.coordinates,
          method: 'MANUAL',
        },
        hoursCompleted: Math.round(hoursCompleted * 10) / 10,
      });

      alert(t('attendance.checkOutSuccess'));
    } catch (error) {
      console.error('Error with manual check-out:', error);
      alert(t('attendance.checkOutError'));
    }
  };

  const exportAttendanceData = () => {
    if (!event || attendances.length === 0) return;

    // Create CSV content
    const headers = ['Name', 'Email', 'Check In', 'Check Out', 'Hours', 'Status', 'Method'];
    const rows = attendances.map(a => [
      a.user?.displayName || 'Unknown',
      a.user?.email || 'Unknown',
      formatDateTime(a.checkIn.timestamp),
      a.checkOut ? formatDateTime(a.checkOut.timestamp) : 'N/A',
      a.hoursCompleted || 0,
      a.status,
      a.checkIn.method,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${event.title.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDateTime = (date: any) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'MMM dd, yyyy hh:mm a');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      CHECKED_IN: 'bg-blue-100 text-blue-800',
      CHECKED_OUT: 'bg-green-100 text-green-800',
      ABSENT: 'bg-red-100 text-red-800',
      VIOLATION: 'bg-orange-100 text-orange-800',
    };

    const labels = {
      CHECKED_IN: t('attendance.checkedIn'),
      CHECKED_OUT: t('attendance.checkedOut'),
      ABSENT: t('attendance.absent'),
      VIOLATION: t('attendance.violation'),
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('events.notFound')}
          </h2>
          <button
            onClick={() => router.back()}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t('common.goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {t('common.back')}
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'ar' && event.titleAr ? event.titleAr : event.title}
              </h1>
              <p className="text-gray-600 mb-2">
                {t('attendance.liveTracking')}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {event.location.emirate}
                <span className="mx-2">•</span>
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDateTime(event.dateTime.startDate)}
              </div>
            </div>

            <button
              onClick={exportAttendanceData}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {t('attendance.exportData')}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.registered')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.registered}
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.checkedIn')}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.checkedIn}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.checkedOut')}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.checkedOut}
                </p>
              </div>
              <XCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.absent')}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.absent}
                </p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.lateArrivals')}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.lateArrivals}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Registered Volunteers - Not Yet Checked In */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('attendance.awaitingCheckIn')}
            </h2>
          </div>
          <div className="p-6">
            {applications.filter(app => !attendances.some(a => a.userId === app.userId)).length === 0 ? (
              <p className="text-center text-gray-600 py-4">
                {t('attendance.allCheckedIn')}
              </p>
            ) : (
              <div className="space-y-3">
                {applications
                  .filter(app => !attendances.some(a => a.userId === app.userId))
                  .map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {app.userId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t('attendance.notYetCheckedIn')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleManualCheckIn(app.userId)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('attendance.manualCheckIn')}
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Attendance List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('attendance.liveAttendance')}
            </h2>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-600">{t('attendance.liveUpdates')}</span>
            </div>
          </div>

          {attendances.length === 0 ? (
            <div className="p-12 text-center">
              <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('attendance.noAttendanceYet')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('attendance.volunteer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('attendance.checkInTime')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('attendance.checkOutTime')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('attendance.hours')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('attendance.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('attendance.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {attendance.user?.displayName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.user?.email || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(attendance.checkIn.timestamp)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attendance.checkIn.method === 'QR_CODE' ? t('attendance.qrCode') : t('attendance.manual')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendance.checkOut ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDateTime(attendance.checkOut.timestamp)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {attendance.checkOut.method === 'QR_CODE' ? t('attendance.qrCode') : t('attendance.manual')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {attendance.hoursCompleted > 0
                            ? `${attendance.hoursCompleted} ${t('attendance.hours')}`
                            : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(attendance.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {attendance.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleManualCheckOut(attendance.id)}
                            className="text-emerald-600 hover:text-emerald-900 font-medium"
                          >
                            {t('attendance.manualCheckOut')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
