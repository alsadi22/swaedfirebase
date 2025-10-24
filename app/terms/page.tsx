import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5C3A1F] mb-6">
              Terms of Service
            </h1>
            <p className="text-sm text-[#A0A0A0] mb-12">
              Last updated: October 25, 2025
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Agreement to Terms</h2>
                <p className="text-[#5C3A1F]">
                  By accessing or using SwaedUAE, you agree to be bound by these Terms of Service and all applicable
                  laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">User Responsibilities</h2>
                <p className="text-[#5C3A1F] mb-4">As a user of SwaedUAE, you agree to:</p>
                <ul className="list-disc pl-6 text-[#5C3A1F] space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Attend events you have committed to</li>
                  <li>Follow event guidelines and organization rules</li>
                  <li>Respect other volunteers and organizations</li>
                  <li>Not misuse the platform or attempt to disrupt services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Volunteer Hours Verification</h2>
                <p className="text-[#5C3A1F]">
                  All volunteer hours must be verified through our QR code check-in system and confirmed by the host organization.
                  Falsifying volunteer hours or attendance may result in account suspension or termination.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Organization Responsibilities</h2>
                <p className="text-[#5C3A1F] mb-4">Organizations using SwaedUAE agree to:</p>
                <ul className="list-disc pl-6 text-[#5C3A1F] space-y-2">
                  <li>Provide accurate event information</li>
                  <li>Ensure a safe environment for volunteers</li>
                  <li>Verify volunteer attendance accurately</li>
                  <li>Maintain proper supervision during events</li>
                  <li>Comply with all UAE laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Limitation of Liability</h2>
                <p className="text-[#5C3A1F]">
                  SwaedUAE serves as a platform connecting volunteers with organizations. We are not responsible for
                  the actions, safety, or conduct of users or organizations during volunteer events.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#5C3A1F] mb-4">Contact Information</h2>
                <p className="text-[#5C3A1F]">
                  For questions about these Terms, contact us at support@swaeduae.ae
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
