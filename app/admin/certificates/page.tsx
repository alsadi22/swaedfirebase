'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Certificate {
  id: string;
  user: { first_name: string; last_name: string };
  event: { title: string };
  hours_earned: number;
  issue_date: string;
  certificate_number: string;
  status: string;
}

export default function AdminCertificatesPage() {
  const [certificates, setcertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          id,
          hours_earned,
          issue_date,
          certificate_number,
          status,
          user:users(first_name, last_name),
          event:events(title)
        `)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setcertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateCertificateStatus(certId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: newStatus })
        .eq('id', certId);

      if (error) throw error;
      fetchCertificates();
    } catch (error) {
      console.error('Error updating certificate:', error);
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesFilter = filter === 'all' || cert.status === filter;
    const userName = `${cert.user?.first_name} ${cert.user?.last_name}`.toLowerCase();
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) ||
                         cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Certificate Management</h1>
            <p className="text-text-secondary mt-1">Review and manage volunteer certificates</p>
          </div>
          <Link 
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search Certificates
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or certificate number..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="all">All Certificates</option>
                <option value="issued">Issued</option>
                <option value="revoked">Revoked</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-text-secondary">Total Certificates</p>
            <p className="text-2xl font-bold text-text-primary">{certificates.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-soft p-4">
            <p className="text-sm text-green-700">Issued</p>
            <p className="text-2xl font-bold text-green-900">
              {certificates.filter(c => c.status === 'issued').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-soft p-4">
            <p className="text-sm text-yellow-700">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {certificates.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-soft p-4">
            <p className="text-sm text-red-700">Revoked</p>
            <p className="text-2xl font-bold text-red-900">
              {certificates.filter(c => c.status === 'revoked').length}
            </p>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volunteer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-text-primary">
                      {cert.certificate_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">
                        {cert.user?.first_name} {cert.user?.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {cert.event?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {cert.hours_earned}h
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(cert.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={cert.status}
                        onChange={(e) => updateCertificateStatus(cert.id, e.target.value)}
                        className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                      >
                        <option value="pending">Pending</option>
                        <option value="issued">Issued</option>
                        <option value="revoked">Revoked</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-accent hover:text-accent-hover font-medium">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <p className="text-text-secondary">No certificates found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
