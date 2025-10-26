'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import { User } from '@/types';
import { getAllUsers } from '@/lib/services/firestore';
import { broadcastNotification } from '@/lib/services/notifications';
import { logNotificationOperation } from '@/lib/services/auditLogger';
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
import { Bell, Send, Users, Filter, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Form state
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'VOLUNTEERS' | 'ORGANIZATIONS' | 'SPECIFIC'>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'>('INFO');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [message, setMessage] = useState('');
  const [messageAr, setMessageAr] = useState('');
  const [actionUrl, setActionUrl] = useState('');

  // Role check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTargetUserIds = (): string[] => {
    switch (targetAudience) {
      case 'VOLUNTEERS':
        return users.filter(u => u.role === 'VOLUNTEER').map(u => u.id);
      case 'ORGANIZATIONS':
        return users.filter(u => u.role === 'ORG_ADMIN' || u.role === 'ORG_SUPERVISOR').map(u => u.id);
      case 'SPECIFIC':
        return selectedUsers;
      case 'ALL':
      default:
        return users.map(u => u.id);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const targetUserIds = getTargetUserIds();
    
    if (targetUserIds.length === 0) {
      alert(language === 'ar' ? 'يرجى اختيار المستلمين' : 'Please select recipients');
      return;
    }

    if (!confirm(
      language === 'ar' 
        ? `هل أنت متأكد من إرسال هذا الإشعار إلى ${targetUserIds.length} مستخدم؟` 
        : `Are you sure you want to send this notification to ${targetUserIds.length} user(s)?`
    )) {
      return;
    }

    try {
      setSending(true);

      await broadcastNotification(targetUserIds, {
        type: notificationType,
        title,
        titleAr: titleAr || title,
        message,
        messageAr: messageAr || message,
        read: false,
        actionUrl: actionUrl || undefined,
      });

      // Log audit trail
      if (user) {
        await logNotificationOperation(
          user.id,
          'NOTIFICATION_SENT',
          `broadcast-${Date.now()}`,
          title,
          targetUserIds.length
        );
      }

      alert(language === 'ar' ? 'تم إرسال الإشعارات بنجاح' : 'Notifications sent successfully');
      
      // Reset form
      setTitle('');
      setTitleAr('');
      setMessage('');
      setMessageAr('');
      setActionUrl('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء إرسال الإشعارات' : 'Error sending notifications');
    } finally {
      setSending(false);
    }
  };

  const getAudienceCount = (): number => {
    return getTargetUserIds().length;
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'إدارة الإشعارات' : 'Notification Management'}
            </h1>
          </div>
          <p className="text-gray-600">
            {language === 'ar' 
              ? 'إرسال إشعارات جماعية للمستخدمين' 
              : 'Send broadcast notifications to users'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-gray-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'المتطوعين' : 'Volunteers'}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'VOLUNTEER').length}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'المنظمات' : 'Organizations'}</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.role === 'ORG_ADMIN' || u.role === 'ORG_SUPERVISOR').length}
                </p>
              </div>
              <Users className="w-10 h-10 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Notification Form */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? 'إنشاء إشعار جديد' : 'Create New Notification'}
          </h2>

          <div className="space-y-6">
            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الجمهور المستهدف *' : 'Target Audience *'}
              </label>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <Select value={targetAudience} onValueChange={(value: any) => setTargetAudience(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">
                      {language === 'ar' ? `جميع المستخدمين (${users.length})` : `All Users (${users.length})`}
                    </SelectItem>
                    <SelectItem value="VOLUNTEERS">
                      {language === 'ar' 
                        ? `المتطوعين فقط (${users.filter(u => u.role === 'VOLUNTEER').length})` 
                        : `Volunteers Only (${users.filter(u => u.role === 'VOLUNTEER').length})`}
                    </SelectItem>
                    <SelectItem value="ORGANIZATIONS">
                      {language === 'ar' 
                        ? `المنظمات فقط (${users.filter(u => u.role === 'ORG_ADMIN' || u.role === 'ORG_SUPERVISOR').length})` 
                        : `Organizations Only (${users.filter(u => u.role === 'ORG_ADMIN' || u.role === 'ORG_SUPERVISOR').length})`}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' 
                  ? `سيتم إرسال الإشعار إلى ${getAudienceCount()} مستخدم` 
                  : `Notification will be sent to ${getAudienceCount()} user(s)`}
              </p>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'نوع الإشعار *' : 'Notification Type *'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setNotificationType('INFO')}
                  className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                    notificationType === 'INFO' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Info className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">{language === 'ar' ? 'معلومات' : 'Info'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType('SUCCESS')}
                  className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                    notificationType === 'SUCCESS' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">{language === 'ar' ? 'نجاح' : 'Success'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType('WARNING')}
                  className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                    notificationType === 'WARNING' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">{language === 'ar' ? 'تحذير' : 'Warning'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType('ERROR')}
                  className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                    notificationType === 'ERROR' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">{language === 'ar' ? 'خطأ' : 'Error'}</span>
                </button>
              </div>
            </div>

            {/* English Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'العنوان (إنجليزي) *' : 'Title (English) *'}
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل عنوان الإشعار بالإنجليزية' : 'Enter notification title in English'}
                required
              />
            </div>

            {/* Arabic Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
              </label>
              <Input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل عنوان الإشعار بالعربية' : 'Enter notification title in Arabic'}
                dir="rtl"
              />
            </div>

            {/* English Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الرسالة (إنجليزي) *' : 'Message (English) *'}
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل نص الإشعار بالإنجليزية' : 'Enter notification message in English'}
                rows={4}
                required
              />
            </div>

            {/* Arabic Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الرسالة (عربي)' : 'Message (Arabic)'}
              </label>
              <Textarea
                value={messageAr}
                onChange={(e) => setMessageAr(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل نص الإشعار بالعربية' : 'Enter notification message in Arabic'}
                rows={4}
                dir="rtl"
              />
            </div>

            {/* Action URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'رابط الإجراء (اختياري)' : 'Action URL (Optional)'}
              </label>
              <Input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/events/123"
              />
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' 
                  ? 'رابط داخلي للتطبيق (مثال: /events/123)' 
                  : 'Internal app link (e.g., /events/123)'}
              </p>
            </div>

            {/* Send Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending 
                  ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                  : (language === 'ar' ? `إرسال إلى ${getAudienceCount()} مستخدم` : `Send to ${getAudienceCount()} user(s)`)}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
