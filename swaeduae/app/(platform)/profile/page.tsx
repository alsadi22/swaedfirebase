'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getUserProfile, updateUserProfile } from '@/lib/services/firestore';
import type { User, EventCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const INTEREST_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'COMMUNITY_SERVICE', label: 'Community Service' },
  { value: 'ANIMAL_WELFARE', label: 'Animal Welfare' },
  { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
  { value: 'SPORTS_RECREATION', label: 'Sports & Recreation' },
  { value: 'EMERGENCY_RESPONSE', label: 'Emergency Response' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emiratesId, setEmiratesId] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [interests, setInterests] = useState<EventCategory[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profile = await getUserProfile(user.id);
      
      if (profile) {
        setUserProfile(profile);
        setDisplayName(profile.displayName || '');
        setPhoneNumber(profile.phoneNumber || '');
        setEmiratesId(profile.emiratesId || '');
        setNationality(profile.nationality || '');
        setGender(profile.gender || 'MALE');
        setInterests(profile.interests || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: EventCategory) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validation
    if (!displayName.trim()) {
      alert(t('profile.nameRequired', 'Name is required'));
      return;
    }

    try {
      setSaving(true);

      await updateUserProfile(user.id, {
        displayName,
        phoneNumber: phoneNumber || undefined,
        emiratesId: emiratesId || undefined,
        nationality: nationality || undefined,
        gender,
        interests,
      });

      alert(t('profile.updateSuccess', 'Profile updated successfully!'));
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('profile.updateError', 'Failed to update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('profile.editProfile', 'Edit Profile')}</CardTitle>
            <CardDescription>
              {t('profile.editProfileDesc', 'Update your personal information and preferences')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('profile.personalInfo', 'Personal Information')}</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">{t('profile.displayName', 'Full Name')} *</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t('profile.email', 'Email Address')}</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('profile.emailNotEditable', 'Email cannot be changed')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">{t('profile.phoneNumber', 'Phone Number')}</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+971-XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emiratesId">{t('profile.emiratesId', 'Emirates ID')}</Label>
                    <Input
                      id="emiratesId"
                      value={emiratesId}
                      onChange={(e) => setEmiratesId(e.target.value)}
                      placeholder="784-YYYY-NNNNNNN-N"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nationality">{t('profile.nationality', 'Nationality')}</Label>
                    <Input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">{t('profile.gender', 'Gender')}</Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MALE">{t('profile.male', 'Male')}</option>
                      <option value="FEMALE">{t('profile.female', 'Female')}</option>
                      <option value="OTHER">{t('profile.other', 'Other')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Volunteer Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('profile.volunteerPreferences', 'Volunteer Preferences')}</h3>
                <div>
                  <Label>{t('profile.interests', 'Areas of Interest')}</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('profile.interestsDesc', 'Select the types of volunteer activities you\'re interested in')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {INTEREST_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          interests.includes(option.value)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={interests.includes(option.value)}
                          onChange={() => handleInterestToggle(option.value)}
                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Volunteer Stats */}
              {userProfile && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">{t('profile.volunteerStats', 'Volunteer Statistics')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">{t('profile.totalHours', 'Total Hours')}</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">{userProfile.totalHours}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">{t('profile.totalEvents', 'Events Completed')}</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{userProfile.totalEvents}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? t('common.saving', 'Saving...') : t('profile.saveChanges', 'Save Changes')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={saving}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
