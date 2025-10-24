'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  organization: { name: string };
  category: string;
  emirate: string;
  status: string;
  start_date: string;
  end_date: string;
  max_volunteers: number;
  applications: { count: number }[];
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          category,
          emirate,
          status,
          start_date,
          end_date,
          max_volunteers,
          organization:organizations(name),
          applications:event_applications(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match the expected interface
      const mappedData = data?.map(event => ({
        ...event,
        organization: Array.isArray(event.organization) ? event.organization[0] : event.organization
      })) || [];
      
      setEvents(mappedData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateEventStatus(eventId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <h1 className="text-3xl font-bold text-text-primary">Event Management</h1>
            <p className="text-text-secondary mt-1">Review and manage all volunteer events</p>
          </div>
          <Link 
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search Events
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-text-secondary">Total Events</p>
            <p className="text-2xl font-bold text-text-primary">{events.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-soft p-4">
            <p className="text-sm text-blue-700">Published</p>
            <p className="text-2xl font-bold text-blue-900">
              {events.filter(e => e.status === 'published').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-soft p-4">
            <p className="text-sm text-green-700">In Progress</p>
            <p className="text-2xl font-bold text-green-900">
              {events.filter(e => e.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-soft p-4">
            <p className="text-sm text-purple-700">Completed</p>
            <p className="text-2xl font-bold text-purple-900">
              {events.filter(e => e.status === 'completed').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-soft p-4">
            <p className="text-sm text-red-700">Cancelled</p>
            <p className="text-2xl font-bold text-red-900">
              {events.filter(e => e.status === 'cancelled').length}
            </p>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{event.title}</p>
                        <p className="text-sm text-text-secondary">{event.emirate}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {event.organization?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(event.start_date).toLocaleDateString()} - <br />
                      {new Date(event.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {event.applications?.[0]?.count || 0} / {event.max_volunteers}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={event.status}
                        onChange={(e) => updateEventStatus(event.id, e.target.value)}
                        className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-accent hover:text-accent-hover font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <p className="text-text-secondary">No events found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
