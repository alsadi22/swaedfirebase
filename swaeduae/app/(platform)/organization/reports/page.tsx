'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  getOrganizationReports,
  createReport,
  generateReport,
  deleteReport,
  formatReportAsCSV,
} from '@/lib/services/reports';
import type { CustomReport } from '@/types';
import { FileText, Download, Trash2, Plus, Calendar, Filter } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'EVENT' as CustomReport['type'],
    format: 'CSV' as CustomReport['format'],
  });

  useEffect(() => {
    if (user?.organizationId) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    if (!user?.organizationId) return;

    try {
      setLoading(true);
      const data = await getOrganizationReports(user.organizationId);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!user?.organizationId || !newReport.name) return;

    try {
      await createReport({
        organizationId: user.organizationId,
        name: newReport.name,
        description: newReport.description || undefined,
        type: newReport.type,
        filters: {}, // Can be customized
        metrics: ['events', 'volunteers', 'attendance'], // Default metrics
        recipients: [user.email],
        format: newReport.format,
        createdBy: user.id,
      });

      setShowCreateModal(false);
      setNewReport({
        name: '',
        description: '',
        type: 'EVENT',
        format: 'CSV',
      });
      await loadReports();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGenerating(reportId);
      const { data, format } = await generateReport(reportId);

      // Format and download
      if (format === 'CSV') {
        const csv = formatReportAsCSV(data);
        downloadFile(csv, `report-${reportId}.csv`, 'text/csv');
      } else {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, `report-${reportId}.json`, 'application/json');
      }

      await loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      alert(language === 'ar' ? 'فشل إنشاء التقرير' : 'Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل تريد حذف هذا التقرير؟' : 'Delete this report?')) {
      return;
    }

    try {
      await deleteReport(reportId);
      await loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getReportTypeLabel = (type: CustomReport['type']) => {
    const labels = {
      EVENT: language === 'ar' ? 'الفعاليات' : 'Events',
      VOLUNTEER: language === 'ar' ? 'المتطوعون' : 'Volunteers',
      FINANCIAL: language === 'ar' ? 'مالي' : 'Financial',
      IMPACT: language === 'ar' ? 'التأثير' : 'Impact',
      CUSTOM: language === 'ar' ? 'مخصص' : 'Custom',
    };
    return labels[type];
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'التقارير' : 'Reports'}
            </h1>
            <p className="mt-2 text-gray-600">
              {language === 'ar' ? 'إنشاء وإدارة التقارير المخصصة' : 'Create and manage custom reports'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تقرير جديد' : 'New Report'}
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <FileText className="h-8 w-8 text-blue-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
                    {report.description && (
                      <p className="text-gray-600 mb-3">{report.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {getReportTypeLabel(report.type)}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {report.format}
                      </span>
                      {report.schedule?.enabled && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {language === 'ar' ? 'مجدول' : 'Scheduled'}
                        </span>
                      )}
                      {report.lastGenerated && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          {language === 'ar' ? 'آخر تشغيل:' : 'Last run:'}{' '}
                          {new Date(
                            report.lastGenerated.toDate
                              ? report.lastGenerated.toDate()
                              : report.lastGenerated
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generating === report.id}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generating === report.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {language === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        {language === 'ar' ? 'تحميل' : 'Generate'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {language === 'ar' ? 'لا توجد تقارير' : 'No reports'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {language === 'ar' ? 'ابدأ بإنشاء تقريرك الأول' : 'Get started by creating your first report'}
            </p>
          </div>
        )}

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'ar' ? 'تقرير جديد' : 'New Report'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={newReport.name}
                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EVENT">{language === 'ar' ? 'الفعاليات' : 'Events'}</option>
                    <option value="VOLUNTEER">{language === 'ar' ? 'المتطوعون' : 'Volunteers'}</option>
                    <option value="FINANCIAL">{language === 'ar' ? 'مالي' : 'Financial'}</option>
                    <option value="IMPACT">{language === 'ar' ? 'التأثير' : 'Impact'}</option>
                    <option value="CUSTOM">{language === 'ar' ? 'مخصص' : 'Custom'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'التنسيق' : 'Format'}
                  </label>
                  <select
                    value={newReport.format}
                    onChange={(e) => setNewReport({ ...newReport, format: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CSV">CSV</option>
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateReport}
                  disabled={!newReport.name}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {language === 'ar' ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
