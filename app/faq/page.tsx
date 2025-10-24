import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'

export default function FAQPage() {
  const faqs = [
    {
      question: 'How do I sign up as a volunteer?',
      answer: `Click on "Get Started" on the homepage and fill out the registration form. You need to provide basic information and choose your role as a volunteer.`
    },
    {
      question: 'Are all organizations verified?',
      answer: `Yes, all organizations go through a verification process to ensure they are legitimate and meet our standards before they can create events on our platform.`
    },
    {
      question: 'How does QR code check-in work?',
      answer: `When you arrive at an event, scan the QR code provided by the organization to check in. Your location will be verified using GPS to ensure you are at the event venue.`
    },
    {
      question: 'Can students volunteer?',
      answer: `Yes! Students aged 13 and above can volunteer with guardian consent. We also integrate with educational institutions to track academic volunteer hours.`
    },
    {
      question: 'How do I earn badges?',
      answer: `Badges are automatically awarded based on your volunteer activities - such as completing events, reaching hour milestones, or achieving special goals.`
    },
    {
      question: 'Are volunteer hours verified?',
      answer: `Yes, all hours are tracked through our QR check-in/check-out system and verified by the organizations you volunteer with.`
    }
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5C3A1F] mb-6 text-center">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-[#A0A0A0] mb-12 text-center">
              Find answers to common questions about SwaedUAE
            </p>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-[#5C3A1F] mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-[#A0A0A0]">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}