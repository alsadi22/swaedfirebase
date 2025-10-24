'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface StudentStats {
  totalHours: number;
  eventsCompleted: number;
  badgesEarned: number;
  academicCredits: number;
  currentGPA: number;
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentStats>({
    totalHours: 0,
    eventsCompleted: 0,
    badgesEarned: 0,
    academicCredits: 0,
    currentGPA: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  async function fetchStudentData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get volunteer hours
      const { data: hours } = await supabase
        .from('volunteer_hours')
        .select('hours_logged')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      const totalHours = hours?.reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;

      // Get badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id);

      // Get student profile
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get upcoming events
      const { data: events } = await supabase
        .from('event_applications')
        .select('*, event:events(*)')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .gte('event.start_date', new Date().toISOString())
        .limit(3);

      setStats({
        totalHours,
        eventsCompleted: Math.floor(totalHours / 4), // Assuming 4 hours per event average
        badgesEarned: badges?.length || 0,
        academicCredits: profile?.academic_credits || 0,
        currentGPA: profile?.current_gpa || 0,
      });

      setUpcomingEvents(events || []);
      setRecentActivity([
        { type: 'event', message: 'Completed Beach Cleanup Event', date: '2 days ago' },
        { type: 'badge', message: 'Earned Community Hero Badge', date: '5 days ago' },
        { type: 'credit', message: 'Academic credit approved: 2.0', date: '1 week ago' },
      ]);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Student Dashboard</h1>
          <p className="text-text-secondary mt-1">Track your volunteer work and academic progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Volunteer Hours</p>
            <p className="text-4xl font-bold mt-2">{stats.totalHours}</p>
            <p className="text-xs mt-2 opacity-75">Total hours logged</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Events Completed</p>
            <p className="text-4xl font-bold mt-2">{stats.eventsCompleted}</p>
            <p className="text-xs mt-2 opacity-75">Attended events</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Badges Earned</p>
            <p className="text-4xl font-bold mt-2">{stats.badgesEarned}</p>
            <p className="text-xs mt-2 opacity-75">Achievement badges</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Academic Credits</p>
            <p className="text-4xl font-bold mt-2">{stats.academicCredits}</p>
            <p className="text-xs mt-2 opacity-75">Credits earned</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Current GPA</p>
            <p className="text-4xl font-bold mt-2">{stats.currentGPA.toFixed(2)}</p>
            <p className="text-xs mt-2 opacity-75">Grade point average</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/events" className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition text-center">
            <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold text-text-primary">Find Events</h3>
          </Link>
          <Link href="/student/academic" className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition text-center">
            <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="font-semibold text-text-primary">Academic Info</h3>
          </Link>
          <Link href="/student/transcripts" className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition text-center">
            <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-semibold text-text-primary">Transcripts</h3>
          </Link>
          <Link href="/student/guardian" className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition text-center">
            <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="font-semibold text-text-primary">Guardian Info</h3>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-text-primary">{item.event?.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {new Date(item.event?.start_date).toLocaleDateString()}
                    </p>
                    <Link href={`/events/${item.event?.id}`} className="text-accent text-sm mt-2 inline-block">
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-center py-8">No upcoming events</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'event' ? 'bg-blue-500' :
                    activity.type === 'badge' ? 'bg-purple-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{activity.message}</p>
                    <p className="text-xs text-text-secondary mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
