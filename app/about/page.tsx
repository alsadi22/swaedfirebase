import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Target, Heart, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5C3A1F] mb-6 text-center">
              About SwaedUAE
            </h1>
            <p className="text-xl text-[#A0A0A0] mb-12 text-center">
              Empowering communities through organized volunteerism
            </p>

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-[#5C3A1F] leading-relaxed">
                SwaedUAE is the UAE's premier volunteer management platform, dedicated to connecting passionate 
                volunteers with verified organizations across the Emirates. Our mission is to make volunteering 
                accessible, organized, and rewarding for everyone.
              </p>
              <p className="text-[#5C3A1F] leading-relaxed">
                Founded with the vision of strengthening community bonds and fostering a culture of giving, 
                we provide a comprehensive digital ecosystem that streamlines volunteer recruitment, event 
                management, and impact tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-[#5C3A1F] rounded-full flex items-center justify-center mb-4">
                    <Target className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#5C3A1F] mb-3">Our Mission</h3>
                  <p className="text-[#A0A0A0]">
                    To create a thriving ecosystem of volunteers and organizations, 
                    making positive social impact accessible to all residents of the UAE.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-[#D2A04A] rounded-full flex items-center justify-center mb-4">
                    <Heart className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#5C3A1F] mb-3">Our Vision</h3>
                  <p className="text-[#A0A0A0]">
                    To be the leading platform that transforms volunteerism in the UAE, 
                    inspiring a generation of engaged and empowered community leaders.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-lg p-8 mb-12">
              <h2 className="text-3xl font-bold text-[#5C3A1F] mb-6 text-center">
                Our Core Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Users className="text-[#D2A04A] mx-auto mb-3" size={40} />
                  <h4 className="font-semibold text-[#5C3A1F] mb-2">Community First</h4>
                  <p className="text-sm text-[#A0A0A0]">
                    We prioritize the needs of our communities and work to create lasting positive change.
                  </p>
                </div>
                <div className="text-center">
                  <Award className="text-[#D2A04A] mx-auto mb-3" size={40} />
                  <h4 className="font-semibold text-[#5C3A1F] mb-2">Excellence</h4>
                  <p className="text-sm text-[#A0A0A0]">
                    We strive for excellence in every aspect of our platform and services.
                  </p>
                </div>
                <div className="text-center">
                  <Heart className="text-[#D2A04A] mx-auto mb-3" size={40} />
                  <h4 className="font-semibold text-[#5C3A1F] mb-2">Integrity</h4>
                  <p className="text-sm text-[#A0A0A0]">
                    We operate with transparency, honesty, and accountability in all we do.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
