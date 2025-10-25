'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { supabase } from '@/lib/supabase'

export default function OrganizationRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationType: 'ngo',
    contactPersonFirstName: '',
    contactPersonLastName: '',
    phone: '',
    organizationDescription: '',
    website: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.contactPersonFirstName,
            last_name: formData.contactPersonLastName,
            phone: formData.phone,
            role: 'organization',
            organization_name: formData.organizationName,
            organization_type: formData.organizationType,
            organization_description: formData.organizationDescription,
            website: formData.website,
            address: formData.address,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        router.push('/organization/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Register Your Organization</CardTitle>
                <p className="text-center text-sm text-[#A0A0A0] mt-2">
                  Join our platform and connect with passionate volunteers
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-4 border-b border-[#E5E5E5] pb-4">
                    <h3 className="font-semibold text-[#5C3A1F]">Organization Information</h3>
                    
                    <Input
                      label="Organization Name"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="Your Organization Name"
                      required
                    />

                    <Select
                      label="Organization Type"
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleChange}
                      options={[
                        { value: 'ngo', label: 'NGO - Non-Governmental Organization' },
                        { value: 'government', label: 'Government Organization' },
                        { value: 'corporate', label: 'Corporate / Company' },
                        { value: 'charity', label: 'Charity Organization' },
                        { value: 'educational', label: 'Educational Institution' },
                        { value: 'religious', label: 'Religious Organization' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#5C3A1F]">
                        Organization Description
                      </label>
                      <textarea
                        name="organizationDescription"
                        value={formData.organizationDescription}
                        onChange={handleChange}
                        placeholder="Briefly describe your organization's mission and activities"
                        rows={4}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2A04A]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Website (optional)"
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourorg.ae"
                      />
                      
                      <Input
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+971 4 123 4567"
                        required
                      />
                    </div>

                    <Input
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Dubai, UAE"
                      required
                    />
                  </div>

                  <div className="space-y-4 border-b border-[#E5E5E5] pb-4">
                    <h3 className="font-semibold text-[#5C3A1F]">Contact Person Details</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        name="contactPersonFirstName"
                        value={formData.contactPersonFirstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                      />
                      
                      <Input
                        label="Last Name"
                        name="contactPersonLastName"
                        value={formData.contactPersonLastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                      />
                    </div>

                    <Input
                      label="Contact Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@organization.ae"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#5C3A1F]">Account Security</h3>
                    
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      required
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Register Organization'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-[#A0A0A0]">
                  Already have an account?{' '}
                  <Link href="/auth/organization/login" className="text-[#5C3A1F] font-medium hover:underline">
                    Sign In
                  </Link>
                </div>
                
                <div className="mt-4 text-center text-sm text-[#A0A0A0]">
                  Are you a volunteer?{' '}
                  <Link href="/auth/volunteer/register" className="text-[#5C3A1F] font-medium hover:underline">
                    Register here
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
