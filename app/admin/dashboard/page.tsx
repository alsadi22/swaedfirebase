import React from 'react'
import { requireAdmin } from '@/lib/admin-auth'
import { ModernDashboardLayout } from '@/components/layout/modern-dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, Calendar, Award, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/database'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

async function getAdminStats() {
  try {
    const [usersResult, organizationsResult, eventsResult, volunteerProfilesResult] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM profiles'),
      db.query('SELECT COUNT(*) as count FROM organizations'),
      db.query('SELECT COUNT(*) as count FROM events'),
      db.query('SELECT total_hours FROM volunteer_profiles WHERE total_hours IS NOT NULL')
    ])

    const pendingOrgsResult = await db.query(
      'SELECT COUNT(*) as count FROM organizations WHERE verification_status = $1',
      ['pending']
    )

    const totalHours = volunteerProfilesResult.rows.reduce((sum: number, v: any) => sum + (v.total_hours || 0), 0)

    return {
      totalUsers: parseInt(usersResult.rows[0].count) || 0,
      totalOrganizations: parseInt(organizationsResult.rows[0].count) || 0,
      totalEvents: parseInt(eventsResult.rows[0].count) || 0,
      pendingOrganizations: parseInt(pendingOrgsResult.rows[0].count) || 0,
      activeVolunteers: volunteerProfilesResult.rows.length || 0,
      totalHours: totalHours,
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalUsers: 0,
      totalOrganizations: 0,
      totalEvents: 0,
      pendingOrganizations: 0,
      activeVolunteers: 0,
      totalHours: 0,
    }
  }
}

export default async function AdminDashboard() {
  // Server-side authentication check
  const user = await requireAdmin()
  const stats = await getAdminStats()

  return (
    <ModernDashboardLayout userType="admin">
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5C3A1F] mb-2">
            {user.language === 'en' ? 'Admin Dashboard' : 'لوحة تحكم المشرف'}
          </h1>
          <p className="text-[#6B7280]">
            {user.language === 'en' 
              ? `Welcome back, ${user.firstName} ${user.lastName}` 
              : `مرحبا بك مرة أخرى، ${user.firstName} ${user.lastName}`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.language === 'en' ? 'Total Users' : 'إجمالي المستخدمين'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.language === 'en' ? 'Organizations' : 'المؤسسات'}
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrganizations.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.language === 'en' ? 'Total Events' : 'إجمالي الفعاليات'}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.language === 'en' ? 'Pending Organizations' : 'المؤسسات المعلقة'}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrganizations.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.language === 'en' ? 'Active Volunteers' : 'المتطوعون النشطون'}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVolunteers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.language === 'en' ? 'Total Volunteer Hours' : 'إجمالي ساعات التطوع'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/organizations">
            <Button className="w-full h-16 text-left justify-start">
              <Building2 className="mr-2 h-5 w-5" />
              {user.language === 'en' ? 'Manage Organizations' : 'إدارة المؤسسات'}
            </Button>
          </Link>
          
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-16 text-left justify-start">
              <Users className="mr-2 h-5 w-5" />
              {user.language === 'en' ? 'Manage Users' : 'إدارة المستخدمين'}
            </Button>
          </Link>
          
          <Link href="/admin/events">
            <Button variant="outline" className="w-full h-16 text-left justify-start">
              <Calendar className="mr-2 h-5 w-5" />
              {user.language === 'en' ? 'Manage Events' : 'إدارة الفعاليات'}
            </Button>
          </Link>
          
          <Link href="/admin/audit-logs">
            <Button variant="outline" className="w-full h-16 text-left justify-start">
              <AlertCircle className="mr-2 h-5 w-5" />
              {user.language === 'en' ? 'Audit Logs' : 'سجلات التدقيق'}
            </Button>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>
              {user.language === 'en' ? 'Recent Activity' : 'النشاط الأخير'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#6B7280]">
              {user.language === 'en' 
                ? 'Activity monitoring coming soon...' 
                : 'مراقبة النشاط قريباً...'}
            </p>
          </CardContent>
        </Card>
      </div>
    </ModernDashboardLayout>
  )
}