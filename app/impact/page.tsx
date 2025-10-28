'use client'

import React from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, MapPin, Heart, Award, Globe } from 'lucide-react'

const impactStats = [
  {
    icon: Users,
    label: 'Volunteers Engaged',
    value: '2,500+',
    description: 'Active volunteers across the UAE'
  },
  {
    icon: Clock,
    label: 'Hours Contributed',
    value: '15,000+',
    description: 'Total volunteer hours logged'
  },
  {
    icon: Heart,
    label: 'Lives Impacted',
    value: '50,000+',
    description: 'People helped through our initiatives'
  },
  {
    icon: Globe,
    label: 'Communities Served',
    value: '7',
    description: 'Emirates with active programs'
  }
]

const impactStories = [
  {
    title: 'Environmental Conservation',
    description: 'Our volunteers have cleaned over 100 beaches and planted 5,000 trees across the UAE.',
    image: '/images/volunteers/uae_environmental_cleanup_volunteers_sandy_area.jpg',
    stats: '100+ beaches cleaned, 5,000 trees planted'
  },
  {
    title: 'Community Support',
    description: 'Food distribution programs have provided meals to thousands of families in need.',
    image: '/images/volunteers/uae_volunteers_community_food_distribution.jpg',
    stats: '25,000+ meals distributed'
  },
  {
    title: 'Healthcare Initiatives',
    description: 'Blood donation drives and health awareness campaigns have saved countless lives.',
    image: '/images/volunteers/UAE_Dubai_Health_Blood_Donation_Volunteers_Event.jpg',
    stats: '2,000+ blood donations collected'
  },
  {
    title: 'Educational Programs',
    description: 'Tutoring and mentorship programs have helped students achieve their academic goals.',
    image: '/images/volunteers/UAE_volunteers_community_event_Dubai_Cares_packing_aid.jpg',
    stats: '1,500+ students supported'
  }
]

const galleryImages = [
  {
    src: '/images/volunteers/uae_volunteers_community_food_distribution.jpg',
    alt: 'Volunteers distributing food to community members',
  },
  {
    src: '/images/volunteers/uae_environmental_cleanup_volunteers_sandy_area.jpg',
    alt: 'Environmental cleanup volunteers',
  },
  {
    src: '/images/volunteers/UAE_volunteers_community_event_Dubai_Cares_packing_aid.jpg',
    alt: 'Volunteers packing aid boxes at Dubai Cares event',
  },
  {
    src: '/images/volunteers/uae_volunteers_community_aid_event_dubai_cares.jpg',
    alt: 'Community aid event volunteers',
  },
  {
    src: '/images/volunteers/UAE_volunteers_Emirates_Red_Crescent_humanitarian_aid_charity_packaging.jpg',
    alt: 'Emirates Red Crescent volunteers packaging humanitarian aid',
  },
  {
    src: '/images/volunteers/uae_red_crescent_volunteers_humanitarian_aid_distribution.jpg',
    alt: 'Red Crescent volunteers distributing aid',
  },
  {
    src: '/images/volunteers/uae_women_volunteers_community_event_helping.jpg',
    alt: 'Women volunteers at community event',
  },
  {
    src: '/images/volunteers/UAE_Dubai_Health_Blood_Donation_Volunteers_Event.jpg',
    alt: 'Blood donation drive volunteers',
  },
]

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Impact Across the UAE
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Together, we're building stronger communities and creating positive change 
              throughout the United Arab Emirates. See how your participation makes a difference.
            </p>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {impactStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impact Stories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Stories of Impact
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {impactStories.map((story, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{story.title}</h3>
                  <p className="text-gray-600 mb-4">{story.description}</p>
                  <div className="flex items-center text-sm text-blue-600 font-semibold">
                    <Award className="h-4 w-4 mr-2" />
                    {story.stats}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Volunteers in Action
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-blue-600 text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-6">
            Be part of the change. Start your volunteer journey today and help us create 
            an even greater impact across the UAE.
          </p>
          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}