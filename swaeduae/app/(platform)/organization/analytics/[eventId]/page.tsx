'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getEventAnalytics, exportEventAnalyticsCSV } from '@/lib/services/eventAnalytics';
import type { EventAnalytics, Event } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  BarChart,
} from 'lucide-react';

export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (eventId) {
      loadAnalytics();
    }
  }, [eventId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, eventData] = await Promise.all([
        getEventAnalytics(eventId),
        getEventData(eventId),
      ]);
      setAnalytics(analyticsData);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventData = async (id: string): Promise<Event | null> => {
    const eventRef = doc(db, 'events', id);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) return null;
    return { id: eventSnap.id, ...eventSnap.data() } as Event;
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    
    const csv = exportEventAnalyticsCSV(analytics);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-analytics-${eventId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!analytics || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">
            {language === 'ar' ? 'لم يتم العثور على بيانات' : 'No data found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'تحليلات الفعالية' : 'Event Analytics'}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {language === 'ar' ? event.titleAr : event.title}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'التسجيلات' : 'Registrations'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{analytics.registrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الموافقات' : 'Approvals'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{analytics.approvals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الحضور' : 'Attendance'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{analytics.attendance}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي الساعات' : 'Total Hours'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalHoursVolunteered}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}
              </h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate}%</p>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'ar'
                ? 'من التسجيلات إلى الموافقات'
                : 'Registrations to Approvals'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'معدل الحضور' : 'Attendance Rate'}
              </h3>
              <BarChart className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.attendanceRate}%</p>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'ar' ? 'من الموافقات إلى الحضور' : 'Approvals to Attendance'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'متوسط الساعات' : 'Average Hours'}
              </h3>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.averageHours}</p>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'ar' ? 'لكل متطوع' : 'Per Volunteer'}
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'تفاصيل الطلبات' : 'Application Details'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'إجمالي التسجيلات' : 'Total Registrations'}
                </span>
                <span className="font-semibold">{analytics.registrations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'الموافقات' : 'Approved'}
                </span>
                <span className="font-semibold text-green-600">{analytics.approvals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'الرفض' : 'Rejected'}
                </span>
                <span className="font-semibold text-red-600">{analytics.rejections}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'عدم الحضور' : 'No Shows'}
                </span>
                <span className="font-semibold text-orange-600">{analytics.noShows}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'تفاصيل الحضور' : 'Attendance Details'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'سجل الحضور' : 'Checked In'}
                </span>
                <span className="font-semibold">{analytics.attendance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'أكمل' : 'Completed'}
                </span>
                <span className="font-semibold text-green-600">{analytics.completions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'إجمالي الساعات' : 'Total Hours'}
                </span>
                <span className="font-semibold">{analytics.totalHoursVolunteered}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'ar' ? 'متوسط الساعات' : 'Average Hours'}
                </span>
                <span className="font-semibold">{analytics.averageHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Skills */}
        {analytics.topSkills && analytics.topSkills.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'أهم المهارات' : 'Top Skills'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.topSkills.map((skill, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{skill.skill}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {skill.count} {language === 'ar' ? 'متطوع' : 'volunteers'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demographics */}
        {analytics.demographics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'التركيبة السكانية' : 'Demographics'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'الفئات العمرية' : 'Age Groups'}
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.demographics.ageGroups).map(([age, count]) => (
                    <div key={age} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{age}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'الجنس' : 'Gender'}
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.demographics.genders).map(([gender, count]) => (
                    <div key={gender} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{gender}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'الجنسيات' : 'Nationalities'}
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.demographics.nationalities)
                    .slice(0, 5)
                    .map(([nationality, count]) => (
                      <div key={nationality} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{nationality}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
