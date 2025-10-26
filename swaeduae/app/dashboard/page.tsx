/**
 * Dashboard Page
 * Role-specific dashboard based on user type
 */

'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserMenu } from '@/components/auth/UserMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  Building2,
  Shield,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute requireEmailVerification>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  if (!user) return null;

  const getDashboardByRole = () => {
    switch (user.role) {
      case 'VOLUNTEER':
        return <VolunteerDashboard user={user} />;
      case 'ORG_ADMIN':
      case 'ORG_SUPERVISOR':
        return <OrganizationDashboard user={user} />;
      case 'ADMIN':
      case 'SUPER_ADMIN':
      case 'OPERATOR':
        return <AdminDashboard user={user} />;
      default:
        return <DefaultDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SwaedUAE</h1>
              <p className="text-sm text-gray-500">Volunteer Management Platform</p>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getDashboardByRole()}
      </main>
    </div>
  );
}

function VolunteerDashboard({ user }: { user: any }) {
  const stats = [
    {
      title: 'Total Hours',
      value: user.totalHours || 0,
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      title: 'Events Completed',
      value: user.totalEvents || 0,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Certificates',
      value: 0,
      icon: Award,
      color: 'bg-purple-500',
    },
    {
      title: 'Rank',
      value: 'Beginner',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.displayName}!</h2>
        <p className="mt-1 text-gray-600">Here's your volunteering summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Events you've registered for</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No upcoming events. Browse events to get started!</p>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationDashboard({ user }: { user: any }) {
  const stats = [
    {
      title: 'Active Events',
      value: 0,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Volunteers',
      value: 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Hours Contributed',
      value: 0,
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      title: 'Certificates Issued',
      value: 0,
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Organization Dashboard</h2>
        <p className="mt-1 text-gray-600">Manage your events and volunteers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Your organization's latest events</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No events yet. Create your first event to get started!</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const stats = [
    {
      title: 'Total Users',
      value: 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Organizations',
      value: 0,
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'Active Events',
      value: 0,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Hours',
      value: 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-gray-600">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Organizations and events awaiting verification</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No pending approvals</p>
        </CardContent>
      </Card>
    </div>
  );
}

function DefaultDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to SwaedUAE</CardTitle>
          <CardDescription>Your account is set up and ready to go!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Complete your profile to get started with volunteering.</p>
        </CardContent>
      </Card>
    </div>
  );
}
