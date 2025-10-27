'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Download, 
  Trash2, 
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Globe,
  Users,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  requestDataExport,
  requestDataDeletion,
  updateConsentSettings,
  getUserConsents,
  updatePrivacySettings,
  getUserPrivacySettings,
} from '@/lib/services/gdprCompliance';

export default function PrivacySettingsPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState<any>({
    dataProcessing: true,
    marketing: false,
    analytics: true,
    thirdParty: false,
  });
  const [privacySettings, setPrivacySettings] = useState<any>({
    profileVisibility: 'PUBLIC',
    showEmail: false,
    showPhone: false,
    allowMessaging: true,
  });
  const [exportStatus, setExportStatus] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadPrivacyData();
    }
  }, [user]);

  const loadPrivacyData = async () => {
    if (!user) return;

    try {
      const [userConsents, userPrivacy] = await Promise.all([
        getUserConsents(user.uid),
        getUserPrivacySettings(user.uid),
      ]);
      
      if (userConsents) setConsents(userConsents);
      if (userPrivacy) setPrivacySettings(userPrivacy);
    } catch (error) {
      console.error('Error loading privacy data:', error);
    }
  };

  const handleConsentChange = async (key: string, value: boolean) => {
    if (!user) return;

    try {
      const newConsents = { ...consents, [key]: value };
      setConsents(newConsents);
      await updateConsentSettings(user.uid, newConsents);
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  const handlePrivacyChange = async (key: string, value: any) => {
    if (!user) return;

    try {
      const newSettings = { ...privacySettings, [key]: value };
      setPrivacySettings(newSettings);
      await updatePrivacySettings(user.uid, newSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  const handleRequestDataExport = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const requestId = await requestDataExport(user.uid);
      setExportStatus('pending');
      alert(t(locale, 'privacy.requestData') + ' - Request ID: ' + requestId);
    } catch (error) {
      console.error('Error requesting data export:', error);
      alert('Failed to request data export');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDataDeletion = async () => {
    if (!user) return;

    const confirmed = confirm(
      'Are you sure you want to delete all your data? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await requestDataDeletion(user.uid, 'User requested account deletion');
      alert('Data deletion request submitted. Your account will be deleted within 30 days.');
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      alert('Failed to request data deletion');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view this page</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t(locale, 'privacy.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your privacy settings and data preferences
        </p>
      </div>

      {/* Privacy Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t(locale, 'privacy.dataProtection')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">GDPR Compliant</p>
                <p className="text-sm text-gray-600">
                  Your data is protected according to EU regulations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Encrypted Storage</p>
                <p className="text-sm text-gray-600">
                  All sensitive data is encrypted at rest and in transit
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Visibility */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t(locale, 'privacy.profileVisibility')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can see your profile?
            </label>
            <Select
              value={privacySettings.profileVisibility}
              onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t(locale, 'privacy.public')}
                  </div>
                </SelectItem>
                <SelectItem value="CONNECTIONS">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t(locale, 'privacy.connectionsOnly')}
                  </div>
                </SelectItem>
                <SelectItem value="PRIVATE">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t(locale, 'privacy.private')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                {privacySettings.showEmail ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="text-sm font-medium">Show email address</span>
              </div>
              <Switch
                checked={privacySettings.showEmail}
                onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                {privacySettings.showPhone ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="text-sm font-medium">Show phone number</span>
              </div>
              <Switch
                checked={privacySettings.showPhone}
                onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Allow messaging from others</span>
              </div>
              <Switch
                checked={privacySettings.allowMessaging}
                onCheckedChange={(checked) => handlePrivacyChange('allowMessaging', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {t(locale, 'privacy.consentManagement')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="text-sm font-medium">Data Processing</p>
              <p className="text-xs text-gray-600">Required for platform functionality</p>
            </div>
            <Switch
              checked={consents.dataProcessing}
              onCheckedChange={(checked) => handleConsentChange('dataProcessing', checked)}
              disabled
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="text-sm font-medium">{t(locale, 'privacy.marketingEmails')}</p>
              <p className="text-xs text-gray-600">Receive updates and newsletters</p>
            </div>
            <Switch
              checked={consents.marketing}
              onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="text-sm font-medium">Analytics & Performance</p>
              <p className="text-xs text-gray-600">Help us improve the platform</p>
            </div>
            <Switch
              checked={consents.analytics}
              onCheckedChange={(checked) => handleConsentChange('analytics', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="text-sm font-medium">Third-Party Integrations</p>
              <p className="text-xs text-gray-600">Allow data sharing with partners</p>
            </div>
            <Switch
              checked={consents.thirdParty}
              onCheckedChange={(checked) => handleConsentChange('thirdParty', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Deletion */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t(locale, 'privacy.dataExport')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800 mb-3">
              Download a copy of all your data in a portable format (JSON/CSV)
            </p>
            <Button
              onClick={handleRequestDataExport}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {t(locale, 'privacy.downloadData')}
            </Button>
            {exportStatus && (
              <p className="text-xs text-gray-600 mt-2">
                Status: {exportStatus}
              </p>
            )}
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  {t(locale, 'privacy.deleteMyData')}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
            <Button
              onClick={handleRequestDataDeletion}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Request Account Deletion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            {t(locale, 'privacy.privacyPolicy')}
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            {t(locale, 'privacy.termsOfService')}
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            {t(locale, 'privacy.dataProcessing')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
