import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Users, Calendar, Award, Building2, Heart, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#5C3A1F] via-[#7a4d28] to-[#D2A04A] text-white py-20 md:py-32">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Empowering Communities Through Volunteerism
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-[#FDFBF7] opacity-90">
                Join UAE's premier volunteer management platform. Connect with verified organizations, 
                track your impact, and earn recognition for making a difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/events">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-[#5C3A1F]">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#D2A04A] mb-2">1,500+</div>
                <div className="text-[#5C3A1F] font-medium">Active Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#D2A04A] mb-2">250+</div>
                <div className="text-[#5C3A1F] font-medium">Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#D2A04A] mb-2">800+</div>
                <div className="text-[#5C3A1F] font-medium">Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#D2A04A] mb-2">50K+</div>
                <div className="text-[#5C3A1F] font-medium">Hours Contributed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-4">
                Why Choose SwaedUAE?
              </h2>
              <p className="text-lg text-[#A0A0A0] max-w-2xl mx-auto">
                Experience the most comprehensive volunteer management platform in the UAE
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card hover>
                <CardContent className="text-center pt-6">
                  <div className="w-16 h-16 bg-[#5C3A1F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#5C3A1F] mb-2">
                    Verified Organizations
                  </h3>
                  <p className="text-[#A0A0A0]">
                    Connect with pre-verified NGOs, charities, and government organizations across the UAE
                  </p>
                </CardContent>
              </Card>

              <Card hover>
                <CardContent className="text-center pt-6">
                  <div className="w-16 h-16 bg-[#D2A04A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#5C3A1F] mb-2">
                    Smart Event Management
                  </h3>
                  <p className="text-[#A0A0A0]">
                    Easy event discovery, QR code check-in, and automated hour tracking
                  </p>
                </CardContent>
              </Card>

              <Card hover>
                <CardContent className="text-center pt-6">
                  <div className="w-16 h-16 bg-[#00732F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#5C3A1F] mb-2">
                    Gamified Recognition
                  </h3>
                  <p className="text-[#A0A0A0]">
                    Earn badges, certificates, and recognition for your volunteer contributions
                  </p>
                </CardContent>
              </Card>

              <Card hover>
                <CardContent className="text-center pt-6">
                  <div className="w-16 h-16 bg-[#CE1126] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#5C3A1F] mb-2">
                    Educational Integration
                  </h3>
                  <p className="text-[#A0A0A0]">
                    Track academic volunteer hours with official transcripts for students
                  </p>
                </CardContent>
              </Card>

              <Card hover>
                <CardContent className="text-center pt-6">
                  <div className="w-16 h-16 bg-[#5C3A1F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#5C3A1F] mb-2">
                    GPS Verification
                  </h3>
                  <p className="text-[#A0A0A0]">
                    Secure check-in with GPS geofencing for authentic volunteer tracking
                  </p>
                </CardContent>
              </Card>

              <Card hover>
                <CardContent className="text-center pt-6">
                  <div className="w-16 h-16 bg-[#D2A04A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#5C3A1F] mb-2">
                    Impact Analytics
                  </h3>
                  <p className="text-[#A0A0A0]">
                    Comprehensive dashboards showing your volunteer impact and progress
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#D2A04A] to-[#5C3A1F] text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-[#FDFBF7] opacity-90 max-w-2xl mx-auto">
              Join thousands of volunteers making an impact across the UAE
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="bg-white text-[#5C3A1F] hover:bg-[#FDFBF7]">
                Create Your Account
              </Button>
            </Link>
          </div>
        </section>

        {/* For Organizations Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-4">
                For Organizations
              </h2>
              <p className="text-lg text-[#A0A0A0] mb-8">
                Streamline your volunteer management with powerful tools designed for UAE organizations
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#D2A04A] mb-2">Event Management</div>
                  <p className="text-sm text-[#A0A0A0]">Create and manage volunteer events with ease</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#D2A04A] mb-2">Volunteer Recruitment</div>
                  <p className="text-sm text-[#A0A0A0]">Find and recruit qualified volunteers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#D2A04A] mb-2">Impact Reports</div>
                  <p className="text-sm text-[#A0A0A0]">Generate detailed analytics and reports</p>
                </div>
              </div>
              <Link href="/organization/register">
                <Button size="lg" variant="primary">
                  Register Your Organization
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
