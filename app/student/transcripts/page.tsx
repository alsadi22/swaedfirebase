'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import jsPDF from 'jspdf';

interface VolunteerRecord {
  id: string;
  event: { title: string; organization: { name: string } };
  hours_logged: number;
  date_logged: string;
  status: string;
}

interface Certificate {
  id: string;
  event: { title: string };
  certificate_number: string;
  issue_date: string;
  hours_earned: number;
}

export default function StudentTranscriptsPage() {
  const [records, setRecords] = useState<VolunteerRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetchTranscriptData();
  }, []);

  async function fetchTranscriptData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch volunteer hours
      const { data: hours } = await supabase
        .from('volunteer_hours')
        .select(`
          id,
          hours_logged,
          date_logged,
          status,
          event:events(title, organization:organizations(name))
        `)
        .eq('user_id', user.id)
        .order('date_logged', { ascending: false });

      // Fetch certificates
      const { data: certs } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_number,
          issue_date,
          hours_earned,
          event:events(title)
        `)
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });

      setRecords(hours || []);
      setCertificates(certs || []);

      const total = hours?.filter(h => h.status === 'approved')
        .reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;
      setTotalHours(total);
    } catch (error) {
      console.error('Error fetching transcript data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function downloadTranscript() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Volunteer Service Transcript', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('SwaedUAE Platform', 105, 30, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 60);
    doc.setFontSize(11);
    doc.text(`Total Volunteer Hours: ${totalHours}`, 20, 70);
    doc.text(`Events Completed: ${records.filter(r => r.status === 'approved').length}`, 20, 80);
    doc.text(`Certificates Earned: ${certificates.length}`, 20, 90);
    
    // Volunteer Records
    doc.setFontSize(14);
    doc.text('Volunteer Records', 20, 110);
    doc.setFontSize(10);
    
    let yPos = 120;
    records.filter(r => r.status === 'approved').forEach((record, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${index + 1}. ${record.event?.title || 'N/A'}`, 20, yPos);
      doc.text(`   Organization: ${record.event?.organization?.name || 'N/A'}`, 20, yPos + 5);
      doc.text(`   Hours: ${record.hours_logged} | Date: ${new Date(record.date_logged).toLocaleDateString()}`, 20, yPos + 10);
      yPos += 20;
    });
    
    doc.save('volunteer-transcript.pdf');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading transcripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Volunteer Transcripts</h1>
            <p className="text-text-secondary mt-1">Official record of your volunteer service</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadTranscript}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
            <Link 
              href="/student/dashboard"
              className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Total Volunteer Hours</p>
            <p className="text-4xl font-bold mt-2">{totalHours}</p>
            <p className="text-xs mt-2 opacity-75">Approved hours</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Events Completed</p>
            <p className="text-4xl font-bold mt-2">
              {records.filter(r => r.status === 'approved').length}
            </p>
            <p className="text-xs mt-2 opacity-75">Verified events</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-soft p-6">
            <p className="text-sm opacity-90">Certificates Earned</p>
            <p className="text-4xl font-bold mt-2">{certificates.length}</p>
            <p className="text-xs mt-2 opacity-75">Official certificates</p>
          </div>
        </div>

        {/* Volunteer Hours Record */}
        <div className="bg-white rounded-lg shadow-soft mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-text-primary">Volunteer Hours Record</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(record.date_logged).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">{record.event?.title || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {record.event?.organization?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {record.hours_logged}h
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'approved' ? 'bg-green-100 text-green-800' :
                        record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">No volunteer hours recorded yet</p>
            </div>
          )}
        </div>

        {/* Certificates */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-text-primary">Official Certificates</h2>
          </div>
          <div className="p-6">
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-text-primary">{cert.event?.title}</h3>
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">
                      Certificate #: {cert.certificate_number}
                    </p>
                    <p className="text-sm text-text-secondary mb-1">
                      Hours: {cert.hours_earned}h
                    </p>
                    <p className="text-sm text-text-secondary mb-3">
                      Issued: {new Date(cert.issue_date).toLocaleDateString()}
                    </p>
                    <button className="text-accent text-sm hover:text-accent-hover font-medium">
                      Download Certificate →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary">No certificates earned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
