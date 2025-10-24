'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('event_applications')
        .select('*, event:events(title, start_date, organization:organizations(name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">My Applications</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow-soft p-6">
              <span className={`px-2 py-1 text-xs rounded-full ${
                app.status === 'approved' ? 'bg-green-100 text-green-800' :
                app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {app.status}
              </span>
              <h3 className="font-bold text-text-primary mt-3 mb-2">{app.event?.title}</h3>
              <p className="text-sm text-text-secondary">{app.event?.organization?.name}</p>
              <Link href={`/events/${app.event_id}`} className="text-accent text-sm mt-4 inline-block">
                View Event →
              </Link>
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <p className="text-text-secondary mb-4">No applications yet</p>
            <Link href="/events" className="px-6 py-3 bg-accent text-white rounded-lg inline-block">
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
