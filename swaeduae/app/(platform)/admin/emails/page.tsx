'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import {
  getEmailAnalyticsSummary,
  getEmailTracking,
  getEmailQueueStatus,
  getTemplatePerformance,
  exportEmailAnalyticsCSV,
  EmailTracking,
} from '@/lib/services/emailAnalytics';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  MousePointerClick,
  Download,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function EmailManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { locale, isRTL } = useLanguage();
  const t = translations[locale];

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [emailTracking, setEmailTracking] = useState<EmailTracking[]>([]);
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    totalFailed: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
  });
  const [queueStatus, setQueueStatus] = useState({
    pending: 0,
    sending: 0,
    failed: 0,
  });
  const [templatePerformance, setTemplatePerformance] = useState<Record<string, any>>({});

  // Role check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Load data
  useEffect(() => {
    loadEmailData();
  }, [timeRange]);

  const loadEmailData = async () => {
    try {
      setLoading(true);

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [summary, tracking, queue, performance] = await Promise.all([
        getEmailAnalyticsSummary(days),
        getEmailTracking({ startDate, limitCount: 100 }),
        getEmailQueueStatus(),
        getTemplatePerformance(),
      ]);

      setAnalytics(summary);
      setEmailTracking(tracking);
      setQueueStatus(queue);
      setTemplatePerformance(performance);
    } catch (error) {
      console.error('Error loading email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportEmailAnalyticsCSV(emailTracking);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-analytics-${timeRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: locale === 'ar' ? 'معلق' : 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      SENT: { label: locale === 'ar' ? 'مرسل' : 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
      DELIVERED: { label: locale === 'ar' ? 'تم التسليم' : 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { label: locale === 'ar' ? 'فشل' : 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
      BOUNCED: { label: locale === 'ar' ? 'مرتد' : 'Bounced', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{ language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-8 h-8 text-emerald-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  { language === 'ar' ? 'إدارة البريد الإلكتروني' : 'Email Management'}
                </h1>
              </div>
              <p className="text-gray-600">
                { language === 'ar' 
                  ? 'تتبع أداء البريد الإلكتروني والمشاركة' 
                  : 'Track email performance and engagement'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">{ language === 'ar' ? '7 أيام' : 'Last 7 Days'}</SelectItem>
                  <SelectItem value="30d">{ language === 'ar' ? '30 يوم' : 'Last 30 Days'}</SelectItem>
                  <SelectItem value="90d">{ language === 'ar' ? '90 يوم' : 'Last 90 Days'}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                { language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </div>

        {/* Email Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{ language === 'ar' ? 'معدل التسليم' : 'Delivery Rate'}</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.deliveryRate}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {analytics.totalDelivered.toLocaleString()} / {analytics.totalSent.toLocaleString()} { language === 'ar' ? 'تم التسليم' : 'delivered'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{ language === 'ar' ? 'معدل الفتح' : 'Open Rate'}</p>
                <p className="text-2xl font-bold text-green-600">{analytics.openRate}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {analytics.totalOpened.toLocaleString()} { language === 'ar' ? 'فتح' : 'opens'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{ language === 'ar' ? 'معدل النقر' : 'Click Rate'}</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.clickRate}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {analytics.totalClicked.toLocaleString()} { language === 'ar' ? 'نقرة' : 'clicks'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{ language === 'ar' ? 'معدل الارتداد' : 'Bounce Rate'}</p>
                <p className="text-2xl font-bold text-red-600">{analytics.bounceRate}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {analytics.totalBounced.toLocaleString()} { language === 'ar' ? 'ارتداد' : 'bounces'}
            </p>
          </Card>
        </div>

        {/* Email Queue Status */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            { language === 'ar' ? 'حالة قائمة الانتظار' : 'Queue Status'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{ language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                <p className="text-2xl font-bold text-gray-900">{queueStatus.pending}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{ language === 'ar' ? 'جاري الإرسال' : 'Sending'}</p>
                <p className="text-2xl font-bold text-gray-900">{queueStatus.sending}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{ language === 'ar' ? 'فشل' : 'Failed'}</p>
                <p className="text-2xl font-bold text-gray-900">{queueStatus.failed}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Template Performance */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            { language === 'ar' ? 'أداء القوالب' : 'Template Performance'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    { language === 'ar' ? 'القالب' : 'Template'}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    { language === 'ar' ? 'مرسل' : 'Sent'}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    { language === 'ar' ? 'معدل الفتح' : 'Open Rate'}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    { language === 'ar' ? 'معدل النقر' : 'Click Rate'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(templatePerformance).map(([template, data]) => (
                  <tr key={template} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{template}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{data.sent}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{data.openRate}%</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{data.clickRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Emails */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            { language === 'ar' ? 'الرسائل الأخيرة' : 'Recent Emails'}
          </h2>
          <div className="overflow-x-auto">
            {emailTracking.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  { language === 'ar' ? 'لا توجد رسائل بريد إلكتروني' : 'No emails found'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      { language === 'ar' ? 'المستلم' : 'Recipient'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      { language === 'ar' ? 'الموضوع' : 'Subject'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      { language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      { language === 'ar' ? 'تاريخ الإرسال' : 'Sent At'}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      { language === 'ar' ? 'فتح' : 'Opened'}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      { language === 'ar' ? 'نقر' : 'Clicked'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emailTracking.map((email) => (
                    <tr key={email.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{email.to}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{email.subject}</td>
                      <td className="py-3 px-4">{getStatusBadge(email.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {email.sentAt ? formatDateTime(email.sentAt, locale) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {email.opened ? (
                          <Eye className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {email.clicked ? (
                          <MousePointerClick className="w-5 h-5 text-purple-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
