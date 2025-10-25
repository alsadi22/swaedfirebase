'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

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

export function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-4">
            Volunteers in Action
          </h2>
          <p className="text-lg text-[#A0A0A0] max-w-2xl mx-auto">
            See the impact our volunteers are making across the UAE
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => setSelectedImage(index)}
            >
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

        <div className="text-center">
          <Link href="/impact">
            <Button variant="outline" size="lg">
              View Full Gallery
            </Button>
          </Link>
        </div>
      </div>

      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-[#D2A04A]"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={galleryImages[selectedImage].src}
              alt={galleryImages[selectedImage].alt}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  )
}
