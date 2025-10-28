'use client'

import React, { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form'
import { Calendar, MapPin, Users, Clock, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatTime, EMIRATES, EVENT_CATEGORIES } from '@/lib/utils'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmirate, setSelectedEmirate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    async function loadEvents() {
      try {
        // Show filtering indicator for subsequent loads
        if (!loading) {
          setIsFiltering(true)
        }

        // Build query parameters for the API
        const params = new URLSearchParams()
        params.append('status', 'published')
        params.append('limit', '50') // Get more events for client-side filtering
        
        if (selectedCategory && selectedCategory !== '') {
          params.append('category', selectedCategory)
        }

        // Fetch events from API endpoint
        const response = await fetch(`/api/events?${params.toString()}`)
        
        if (response.ok) {
          const data = await response.json()
          let filteredEvents = data.events || []
          
          // Apply client-side filtering for search term and emirate
          if (searchTerm) {
            filteredEvents = filteredEvents.filter((event: any) =>
              event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }
          
          if (selectedEmirate) {
            filteredEvents = filteredEvents.filter((event: any) =>
              event.emirate === selectedEmirate
            )
          }

          setEvents(filteredEvents)
        } else {
          console.error('Failed to fetch events:', response.statusText)
        }
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
        setIsFiltering(false)
      }
    }

    loadEvents()
  }, [searchTerm, selectedEmirate, selectedCategory])

  // Loading skeleton component
  const EventSkeleton = () => (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Header />
        
        <main className="pt-24 pb-20">
          <div className="container-custom">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
                Discover Volunteer Events
              </h1>
              <p className="text-lg text-[#A0A0A0]">
                Find meaningful volunteer opportunities across the UAE
              </p>
            </div>

            {/* Loading state for filters */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Loading state for events grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <EventSkeleton key={index} />
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              Discover Volunteer Events
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Find meaningful volunteer opportunities across the UAE
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]" size={20} />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
              {isFiltering && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#D2A04A]" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                options={[
                  { value: '', label: 'All Emirates' },
                  ...EMIRATES.map(e => ({ value: e, label: e }))
                ]}
                value={selectedEmirate}
                onChange={(e) => setSelectedEmirate(e.target.value)}
              />
              
              <Select
                options={[
                  { value: '', label: 'All Categories' },
                  ...EVENT_CATEGORIES.map(c => ({ value: c, label: c }))
                ]}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Results summary with loading indicator */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[#A0A0A0]">
              {isFiltering ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Filtering events...
                </span>
              ) : (
                `Found ${events.length} event${events.length !== 1 ? 's' : ''}`
              )}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
              <p className="mt-4 text-[#A0A0A0]">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-lg text-[#A0A0A0] mb-4">No events found matching your criteria</p>
                <Button onClick={() => {
                  setSearchTerm('')
                  setSelectedEmirate('')
                  setSelectedCategory('')
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} hover>
                  {event.cover_image_url && (
                    <div className="h-48 bg-[#E5E5E5] rounded-t-lg overflow-hidden">
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-[#D2A04A] text-white text-xs font-medium rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#5C3A1F] mb-2">
                      {event.title}
                    </h3>
                    <p className="text-[#A0A0A0] text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-[#5C3A1F] mb-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        {formatDate(event.start_date)}
                      </div>
                      {event.start_time && (
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2" />
                          {formatTime(event.start_time)}
                        </div>
                      )}
                      {event.location_name && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {event.location_name}
                        </div>
                      )}
                      {event.volunteer_capacity && (
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" />
                          {event.current_volunteers}/{event.volunteer_capacity} volunteers
                        </div>
                      )}
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
