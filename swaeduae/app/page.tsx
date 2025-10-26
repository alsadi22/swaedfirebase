/**
 * Homepage
 * Landing page for SwaedUAE platform
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Award, MapPin, Heart, Shield } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: 'Discover Events',
      description: 'Find volunteer opportunities that match your interests and skills across the UAE.',
    },
    {
      icon: MapPin,
      title: 'Location-Based',
      description: 'GPS-enabled check-in/out with geofencing for accurate attendance tracking.',
    },
    {
      icon: Award,
      title: 'Earn Certificates',
      description: 'Receive verified digital certificates for your volunteer contributions.',
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Join a network of volunteers making a difference in the UAE.',
    },
    {
      icon: Heart,
      title: 'Track Your Impact',
      description: 'Monitor your volunteer hours, achievements, and community contributions.',
    },
    {
      icon: Shield,
      title: 'Verified Organizations',
      description: 'Connect with verified organizations and legitimate volunteer opportunities.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary">SwaedUAE</h1>
              <span className="hidden sm:inline text-sm text-gray-600">Volunteer Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Make a Difference in the UAE
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with meaningful volunteer opportunities, track your impact, and earn verified certificates. 
          Join thousands of volunteers building a better community across the Emirates.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/register">
            <Button size="lg" className="px-8">
              Start Volunteering
            </Button>
          </Link>
          <Link href="/events">
            <Button size="lg" variant="outline" className="px-8">
              Browse Events
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-gray-600">Active Volunteers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-gray-600">Verified Organizations</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
            <div className="text-gray-600">Hours Contributed</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose SwaedUAE?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed specifically for the UAE volunteer ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-2 hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-primary to-blue-600 text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Volunteer Journey?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join our community of volunteers and organizations making an impact in the UAE
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="px-8">
                  Create Account
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">SwaedUAE</h3>
              <p className="text-gray-400 text-sm">
                Connecting volunteers with opportunities across the United Arab Emirates
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/events" className="hover:text-white">Browse Events</Link></li>
                <li><Link href="/organizations" className="hover:text-white">Organizations</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>2025 SwaedUAE. All rights reserved. Built with dedication for the UAE volunteer community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
