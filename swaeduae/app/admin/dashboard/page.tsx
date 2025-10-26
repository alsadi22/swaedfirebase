'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  CalendarIcon, 
  DocumentCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalEvents: number;
  pendingOrganizations: number;
  totalCertificates: number;
  totalVolunteerHours: number;
  recentUsers: number;
  recentEvents: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalEvents: 0,
    pendingOrganizations: 0,
    totalCertificates: 0,
    totalVolunteerHours: 0,
    recentUsers: 0,
    recentEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
      return;
    }

    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Get total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get recent users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.size;

      // Get organizations
      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      const totalOrganizations = orgsSnapshot.size;

      // Get pending organizations
      const pendingOrgsQuery = query(
        collection(db, 'organizations'),
        where('verificationStatus', '==', 'PENDING')
      );
      const pendingOrgsSnapshot = await getDocs(pendingOrgsQuery);
      const pendingOrganizations = pendingOrgsSnapshot.size;

      // Get events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const totalEvents = eventsSnapshot.size;

      // Get recent events
      const recentEventsQuery = query(
        collection(db, 'events'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );
      const recentEventsSnapshot = await getDocs(recentEventsQuery);
      const recentEvents = recentEventsSnapshot.size;

      // Get certificates
      const certificatesSnapshot = await getDocs(collection(db, 'certificates'));
      const totalCertificates = certificatesSnapshot.size;

      // Calculate total volunteer hours
      const attendancesSnapshot = await getDocs(collection(db, 'attendances'));
      let totalHours = 0;
      attendancesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.hoursCompleted) {
          totalHours += data.hoursCompleted;
        }
      });

      setStats({
        totalUsers,
        totalOrganizations,
        totalEvents,
        pendingOrganizations,
        totalCertificates,
        totalVolunteerHours: Math.round(totalHours),
        recentUsers,
        recentEvents,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: `+${stats.recentUsers} this month`,
      icon: UsersIcon,
      color: 'bg-blue-500',
      href: '/admin/users',
    },
    {
      title: 'Organizations',
      value: stats.totalOrganizations,
      change: `${stats.pendingOrganizations} pending verification`,
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
      href: '/admin/organizations',
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      change: `+${stats.recentEvents} this month`,
      icon: CalendarIcon,
      color: 'bg-emerald-500',
      href: '/admin/events',
    },
    {
      title: 'Certificates',
      value: stats.totalCertificates,
      change: 'Total issued',
      icon: DocumentCheckIcon,
      color: 'bg-yellow-500',
      href: '/admin/certificates',
    },
    {
      title: 'Volunteer Hours',
      value: stats.totalVolunteerHours,
      change: 'Total hours served',
      icon: ChartBarIcon,
      color: 'bg-pink-500',
      href: '/admin/reports',
    },
    {
      title: 'Revenue',
      value: `AED ${(stats.totalCertificates * 30).toLocaleString()}`,
      change: 'From certificates',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      href: '/admin/payments',
    },
  ];

  const quickActions = [
    {
      title: 'Verify Organizations',
      description: `${stats.pendingOrganizations} organizations waiting`,
      href: '/admin/organizations',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Moderate Events',
      description: 'Review pending events',
      href: '/admin/events',
      icon: CalendarIcon,
      color: 'bg-emerald-500',
    },
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      href: '/admin/users',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'View Reports',
      description: 'Analytics and insights',
      href: '/admin/reports',
      icon: ChartBarIcon,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} href={stat.href}>
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer">
                    <div className={`${action.color} p-2 rounded-lg mr-4`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-center py-8">
              Activity feed coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
