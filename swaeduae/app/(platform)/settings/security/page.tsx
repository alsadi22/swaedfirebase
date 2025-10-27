'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Download,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  setup2FA,
  verify2FA,
  disable2FA,
  generate2FABackupCodes,
  getTrustedDevices,
  revokeTrustedDevice,
} from '@/lib/services/twoFactorAuth';

export default function SecuritySettingsPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      const devices = await getTrustedDevices(user.uid);
      setTrustedDevices(devices);
      // Check if 2FA is enabled (from user profile or metadata)
      // For demo purposes, we'll use local state
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const handleSetup2FA = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const setupData = await setup2FA(user.uid);
      setQrCode(setupData.qrCode);
      setSecret(setupData.secret);
      setShowSetup(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      alert('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!user || !verificationCode) return;

    try {
      setLoading(true);
      const verified = await verify2FA(user.uid, verificationCode);
      
      if (verified) {
        setTwoFAEnabled(true);
        setShowSetup(false);
        alert(t(locale, 'common.success'));
        
        // Generate backup codes
        const codes = await generate2FABackupCodes(user.uid);
        setBackupCodes(codes);
      } else {
        alert('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('Failed to verify 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;

    const confirmed = confirm('Are you sure you want to disable 2FA?');
    if (!confirmed) return;

    try {
      setLoading(true);
      await disable2FA(user.uid);
      setTwoFAEnabled(false);
      setBackupCodes([]);
      alert('2FA disabled successfully');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const codes = await generate2FABackupCodes(user.uid);
      setBackupCodes(codes);
    } catch (error) {
      console.error('Error generating backup codes:', error);
      alert('Failed to generate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await revokeTrustedDevice(deviceId);
      await loadSecurityData();
    } catch (error) {
      console.error('Error revoking device:', error);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swaeduae-backup-codes.txt';
    a.click();
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
          {t(locale, 'security.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          Protect your account with advanced security features
        </p>
      </div>

      {/* Security Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Account Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Email Verified</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Two-Factor Authentication</span>
              </div>
              <Badge className={twoFAEnabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}>
                {twoFAEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {t(locale, 'security.twoFactorAuth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!twoFAEnabled && !showSetup && (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Add an extra layer of security to your account
              </p>
              <Button
                onClick={handleSetup2FA}
                disabled={loading}
                className="bg-[#D4AF37] hover:bg-[#B8941F]"
              >
                {t(locale, 'security.enable2FA')}
              </Button>
            </div>
          )}

          {showSetup && !twoFAEnabled && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Step 1: Scan QR Code</h3>
                <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                  <div className="h-48 w-48 bg-white border-2 border-gray-200 rounded flex items-center justify-center">
                    <p className="text-sm text-gray-500">QR Code</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Scan this code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Step 2: Enter Verification Code</h3>
                <div className="flex gap-2">
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleVerify2FA}
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {t(locale, 'common.verify')}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowSetup(false)}
                className="w-full"
              >
                {t(locale, 'common.cancel')}
              </Button>
            </div>
          )}

          {twoFAEnabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">2FA is enabled</p>
                    <p className="text-sm text-gray-600">Your account is protected</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisable2FA}
                  disabled={loading}
                >
                  {t(locale, 'security.disable2FA')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Codes */}
      {twoFAEnabled && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t(locale, 'security.backupCodes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backupCodes.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Save these backup codes in a secure place. Each code can only be used once.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-white rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={downloadBackupCodes}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t(locale, 'security.downloadBackupCodes')}
                  </Button>
                  <Button
                    onClick={handleGenerateBackupCodes}
                    variant="outline"
                    disabled={loading}
                  >
                    {t(locale, 'security.generateBackupCodes')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No backup codes generated yet</p>
                <Button
                  onClick={handleGenerateBackupCodes}
                  disabled={loading}
                  variant="outline"
                >
                  {t(locale, 'security.generateBackupCodes')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            {t(locale, 'security.trustedDevices')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trustedDevices.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No trusted devices</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{device.deviceName}</p>
                      <p className="text-sm text-gray-600">{device.location}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Last active: {new Date(device.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeDevice(device.id)}
                  >
                    {t(locale, 'security.revokeSession')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
