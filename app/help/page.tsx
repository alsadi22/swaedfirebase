'use client';

import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Help & Support</h1>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/faq" className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition text-center">
            <svg className="w-12 h-12 text-accent mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-text-primary">FAQ</h3>
          </Link>

          <Link href="/contact" className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition text-center">
            <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold text-text-primary">Contact Us</h3>
          </Link>

          <div className="bg-white rounded-lg shadow-soft p-6 text-center">
            <svg className="w-12 h-12 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="font-semibold text-text-primary">User Guide</h3>
          </div>
        </div>

        {/* Common Topics */}
        <div className="bg-white rounded-lg shadow-soft p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Common Topics</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Getting Started</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• How to create an account</li>
                <li>• Setting up your profile</li>
                <li>• Finding volunteer opportunities</li>
                <li>• Applying to events</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">For Volunteers</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• How to check in to events using QR code</li>
                <li>• Tracking your volunteer hours</li>
                <li>• Earning badges and achievements</li>
                <li>• Downloading certificates</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">For Students</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• Academic credit requirements</li>
                <li>• Guardian consent process</li>
                <li>• Generating academic transcripts</li>
                <li>• School integration</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">For Organizations</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• Creating and managing events</li>
                <li>• Reviewing volunteer applications</li>
                <li>• Verifying volunteer hours</li>
                <li>• Viewing analytics and reports</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Need More Help?</h3>
          <p className="text-blue-700 mb-4">
            Our support team is here to assist you. Contact us through any of the following channels:
          </p>
          <div className="space-y-2 text-blue-700">
            <p>📧 Email: support@swaeduae.ae</p>
            <p>📞 Phone: +971 4 XXX XXXX</p>
            <p>💬 Live Chat: Available Mon-Fri 9AM-6PM GST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
