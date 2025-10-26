'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import { Notification } from '@/types';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeToUserNotifications,
} from '@/lib/services/notifications';
import { formatDistanceToNow } from '@/lib/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCheck,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToUserNotifications(user.id, (notifications) => {
      setNotifications(notifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف جميع الإشعارات؟' : 'Are you sure you want to delete all notifications?')) {
      return;
    }

    try {
      await deleteAllNotifications(user.id);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = 'w-6 h-6';
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'ERROR':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'WARNING':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'INFO':
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

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
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">
                    {language === 'ar' 
                      ? `${unreadCount} إشعار غير مقروء` 
                      : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All Read'}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'حذف الكل' : 'Delete All'}
                </Button>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === 'unread'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'ar' ? 'غير مقروء' : 'Unread'} ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filter === 'unread'
                  ? (language === 'ar' ? 'لا توجد إشعارات غير مقروءة' : 'No unread notifications')
                  : (language === 'ar' ? 'لا توجد إشعارات' : 'No notifications')}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {language === 'ar' && notification.titleAr 
                          ? notification.titleAr 
                          : notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {language === 'ar' && notification.messageAr 
                        ? notification.messageAr 
                        : notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(notification.createdAt, language)}
                      </p>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {language === 'ar' ? 'تحديد كمقروء' : 'Mark Read'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
