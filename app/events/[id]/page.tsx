'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase, type Event } from '@/lib/supabase'
import { Calendar, MapPin, Users, Clock, Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadEvent() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle()

        if (!eventData) {
          router.push('/events')
          return
        }

        setEvent(eventData)

        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', eventData.organization_id)
          .maybeSingle()

        setOrganization(orgData)

        if (currentUser) {
          const { data: applicationData } = await supabase
            .from('event_applications')
            .select('*')
            .eq('event_id', eventId)
            .eq('volunteer_id', currentUser.id)
            .maybeSingle()

          setHasApplied(!!applicationData)
        }
      } catch (error) {
        console.error('Error loading event:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId, router])

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setApplying(true)

    try {
      const { error } = await supabase
        .from('event_applications')
        .insert({
          event_id: eventId,
          volunteer_id: user.id,
          status: 'pending'
        })

      if (error) throw error

      setHasApplied(true)
      alert('Application submitted successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
          <p className="mt-4 text-[#A0A0A0]">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <Link href="/events" className="inline-flex items-center text-[#5C3A1F] hover:text-[#D2A04A] mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {event.cover_image_url && (
                <div className="h-96 bg-[#E5E5E5] rounded-lg overflow-hidden mb-6">
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-4">
                {event.title}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <span className="inline-block px-4 py-2 bg-[#D2A04A] text-white text-sm font-medium rounded-full">
                  {event.category}
                </span>
                <span className="inline-block px-4 py-2 bg-[#00732F] text-white text-sm font-medium rounded-full">
                  {event.status}
                </span>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-[#5C3A1F] mb-4">About This Event</h3>
                  <p className="text-[#5C3A1F] whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              {organization && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-[#5C3A1F] rounded-lg flex items-center justify-center">
                        <Building2 className="text-white" size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#5C3A1F]">{organization.name}</h3>
                        <p className="text-sm text-[#A0A0A0]">{organization.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center text-[#5C3A1F]">
                    <Calendar size={20} className="mr-3 text-[#D2A04A]" />
                    <div>
                      <p className="text-sm text-[#A0A0A0]">Date</p>
                      <p className="font-medium">{formatDate(event.start_date)}</p>
                    </div>
                  </div>

                  {event.start_time && (
                    <div className="flex items-center text-[#5C3A1F]">
                      <Clock size={20} className="mr-3 text-[#D2A04A]" />
                      <div>
                        <p className="text-sm text-[#A0A0A0]">Time</p>
                        <p className="font-medium">
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.location_name && (
                    <div className="flex items-start text-[#5C3A1F]">
                      <MapPin size={20} className="mr-3 text-[#D2A04A] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-[#A0A0A0]">Location</p>
                        <p className="font-medium">{event.location_name}</p>
                        {event.location_address && (
                          <p className="text-sm text-[#A0A0A0] mt-1">{event.location_address}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {event.volunteer_capacity && (
                    <div className="flex items-center text-[#5C3A1F]">
                      <Users size={20} className="mr-3 text-[#D2A04A]" />
                      <div>
                        <p className="text-sm text-[#A0A0A0]">Capacity</p>
                        <p className="font-medium">
                          {event.current_volunteers}/{event.volunteer_capacity} volunteers
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E5E5E5]">
                    {hasApplied ? (
                      <Button variant="success" className="w-full" disabled>
                        Application Submitted
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleApply}
                        disabled={applying || event.current_volunteers >= (event.volunteer_capacity || 0)}
                      >
                        {applying ? 'Applying...' : event.current_volunteers >= (event.volunteer_capacity || 0) ? 'Event Full' : 'Apply to Volunteer'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
