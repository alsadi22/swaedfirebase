'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/database'
import { useUser } from '@auth0/nextjs-auth0/client'
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
      // Check authentication
      const authResponse = await fetch('/api/auth/check')
      if (!authResponse.ok) {
        router.push('/auth/login')
        return
      }

      if (eventId) {
        try {
          // Fetch event and session data
          const checkInResponse = await fetch(`/api/events/check-in?eventId=${eventId}${sessionId ? `&sessionId=${sessionId}` : ''}`)
          if (!checkInResponse.ok) {
            if (checkInResponse.status === 401) {
              router.push('/auth/login')
              return
            }
            throw new Error('Failed to fetch event data')
          }

          const checkInData = await checkInResponse.json()
          setEvent(checkInData.event)
          setSession(checkInData.session)
          setUser(checkInData.user)

        } catch (error) {
          console.error('Error fetching event data:', error)
          setMessage('Failed to load event information')
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
      const response = await fetch('/api/events/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          sessionId,
          location
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'location_too_far') {
          setCheckInStatus('error')
          setMessage(result.message)
        } else {
          throw new Error(result.error || 'Check-in failed')
        }
        return
      }

      setCheckInStatus('success')
      setMessage(result.message)

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
