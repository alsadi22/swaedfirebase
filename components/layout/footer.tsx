'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#5C3A1F] text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[#D2A04A] rounded-lg flex items-center justify-center font-bold">
                S
              </div>
              <span className="text-xl font-bold">SwaedUAE</span>
            </div>
            <p className="text-sm text-[#FDFBF7] opacity-80">
              UAE's premier volunteer management platform connecting volunteers
              with verified organizations across the Emirates.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="hover:text-[#D2A04A]">Browse Events</Link></li>
              <li><Link href="/organizations" className="hover:text-[#D2A04A]">Organizations</Link></li>
              <li><Link href="/about" className="hover:text-[#D2A04A]">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#D2A04A]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Organizations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/organization/register" className="hover:text-[#D2A04A]">Register Organization</Link></li>
              <li><Link href="/organization/login" className="hover:text-[#D2A04A]">Organization Portal</Link></li>
              <li><Link href="/resources" className="hover:text-[#D2A04A]">Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>support@swaeduae.ae</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+971 4 123 4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Dubai, UAE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#D2A04A] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-[#FDFBF7] opacity-80">
            2025 SwaedUAE. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-[#D2A04A]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#D2A04A]">Terms of Service</Link>
            <Link href="/faq" className="hover:text-[#D2A04A]">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
