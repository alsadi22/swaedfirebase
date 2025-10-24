'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface VolunteerHour {
  id: string;
  event: { title: string };
  hours_logged: number;
  date_logged: string;
  status: string;
  verified_by_user: { first_name: string; last_name: string };
}

export default function VolunteerHoursPage() {
  const [hours, setHours] = useState<VolunteerHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHours();
  }, []);

  async function fetchHours() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('volunteer_hours')
        .select(`
          id,
          hours_logged,
          date_logged,
          status,
          event:events(title),
          verified_by_user:users(first_name, last_name)
        `)
        .eq('user_id', user.id)
        .order('date_logged', { ascending: false });

      if (error) throw error;
      
      // Map the data to match the expected interface
      const mappedData = data?.map(hour => ({
        ...hour,
        event: Array.isArray(hour.event) ? hour.event[0] : hour.event,
        verified_by_user: Array.isArray(hour.verified_by_user) ? hour.verified_by_user[0] : hour.verified_by_user
      })) || [];
      
      setHours(mappedData);

      const approved = mappedData?.filter(h => h.status === 'approved')
        .reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;
      setTotalHours(approved);
    } catch (error) {
      console.error('Error fetching hours:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredHours = hours.filter(h => filter === 'all' || h.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Volunteer Hours</h1>
          <p className="text-text-secondary mt-1">Track your volunteer time contributions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Total Hours</p>
            <p className="text-4xl font-bold mt-2">{totalHours}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Approved</p>
            <p className="text-4xl font-bold mt-2">{hours.filter(h => h.status === 'approved').length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Pending</p>
            <p className="text-4xl font-bold mt-2">{hours.filter(h => h.status === 'pending').length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Rejected</p>
            <p className="text-4xl font-bold mt-2">{hours.filter(h => h.status === 'rejected').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft mb-6">
          <div className="flex border-b border-gray-200">
            {['all', 'approved', 'pending', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-6 py-4 text-sm font-medium capitalize ${
                  filter === f
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Hours Table */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHours.map((hour) => (
                <tr key={hour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(hour.date_logged).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">
                    {hour.event?.title}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-text-primary">
                    {hour.hours_logged}h
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      hour.status === 'approved' ? 'bg-green-100 text-green-800' :
                      hour.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {hour.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {hour.verified_by_user 
                      ? `${hour.verified_by_user.first_name} ${hour.verified_by_user.last_name}`
                      : 'Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHours.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <p className="text-text-secondary">No hours found</p>
          </div>
        )}
      </div>
    </div>
  );
}
