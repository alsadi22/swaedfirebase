'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  category: string;
  status: string;
  start_date: string;
  max_volunteers: number;
  applications: { count: number }[];
}

export default function OrganizationEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get organization
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) return;

      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          category,
          status,
          start_date,
          max_volunteers,
          applications:event_applications(count)
        `)
        .eq('organization_id', orgMember.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter(e => filter === 'all' || e.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading events...</p>
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
            <h1 className="text-3xl font-bold text-text-primary">My Events</h1>
            <p className="text-text-secondary mt-1">Manage your organization's volunteer events</p>
          </div>
          <Link 
            href="/organization/events/create"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
          >
            Create New Event
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft mb-6">
          <div className="flex border-b border-gray-200">
            {['all', 'draft', 'published', 'in_progress', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-4 text-sm font-medium capitalize ${
                  filter === f
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {f.replace('_', ' ')} ({events.filter(e => f === 'all' || e.status === f).length})
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.status === 'published' ? 'bg-green-100 text-green-800' :
                    event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {event.status}
                  </span>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                    {event.category}
                  </span>
                </div>

                <h3 className="font-bold text-text-primary mb-2 line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-sm text-text-secondary mb-4">
                  {new Date(event.start_date).toLocaleDateString()}
                </p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-text-secondary">Applications:</span>
                  <span className="font-semibold text-text-primary">
                    {event.applications?.[0]?.count || 0} / {event.max_volunteers}
                  </span>
                </div>

                <Link
                  href={`/events/${event.id}`}
                  className="block w-full text-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
                >
                  Manage Event
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-lg shadow-soft p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-text-primary mb-2">No Events Found</h3>
            <p className="text-text-secondary mb-6">
              {filter === 'all' 
                ? "You haven't created any events yet" 
                : `No ${filter} events`}
            </p>
            <Link
              href="/organization/events/create"
              className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
            >
              Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
