import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5C3A1F] mb-6">
              Privacy Policy
            </h1>
            <p className="text-sm text-[#A0A0A0] mb-12">
              Last updated: October 25, 2025
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Introduction</h2>
                <p className="text-[#5C3A1F] mb-4">
                  SwaedUAE ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
                  how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Information We Collect</h2>
                <p className="text-[#5C3A1F] mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-[#5C3A1F] space-y-2">
                  <li>Personal information (name, email, phone number, Emirates ID)</li>
                  <li>Profile information (skills, interests, experience)</li>
                  <li>Volunteer activity data (events attended, hours worked)</li>
                  <li>Location data (when checking in to events)</li>
                  <li>Communications you send to us</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">How We Use Your Information</h2>
                <p className="text-[#5C3A1F] mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-[#5C3A1F] space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Match you with appropriate volunteer opportunities</li>
                  <li>Track and verify your volunteer hours</li>
                  <li>Issue certificates and badges</li>
                  <li>Communicate with you about events and updates</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Data Security</h2>
                <p className="text-[#5C3A1F]">
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Contact Us</h2>
                <p className="text-[#5C3A1F]">
                  If you have questions about this Privacy Policy, please contact us at support@swaeduae.ae
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
