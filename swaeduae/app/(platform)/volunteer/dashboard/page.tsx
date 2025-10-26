'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getUserProfile, getUserApplications, getEvent } from '@/lib/services/firestore';
import type { User, Application, Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<Map<string, Event>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user profile
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      // Load applications
      const userApplications = await getUserApplications(user.uid);
      setApplications(userApplications);

      // Load events for applications
      const eventMap = new Map<string, Event>();
      for (const app of userApplications) {
        if (!eventMap.has(app.eventId)) {
          const event = await getEvent(app.eventId);
          if (event) {
            eventMap.set(app.eventId, event);
          }
        }
      }
      setEvents(eventMap);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM d, yyyy');
  };

  const getApplicationStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      WAITLISTED: { label: 'Waitlisted', color: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
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

  const approvedApplications = applications.filter(app => app.status === 'APPROVED');
  const pendingApplications = applications.filter(app => app.status === 'PENDING');

  const stats = [
    {
      label: t('volunteer.totalHours', 'Total Hours'),
      value: userProfile?.totalHours || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: t('volunteer.eventsParticipated', 'Events Participated'),
      value: userProfile?.totalEvents || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: t('volunteer.pendingApplications', 'Pending Applications'),
      value: pendingApplications.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('volunteer.welcome', 'Welcome')}, {userProfile?.displayName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            {t('volunteer.dashboardDesc', 'Track your volunteer journey and discover new opportunities')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('volunteer.quickActions', 'Quick Actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/events">
                <Button className="w-full h-auto py-4 flex flex-col items-center">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {t('volunteer.browseEvents', 'Browse Events')}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('volunteer.editProfile', 'Edit Profile')}
                </Button>
              </Link>
              <Link href="/certificates">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {t('volunteer.certificates', 'My Certificates')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('volunteer.myApplications', 'My Applications')}</CardTitle>
                <CardDescription>{t('volunteer.myApplicationsDesc', 'Track your event applications')}</CardDescription>
              </div>
              <Link href="/events">
                <Button size="sm">{t('volunteer.applyToEvents', 'Apply to Events')}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {t('volunteer.noApplications', 'No applications yet')}
                </h3>
                <p className="mt-2 text-gray-600">
                  {t('volunteer.noApplicationsDesc', 'Start applying to events to see them here')}
                </p>
                <Link href="/events">
                  <Button className="mt-4">{t('volunteer.browseEvents', 'Browse Events')}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => {
                  const event = events.get(application.eventId);
                  return (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {event?.title || 'Loading...'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{event?.organizationName}</span>
                          <span>•</span>
                          <span>{t('volunteer.appliedOn', 'Applied on')} {formatDate(application.appliedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getApplicationStatusBadge(application.status)}
                        {event && (
                          <Link href={`/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                              {t('common.view', 'View')}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
                {applications.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/applications">
                      <Button variant="outline">
                        {t('volunteer.viewAllApplications', 'View All Applications')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
