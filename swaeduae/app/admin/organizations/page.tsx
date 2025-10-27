'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { sendOrganizationVerificationEmail } from '@/lib/services/email';
import { logOrganizationVerification } from '@/lib/services/auditLogger';
import type { Organization } from '@/types';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building,
} from 'lucide-react';

export default function AdminOrganizationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
      return;
    }

    if (user) {
      loadOrganizations();
    }
  }, [user, filter]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const orgsRef = collection(db, 'organizations');
      
      let q;
      if (filter === 'ALL') {
        q = query(orgsRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(
          orgsRef,
          where('verificationStatus', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const orgsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[];

      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (org: Organization, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
    if (!user) return;

    try {
      setProcessing(org.id);

      // Update organization status
      const orgRef = doc(db, 'organizations', org.id);
      await updateDoc(orgRef, {
        verificationStatus: status,
        verificationDate: serverTimestamp(),
        verificationReason: reason || null,
      });

      // Get admin email (organization admin user)
      const adminUserRef = doc(db, 'users', org.adminUserId);
      const adminUserSnap = await (await import('firebase/firestore')).getDoc(adminUserRef);
      const adminEmail = adminUserSnap.exists() ? adminUserSnap.data().email : org.email;

      // Send email notification
      await sendOrganizationVerificationEmail(org, status, adminEmail, reason);

      // Log audit trail
      await logOrganizationVerification(
        user.id,
        user.displayName || 'Admin',
        status === 'VERIFIED' ? 'ORG_VERIFIED' : 'ORG_REJECTED',
        org.id,
        org.name,
        reason
      );

      // Reload organizations
      await loadOrganizations();

      alert(`Organization ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Failed to update organization. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      VERIFIED: { label: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
      EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: Clock },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
          <p className="text-gray-600 mt-2">
            Verify and manage organization accounts
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No organizations found
            </h3>
            <p className="text-gray-600">
              No organizations match the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {org.name}
                        </h3>
                        {getStatusBadge(org.verificationStatus)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{org.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="ml-2 text-gray-600">{org.email}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Phone:</span>
                          <span className="ml-2 text-gray-600">{org.phone}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Trade License:</span>
                          <span className="ml-2 text-gray-600">{org.tradeLicenseNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <span className="ml-2 text-gray-600">
                            {org.address.emirate}, {org.address.city}
                          </span>
                        </div>
                      </div>
                      {org.website && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">Website:</span>
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-emerald-600 hover:text-emerald-700"
                          >
                            {org.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  {org.verificationDocuments && org.verificationDocuments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Verification Documents:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {org.verificationDocuments.map((doc, index) => (
                          <a
                            key={index}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 underline"
                          >
                            Document {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {org.verificationStatus === 'PENDING' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleVerify(org, 'VERIFIED')}
                        disabled={processing === org.id}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing === org.id ? 'Processing...' : 'Verify & Approve'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            handleVerify(org, 'REJECTED', reason);
                          }
                        }}
                        disabled={processing === org.id}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing === org.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
