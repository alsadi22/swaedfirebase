'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import {
  getSystemConfig,
  updateSystemConfig,
  SystemConfig,
} from '@/lib/services/systemConfig';
import { logSettingsChange } from '@/lib/services/auditLogger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Save, AlertCircle, Mail, DollarSign, Bell, Shield, Palette } from 'lucide-react';

export default function SystemSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'certificates' | 'notifications' | 'security' | 'branding'>('general');

  // Role check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Load configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const systemConfig = await getSystemConfig();
      setConfig(systemConfig);
    } catch (error) {
      console.error('Error loading system config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config || !user) return;

    try {
      setSaving(true);

      const success = await updateSystemConfig(config, user.id);

      if (success) {
        // Log settings change
        await logSettingsChange(
          user.id,
          user.displayName,
          'SYSTEM_CONFIG',
          {},
          config
        );

        alert(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      } else {
        alert(language === 'ar' ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error saving settings');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  if (loading || !config) {
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
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
            </h1>
          </div>
          <p className="text-gray-600">
            {language === 'ar' ? 'إدارة تكوينات المنصة' : 'Manage platform configurations'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'general', label: language === 'ar' ? 'عام' : 'General', icon: Settings },
              { id: 'email', label: language === 'ar' ? 'البريد الإلكتروني' : 'Email', icon: Mail },
              { id: 'certificates', label: language === 'ar' ? 'الشهادات' : 'Certificates', icon: DollarSign },
              { id: 'notifications', label: language === 'ar' ? 'الإشعارات' : 'Notifications', icon: Bell },
              { id: 'security', label: language === 'ar' ? 'الأمان' : 'Security', icon: Shield },
              { id: 'branding', label: language === 'ar' ? 'العلامة التجارية' : 'Branding', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'اسم المنصة (إنجليزي)' : 'Platform Name (English)'}</Label>
                  <Input
                    value={config.platformName}
                    onChange={(e) => updateConfig('platformName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'اسم المنصة (عربي)' : 'Platform Name (Arabic)'}</Label>
                  <Input
                    value={config.platformNameAr || ''}
                    onChange={(e) => updateConfig('platformNameAr', e.target.value)}
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <Label>{language === 'ar' ? 'وصف المنصة (إنجليزي)' : 'Platform Description (English)'}</Label>
                <Textarea
                  value={config.platformDescription}
                  onChange={(e) => updateConfig('platformDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'وصف المنصة (عربي)' : 'Platform Description (Arabic)'}</Label>
                <Textarea
                  value={config.platformDescriptionAr || ''}
                  onChange={(e) => updateConfig('platformDescriptionAr', e.target.value)}
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'إعدادات التسجيل' : 'Registration Settings'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{language === 'ar' ? 'السماح بالتسجيلات الجديدة' : 'Allow New Registrations'}</Label>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'تمكين المستخدمين الجدد من التسجيل' : 'Enable new users to register'}
                      </p>
                    </div>
                    <Switch
                      checked={config.allowNewRegistrations}
                      onCheckedChange={(checked) => updateConfig('allowNewRegistrations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{language === 'ar' ? 'السماح بتسجيل المتطوعين' : 'Allow Volunteer Registrations'}</Label>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'السماح للمتطوعين الجدد بالتسجيل' : 'Allow new volunteers to register'}
                      </p>
                    </div>
                    <Switch
                      checked={config.allowVolunteerRegistrations}
                      onCheckedChange={(checked) => updateConfig('allowVolunteerRegistrations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{language === 'ar' ? 'السماح بتسجيل المنظمات' : 'Allow Organization Registrations'}</Label>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'السماح للمنظمات الجديدة بالتسجيل' : 'Allow new organizations to register'}
                      </p>
                    </div>
                    <Switch
                      checked={config.allowOrganizationRegistrations}
                      onCheckedChange={(checked) => updateConfig('allowOrganizationRegistrations', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{language === 'ar' ? 'تفعيل وضع الصيانة' : 'Enable Maintenance Mode'}</Label>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'إيقاف المنصة للصيانة' : 'Take platform offline for maintenance'}
                      </p>
                    </div>
                    <Switch
                      checked={config.maintenanceMode}
                      onCheckedChange={(checked) => updateConfig('maintenanceMode', checked)}
                    />
                  </div>

                  {config.maintenanceMode && (
                    <>
                      <div>
                        <Label>{language === 'ar' ? 'رسالة الصيانة (إنجليزي)' : 'Maintenance Message (English)'}</Label>
                        <Textarea
                          value={config.maintenanceMessage || ''}
                          onChange={(e) => updateConfig('maintenanceMessage', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>{language === 'ar' ? 'رسالة الصيانة (عربي)' : 'Maintenance Message (Arabic)'}</Label>
                        <Textarea
                          value={config.maintenanceMessageAr || ''}
                          onChange={(e) => updateConfig('maintenanceMessageAr', e.target.value)}
                          rows={2}
                          dir="rtl"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'إعدادات البريد الإلكتروني' : 'Email Settings'}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'تفعيل البريد الإلكتروني' : 'Enable Email'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'تمكين إرسال البريد الإلكتروني' : 'Enable email sending'}
                  </p>
                </div>
                <Switch
                  checked={config.emailEnabled}
                  onCheckedChange={(checked) => updateConfig('emailEnabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'مضيف SMTP' : 'SMTP Host'}</Label>
                  <Input
                    value={config.smtpHost}
                    onChange={(e) => updateConfig('smtpHost', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'منفذ SMTP' : 'SMTP Port'}</Label>
                  <Input
                    type="number"
                    value={config.smtpPort}
                    onChange={(e) => updateConfig('smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'البريد الإلكتروني للمرسل' : 'From Email'}</Label>
                  <Input
                    type="email"
                    value={config.smtpFromEmail}
                    onChange={(e) => updateConfig('smtpFromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'اسم المرسل' : 'From Name'}</Label>
                  <Input
                    value={config.smtpFromName}
                    onChange={(e) => updateConfig('smtpFromName', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Certificate Settings */}
        {activeTab === 'certificates' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'إعدادات الشهادات' : 'Certificate Settings'}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'تفعيل الشهادات' : 'Enable Certificates'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'السماح بإصدار الشهادات' : 'Allow certificate generation'}
                  </p>
                </div>
                <Switch
                  checked={config.certificatesEnabled}
                  onCheckedChange={(checked) => updateConfig('certificatesEnabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'سعر الشهادة' : 'Certificate Price'}</Label>
                  <Input
                    type="number"
                    value={config.certificatePrice}
                    onChange={(e) => updateConfig('certificatePrice', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                  <Input
                    value={config.certificateCurrency}
                    onChange={(e) => updateConfig('certificateCurrency', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'الحد الأدنى للساعات' : 'Minimum Hours'}</Label>
                  <Input
                    type="number"
                    value={config.certificateMinHours}
                    onChange={(e) => updateConfig('certificateMinHours', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'إنشاء تلقائي' : 'Auto Generate'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'إنشاء الشهادات تلقائياً بعد الحضور' : 'Automatically generate certificates after attendance'}
                  </p>
                </div>
                <Switch
                  checked={config.certificateAutoGenerate}
                  onCheckedChange={(checked) => updateConfig('certificateAutoGenerate', checked)}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'تمكين نظام الإشعارات' : 'Enable notification system'}
                  </p>
                </div>
                <Switch
                  checked={config.notificationsEnabled}
                  onCheckedChange={(checked) => updateConfig('notificationsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'إرسال الإشعارات عبر البريد الإلكتروني' : 'Send notifications via email'}
                  </p>
                </div>
                <Switch
                  checked={config.emailNotificationsEnabled}
                  onCheckedChange={(checked) => updateConfig('emailNotificationsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'إشعارات الدفع' : 'Push Notifications'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'إرسال إشعارات الدفع للمتصفح' : 'Send browser push notifications'}
                  </p>
                </div>
                <Switch
                  checked={config.pushNotificationsEnabled}
                  onCheckedChange={(checked) => updateConfig('pushNotificationsEnabled', checked)}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'الحد الأدنى لطول كلمة المرور' : 'Minimum Password Length'}</Label>
                  <Input
                    type="number"
                    value={config.passwordMinLength}
                    onChange={(e) => updateConfig('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'الحد الأقصى لمحاولات تسجيل الدخول' : 'Max Login Attempts'}</Label>
                  <Input
                    type="number"
                    value={config.maxLoginAttempts}
                    onChange={(e) => updateConfig('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'يتطلب حرف خاص' : 'Require Special Character'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'يجب أن تحتوي كلمة المرور على حرف خاص' : 'Password must contain special character'}
                  </p>
                </div>
                <Switch
                  checked={config.passwordRequireSpecialChar}
                  onCheckedChange={(checked) => updateConfig('passwordRequireSpecialChar', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'يتطلب رقم' : 'Require Number'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'يجب أن تحتوي كلمة المرور على رقم' : 'Password must contain number'}
                  </p>
                </div>
                <Switch
                  checked={config.passwordRequireNumber}
                  onCheckedChange={(checked) => updateConfig('passwordRequireNumber', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'تمكين المصادقة الثنائية للمستخدمين' : 'Enable two-factor authentication for users'}
                  </p>
                </div>
                <Switch
                  checked={config.twoFactorEnabled}
                  onCheckedChange={(checked) => updateConfig('twoFactorEnabled', checked)}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Branding Settings */}
        {activeTab === 'branding' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'إعدادات العلامة التجارية' : 'Branding Settings'}
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}</Label>
                  <Input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => updateConfig('primaryColor', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}</Label>
                  <Input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>{language === 'ar' ? 'CSS مخصص' : 'Custom CSS'}</Label>
                <Textarea
                  value={config.customCss || ''}
                  onChange={(e) => updateConfig('customCss', e.target.value)}
                  rows={6}
                  placeholder=".custom-class { color: #000; }"
                />
              </div>
            </div>
          </Card>
        )}

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
              : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
          </Button>
        </div>
      </div>
    </div>
  );
}
