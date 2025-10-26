'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getUserProfile, getOrganizationEvents, getEventApplications, updateApplicationStatus, getEvent, getUserProfile as getApplicantProfile, createNotification } from '@/lib/services/firestore';
import type { User, Event, Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface ApplicationWithDetails extends Application {
  event?: Event;
  applicant?: User;
}

export default function ApplicationManagementPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [responseMessage, setResponseMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  useEffect(() => {
    filterApplicationsList();
  }, [applications, filterStatus, searchQuery]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      if (!profile?.organizationId) return;

      // Get all organization events
      const events = await getOrganizationEvents(profile.organizationId);

      // Get applications for all events
      const allApplications: ApplicationWithDetails[] = [];
      for (const event of events) {
        const eventApplications = await getEventApplications(event.id);
        
        // Load applicant details for each application
        for (const app of eventApplications) {
          const applicant = await getApplicantProfile(app.userId);
          allApplications.push({
            ...app,
            event,
            applicant: applicant || undefined,
          });
        }
      }

      // Sort by application date (newest first)
      allApplications.sort((a, b) => {
        const dateA = a.appliedAt instanceof Date ? a.appliedAt : (a.appliedAt as any).toDate();
        const dateB = b.appliedAt instanceof Date ? b.appliedAt : (b.appliedAt as any).toDate();
        return dateB.getTime() - dateA.getTime();
      });

      setApplications(allApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplicationsList = () => {
    let filtered = [...applications];

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicant?.displayName?.toLowerCase().includes(query) ||
        app.applicant?.email?.toLowerCase().includes(query) ||
        app.event?.title?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: Application['status'],
    eventId: string,
    userId: string
  ) => {
    try {
      setProcessing(applicationId);

      const message = responseMessage[applicationId] || '';
      await updateApplicationStatus(applicationId, newStatus, message, user?.uid);

      // Send notification to volunteer
      const notificationMessage = newStatus === 'APPROVED' 
        ? t('org.applicationApprovedNotif', 'Your application has been approved!')
        : newStatus === 'REJECTED'
        ? t('org.applicationRejectedNotif', 'Your application has been rejected.')
        : t('org.applicationUpdatedNotif', 'Your application status has been updated.');

      await createNotification({
        userId,
        type: newStatus === 'APPROVED' ? 'SUCCESS' : newStatus === 'REJECTED' ? 'ERROR' : 'INFO',
        title: t('org.applicationStatusUpdate', 'Application Status Update'),
        message: notificationMessage,
        read: false,
        actionUrl: `/events/${eventId}`,
      });

      // Reload applications
      await loadApplications();
      
      // Clear response message
      setResponseMessage(prev => {
        const updated = { ...prev };
        delete updated[applicationId];
        return updated;
      });

      alert(t('org.statusUpdateSuccess', 'Application status updated successfully!'));
    } catch (error) {
      console.error('Error updating application status:', error);
      alert(t('org.statusUpdateError', 'Failed to update application status. Please try again.'));
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getStatusBadge = (status: string) => {
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

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    WAITLISTED: applications.filter(a => a.status === 'WAITLISTED').length,
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

  if (!userProfile?.organizationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('org.noOrganization', 'No Organization Found')}
            </h2>
            <p className="text-gray-600">
              {t('org.cannotManageApplications', 'You must be part of an organization to manage applications')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('org.applicationManagement', 'Application Management')}
          </h1>
          <p className="text-gray-600">
            {t('org.applicationManagementDesc', 'Review and manage volunteer applications for your events')}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? t('common.all', 'All') : status} ({count})
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              type="text"
              placeholder={t('org.searchApplications', 'Search by volunteer name, email, or event...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('org.applications', 'Applications')} ({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {t('org.noApplications', 'No applications found')}
                </h3>
                <p className="mt-2 text-gray-600">
                  {filterStatus === 'PENDING' 
                    ? t('org.noPendingApplications', 'No pending applications at the moment')
                    : t('org.noApplicationsDesc', 'Adjust your filters or wait for volunteers to apply')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.applicant?.displayName || 'Unknown Volunteer'}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {application.applicant?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>{t('org.event', 'Event')}:</strong> {application.event?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('org.appliedOn', 'Applied on')} {formatDate(application.appliedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Volunteer Details */}
                    {application.applicant && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {t('org.volunteerDetails', 'Volunteer Details')}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {application.applicant.phoneNumber && (
                            <div>
                              <span className="text-gray-600">{t('profile.phoneNumber', 'Phone')}:</span>{' '}
                              <span className="text-gray-900">{application.applicant.phoneNumber}</span>
                            </div>
                          )}
                          {application.applicant.emiratesId && (
                            <div>
                              <span className="text-gray-600">{t('profile.emiratesId', 'Emirates ID')}:</span>{' '}
                              <span className="text-gray-900">{application.applicant.emiratesId}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">{t('profile.totalHours', 'Total Hours')}:</span>{' '}
                            <span className="text-gray-900">{application.applicant.totalHours}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">{t('profile.totalEvents', 'Events')}:</span>{' '}
                            <span className="text-gray-900">{application.applicant.totalEvents}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Application Message */}
                    {application.message && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {t('org.applicationMessage', 'Application Message')}
                        </h4>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                          {application.message}
                        </p>
                      </div>
                    )}

                    {/* Response Message (if exists) */}
                    {application.responseMessage && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {t('org.yourResponse', 'Your Response')}
                        </h4>
                        <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">
                          {application.responseMessage}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('org.respondedOn', 'Responded on')} {formatDate(application.respondedAt)}
                        </p>
                      </div>
                    )}

                    {/* Action Section (for pending applications) */}
                    {application.status === 'PENDING' && (
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('org.responseMessage', 'Response Message')} ({t('common.optional', 'Optional')})
                          </label>
                          <textarea
                            value={responseMessage[application.id] || ''}
                            onChange={(e) => setResponseMessage(prev => ({
                              ...prev,
                              [application.id]: e.target.value
                            }))}
                            rows={2}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('org.responseMessagePlaceholder', 'Add a message for the volunteer...')}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateStatus(application.id, 'APPROVED', application.eventId, application.userId)}
                            disabled={processing === application.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processing === application.id ? t('common.processing', 'Processing...') : t('org.approve', 'Approve')}
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(application.id, 'REJECTED', application.eventId, application.userId)}
                            disabled={processing === application.id}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            {t('org.reject', 'Reject')}
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(application.id, 'WAITLISTED', application.eventId, application.userId)}
                            disabled={processing === application.id}
                            variant="outline"
                          >
                            {t('org.waitlist', 'Waitlist')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
