'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getEvents } from '@/lib/services/firestore';
import type { Event, EventCategory, EventFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';

const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

const CATEGORIES: EventCategory[] = [
  'EDUCATION',
  'ENVIRONMENT',
  'HEALTH',
  'COMMUNITY_SERVICE',
  'ANIMAL_WELFARE',
  'ARTS_CULTURE',
  'SPORTS_RECREATION',
  'EMERGENCY_RESPONSE',
];

export default function EventsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventFilters>({});
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | ''>('');
  const [selectedEmirate, setSelectedEmirate] = useState('');

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { events: fetchedEvents } = await getEvents(filters, { page: 1, pageSize: 20 });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters: EventFilters = {};
    
    if (selectedCategory) {
      newFilters.category = selectedCategory;
    }
    if (selectedEmirate) {
      newFilters.emirate = selectedEmirate;
    }
    
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedEmirate('');
    setFilters({});
  };

  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.organizationName.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getCategoryLabel = (category: EventCategory) => {
    const labels: Record<EventCategory, string> = {
      EDUCATION: 'Education',
      ENVIRONMENT: 'Environment',
      HEALTH: 'Health',
      COMMUNITY_SERVICE: 'Community Service',
      ANIMAL_WELFARE: 'Animal Welfare',
      ARTS_CULTURE: 'Arts & Culture',
      SPORTS_RECREATION: 'Sports & Recreation',
      EMERGENCY_RESPONSE: 'Emergency Response',
    };
    return labels[category];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('events.discover', 'Discover Events')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('events.findOpportunities', 'Find volunteer opportunities that match your interests')}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('events.searchFilter', 'Search & Filter')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-4">
                <Input
                  type="text"
                  placeholder={t('events.searchPlaceholder', 'Search events by title, description, or organization...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.category', 'Category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as EventCategory | '')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('events.allCategories', 'All Categories')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emirate Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.emirate', 'Emirate')}
                </label>
                <select
                  value={selectedEmirate}
                  onChange={(e) => setSelectedEmirate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('events.allEmirates', 'All Emirates')}</option>
                  {EMIRATES.map((emirate) => (
                    <option key={emirate} value={emirate}>
                      {emirate}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  {t('events.applyFilters', 'Apply Filters')}
                </Button>
                <Button onClick={handleClearFilters} variant="outline">
                  {t('events.clearFilters', 'Clear')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {t('events.showingResults', 'Showing')} {filteredEvents.length} {t('events.events', 'events')}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {t('events.noEvents', 'No events found')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('events.noEventsDesc', 'Try adjusting your search or filters')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryLabel(event.category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {event.location.emirate}
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">
                    {language === 'ar' && event.titleAr ? event.titleAr : event.title}
                  </CardTitle>
                  <CardDescription>{event.organizationName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(event.dateTime.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>
                        {event.capacity.currentVolunteers} / {event.capacity.maxVolunteers} {t('events.volunteers', 'volunteers')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{event.location.address}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button className="w-full">
                      {t('events.viewDetails', 'View Details')}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
