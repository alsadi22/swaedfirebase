'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Loader2, Calendar, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function MyApplicationsPage() {
  const { user, error: authError, isLoading: authLoading } = useUser()
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || authError) {
        setError('Please log in to view your applications');
        setLoading(false);
        return;
      }
      fetchApplications();
    }
  }, [user, authError, authLoading]);

  async function fetchApplications() {
    try {
      setError(null);
      
      // Use the new API endpoint instead of direct database queries
      const response = await fetch('/api/applications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        setError('Failed to load applications. Please try again.');
        console.error('Failed to fetch applications:', response.statusText);
      }
    } catch (error) {
      setError('An error occurred while loading your applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Loading skeleton component
  const ApplicationSkeleton = () => (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary">My Applications</h1>
            <Loader2 className="ml-4 h-6 w-6 animate-spin text-accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ApplicationSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">My Applications</h1>
          
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text-secondary mb-4">{error}</p>
            <button 
              onClick={fetchApplications}
              className="px-6 py-3 bg-accent text-white rounded-lg inline-flex items-center"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">My Applications</h1>
          <p className="text-text-secondary">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                {app.status === 'pending' && (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                )}
              </div>
              
              <h3 className="font-bold text-text-primary mb-2 line-clamp-2">
                {app.event?.title || 'Event Title'}
              </h3>
              
              <p className="text-sm text-text-secondary mb-3">
                {app.event?.organization?.name || 'Organization'}
              </p>

              {app.event && (
                <div className="space-y-1 text-xs text-text-secondary mb-4">
                  {app.event.start_date && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(app.event.start_date).toLocaleDateString()}
                    </div>
                  )}
                  {app.event.location_name && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {app.event.location_name}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Link 
                  href={`/events/${app.event_id}`} 
                  className="text-accent text-sm hover:underline"
                >
                  View Event →
                </Link>
                <span className="text-xs text-text-secondary">
                  Applied {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <div className="text-text-secondary mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No applications yet</h3>
            <p className="text-text-secondary mb-6">Start your volunteer journey by applying to events</p>
            <Link href="/events" className="px-6 py-3 bg-accent text-white rounded-lg inline-block hover:bg-accent/90 transition-colors">
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
