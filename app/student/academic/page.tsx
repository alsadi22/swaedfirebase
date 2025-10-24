'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface StudentProfile {
  student_id: string;
  school_name: string;
  grade_level: string;
  major: string;
  current_gpa: number;
  academic_credits: number;
  graduation_year: number;
}

export default function StudentAcademicPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});

  useEffect(() => {
    fetchAcademicProfile();
  }, []);

  async function fetchAcademicProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching academic profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveAcademicProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('student_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
        });

      if (error) throw error;
      
      setIsEditing(false);
      fetchAcademicProfile();
    } catch (error) {
      console.error('Error saving academic profile:', error);
      alert('Failed to save profile');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading academic information...</p>
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
            <h1 className="text-3xl font-bold text-text-primary">Academic Information</h1>
            <p className="text-text-secondary mt-1">Manage your educational details</p>
          </div>
          <Link 
            href="/student/dashboard"
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Academic Profile Card */}
        <div className="bg-white rounded-lg shadow-soft p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Student Profile</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={saveAcademicProfile}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile || {});
                  }}
                  className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Student ID
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.student_id || ''}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <p className="text-text-primary">{profile?.student_id || 'Not set'}</p>
              )}
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                School/University Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.school_name || ''}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <p className="text-text-primary">{profile?.school_name || 'Not set'}</p>
              )}
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Grade Level
              </label>
              {isEditing ? (
                <select
                  value={formData.grade_level || ''}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Grade</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Undergraduate Year 1">Undergraduate Year 1</option>
                  <option value="Undergraduate Year 2">Undergraduate Year 2</option>
                  <option value="Undergraduate Year 3">Undergraduate Year 3</option>
                  <option value="Undergraduate Year 4">Undergraduate Year 4</option>
                  <option value="Graduate">Graduate</option>
                </select>
              ) : (
                <p className="text-text-primary">{profile?.grade_level || 'Not set'}</p>
              )}
            </div>

            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Major/Specialization
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.major || ''}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <p className="text-text-primary">{profile?.major || 'Not set'}</p>
              )}
            </div>

            {/* Current GPA */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Current GPA
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.current_gpa || ''}
                  onChange={(e) => setFormData({ ...formData, current_gpa: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <p className="text-text-primary">{profile?.current_gpa?.toFixed(2) || 'Not set'}</p>
              )}
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Expected Graduation Year
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="2024"
                  max="2035"
                  value={formData.graduation_year || ''}
                  onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <p className="text-text-primary">{profile?.graduation_year || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Academic Credits Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-text-primary mb-4">Academic Credits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">Total Credits Earned</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {profile?.academic_credits || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">From volunteer activities</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">Volunteer Hours</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {(profile?.academic_credits || 0) * 10}
                </p>
                <p className="text-xs text-green-600 mt-1">Required for credits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900">Academic Credit Information</h4>
              <p className="text-sm text-blue-700 mt-1">
                Volunteer hours can be converted to academic credits. Typically, 10 volunteer hours = 1 academic credit. 
                Credits must be approved by your educational institution. Check with your school's volunteer coordinator for requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
