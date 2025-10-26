/**
 * Profile Setup Page
 * New user profile completion after registration
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, ProfileUpdateFormData } from '@/lib/validations/auth';
import { useAuth } from '@/lib/auth/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmiratesIDInput } from '@/components/auth/EmiratesIDInput';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { EventCategory } from '@/types';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { locale } = useLanguage();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<EventCategory[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const emiratesId = watch('emiratesId');

  const interestOptions: EventCategory[] = [
    'EDUCATION',
    'ENVIRONMENT',
    'HEALTH',
    'COMMUNITY_SERVICE',
    'ANIMAL_WELFARE',
    'ARTS_CULTURE',
    'SPORTS_RECREATION',
    'EMERGENCY_RESPONSE',
  ];

  const getInterestLabel = (interest: EventCategory) => {
    const labels: Record<EventCategory, { en: string; ar: string }> = {
      EDUCATION: { en: 'Education', ar: 'التعليم' },
      ENVIRONMENT: { en: 'Environment', ar: 'البيئة' },
      HEALTH: { en: 'Health', ar: 'الصحة' },
      COMMUNITY_SERVICE: { en: 'Community Service', ar: 'الخدمة المجتمعية' },
      ANIMAL_WELFARE: { en: 'Animal Welfare', ar: 'رعاية الحيوانات' },
      ARTS_CULTURE: { en: 'Arts & Culture', ar: 'الفنون والثقافة' },
      SPORTS_RECREATION: { en: 'Sports & Recreation', ar: 'الرياضة والترفيه' },
      EMERGENCY_RESPONSE: { en: 'Emergency Response', ar: 'الاستجابة للطوارئ' },
    };
    return labels[interest][locale];
  };

  const toggleInterest = (interest: EventCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const onSubmit = async (data: ProfileUpdateFormData) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        updatedAt: new Date(),
      };

      if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
      if (data.nationality) updateData.nationality = data.nationality;
      if (data.gender) updateData.gender = data.gender;
      if (data.emiratesId) updateData.emiratesId = data.emiratesId;
      if (selectedInterests.length > 0) updateData.interests = selectedInterests;

      await updateDoc(doc(db, 'users', user.id), updateData);
      await refreshUser();

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">SwaedUAE</h1>
          <p className="mt-2 text-gray-600">{t(locale, 'profile.setupProfile')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t(locale, 'profile.setupProfile')}</CardTitle>
            <CardDescription>
              {locale === 'en'
                ? 'Complete your profile to start volunteering'
                : 'أكمل ملفك الشخصي لبدء التطوع'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t(locale, 'profile.personalInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">{t(locale, 'form.displayName')} *</Label>
                    <Input
                      id="displayName"
                      {...register('displayName')}
                      className={errors.displayName ? 'border-red-500' : ''}
                    />
                    {errors.displayName && (
                      <p className="text-sm text-red-500">{errors.displayName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t(locale, 'form.phoneNumber')} *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+971-XXXXXXXXX"
                      {...register('phoneNumber')}
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t(locale, 'form.dateOfBirth')}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth', {
                        setValueAs: (v: string) => v ? new Date(v) : undefined,
                      })}
                      className={errors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t(locale, 'form.nationality')}</Label>
                    <Input
                      id="nationality"
                      placeholder="UAE"
                      {...register('nationality')}
                      className={errors.nationality ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t(locale, 'form.gender')}</Label>
                    <select
                      id="gender"
                      {...register('gender')}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">Select...</option>
                      <option value="MALE">{t(locale, 'form.male')}</option>
                      <option value="FEMALE">{t(locale, 'form.female')}</option>
                      <option value="OTHER">{t(locale, 'form.other')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <EmiratesIDInput
                      value={emiratesId || ''}
                      onChange={(value) => setValue('emiratesId', value)}
                      error={errors.emiratesId?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t(locale, 'profile.interests')}</h3>
                <p className="text-sm text-gray-600">
                  {locale === 'en'
                    ? 'Select your areas of interest to get personalized event recommendations'
                    : 'اختر مجالات اهتمامك للحصول على توصيات فعاليات مخصصة'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {getInterestLabel(interest)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/dashboard')}
                >
                  {t(locale, 'common.cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading
                    ? (locale === 'en' ? 'Saving...' : 'جاري الحفظ...')
                    : t(locale, 'common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
