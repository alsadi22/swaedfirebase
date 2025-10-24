'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OrganizationAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [eventData, setEventData] = useState<any[]>([]);
  const [applicationData, setApplicationData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) return;

      // Overall stats
      const { data: events } = await supabase
        .from('events')
        .select('id, status')
        .eq('organization_id', orgMember.organization_id);

      const { data: applications } = await supabase
        .from('event_applications')
        .select('status, user_id, event:events!inner(organization_id)')
        .eq('event.organization_id', orgMember.organization_id);

      const { data: hours } = await supabase
        .from('volunteer_hours')
        .select('hours_logged, event:events!inner(organization_id)')
        .eq('event.organization_id', orgMember.organization_id)
        .eq('status', 'approved');

      const totalHours = hours?.reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;
      const totalVolunteers = new Set(applications?.filter(a => a.status === 'approved').map(a => a.user_id)).size;

      setStats({
        totalEvents: events?.length || 0,
        activeEvents: events?.filter(e => e.status === 'published' || e.status === 'in_progress').length || 0,
        totalApplications: applications?.length || 0,
        totalHours: totalHours,
        totalVolunteers: totalVolunteers,
      });

      // Events by status
      const statusCounts = events?.reduce((acc: any, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {});

      setEventData(
        Object.entries(statusCounts || {}).map(([status, count]) => ({
          status,
          count,
        }))
      );

      // Applications by status
      const appStatusCounts = applications?.reduce((acc: any, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      setApplicationData(
        Object.entries(appStatusCounts || {}).map(([status, count]) => ({
          status,
          count,
        }))
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#D2A04A', '#CE1126', '#00732F', '#4A90E2', '#9B59B6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Analytics Dashboard</h1>
            <p className="text-text-secondary mt-1">Track your organization's impact</p>
          </div>
          <Link 
            href="/organization/dashboard"
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Total Events</p>
            <p className="text-4xl font-bold mt-2">{stats.totalEvents}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Active Events</p>
            <p className="text-4xl font-bold mt-2">{stats.activeEvents}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Applications</p>
            <p className="text-4xl font-bold mt-2">{stats.totalApplications}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Volunteer Hours</p>
            <p className="text-4xl font-bold mt-2">{stats.totalHours}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Volunteers</p>
            <p className="text-4xl font-bold mt-2">{stats.totalVolunteers}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events by Status */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Events by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value, name }: any) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {eventData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Applications by Status */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Applications by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="count" fill="#D2A04A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
