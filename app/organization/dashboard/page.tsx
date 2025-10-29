'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModernDashboardLayout } from '@/components/layout/modern-dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Users, TrendingUp, Plus, Settings } from 'lucide-react'

export default function OrganizationDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalVolunteers: 0,
    pendingApplications: 0,
  })
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as 'en' | 'ar' || 'en'
    setLanguage(storedLang)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
          router.push('/auth/login');
          return;
        }
        
        // Fetch organization dashboard data
        const dashboardResponse = await fetch('/api/organization/dashboard');
        if (!dashboardResponse.ok) {
          if (dashboardResponse.status === 401) {
            router.push('/auth/login');
            return;
          } else if (dashboardResponse.status === 403) {
            router.push('/dashboard');
            return;
          } else if (dashboardResponse.status === 404) {
            router.push('/auth/organization/register');
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }
        
        const dashboardData = await dashboardResponse.json();
        setOrganization(dashboardData.organization);
        setStats(dashboardData.stats);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router])

  if (loading) {
    return (
      <ModernDashboardLayout userType="organization">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
            <p className="mt-4 text-[#6B7280]">
              {language === 'en' ? 'Loading dashboard...' : 'جاري تحميل لوحة التحكم...'}
            </p>
          </div>
        </div>
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout userType="organization">
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
            {language === 'en' ? 'Organization Dashboard' : 'لوحة تحكم المؤسسة'}
          </h1>
          {organization && (
            <p className="text-lg text-[#6B7280]">{organization.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">
                    {language === 'en' ? 'Total Events' : 'إجمالي الفعاليات'}
                  </p>
                  <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalEvents}</p>
                </div>
                <div className="w-12 h-12 bg-[#5C3A1F] rounded-full flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">
                    {language === 'en' ? 'Active Events' : 'الفعاليات النشطة'}
                  </p>
                  <p className="text-3xl font-bold text-[#5C3A1F]">{stats.activeEvents}</p>
                </div>
                <div className="w-12 h-12 bg-[#00732F] rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">
                    {language === 'en' ? 'Total Volunteers' : 'إجمالي المتطوعين'}
                  </p>
                  <p className="text-3xl font-bold text-[#5C3A1F]">{stats.totalVolunteers}</p>
                </div>
                <div className="w-12 h-12 bg-[#D2A04A] rounded-full flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">
                    {language === 'en' ? 'Pending Applications' : 'الطلبات المعلقة'}
                  </p>
                  <p className="text-3xl font-bold text-[#5C3A1F]">{stats.pendingApplications}</p>
                </div>
                <div className="w-12 h-12 bg-[#CE1126] rounded-full flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/organization/events/create">
                <Button variant="primary" className="w-full justify-start">
                  <Plus className="mr-2" size={20} />
                  {language === 'en' ? 'Create New Event' : 'إنشاء فعالية جديدة'}
                </Button>
              </Link>
              <Link href="/organization/events">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2" size={20} />
                  {language === 'en' ? 'Manage Events' : 'إدارة الفعاليات'}
                </Button>
              </Link>
              <Link href="/organization/volunteers">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2" size={20} />
                  {language === 'en' ? 'View Volunteers' : 'عرض المتطوعين'}
                </Button>
              </Link>
              <Link href="/organization/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2" size={20} />
                  {language === 'en' ? 'Organization Settings' : 'إعدادات المؤسسة'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Verification Status' : 'حالة التحقق'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {organization ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C3A1F]">
                      {language === 'en' ? 'Status' : 'الحالة'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      organization.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                      organization.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {language === 'en' 
                        ? organization.verification_status 
                        : organization.verification_status === 'approved' ? 'موافق' : 
                          organization.verification_status === 'pending' ? 'قيد الانتظار' : 'مرفوض'}
                    </span>
                  </div>
                  {organization.verification_status === 'approved' && (
                    <p className="text-sm text-[#00732F]">
                      {language === 'en' 
                        ? 'Your organization is verified and can create events.' 
                        : 'تم التحقق من مؤسستك ويمكنك إنشاء فعاليات.'}
                    </p>
                  )}
                  {organization.verification_status === 'pending' && (
                    <p className="text-sm text-[#6B7280]">
                      {language === 'en' 
                        ? 'Your verification is being reviewed by our team.' 
                        : 'يجري فريقنا مراجعة التحقق من مؤسستك.'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[#6B7280]">
                  {language === 'en' ? 'Loading organization information...' : 'جاري تحميل معلومات المؤسسة...'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}