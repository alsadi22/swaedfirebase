'use client';

import { useState } from 'react';
import { db } from '@/lib/database';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    emirate: '',
    location_address: '',
    location_lat: 0,
    location_lng: 0,
    location_radius: 100,
    start_date: '',
    end_date: '',
    max_volunteers: 0,
    min_age: 16,
    required_skills: '',
    benefits: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Using useUser hook instead of auth.getUser();
      const user = userResponse.data?.user;
      if (!user) throw new Error('Not authenticated');

      // Get organization
      const orgMemberResult = await db.query(
        'SELECT organization_id FROM organization_members WHERE user_id = $1',
        [user.id]
      );

      const orgMember = orgMemberResult.rows?.[0];
      if (!orgMember) throw new Error('Organization not found');

      await db.query(`
        INSERT INTO events (
          title, description, category, emirate, location_address, location_lat, location_lng, 
          location_radius, start_date, end_date, max_volunteers, min_age, required_skills, 
          benefits, organization_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        formData.title,
        formData.description,
        formData.category,
        formData.emirate,
        formData.location_address,
        formData.location_lat,
        formData.location_lng,
        formData.location_radius,
        formData.start_date,
        formData.end_date,
        formData.max_volunteers,
        formData.min_age,
        formData.required_skills.split(',').map(s => s.trim()),
        formData.benefits,
        orgMember.organization_id,
        'draft'
      ]);

      router.push('/organization/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  function renderStep1() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-text-primary">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              <option value="environment">Environment</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="community">Community</option>
              <option value="elderly_care">Elderly Care</option>
              <option value="animal_welfare">Animal Welfare</option>
              <option value="disaster_relief">Disaster Relief</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Emirate *
            </label>
            <select
              value={formData.emirate}
              onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            >
              <option value="">Select Emirate</option>
              <option value="Abu Dhabi">Abu Dhabi</option>
              <option value="Dubai">Dubai</option>
              <option value="Sharjah">Sharjah</option>
              <option value="Ajman">Ajman</option>
              <option value="Umm Al Quwain">Umm Al Quwain</option>
              <option value="Ras Al Khaimah">Ras Al Khaimah</option>
              <option value="Fujairah">Fujairah</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-text-primary">Location & Schedule</h2>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Location Address *
          </label>
          <input
            type="text"
            value={formData.location_address}
            onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Full address of the event"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.location_lat}
              onChange={(e) => setFormData({ ...formData, location_lat: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.location_lng}
              onChange={(e) => setFormData({ ...formData, location_lng: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-text-primary">Requirements & Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Maximum Volunteers *
            </label>
            <input
              type="number"
              min="1"
              value={formData.max_volunteers}
              onChange={(e) => setFormData({ ...formData, max_volunteers: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Minimum Age
            </label>
            <input
              type="number"
              min="12"
              max="100"
              value={formData.min_age}
              onChange={(e) => setFormData({ ...formData, min_age: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            value={formData.required_skills}
            onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="e.g., Communication, Teamwork, First Aid"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Benefits for Volunteers
          </label>
          <textarea
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Describe what volunteers will gain (certificate, meals, transportation, etc.)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Check-in Radius (meters)
          </label>
          <input
            type="number"
            min="50"
            max="500"
            value={formData.location_radius}
            onChange={(e) => setFormData({ ...formData, location_radius: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <p className="text-xs text-text-secondary mt-1">
            Volunteers must be within this radius to check in (50-500m)
          </p>
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
            <h1 className="text-3xl font-bold text-text-primary">Create New Event</h1>
            <p className="text-text-secondary mt-1">Fill out the form to create a volunteer event</p>
          </div>
          <Link 
            href="/organization/events"
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-accent' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-text-secondary">Basic Info</span>
            <span className="text-xs text-text-secondary">Location</span>
            <span className="text-xs text-text-secondary">Requirements</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-soft p-8 mb-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
