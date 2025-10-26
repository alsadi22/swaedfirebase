/**
 * Registration Page
 * Multi-role registration for volunteers and organizations
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  volunteerRegisterSchema,
  organizationRegisterSchema,
  VolunteerRegisterFormData,
  OrganizationRegisterFormData,
} from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { EmiratesIDInput } from '@/components/auth/EmiratesIDInput';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'volunteer' | 'organization'>('volunteer');

  const isVolunteer = selectedRole === 'volunteer';

  const volunteerForm = useForm<VolunteerRegisterFormData>({
    resolver: zodResolver(volunteerRegisterSchema),
    defaultValues: {
      gender: 'MALE',
    },
  });

  const organizationForm = useForm<OrganizationRegisterFormData>({
    resolver: zodResolver(organizationRegisterSchema),
    defaultValues: {
      address: {
        emirate: 'Dubai',
      },
    },
  });

  const form = isVolunteer ? volunteerForm : organizationForm;

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      if (isVolunteer) {
        const volunteerData = data as VolunteerRegisterFormData;
        await signUp(volunteerData.email, volunteerData.password, {
          displayName: volunteerData.displayName,
          phoneNumber: volunteerData.phoneNumber,
          role: 'VOLUNTEER',
          dateOfBirth: volunteerData.dateOfBirth,
          nationality: volunteerData.nationality,
          gender: volunteerData.gender,
          emiratesId: volunteerData.emiratesId,
        });
      } else {
        const orgData = data as OrganizationRegisterFormData;
        await signUp(orgData.email, orgData.password, {
          displayName: orgData.organizationName,
          phoneNumber: orgData.phone,
          role: 'ORG_ADMIN',
        });
        // Additional organization data will be stored separately
      }

      router.push('/auth/verify-email');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSuccess = () => {
    router.push('/dashboard');
  };

  const handleSocialError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Join SwaedUAE</h1>
          <p className="mt-2 text-gray-600">Create your account and start making a difference</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Choose your account type and fill in your details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <Label>I am a...</Label>
              <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
            </div>

            {isVolunteer && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Sign up with social</span>
                  </div>
                </div>

                <SocialLoginButtons
                  mode="register"
                  onSuccess={handleSocialSuccess}
                  onError={handleSocialError}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isVolunteer ? (
                <VolunteerRegistrationForm form={volunteerForm} loading={loading} />
              ) : (
                <OrganizationRegistrationForm form={organizationForm} loading={loading} />
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

// Volunteer Registration Form Component
function VolunteerRegistrationForm({ form, loading }: { form: any; loading: boolean }) {
  const { register, formState: { errors }, setValue, watch } = form;
  const emiratesId = watch('emiratesId');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Full Name *</Label>
        <Input
          id="displayName"
          placeholder="John Doe"
          {...register('displayName')}
          className={errors.displayName ? 'border-red-500' : ''}
        />
        {errors.displayName && (
          <p className="text-sm text-red-500">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min. 8 characters"
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
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
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
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
        <Label htmlFor="nationality">Nationality *</Label>
        <Input
          id="nationality"
          placeholder="UAE"
          {...register('nationality')}
          className={errors.nationality ? 'border-red-500' : ''}
        />
        {errors.nationality && (
          <p className="text-sm text-red-500">{errors.nationality.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender *</Label>
        <select
          id="gender"
          {...register('gender')}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <EmiratesIDInput
          value={emiratesId || ''}
          onChange={(value) => setValue('emiratesId', value)}
          error={errors.emiratesId?.message}
        />
      </div>
    </div>
  );
}

// Organization Registration Form Component
function OrganizationRegistrationForm({ form, loading }: { form: any; loading: boolean }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            placeholder="Your Organization"
            {...register('organizationName')}
            className={errors.organizationName ? 'border-red-500' : ''}
          />
          {errors.organizationName && (
            <p className="text-sm text-red-500">{errors.organizationName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="org@example.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+971-XXXXXXXXX"
            {...register('phone')}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yourorg.ae"
            {...register('website')}
            className={errors.website ? 'border-red-500' : ''}
          />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tradeLicenseNumber">Trade License Number *</Label>
          <Input
            id="tradeLicenseNumber"
            placeholder="TL-XXXXXX"
            {...register('tradeLicenseNumber')}
            className={errors.tradeLicenseNumber ? 'border-red-500' : ''}
          />
          {errors.tradeLicenseNumber && (
            <p className="text-sm text-red-500">{errors.tradeLicenseNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address.emirate">Emirate *</Label>
          <select
            id="address.emirate"
            {...register('address.emirate')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
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

      <div className="space-y-2">
        <Label htmlFor="description">Organization Description *</Label>
        <textarea
          id="description"
          rows={4}
          placeholder="Tell us about your organization (min. 50 characters)"
          {...register('description')}
          className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
            errors.description ? 'border-red-500' : ''
          }`}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address.street">Street Address *</Label>
          <Input
            id="address.street"
            placeholder="Street, Building, etc."
            {...register('address.street')}
            className={errors.address?.street ? 'border-red-500' : ''}
          />
          {errors.address?.street && (
            <p className="text-sm text-red-500">{errors.address.street.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address.city">City *</Label>
          <Input
            id="address.city"
            placeholder="City"
            {...register('address.city')}
            className={errors.address?.city ? 'border-red-500' : ''}
          />
          {errors.address?.city && (
            <p className="text-sm text-red-500">{errors.address.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address.poBox">P.O. Box (Optional)</Label>
          <Input
            id="address.poBox"
            placeholder="P.O. Box"
            {...register('address.poBox')}
          />
        </div>
      </div>
    </div>
  );
}
