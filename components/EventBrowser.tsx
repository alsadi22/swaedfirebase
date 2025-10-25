'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, MapPin, Clock } from 'lucide-react'

const upcomingEvents = [
  {
    id: 1,
    title: 'Community Clean-up Drive',
    date: '2025 Nov 05',
    time: '08:00 AM - 12:00 PM',
    location: 'Dubai Marina',
    description: 'Join us for a community clean-up initiative to keep Dubai Marina beautiful and sustainable.',
    category: 'Environmental',
  },
  {
    id: 2,
    title: 'Food Distribution Event',
    date: '2025 Nov 08',
    time: '09:00 AM - 02:00 PM',
    location: 'Abu Dhabi',
    description: 'Help distribute food packages to families in need across Abu Dhabi communities.',
    category: 'Humanitarian',
  },
  {
    id: 3,
    title: 'Environmental Awareness Campaign',
    date: '2025 Nov 12',
    time: '10:00 AM - 05:00 PM',
    location: 'Sharjah',
    description: 'Educate the community about environmental conservation and sustainable living practices.',
    category: 'Environmental',
  },
  {
    id: 4,
    title: 'Blood Donation Drive',
    date: '2025 Nov 15',
    time: '07:00 AM - 01:00 PM',
    location: 'Al Ain',
    description: 'Save lives by donating blood at our community blood donation drive.',
    category: 'Health',
  },
  {
    id: 5,
    title: 'Youth Mentoring Program',
    date: '2025 Nov 18',
    time: '03:00 PM - 06:00 PM',
    location: 'Ras Al Khaimah',
    description: 'Mentor young students and help them develop essential life and career skills.',
    category: 'Education',
  },
  {
    id: 6,
    title: 'Elderly Care Program',
    date: '2025 Nov 20',
    time: '09:00 AM - 01:00 PM',
    location: 'Dubai',
    description: 'Spend time with elderly community members and provide companionship and support.',
    category: 'Community',
  },
]

export function EventBrowser() {
  return (
    <section className="py-20 bg-[#FDFBF7]">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-[#A0A0A0] max-w-2xl mx-auto">
            Discover volunteer opportunities happening across the UAE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {upcomingEvents.map((event) => (
            <Card key={event.id} hover className="bg-white">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#FDF7E7] text-[#D2A04A] text-xs font-semibold rounded-full border border-[#D2A04A]">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-[#5C3A1F] mb-3">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-4 text-sm text-[#A0A0A0]">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#D2A04A]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#D2A04A]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#D2A04A]" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <p className="text-[#5C3A1F] mb-4 line-clamp-2">
                  {event.description}
                </p>

                <Link href={`/events/${event.id}`}>
                  <Button variant="primary" className="w-full bg-[#D2A04A] hover:bg-[#5C3A1F] text-white">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/events">
            <Button variant="outline" size="lg">
              View All Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
