'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import type { AuditLog } from '@/types';
import {
  getAuditLogs,
  getAuditStatistics,
  exportAuditLogsToCSV,
  AuditAction,
  AuditEntityType,
} from '@/lib/services/auditLogger';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

export default function AuditLogsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [stats, setStats] = useState({
    totalActions: 0,
    byAction: {} as Record<string, number>,
    byEntityType: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
    failedActions: 0,
  });

  // Role check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Load audit logs
  useEffect(() => {
    loadAuditLogs();
  }, [dateRange]);

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        (log as any).userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log as any).entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by action
    if (actionFilter !== 'ALL') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filter by entity type
    if (entityFilter !== 'ALL') {
      filtered = filtered.filter(log => log.entityType === entityFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, entityFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let startDate: Date | undefined;

      switch (dateRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startDate = undefined;
          break;
      }

      const [auditLogs, statistics] = await Promise.all([
        getAuditLogs({ startDate, limitCount: 500 }),
        getAuditStatistics(dateRange === '24h' ? 1 : dateRange === '7d' ? 7 : 30),
      ]);

      setLogs(auditLogs);
      setFilteredLogs(auditLogs);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportAuditLogsToCSV(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${dateRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      LOGIN_FAILED: 'bg-red-100 text-red-800',
      EVENT_APPROVED: 'bg-green-100 text-green-800',
      EVENT_REJECTED: 'bg-red-100 text-red-800',
      ORG_VERIFIED: 'bg-green-100 text-green-800',
      ORG_REJECTED: 'bg-red-100 text-red-800',
      EMAIL_SENT: 'bg-blue-100 text-blue-800',
      NOTIFICATION_SENT: 'bg-purple-100 text-purple-800',
      CERTIFICATE_ISSUED: 'bg-green-100 text-green-800',
      SETTINGS_CHANGED: 'bg-yellow-100 text-yellow-800',
    };

    const color = actionColors[action] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'USER':
        return <User className="w-4 h-4" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4" />;
      case 'ORGANIZATION':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
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
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'سجلات المراجعة' : 'Audit Logs'}
            </h1>
          </div>
          <p className="text-gray-600">
            {language === 'ar' 
              ? 'تتبع جميع الإجراءات والأحداث في المنصة' 
              : 'Track all actions and events in the platform'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي الإجراءات' : 'Total Actions'}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActions}</p>
              </div>
              <Shield className="w-10 h-10 text-gray-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'المستخدمون النشطون' : 'Active Users'}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Object.keys(stats.byUser).length}
                </p>
              </div>
              <User className="w-10 h-10 text-blue-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'الإجراءات الفاشلة' : 'Failed Actions'}</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedActions}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'الإجراءات الناجحة' : 'Successful Actions'}</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalActions - stats.failedActions}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'كل الإجراءات' : 'All Actions'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{language === 'ar' ? 'كل الإجراءات' : 'All Actions'}</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                <SelectItem value="EVENT_APPROVED">Event Approved</SelectItem>
                <SelectItem value="EVENT_REJECTED">Event Rejected</SelectItem>
                <SelectItem value="ORG_VERIFIED">Org Verified</SelectItem>
                <SelectItem value="EMAIL_SENT">Email Sent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'كل الكيانات' : 'All Entities'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{language === 'ar' ? 'كل الكيانات' : 'All Entities'}</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ORGANIZATION">Organization</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="APPLICATION">Application</SelectItem>
                <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="NOTIFICATION">Notification</SelectItem>
                <SelectItem value="SETTINGS">Settings</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">{language === 'ar' ? '24 ساعة' : 'Last 24 Hours'}</SelectItem>
                  <SelectItem value="7d">{language === 'ar' ? '7 أيام' : 'Last 7 Days'}</SelectItem>
                  <SelectItem value="30d">{language === 'ar' ? '30 يوم' : 'Last 30 Days'}</SelectItem>
                  <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All Time'}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Audit Logs Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {language === 'ar' ? 'لا توجد سجلات مراجعة' : 'No audit logs found'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'التاريخ والوقت' : 'Timestamp'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'المستخدم' : 'User'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الإجراء' : 'Action'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الكيان' : 'Entity'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'IP' : 'IP Address'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatDateTime(log.timestamp, language)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {(log as any).userName || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">{(log as any).userRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getEntityIcon(log.entityType)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {(log as any).entityName || log.entityType}
                            </p>
                            <p className="text-xs text-gray-500">{log.entityType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {(log as any).success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {log.ipAddress || '-'}
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
