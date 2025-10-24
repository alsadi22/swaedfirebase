'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { QrCode, MapPin, Camera, CheckCircle, XCircle } from 'lucide-react'
import { calculateDistance } from '@/lib/utils'

function CheckInComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const sessionId = searchParams.get('sessionId')
  
  const [scanning, setScanning] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [checkInStatus, setCheckInStatus] = useState<'pending' | 'success' | 'error' | 'validating'>('pending')
  const [message, setMessage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)

      if (eventId) {
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle()
        
        setEvent(eventData)

        if (sessionId) {
          const { data: sessionData } = await supabase
            .from('event_sessions')
            .select('*')
            .eq('id', sessionId)
            .maybeSingle()
          
          setSession(sessionData)
        }
      }

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          (error) => {
            console.error('Geolocation error:', error)
            setMessage('Please enable location access to check in')
          }
        )
      }
    }

    init()
  }, [eventId, sessionId, router])

  const handleCheckIn = async () => {
    if (!user || !event || !location) {
      setMessage('Missing required information')
      return
    }

    setCheckInStatus('validating')

    try {
      // Validate GPS location
      const eventLocation = event.location_coordinates || session?.location_coordinates
      if (eventLocation) {
        const eventLat = eventLocation.lat || eventLocation.latitude
        const eventLng = eventLocation.lng || eventLocation.longitude
        const radius = event.geofence_radius || 500

        const distance = calculateDistance(location.lat, location.lng, eventLat, eventLng)
        
        if (distance > radius) {
          setCheckInStatus('error')
          setMessage(`You are ${Math.round(distance)}m away. Please be within ${radius}m of the event location.`)
          return
        }
      }

      // Check if already checked in
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('event_id', eventId)
        .eq('volunteer_id', user.id)
        .eq('status', 'checked_in')
        .maybeSingle()

      if (existingAttendance) {
        setCheckInStatus('success')
        setMessage('You are already checked in!')
        return
      }

      // Create attendance record
      const { data: attendance, error } = await supabase
        .from('attendance')
        .insert({
          event_id: eventId,
          event_session_id: sessionId,
          volunteer_id: user.id,
          check_in_time: new Date().toISOString(),
          check_in_method: 'qr_code',
          check_in_location: location,
          location_verified: true,
          status: 'checked_in'
        })
        .select()
        .maybeSingle()

      if (error) throw error

      // Update event volunteer count
      await supabase.rpc('increment_event_volunteers', { event_id: eventId })

      setCheckInStatus('success')
      setMessage('Check-in successful! Enjoy the event.')
    } catch (error: any) {
      setCheckInStatus('error')
      setMessage(error.message || 'Check-in failed. Please try again.')
    }
  }

  const startScanner = async () => {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setMessage('Please allow camera access to scan QR codes')
      setScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-8 text-center">
            Event Check-In
          </h1>

          {event && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#5C3A1F] mb-2">{event.title}</h2>
                <div className="flex items-center text-[#A0A0A0] text-sm">
                  <MapPin size={16} className="mr-2" />
                  {event.location_name}
                </div>
              </CardContent>
            </Card>
          )}

          {checkInStatus === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Ready to Check In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!eventId && (
                  <div className="text-center">
                    <QrCode className="w-20 h-20 text-[#D2A04A] mx-auto mb-4" />
                    <p className="text-[#A0A0A0] mb-4">
                      Scan the event QR code to check in
                    </p>
                    <Button onClick={startScanner} variant="primary" className="w-full">
                      <Camera className="mr-2" size={20} />
                      Open QR Scanner
                    </Button>
                  </div>
                )}

                {eventId && !scanning && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#5C3A1F] rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="text-white" size={40} />
                    </div>
                    <p className="text-[#A0A0A0] mb-4">
                      {location ? 'Location verified. Ready to check in!' : 'Getting your location...'}
                    </p>
                    <Button 
                      onClick={handleCheckIn} 
                      variant="primary" 
                      className="w-full"
                      disabled={!location}
                    >
                      <CheckCircle className="mr-2" size={20} />
                      Check In Now
                    </Button>
                  </div>
                )}

                {scanning && (
                  <div>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full rounded-lg mb-4"
                    />
                    <Button 
                      onClick={() => setScanning(false)} 
                      variant="outline" 
                      className="w-full"
                    >
                      Cancel Scanner
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {checkInStatus === 'validating' && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5C3A1F] mx-auto mb-4"></div>
                <p className="text-[#5C3A1F] font-medium">Validating check-in...</p>
              </CardContent>
            </Card>
          )}

          {checkInStatus === 'success' && (
            <Card className="border-2 border-[#00732F]">
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle className="w-20 h-20 text-[#00732F] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#00732F] mb-2">Check-In Successful!</h3>
                <p className="text-[#A0A0A0] mb-6">{message}</p>
                <Button onClick={() => router.push('/dashboard')} variant="primary">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {checkInStatus === 'error' && (
            <Card className="border-2 border-[#CE1126]">
              <CardContent className="pt-6 text-center py-12">
                <XCircle className="w-20 h-20 text-[#CE1126] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#CE1126] mb-2">Check-In Failed</h3>
                <p className="text-[#A0A0A0] mb-6">{message}</p>
                <div className="space-y-3">
                  <Button onClick={() => setCheckInStatus('pending')} variant="primary" className="w-full">
                    Try Again
                  </Button>
                  <Button onClick={() => router.push('/events')} variant="outline" className="w-full">
                    Back to Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckInComponent />
    </Suspense>
  )
}
