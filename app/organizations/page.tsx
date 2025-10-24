import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5C3A1F] mb-6 text-center">
            Verified Organizations
          </h1>
          <p className="text-xl text-[#A0A0A0] mb-12 text-center max-w-3xl mx-auto">
            Browse our directory of verified organizations across the UAE
          </p>
          
          <div className="text-center py-20">
            <p className="text-lg text-[#A0A0A0]">Organizations directory coming soon</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
