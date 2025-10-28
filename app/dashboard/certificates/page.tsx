'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { jsPDF } from 'jspdf';

interface Certificate {
  id: string;
  certificate_number: string;
  issue_date: string;
  hours_earned: number;
  status: string;
  user: {
    first_name: string;
    last_name: string;
  };
  event: {
    title: string;
    organization: {
      name: string;
    };
  };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      // Using useUser hook instead of auth.getUser()
      if (!data?.user) return;

      const result = await db.query(`
        SELECT 
          c.id,
          c.certificate_number,
          c.issue_date,
          c.hours_earned,
          c.status,
          u.first_name,
          u.last_name,
          e.title as event_title,
          o.name as organization_name
        FROM certificates c
        JOIN users u ON c.user_id = u.id
        JOIN events e ON c.event_id = e.id
        JOIN organizations o ON e.organization_id = o.id
        WHERE c.user_id = $1
        ORDER BY c.issue_date DESC
      `, [data.user.id]);

      // Map the data to match the expected interface
      const mappedData = result.rows.map((cert: any) => ({
        id: cert.id,
        certificate_number: cert.certificate_number,
        issue_date: cert.issue_date,
        hours_earned: cert.hours_earned,
        status: cert.status,
        user: { first_name: cert.first_name, last_name: cert.last_name },
        event: { 
          title: cert.event_title,
          organization: { name: cert.organization_name }
        }
      }));
      
      setCertificates(mappedData);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  }

  function generateCertificatePDF(certificate: Certificate) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    doc.setFillColor(253, 251, 247); // Warm white
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(210, 160, 74); // Gold
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 267, 180);

    // Header
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(92, 58, 31); // Brown
    doc.text('CERTIFICATE OF APPRECIATION', 148.5, 40, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 148.5, 55, { align: 'center' });

    // Volunteer Name
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(210, 160, 74); // Gold
    const fullName = `${certificate.user?.first_name} ${certificate.user?.last_name}`;
    doc.text(fullName, 148.5, 75, { align: 'center' });

    // Achievement text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(92, 58, 31);
    doc.text('has successfully completed', 148.5, 90, { align: 'center' });

    // Hours
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${certificate.hours_earned} Volunteer Hours`, 148.5, 105, { align: 'center' });

    // Event details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('at', 148.5, 115, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const eventTitle = certificate.event?.title || 'Volunteer Event';
    doc.text(eventTitle, 148.5, 125, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const orgName = certificate.event?.organization?.name || 'Organization';
    doc.text(`Organized by ${orgName}`, 148.5, 135, { align: 'center' });

    // Date and Certificate Number
    doc.setFontSize(11);
    doc.text(`Issue Date: ${new Date(certificate.issue_date).toLocaleDateString()}`, 30, 170);
    doc.text(`Certificate No: ${certificate.certificate_number}`, 30, 178);

    // Signature area
    doc.setFontSize(11);
    doc.line(210, 175, 260, 175);
    doc.text('Authorized Signature', 235, 182, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('SwaedUAE - UAE Volunteer Management Platform', 148.5, 195, { align: 'center' });
    doc.text('www.swaeduae.ae', 148.5, 200, { align: 'center' });

    // Save the PDF
    doc.save(`certificate-${certificate.certificate_number}.pdf`);
  }

  const filteredCertificates = certificates.filter(cert => {
    if (filter === 'all') return true;
    return cert.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">My Certificates</h1>
          <p className="text-text-secondary mt-1">View and download your volunteer certificates</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-soft mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                filter === 'all'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All Certificates ({certificates.length})
            </button>
            <button
              onClick={() => setFilter('issued')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                filter === 'issued'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Issued ({certificates.filter(c => c.status === 'issued').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                filter === 'pending'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Pending ({certificates.filter(c => c.status === 'pending').length})
            </button>
          </div>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-md transition"
              >
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 border-b-4 border-accent">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-accent mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <p className="text-xs text-text-secondary font-mono">
                      {certificate.certificate_number}
                    </p>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <h3 className="font-bold text-text-primary mb-2 line-clamp-2">
                    {certificate.event?.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    {certificate.event?.organization?.name}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Hours:</span>
                      <span className="font-semibold text-text-primary">
                        {certificate.hours_earned}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Issued:</span>
                      <span className="font-semibold text-text-primary">
                        {new Date(certificate.issue_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        certificate.status === 'issued' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {certificate.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {certificate.status === 'issued' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateCertificatePDF(certificate)}
                        className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-soft p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="text-xl font-bold text-text-primary mb-2">No Certificates Yet</h3>
            <p className="text-text-secondary mb-6">
              Complete volunteer events to earn certificates
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
