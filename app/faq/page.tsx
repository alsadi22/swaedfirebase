'use client'

import React, { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I register as a volunteer?',
    answer: 'To register as a volunteer, click on the "Sign Up" button in the top navigation and select "Volunteer". Fill out the registration form with your personal information, skills, and interests. Once submitted, you\'ll receive a confirmation email to verify your account.',
    category: 'Getting Started'
  },
  {
    id: '2',
    question: 'How do I find volunteer opportunities?',
    answer: 'You can browse volunteer opportunities by visiting the Events page. Use the search and filter options to find events that match your interests, location, and availability. You can filter by category, date, location, and organization.',
    category: 'Finding Events'
  },
  {
    id: '3',
    question: 'How do I apply for an event?',
    answer: 'Once you find an event you\'re interested in, click on the event card to view details. If you meet the requirements, click the "Apply" button. You\'ll need to provide additional information if required by the organization.',
    category: 'Applications'
  },
  {
    id: '4',
    question: 'How do I check in to an event?',
    answer: 'On the day of the event, use the QR code provided by the organization or the location-based check-in feature in your dashboard. Make sure you arrive at the designated location and time specified in the event details.',
    category: 'Event Participation'
  },
  {
    id: '5',
    question: 'How do I earn badges and track my volunteer hours?',
    answer: 'Badges are automatically awarded based on your volunteer activities. You earn hours by completing events, and badges are unlocked when you reach certain milestones. You can view your progress in your dashboard.',
    category: 'Badges & Recognition'
  },
  {
    id: '6',
    question: 'How can organizations register on the platform?',
    answer: 'Organizations can register by clicking "Sign Up" and selecting "Organization". They need to provide official documentation, including license numbers and contact information. All organizations go through a verification process before approval.',
    category: 'Organizations'
  },
  {
    id: '7',
    question: 'How do organizations create events?',
    answer: 'Once approved, organizations can create events through their dashboard. They need to provide event details, requirements, location, and volunteer capacity. Events are reviewed before being published to ensure quality and compliance.',
    category: 'Organizations'
  },
  {
    id: '8',
    question: 'What if I need to cancel my application?',
    answer: 'You can cancel your application through your dashboard under "My Applications" as long as the event hasn\'t started. If you need to cancel after the deadline, contact the organization directly.',
    category: 'Applications'
  },
  {
    id: '9',
    question: 'How do I update my profile information?',
    answer: 'Go to your dashboard and click on "Edit Profile". You can update your personal information, skills, interests, and availability. Make sure to save your changes.',
    category: 'Profile Management'
  },
  {
    id: '10',
    question: 'What should I do if I encounter technical issues?',
    answer: 'If you experience technical problems, try refreshing the page first. If the issue persists, contact our support team through the contact form or email us at support@swaeduae.ae with details about the problem.',
    category: 'Technical Support'
  }
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#5C3A1F] rounded-full flex items-center justify-center">
              <HelpCircle className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#5C3A1F] mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about volunteering, events, and using our platform.
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2A04A] focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2A04A] focus:border-transparent"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#D2A04A] bg-[#D2A04A]/10 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-semibold text-[#5C3A1F]">
                        {faq.question}
                      </CardTitle>
                    </div>
                    <div className="ml-4">
                      {expandedItems.includes(faq.id) ? (
                        <ChevronUp className="text-gray-500" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-500" size={20} />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {expandedItems.includes(faq.id) && (
                  <CardContent className="pt-0 pb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or category filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Support Section */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-[#5C3A1F] mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-2 bg-[#5C3A1F] text-white rounded-lg hover:bg-[#4a2e18] transition-colors"
              >
                Contact Support
              </a>
              <a
                href="mailto:support@swaeduae.ae"
                className="inline-flex items-center justify-center px-6 py-2 border border-[#5C3A1F] text-[#5C3A1F] rounded-lg hover:bg-[#5C3A1F] hover:text-white transition-colors"
              >
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}