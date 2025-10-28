'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Calendar, MapPin, Users, Clock, Building2, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'

// Application feedback types
type ApplicationStatus = 'idle' | 'applying' | 'success' | 'error'

interface ApplicationFeedback {
  status: ApplicationStatus
  message: string
  details?: string
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: authUser, error: authError, isLoading: authLoading } = useUser()
  const eventId = params.id as string
  const [event, setEvent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [applicationFeedback, setApplicationFeedback] = useState<ApplicationFeedback>({
    status: 'idle',
    message: ''
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        if (authLoading) return
        
        const currentUser = authUser ? {
          id: authUser.sub,
          email: authUser.email,
          first_name: authUser.given_name || authUser.user_metadata?.first_name || '',
          last_name: authUser.family_name || authUser.user_metadata?.last_name || '',
          user_type: authUser.user_metadata?.user_type || 'volunteer'
        } : null
        
        setUser(currentUser)

        // Fetch event details from API endpoint
        const response = await fetch(`/api/events/${eventId}`)
        
        if (response.ok) {
          const data = await response.json()
          setEvent(data.event)
        } else if (response.status === 404) {
          router.push('/events')
          return
        } else {
          console.error('Failed to fetch event:', response.statusText)
        }

        // Check if user has already applied
        if (currentUser) {
          const applicationResponse = await fetch(`/api/applications/check?event_id=${eventId}`, {
            credentials: 'include'
          })
          
          if (applicationResponse.ok) {
            const applicationData = await applicationResponse.json()
            setHasApplied(applicationData.hasApplied)
          }
        }
      } catch (error) {
        console.error('Error loading event:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId, router, authUser, authLoading])

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Set applying state with feedback
    setApplicationFeedback({
      status: 'applying',
      message: 'Submitting your application...',
      details: 'Please wait while we process your volunteer application.'
    })

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          event_id: eventId,
          status: 'pending'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setHasApplied(true)
        setApplicationFeedback({
          status: 'success',
          message: 'Application submitted successfully!',
          details: 'Your volunteer application has been received. The organization will review your application and contact you soon. You can track your application status in your dashboard.'
        })

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setApplicationFeedback({ status: 'idle', message: '' })
        }, 5000)
      } else {
        setApplicationFeedback({
          status: 'error',
          message: data.error || 'Failed to submit application',
          details: response.status === 400 && data.error?.includes('already applied') 
            ? 'You have already applied to this event. Check your dashboard to view your application status.'
            : 'There was an issue processing your application. Please try again or contact support if the problem persists.'
        })
      }
    } catch (error: any) {
      setApplicationFeedback({
        status: 'error',
        message: 'Network error occurred',
        details: 'Unable to connect to the server. Please check your internet connection and try again.'
      })
    }
  }

  // Render application feedback component
  const renderApplicationFeedback = () => {
    if (applicationFeedback.status === 'idle') return null

    const getIcon = () => {
      switch (applicationFeedback.status) {
        case 'applying':
          return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-600" />
        default:
          return <Info className="h-5 w-5 text-blue-600" />
      }
    }

    const getBackgroundColor = () => {
      switch (applicationFeedback.status) {
        case 'applying':
          return 'bg-blue-50 border-blue-200'
        case 'success':
          return 'bg-green-50 border-green-200'
        case 'error':
          return 'bg-red-50 border-red-200'
        default:
          return 'bg-gray-50 border-gray-200'
      }
    }

    const getTextColor = () => {
      switch (applicationFeedback.status) {
        case 'applying':
          return 'text-blue-800'
        case 'success':
          return 'text-green-800'
        case 'error':
          return 'text-red-800'
        default:
          return 'text-gray-800'
      }
    }

    return (
      <div className={`mb-4 p-4 rounded-lg border ${getBackgroundColor()}`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <p className={`font-medium ${getTextColor()}`}>
              {applicationFeedback.message}
            </p>
            {applicationFeedback.details && (
              <p className={`mt-1 text-sm ${getTextColor()} opacity-80`}>
                {applicationFeedback.details}
              </p>
            )}
          </div>
        </div>
      </div>
    )
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

              {event.organization && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-[#5C3A1F] rounded-lg flex items-center justify-center">
                        <Building2 className="text-white" size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#5C3A1F]">{event.organization.name}</h3>
                        <p className="text-sm text-[#A0A0A0]">{event.organization.type}</p>
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
                    {renderApplicationFeedback()}
                    
                    {hasApplied ? (
                      <div className="space-y-3">
                        <Button variant="success" className="w-full" disabled>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Application Submitted
                        </Button>
                        <div className="text-center">
                          <Link 
                            href="/dashboard/applications" 
                            className="text-sm text-[#D2A04A] hover:text-[#5C3A1F] underline"
                          >
                            View Application Status
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleApply}
                        disabled={
                          applicationFeedback.status === 'applying' || 
                          event.current_volunteers >= (event.volunteer_capacity || 0)
                        }
                      >
                        {applicationFeedback.status === 'applying' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Application...
                          </>
                        ) : event.current_volunteers >= (event.volunteer_capacity || 0) ? (
                          'Event Full'
                        ) : (
                          'Apply to Volunteer'
                        )}
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
