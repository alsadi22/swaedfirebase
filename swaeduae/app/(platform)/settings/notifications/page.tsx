'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import {
  getUserNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '@/lib/services/notifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone, Save, ArrowLeft } from 'lucide-react';

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadPreferences();
  }, [user, router]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const prefs = await getUserNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !preferences) return;

    try {
      setSaving(true);
      await updateNotificationPreferences(user.id, preferences);
      alert(language === 'ar' ? 'تم حفظ التفضيلات بنجاح' : 'Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ التفضيلات' : 'Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (
    category: 'email' | 'inApp' | 'pushNotifications',
    key: string,
    value: boolean
  ) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: value,
      },
    });
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

  if (!preferences) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={dir}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.goBack}
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
            </h1>
          </div>
          <p className="text-gray-600">
            {language === 'ar' 
              ? 'اختر كيف ومتى تريد تلقي الإشعارات' 
              : 'Choose how and when you want to receive notifications'}
          </p>
        </div>

        {/* Email Notifications */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="email-application-updates" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'تحديثات الطلبات' : 'Application Updates'}
                </Label>
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'تلقي إشعارات عند قبول أو رفض طلباتك' 
                    : 'Receive notifications when your applications are approved or rejected'}
                </p>
              </div>
              <Switch
                id="email-application-updates"
                checked={preferences.email.applicationUpdates}
                onCheckedChange={(checked) => updatePreference('email', 'applicationUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="email-event-reminders" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'تذكيرات الأحداث' : 'Event Reminders'}
                </Label>
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'تذكيرك بالأحداث القادمة التي سجلت فيها' 
                    : 'Remind you about upcoming events you registered for'}
                </p>
              </div>
              <Switch
                id="email-event-reminders"
                checked={preferences.email.eventReminders}
                onCheckedChange={(checked) => updatePreference('email', 'eventReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="email-certificate-issued" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'إصدار الشهادات' : 'Certificate Issued'}
                </Label>
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'إشعارك عند إصدار شهادة تطوع جديدة' 
                    : 'Notify you when a new volunteer certificate is issued'}
                </p>
              </div>
              <Switch
                id="email-certificate-issued"
                checked={preferences.email.certificateIssued}
                onCheckedChange={(checked) => updatePreference('email', 'certificateIssued', checked)}
              />
            </div>

            {user?.role !== 'VOLUNTEER' && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <Label htmlFor="email-new-applications" className="text-base font-medium text-gray-900">
                    {language === 'ar' ? 'طلبات تطوع جديدة' : 'New Applications'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' 
                      ? 'إشعارك عند تلقي طلبات تطوع جديدة' 
                      : 'Notify you when new volunteer applications are received'}
                  </p>
                </div>
                <Switch
                  id="email-new-applications"
                  checked={preferences.email.newApplications}
                  onCheckedChange={(checked) => updatePreference('email', 'newApplications', checked)}
                />
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="email-organization-updates" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'تحديثات المنظمة' : 'Organization Updates'}
                </Label>
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'تحديثات حول المنظمات التي تتابعها' 
                    : 'Updates about organizations you follow'}
                </p>
              </div>
              <Switch
                id="email-organization-updates"
                checked={preferences.email.organizationUpdates}
                onCheckedChange={(checked) => updatePreference('email', 'organizationUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <Label htmlFor="email-platform-news" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'أخبار المنصة' : 'Platform News'}
                </Label>
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'أخبار وتحديثات حول منصة سواعد الإمارات' 
                    : 'News and updates about SwaedUAE platform'}
                </p>
              </div>
              <Switch
                id="email-platform-news"
                checked={preferences.email.platformNews}
                onCheckedChange={(checked) => updatePreference('email', 'platformNews', checked)}
              />
            </div>
          </div>
        </Card>

        {/* In-App Notifications */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'إشعارات داخل التطبيق' : 'In-App Notifications'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="inapp-application-updates" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'تحديثات الطلبات' : 'Application Updates'}
                </Label>
              </div>
              <Switch
                id="inapp-application-updates"
                checked={preferences.inApp.applicationUpdates}
                onCheckedChange={(checked) => updatePreference('inApp', 'applicationUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="inapp-event-reminders" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'تذكيرات الأحداث' : 'Event Reminders'}
                </Label>
              </div>
              <Switch
                id="inapp-event-reminders"
                checked={preferences.inApp.eventReminders}
                onCheckedChange={(checked) => updatePreference('inApp', 'eventReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="inapp-certificate-issued" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'إصدار الشهادات' : 'Certificate Issued'}
                </Label>
              </div>
              <Switch
                id="inapp-certificate-issued"
                checked={preferences.inApp.certificateIssued}
                onCheckedChange={(checked) => updatePreference('inApp', 'certificateIssued', checked)}
              />
            </div>

            {user?.role !== 'VOLUNTEER' && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <Label htmlFor="inapp-new-applications" className="text-base font-medium text-gray-900">
                    {language === 'ar' ? 'طلبات تطوع جديدة' : 'New Applications'}
                  </Label>
                </div>
                <Switch
                  id="inapp-new-applications"
                  checked={preferences.inApp.newApplications}
                  onCheckedChange={(checked) => updatePreference('inApp', 'newApplications', checked)}
                />
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="inapp-organization-updates" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'تحديثات المنظمة' : 'Organization Updates'}
                </Label>
              </div>
              <Switch
                id="inapp-organization-updates"
                checked={preferences.inApp.organizationUpdates}
                onCheckedChange={(checked) => updatePreference('inApp', 'organizationUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <Label htmlFor="inapp-platform-news" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'أخبار المنصة' : 'Platform News'}
                </Label>
              </div>
              <Switch
                id="inapp-platform-news"
                checked={preferences.inApp.platformNews}
                onCheckedChange={(checked) => updatePreference('inApp', 'platformNews', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Push Notifications */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'إشعارات الدفع' : 'Push Notifications'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <Label htmlFor="push-enabled" className="text-base font-medium text-gray-900">
                  {language === 'ar' ? 'تفعيل إشعارات الدفع' : 'Enable Push Notifications'}
                </Label>
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'السماح بإرسال إشعارات الدفع إلى متصفحك' 
                    : 'Allow push notifications to be sent to your browser'}
                </p>
              </div>
              <Switch
                id="push-enabled"
                checked={preferences.pushNotifications.enabled}
                onCheckedChange={(checked) => updatePreference('pushNotifications', 'enabled', checked)}
              />
            </div>

            {preferences.pushNotifications.enabled && (
              <>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <Label htmlFor="push-application-updates" className="text-base font-medium text-gray-900">
                      {language === 'ar' ? 'تحديثات الطلبات' : 'Application Updates'}
                    </Label>
                  </div>
                  <Switch
                    id="push-application-updates"
                    checked={preferences.pushNotifications.applicationUpdates}
                    onCheckedChange={(checked) => updatePreference('pushNotifications', 'applicationUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <Label htmlFor="push-event-reminders" className="text-base font-medium text-gray-900">
                      {language === 'ar' ? 'تذكيرات الأحداث' : 'Event Reminders'}
                    </Label>
                  </div>
                  <Switch
                    id="push-event-reminders"
                    checked={preferences.pushNotifications.eventReminders}
                    onCheckedChange={(checked) => updatePreference('pushNotifications', 'eventReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <Label htmlFor="push-certificate-issued" className="text-base font-medium text-gray-900">
                      {language === 'ar' ? 'إصدار الشهادات' : 'Certificate Issued'}
                    </Label>
                  </div>
                  <Switch
                    id="push-certificate-issued"
                    checked={preferences.pushNotifications.certificateIssued}
                    onCheckedChange={(checked) => updatePreference('pushNotifications', 'certificateIssued', checked)}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving 
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
              : (language === 'ar' ? 'حفظ التفضيلات' : 'Save Preferences')}
          </Button>
        </div>
      </div>
    </div>
  );
}
