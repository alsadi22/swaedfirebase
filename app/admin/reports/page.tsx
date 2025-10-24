'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [emirateData, setEmirateData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    try {
      // Overall stats
      const { data: users } = await supabase.from('users').select('id', { count: 'exact' });
      const { data: events } = await supabase.from('events').select('id', { count: 'exact' });
      const { data: organizations } = await supabase.from('organizations').select('id', { count: 'exact' });
      const { data: hours } = await supabase.from('volunteer_hours').select('hours_logged');

      const totalHours = hours?.reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;

      setStats({
        totalUsers: users?.length || 0,
        totalEvents: events?.length || 0,
        totalOrganizations: organizations?.length || 0,
        totalHours: totalHours,
      });

      // Events by Emirate
      const { data: eventsByEmirate } = await supabase
        .from('events')
        .select('emirate');

      const emirateCounts = eventsByEmirate?.reduce((acc: any, event) => {
        acc[event.emirate] = (acc[event.emirate] || 0) + 1;
        return acc;
      }, {});

      setEmirateData(
        Object.entries(emirateCounts || {}).map(([emirate, count]) => ({
          emirate,
          events: count,
        }))
      );

      // Events by Category
      const { data: eventsByCategory } = await supabase
        .from('events')
        .select('category');

      const categoryCounts = eventsByCategory?.reduce((acc: any, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {});

      setCategoryData(
        Object.entries(categoryCounts || {}).map(([category, count]) => ({
          category,
          count,
        }))
      );

      // Monthly volunteer hours (last 6 months)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      const monthlyHours: any[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

        const { data: monthHours } = await supabase
          .from('volunteer_hours')
          .select('hours_logged')
          .eq('status', 'approved')
          .gte('date_logged', startOfMonth)
          .lte('date_logged', endOfMonth);

        const totalHours = monthHours?.reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;

        monthlyHours.push({
          month: `${month} ${year}`,
          hours: totalHours,
        });
      }

      setMonthlyData(monthlyHours);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#D2A04A', '#CE1126', '#00732F', '#4A90E2', '#9B59B6', '#E67E22', '#16A085'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Analytics & Reports</h1>
            <p className="text-text-secondary mt-1">Platform statistics and insights</p>
          </div>
          <Link 
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Total Users</p>
            <p className="text-4xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Total Events</p>
            <p className="text-4xl font-bold mt-2">{stats.totalEvents.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Organizations</p>
            <p className="text-4xl font-bold mt-2">{stats.totalOrganizations.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Volunteer Hours</p>
            <p className="text-4xl font-bold mt-2">{stats.totalHours.toLocaleString()}h</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Volunteer Hours */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Monthly Volunteer Hours</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Line type="monotone" dataKey="hours" stroke="#D2A04A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Events by Emirate */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Events by Emirate</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emirateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emirate" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="events" fill="#00732F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events by Category */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Events by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }: { category: string; count: number }) => `${category}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Export Reports</h2>
            <div className="space-y-4">
              <button className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition flex items-center justify-between">
                <span>Download User Report (CSV)</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-between">
                <span>Download Event Report (Excel)</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-between">
                <span>Download Hours Report (PDF)</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-between">
                <span>Download Certificate Report (PDF)</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
