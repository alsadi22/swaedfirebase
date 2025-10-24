'use client'

import React, { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/form'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5C3A1F] mb-6 text-center">
              Contact Us
            </h1>
            <p className="text-xl text-[#A0A0A0] mb-12 text-center">
              Have questions? We're here to help!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardContent className="text-center pt-8">
                  <div className="w-16 h-16 bg-[#5C3A1F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-white" size={28} />
                  </div>
                  <h3 className="font-semibold text-[#5C3A1F] mb-2">Email Us</h3>
                  <p className="text-[#A0A0A0]">support@swaeduae.ae</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center pt-8">
                  <div className="w-16 h-16 bg-[#D2A04A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="text-white" size={28} />
                  </div>
                  <h3 className="font-semibold text-[#5C3A1F] mb-2">Call Us</h3>
                  <p className="text-[#A0A0A0]">+971 4 123 4567</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center pt-8">
                  <div className="w-16 h-16 bg-[#00732F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-white" size={28} />
                  </div>
                  <h3 className="font-semibold text-[#5C3A1F] mb-2">Visit Us</h3>
                  <p className="text-[#A0A0A0]">Dubai, UAE</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#00732F] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-[#5C3A1F] mb-2">Message Sent!</h3>
                    <p className="text-[#A0A0A0]">We'll get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <Input
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />

                    <Textarea
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      required
                    />

                    <Button type="submit" variant="primary" size="lg" className="w-full">
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
