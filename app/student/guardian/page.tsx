'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface GuardianInfo {
  guardian_name: string;
  guardian_relationship: string;
  guardian_email: string;
  guardian_phone: string;
  consent_given: boolean;
  consent_date: string;
}

export default function StudentGuardianPage() {
  const [guardianInfo, setGuardianInfo] = useState<GuardianInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<GuardianInfo>>({});
  const [consentPending, setConsentPending] = useState(false);

  useEffect(() => {
    fetchGuardianInfo();
  }, []);

  async function fetchGuardianInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('student_profiles')
        .select('guardian_name, guardian_email, guardian_phone, guardian_relationship, consent_given, consent_date')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setGuardianInfo(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching guardian info:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveGuardianInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('student_profiles')
        .update({
          guardian_name: formData.guardian_name,
          guardian_email: formData.guardian_email,
          guardian_phone: formData.guardian_phone,
          guardian_relationship: formData.guardian_relationship,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIsEditing(false);
      fetchGuardianInfo();
    } catch (error) {
      console.error('Error saving guardian info:', error);
      alert('Failed to save guardian information');
    }
  }

  async function requestConsent() {
    try {
      setConsentPending(true);
      
      // In a real application, this would send an email to the guardian
      // For now, we'll just simulate the process
      
      setTimeout(() => {
        alert('Consent request sent to guardian via email. Please check with your guardian to complete the consent form.');
        setConsentPending(false);
      }, 1500);
    } catch (error) {
      console.error('Error requesting consent:', error);
      setConsentPending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading guardian information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Guardian Information</h1>
            <p className="text-text-secondary mt-1">Parent/Guardian details and consent management</p>
          </div>
          <Link 
            href="/student/dashboard"
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Consent Status Card */}
        {guardianInfo && (
          <div className={`mb-6 rounded-lg p-6 ${
            guardianInfo.consent_given 
              ? 'bg-green-50 border-l-4 border-green-500'
              : 'bg-yellow-50 border-l-4 border-yellow-500'
          }`}>
            <div className="flex items-start">
              {guardianInfo.consent_given ? (
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  guardianInfo.consent_given ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {guardianInfo.consent_given 
                    ? 'Guardian Consent Approved' 
                    : 'Guardian Consent Pending'}
                </h4>
                <p className={`text-sm mt-1 ${
                  guardianInfo.consent_given ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {guardianInfo.consent_given
                    ? `Consent granted on ${new Date(guardianInfo.consent_date).toLocaleDateString()}. You can participate in all volunteer activities.`
                    : 'Guardian consent is required for students under 18. Please request consent from your guardian.'}
                </p>
                {!guardianInfo.consent_given && (
                  <button
                    onClick={requestConsent}
                    disabled={consentPending}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                  >
                    {consentPending ? 'Sending...' : 'Request Consent'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Guardian Information Card */}
        <div className="bg-white rounded-lg shadow-soft p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Guardian Details</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
              >
                Edit Information
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={saveGuardianInfo}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(guardianInfo || {});
                  }}
                  className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guardian Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Guardian Full Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.guardian_name || ''}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                />
              ) : (
                <p className="text-text-primary">{guardianInfo?.guardian_name || 'Not set'}</p>
              )}
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Relationship *
              </label>
              {isEditing ? (
                <select
                  value={formData.guardian_relationship || ''}
                  onChange={(e) => setFormData({ ...formData, guardian_relationship: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-text-primary">{guardianInfo?.guardian_relationship || 'Not set'}</p>
              )}
            </div>

            {/* Guardian Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Guardian Email *
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.guardian_email || ''}
                  onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                />
              ) : (
                <p className="text-text-primary">{guardianInfo?.guardian_email || 'Not set'}</p>
              )}
            </div>

            {/* Guardian Phone */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Guardian Phone *
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.guardian_phone || ''}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="+971 50 123 4567"
                  required
                />
              ) : (
                <p className="text-text-primary">{guardianInfo?.guardian_phone || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900">Why Guardian Consent?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  UAE regulations require parental consent for students under 18 to participate in volunteer activities. 
                  This ensures your safety and keeps your guardian informed about your volunteer work.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-purple-900">Consent Process</h4>
                <p className="text-sm text-purple-700 mt-1">
                  When you request consent, your guardian will receive an email with a secure link to review and approve your volunteer participation. 
                  The process typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
