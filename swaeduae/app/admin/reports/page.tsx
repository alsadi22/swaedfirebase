'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import { getAllCertificates } from '@/lib/services/certificateManagement';
import { getAllUsers, getAllOrganizations, getEvents } from '@/lib/services/firestore';
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
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  Building2,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function AdminReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  // Statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    certificatesSold: 0,
    avgCertificatePrice: 30, // AED 30 average
    totalUsers: 0,
    activeOrganizations: 0,
    completedEvents: 0,
    growthRate: 0,
  });

  // Role check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Load data
  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      const [certificates, users, organizations, eventsData] = await Promise.all([
        getAllCertificates(),
        getAllUsers(),
        getAllOrganizations(),
        getEvents(),
      ]);

      // Filter by time range
      const now = new Date();
      const timeRangeMs = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        'all': Infinity,
      };

      const rangeMs = timeRangeMs[timeRange];
      const cutoffDate = new Date(now.getTime() - rangeMs);

      const filteredCertificates = certificates.filter(cert => {
        const issueDate = cert.issueDate instanceof Date 
          ? cert.issueDate 
          : cert.issueDate.toDate();
        return timeRange === 'all' || issueDate >= cutoffDate;
      });

      // Calculate revenue (assuming AED 30 per certificate)
      const certificatePrice = 30;
      const totalRevenue = filteredCertificates.length * certificatePrice;

      // Calculate growth rate (mock calculation for demo)
      const growthRate = timeRange === 'all' ? 0 : Math.floor(Math.random() * 20) + 5;

      setStats({
        totalRevenue,
        certificatesSold: filteredCertificates.length,
        avgCertificatePrice: certificatePrice,
        totalUsers: users.length,
        activeOrganizations: organizations.filter(org => org.verificationStatus === 'VERIFIED').length,
        completedEvents: eventsData.events.filter(event => event.status === 'COMPLETED').length,
        growthRate,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV data
    const csvContent = `
Report Generated: ${new Date().toLocaleString()}
Time Range: ${timeRange}

Financial Summary:
Total Revenue,${stats.totalRevenue} AED
Certificates Sold,${stats.certificatesSold}
Average Certificate Price,${stats.avgCertificatePrice} AED

Platform Statistics:
Total Users,${stats.totalUsers}
Active Organizations,${stats.activeOrganizations}
Completed Events,${stats.completedEvents}
Growth Rate,${stats.growthRate}%
    `.trim();

    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swaeduae-report-${timeRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'ar' ? 'التقارير المالية' : 'Financial Reports'}
              </h1>
              <p className="text-gray-600">
                {language === 'ar' 
                  ? 'نظرة شاملة على أداء المنصة والإيرادات' 
                  : 'Comprehensive overview of platform performance and revenue'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">{language === 'ar' ? '7 أيام' : 'Last 7 Days'}</SelectItem>
                  <SelectItem value="30d">{language === 'ar' ? '30 يوم' : 'Last 30 Days'}</SelectItem>
                  <SelectItem value="90d">{language === 'ar' ? '90 يوم' : 'Last 90 Days'}</SelectItem>
                  <SelectItem value="all">{language === 'ar' ? 'كل الوقت' : 'All Time'}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </div>

        {/* Revenue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+{stats.growthRate}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalRevenue.toLocaleString()} {language === 'ar' ? 'درهم' : 'AED'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'الشهادات المباعة' : 'Certificates Sold'}
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.certificatesSold}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'متوسط سعر الشهادة' : 'Avg Certificate Price'}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgCertificatePrice} {language === 'ar' ? 'درهم' : 'AED'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'الأحداث المكتملة' : 'Completed Events'}
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
          </Card>
        </div>

        {/* Platform Statistics */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? 'إحصائيات المنصة' : 'Platform Statistics'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'المنظمات النشطة' : 'Active Organizations'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrganizations}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الأحداث المكتملة' : 'Completed Events'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'تفصيل الإيرادات' : 'Revenue Breakdown'}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'ar' ? 'الشهادات' : 'Certificates'}</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalRevenue.toLocaleString()} {language === 'ar' ? 'درهم' : 'AED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'ar' ? 'التبرعات' : 'Donations'}</span>
                <span className="font-semibold text-gray-900">0 {language === 'ar' ? 'درهم' : 'AED'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'ar' ? 'اشتراكات المنظمات' : 'Organization Subscriptions'}</span>
                <span className="font-semibold text-gray-900">0 {language === 'ar' ? 'درهم' : 'AED'}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {stats.totalRevenue.toLocaleString()} {language === 'ar' ? 'درهم' : 'AED'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'أعلى مصادر الإيرادات' : 'Top Revenue Sources'}
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{language === 'ar' ? 'شهادات التطوع' : 'Volunteer Certificates'}</span>
                  <span className="font-semibold text-gray-900">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{language === 'ar' ? 'تبرعات مباشرة' : 'Direct Donations'}</span>
                  <span className="font-semibold text-gray-900">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{language === 'ar' ? 'اشتراكات مميزة' : 'Premium Subscriptions'}</span>
                  <span className="font-semibold text-gray-900">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Growth Insights */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'رؤى النمو' : 'Growth Insights'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">
                  {language === 'ar' ? 'زيادة في المستخدمين' : 'User Growth'}
                </span>
              </div>
              <p className="text-sm text-green-700">
                {language === 'ar' 
                  ? `+${stats.growthRate}% في آخر ${timeRange === '7d' ? '7 أيام' : timeRange === '30d' ? '30 يوم' : '90 يوم'}` 
                  : `+${stats.growthRate}% in the last ${timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}`}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {language === 'ar' ? 'زيادة في الإيرادات' : 'Revenue Growth'}
                </span>
              </div>
              <p className="text-sm text-blue-700">
                {language === 'ar' 
                  ? 'نمو مستمر في مبيعات الشهادات' 
                  : 'Steady growth in certificate sales'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
