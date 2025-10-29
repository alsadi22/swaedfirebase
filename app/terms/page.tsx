'use client'

import React from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Calendar, Shield, Users } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#5C3A1F] rounded-full flex items-center justify-center">
              <FileText className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#5C3A1F] mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our volunteer platform.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <FileText size={20} />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Welcome to SWAED UAE ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our volunteer platform and services. By accessing or using our platform, you agree to be bound by these Terms.
              </p>
              <p>
                Our platform connects volunteers with organizations in the UAE to facilitate meaningful community service and social impact initiatives.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Users size={20} />
                2. User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>2.1 Account Registration</h4>
              <p>
                To use our services, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h4>2.2 Account Types</h4>
              <ul>
                <li><strong>Volunteers:</strong> Individuals seeking volunteer opportunities</li>
                <li><strong>Organizations:</strong> Registered entities offering volunteer opportunities</li>
                <li><strong>Administrators:</strong> Platform management personnel</li>
              </ul>

              <h4>2.3 Account Responsibilities</h4>
              <p>
                You agree to provide accurate information, maintain account security, and notify us immediately of any unauthorized access to your account.
              </p>
            </CardContent>
          </Card>

          {/* Platform Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Shield size={20} />
                3. Platform Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>3.1 Acceptable Use</h4>
              <p>You agree to use our platform only for lawful purposes and in accordance with these Terms. You may not:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Upload malicious code or content</li>
                <li>Interfere with platform security or functionality</li>
                <li>Use the platform for commercial purposes without authorization</li>
              </ul>

              <h4>3.2 Content Guidelines</h4>
              <p>
                All content you submit must be appropriate, accurate, and not infringe on third-party rights. We reserve the right to remove content that violates these guidelines.
              </p>
            </CardContent>
          </Card>

          {/* Volunteer Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Calendar size={20} />
                4. Volunteer Services
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>4.1 Event Participation</h4>
              <p>
                Volunteers participate in events at their own discretion and risk. We facilitate connections but do not guarantee event quality or safety.
              </p>

              <h4>4.2 Volunteer Obligations</h4>
              <p>Volunteers agree to:</p>
              <ul>
                <li>Attend events they commit to</li>
                <li>Follow organization guidelines and instructions</li>
                <li>Behave professionally and respectfully</li>
                <li>Report any issues or concerns promptly</li>
              </ul>

              <h4>4.3 Cancellation Policy</h4>
              <p>
                Volunteers may cancel their participation according to the cancellation policy specified for each event. Late cancellations may affect your platform standing.
              </p>
            </CardContent>
          </Card>

          {/* Organization Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Users size={20} />
                5. Organization Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>5.1 Verification</h4>
              <p>
                Organizations must provide valid documentation and undergo verification before posting events. This includes business licenses and contact information.
              </p>

              <h4>5.2 Event Management</h4>
              <p>Organizations are responsible for:</p>
              <ul>
                <li>Providing accurate event information</li>
                <li>Ensuring volunteer safety and appropriate supervision</li>
                <li>Maintaining professional standards</li>
                <li>Confirming volunteer attendance and hours</li>
              </ul>

              <h4>5.3 Compliance</h4>
              <p>
                Organizations must comply with all applicable UAE laws and regulations regarding volunteer management and activities.
              </p>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Shield size={20} />
                6. Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>6.1 Data Collection</h4>
              <p>
                We collect and process personal data in accordance with our Privacy Policy and applicable UAE data protection laws.
              </p>

              <h4>6.2 Data Sharing</h4>
              <p>
                We may share necessary information between volunteers and organizations to facilitate volunteer activities, but we do not sell personal data to third parties.
              </p>

              <h4>6.3 Data Security</h4>
              <p>
                We implement appropriate security measures to protect your personal information, but cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Liability and Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Shield size={20} />
                7. Liability and Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>7.1 Platform Disclaimer</h4>
              <p>
                Our platform is provided "as is" without warranties. We do not guarantee the accuracy of information or the quality of volunteer opportunities.
              </p>

              <h4>7.2 Limitation of Liability</h4>
              <p>
                We are not liable for any damages arising from your use of the platform or participation in volunteer activities. Users participate at their own risk.
              </p>

              <h4>7.3 Third-Party Content</h4>
              <p>
                We are not responsible for content, actions, or policies of third-party organizations using our platform.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <FileText size={20} />
                8. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>8.1 Account Termination</h4>
              <p>
                We may suspend or terminate accounts that violate these Terms or engage in inappropriate behavior.
              </p>

              <h4>8.2 Effect of Termination</h4>
              <p>
                Upon termination, your access to the platform will cease, but these Terms will continue to apply to past activities.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Shield size={20} />
                9. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                These Terms are governed by the laws of the United Arab Emirates. Any disputes will be resolved in the courts of the UAE.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <FileText size={20} />
                10. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We may update these Terms from time to time. We will notify users of significant changes through the platform or email. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C3A1F]">
                <Users size={20} />
                11. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                If you have questions about these Terms, please contact us:
              </p>
              <ul>
                <li>Email: legal@swaeduae.ae</li>
                <li>Website: <a href="/contact" className="text-[#D2A04A] hover:underline">Contact Form</a></li>
                <li>Address: United Arab Emirates</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Acceptance Notice */}
        <Card className="mt-8 border-[#D2A04A]">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-[#5C3A1F] mb-2">
              Agreement to Terms
            </h3>
            <p className="text-gray-600">
              By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}