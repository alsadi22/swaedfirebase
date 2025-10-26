'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import { Event, EventStatus } from '@/types';
import { getEvents, updateEvent, deleteEvent } from '@/lib/services/firestore';
import { sendEmail } from '@/lib/services/email';
import { createNotification } from '@/lib/services/notifications';
import { logEventModeration } from '@/lib/services/auditLogger';
import { formatDate } from '@/lib/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Building2
} from 'lucide-react';

export default function AdminEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Role check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Load events
  useEffect(() => {
    loadEvents();
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.emirate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await getEvents();
      setEvents(result.events);
      setFilteredEvents(result.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;

    try {
      setProcessing(true);

      // Update event status
      await updateEvent(selectedEvent.id, {
        status: 'PUBLISHED' as EventStatus,
        approvedAt: new Date(),
        approvedBy: user?.id,
        approvalNotes: approvalNotes,
      });

      // Send approval email
      const orgAdmin = await import('@/lib/services/firestore').then(m => m.getUserProfile(selectedEvent.createdBy));
      if (orgAdmin) {
        await sendEmail({
          to: orgAdmin.email,
          subject: language === 'ar' ? 'تم الموافقة على الحدث' : 'Event Approved',
          htmlContent: `
            <div dir="${dir}">
              <h2>${language === 'ar' ? 'تم الموافقة على حدثك' : 'Your Event Has Been Approved'}</h2>
              <p>${language === 'ar' ? 'مرحباً' : 'Hello'} ${orgAdmin.displayName},</p>
              <p>${language === 'ar' 
                ? `تم الموافقة على حدثك "${selectedEvent.title}" ونشره على المنصة.` 
                : `Your event "${selectedEvent.title}" has been approved and published on the platform.`
              }</p>
              ${approvalNotes ? `<p><strong>${language === 'ar' ? 'ملاحظات:' : 'Notes:'}</strong> ${approvalNotes}</p>` : ''}
              <p>${language === 'ar' ? 'يمكن للمتطوعين الآن التقديم على حدثك.' : 'Volunteers can now apply to your event.'}</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/organization/events/${selectedEvent.id}" 
                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
                ${language === 'ar' ? 'عرض الحدث' : 'View Event'}
              </a>
            </div>
          `,
        });

        // Create notification
        await createNotification({
          userId: selectedEvent.createdBy,
          type: 'SUCCESS',
          title: language === 'ar' ? 'تم الموافقة على الحدث' : 'Event Approved',
          titleAr: 'تم الموافقة على الحدث',
          message: language === 'ar' 
            ? `تم الموافقة على حدثك "${selectedEvent.title}" ونشره.` 
            : `Your event "${selectedEvent.title}" has been approved and published.`,
          messageAr: `تم الموافقة على حدثك "${selectedEvent.title}" ونشره.`,
          read: false,
          actionUrl: `/organization/events/${selectedEvent.id}`,
        });

        // Log audit trail
        if (user) {
          await logEventModeration(
            user.id,
            user.displayName,
            'EVENT_APPROVED',
            selectedEvent.id,
            selectedEvent.title,
            approvalNotes
          );
        }
      }

      // Reload events
      await loadEvents();
      setShowApprovalModal(false);
      setSelectedEvent(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error approving event:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء الموافقة على الحدث' : 'Error approving event');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent || !rejectionReason.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال سبب الرفض' : 'Please enter rejection reason');
      return;
    }

    try {
      setProcessing(true);

      // Update event status
      await updateEvent(selectedEvent.id, {
        status: 'CANCELLED' as EventStatus,
        rejectedAt: new Date(),
        rejectedBy: user?.id,
        rejectionReason: rejectionReason,
      });

      // Send rejection email
      const orgAdmin = await import('@/lib/services/firestore').then(m => m.getUserProfile(selectedEvent.createdBy));
      if (orgAdmin) {
        await sendEmail({
          to: orgAdmin.email,
          subject: language === 'ar' ? 'تم رفض الحدث' : 'Event Rejected',
          htmlContent: `
            <div dir="${dir}">
              <h2>${language === 'ar' ? 'تم رفض حدثك' : 'Your Event Has Been Rejected'}</h2>
              <p>${language === 'ar' ? 'مرحباً' : 'Hello'} ${orgAdmin.displayName},</p>
              <p>${language === 'ar' 
                ? `نأسف لإبلاغك بأن حدثك "${selectedEvent.title}" لم يتم الموافقة عليه.` 
                : `We regret to inform you that your event "${selectedEvent.title}" has not been approved.`
              }</p>
              <p><strong>${language === 'ar' ? 'السبب:' : 'Reason:'}</strong> ${rejectionReason}</p>
              <p>${language === 'ar' 
                ? 'يمكنك تعديل الحدث وإعادة تقديمه للمراجعة.' 
                : 'You can edit the event and resubmit it for review.'
              }</p>
            </div>
          `,
        });

        // Create notification
        await createNotification({
          userId: selectedEvent.createdBy,
          type: 'ERROR',
          title: language === 'ar' ? 'تم رفض الحدث' : 'Event Rejected',
          titleAr: 'تم رفض الحدث',
          message: language === 'ar' 
            ? `تم رفض حدثك "${selectedEvent.title}". السبب: ${rejectionReason}` 
            : `Your event "${selectedEvent.title}" was rejected. Reason: ${rejectionReason}`,
          messageAr: `تم رفض حدثك "${selectedEvent.title}". السبب: ${rejectionReason}`,
          read: false,
        });

        // Log audit trail
        if (user) {
          await logEventModeration(
            user.id,
            user.displayName,
            'EVENT_REJECTED',
            selectedEvent.id,
            selectedEvent.title,
            rejectionReason
          );
        }
      }

      // Reload events
      await loadEvents();
      setShowRejectionModal(false);
      setSelectedEvent(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء رفض الحدث' : 'Error rejecting event');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الحدث؟' : 'Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حذف الحدث' : 'Error deleting event');
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const badges = {
      DRAFT: { label: language === 'ar' ? 'مسودة' : 'Draft', color: 'bg-gray-100 text-gray-800' },
      PENDING_APPROVAL: { label: language === 'ar' ? 'قيد المراجعة' : 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
      PUBLISHED: { label: language === 'ar' ? 'منشور' : 'Published', color: 'bg-green-100 text-green-800' },
      ONGOING: { label: language === 'ar' ? 'جاري' : 'Ongoing', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: language === 'ar' ? 'مكتمل' : 'Completed', color: 'bg-purple-100 text-purple-800' },
      CANCELLED: { label: language === 'ar' ? 'ملغي' : 'Cancelled', color: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'ar' ? 'إدارة الأحداث' : 'Event Moderation'}
          </h1>
          <p className="text-gray-600">
            {language === 'ar' 
              ? 'مراجعة والموافقة على الأحداث المقدمة من المنظمات' 
              : 'Review and approve events submitted by organizations'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي الأحداث' : 'Total Events'}</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'قيد المراجعة' : 'Pending Review'}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {events.filter(e => e.status === 'PENDING_APPROVAL').length}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'منشور' : 'Published'}</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.status === 'PUBLISHED').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'ملغي' : 'Cancelled'}</p>
                <p className="text-2xl font-bold text-red-600">
                  {events.filter(e => e.status === 'CANCELLED').length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن حدث، منظمة، أو موقع...' : 'Search event, organization, or location...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EventStatus | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">{language === 'ar' ? 'قيد المراجعة' : 'Pending Approval'}</SelectItem>
                  <SelectItem value="PUBLISHED">{language === 'ar' ? 'منشور' : 'Published'}</SelectItem>
                  <SelectItem value="ONGOING">{language === 'ar' ? 'جاري' : 'Ongoing'}</SelectItem>
                  <SelectItem value="COMPLETED">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
                  <SelectItem value="CANCELLED">{language === 'ar' ? 'ملغي' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {language === 'ar' ? 'لا توجد أحداث' : 'No events found'}
              </p>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {language === 'ar' && event.titleAr ? event.titleAr : event.title}
                          </h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{event.organizationName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location.emirate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.dateTime.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.capacity.currentVolunteers}/{event.capacity.maxVolunteers} {language === 'ar' ? 'متطوع' : 'volunteers'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'عرض' : 'View'}
                    </Button>
                    {event.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowApprovalModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'موافقة' : 'Approve'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowRejectionModal(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'رفض' : 'Reject'}
                        </Button>
                      </>
                    )}
                    {event.status === 'CANCELLED' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'ar' ? 'الموافقة على الحدث' : 'Approve Event'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'ar' 
                  ? `هل أنت متأكد من الموافقة على حدث "${selectedEvent.title}"؟` 
                  : `Are you sure you want to approve the event "${selectedEvent.title}"?`}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                </label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'أضف ملاحظات للمنظمة...' : 'Add notes for the organization...'}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {processing ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (language === 'ar' ? 'موافقة' : 'Approve')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedEvent(null);
                    setApprovalNotes('');
                  }}
                  disabled={processing}
                  className="flex-1"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'ar' ? 'رفض الحدث' : 'Reject Event'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'ar' 
                  ? `يرجى تقديم سبب رفض حدث "${selectedEvent.title}".` 
                  : `Please provide a reason for rejecting the event "${selectedEvent.title}".`}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'سبب الرفض *' : 'Rejection Reason *'}
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل سبب الرفض...' : 'Enter rejection reason...'}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  {processing ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (language === 'ar' ? 'رفض' : 'Reject')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setSelectedEvent(null);
                    setRejectionReason('');
                  }}
                  disabled={processing}
                  className="flex-1"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
