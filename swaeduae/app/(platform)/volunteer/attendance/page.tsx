'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getUserAttendances, getEvent, getUserProfile } from '@/lib/services/firestore';
import { downloadCertificate } from '@/lib/services/certificate';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import type { Attendance, Event, User } from '@/types';

interface AttendanceWithEvent extends Attendance {
  event?: Event;
}

export default function VolunteerAttendancePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [attendances, setAttendances] = useState<AttendanceWithEvent[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalHours: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadAttendances();
  }, [user]);

  const loadAttendances = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Load user profile
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
      
      const attendanceData = await getUserAttendances(user.id);

      // Load event details for each attendance
      const attendancesWithEvents = await Promise.all(
        attendanceData.map(async (attendance) => {
          const event = await getEvent(attendance.eventId);
          return { ...attendance, event: event || undefined };
        })
      );

      setAttendances(attendancesWithEvents);

      // Calculate statistics
      const completed = attendancesWithEvents.filter(a => a.status === 'CHECKED_OUT');
      const totalHours = attendancesWithEvents.reduce((sum, a) => sum + a.hoursCompleted, 0);
      
      setStats({
        totalEvents: attendancesWithEvents.length,
        totalHours: Math.round(totalHours * 10) / 10,
        completionRate: attendancesWithEvents.length > 0 
          ? Math.round((completed.length / attendancesWithEvents.length) * 100)
          : 0,
      });
    } catch (error) {
      console.error('Error loading attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendances = attendances.filter(attendance => {
    if (filter === 'completed') return attendance.status === 'CHECKED_OUT';
    if (filter === 'ongoing') return attendance.status === 'CHECKED_IN';
    return true;
  });

  const formatDate = (date: any) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'MMM dd, yyyy');
  };

  const formatTime = (date: any) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'hh:mm a');
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

  const handleDownloadCertificate = (attendance: AttendanceWithEvent) => {
    if (!attendance.event || !userProfile) {
      alert('Unable to generate certificate. Missing data.');
      return;
    }

    try {
      downloadCertificate({
        volunteer: userProfile,
        event: attendance.event,
        attendance: attendance,
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('attendance.myAttendance')}
          </h1>
          <p className="text-gray-600">
            {t('attendance.trackYourHistory')}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
              <div className={`ml-4 ${ language === 'ar' ? 'mr-4 ml-0' : ''}`}>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.totalEvents')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className={`ml-4 ${ language === 'ar' ? 'mr-4 ml-0' : ''}`}>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.totalHours')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalHours}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className={`ml-4 ${ language === 'ar' ? 'mr-4 ml-0' : ''}`}>
                <p className="text-sm font-medium text-gray-600">
                  {t('attendance.completionRate')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('attendance.allEvents')}
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('attendance.completed')}
              </button>
              <button
                onClick={() => setFilter('ongoing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'ongoing'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('attendance.ongoing')}
              </button>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        {filteredAttendances.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('attendance.noAttendance')}
            </h3>
            <p className="text-gray-600">
              {t('attendance.noAttendanceDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAttendances.map((attendance) => (
              <div
                key={attendance.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        { language === 'ar' && attendance.event?.titleAr
                          ? attendance.event.titleAr
                          : attendance.event?.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {attendance.event?.organizationName}
                      </p>
                    </div>
                    <div>{getStatusBadge(attendance.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Check-in Info */}
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className={`ml-3 ${ language === 'ar' ? 'mr-3 ml-0' : ''}`}>
                        <p className="text-sm font-medium text-gray-900">
                          {t('attendance.checkInTime')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(attendance.checkIn.timestamp)} {t('common.at')}{' '}
                          {formatTime(attendance.checkIn.timestamp)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('attendance.method')}: {attendance.checkIn.method === 'QR_CODE' ? t('attendance.qrCode') : t('attendance.manual')}
                        </p>
                      </div>
                    </div>

                    {/* Check-out Info */}
                    {attendance.checkOut && (
                      <div className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className={`ml-3 ${ language === 'ar' ? 'mr-3 ml-0' : ''}`}>
                          <p className="text-sm font-medium text-gray-900">
                            {t('attendance.checkOutTime')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(attendance.checkOut.timestamp)} {t('common.at')}{' '}
                            {formatTime(attendance.checkOut.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('attendance.method')}: {attendance.checkOut.method === 'QR_CODE' ? t('attendance.qrCode') : t('attendance.manual')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hours and Location */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        {attendance.hoursCompleted > 0
                          ? `${attendance.hoursCompleted} ${t('attendance.hours')}`
                          : t('attendance.inProgress')}
                      </span>
                    </div>
                    {attendance.event?.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>{attendance.event.location.emirate}</span>
                      </div>
                    )}
                  </div>

                  {/* Violations */}
                  {attendance.violations && attendance.violations.length > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-900 mb-1">
                        {t('attendance.violations')}
                      </p>
                      {attendance.violations.map((violation, index) => (
                        <p key={index} className="text-sm text-orange-700">
                          • {violation.description}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {attendance.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        {t('attendance.notes')}
                      </p>
                      <p className="text-sm text-blue-700">{attendance.notes}</p>
                    </div>
                  )}

                  {/* Certificate Eligibility */}
                  {attendance.status === 'CHECKED_OUT' && attendance.hoursCompleted > 0 && (
                    <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        {t('attendance.certificateEligible')}
                      </p>
                      <button 
                        onClick={() => handleDownloadCertificate(attendance)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        {t('attendance.viewCertificate')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
