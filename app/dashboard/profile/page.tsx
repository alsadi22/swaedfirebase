'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form'
import { useUser } from '@auth0/nextjs-auth0/client'
import { EMIRATES } from '@/lib/utils'
import { CheckCircle, AlertCircle, Loader2, User, Phone, Globe, MapPin } from 'lucide-react'

interface ValidationErrors {
  first_name?: string
  last_name?: string
  phone?: string
  nationality?: string
  emirate?: string
}

interface FeedbackState {
  type: 'idle' | 'success' | 'error'
  message: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'idle', message: '' })
  const [hasChanges, setHasChanges] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    nationality: '',
    emirate: '',
  })

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'First name is required'
        if (value.trim().length < 2) return 'First name must be at least 2 characters'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces'
        return ''
      
      case 'last_name':
        if (!value.trim()) return 'Last name is required'
        if (value.trim().length < 2) return 'Last name must be at least 2 characters'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces'
        return ''
      
      case 'phone':
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number'
        }
        return ''
      
      case 'nationality':
        if (value && value.trim().length < 2) return 'Nationality must be at least 2 characters'
        if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'Nationality can only contain letters and spaces'
        return ''
      
      default:
        return ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        newErrors[key as keyof ValidationErrors] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        // Using useUser hook instead of auth.getUser()
        
        if (userResponse.error || !userResponse.data?.user) {
          router.push('/auth/login')
          return
        }

        // Fetch profile from API endpoint
        const response = await fetch('/api/profile', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          const profileData = data.profile

          if (profileData) {
            setProfile(profileData)
            const initialData = {
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              phone: profileData.phone || '',
              nationality: profileData.nationality || '',
              emirate: profileData.emirate || '',
            }
            setFormData(initialData)
          }
        } else if (response.status === 401) {
          router.push('/auth/login')
          return
        } else {
          setFeedback({
            type: 'error',
            message: 'Failed to load profile. Please try again.'
          })
        }
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'Network error. Please check your connection and try again.'
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  // Check for changes when form data updates
  useEffect(() => {
    if (profile) {
      const hasFormChanges = 
        formData.first_name !== (profile.first_name || '') ||
        formData.last_name !== (profile.last_name || '') ||
        formData.phone !== (profile.phone || '') ||
        formData.nationality !== (profile.nationality || '') ||
        formData.emirate !== (profile.emirate || '')
      
      setHasChanges(hasFormChanges)
    }
  }, [formData, profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value,
    })

    // Real-time validation
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))

    // Clear feedback when user starts typing
    if (feedback.type !== 'idle') {
      setFeedback({ type: 'idle', message: '' })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    if (!validateForm()) {
      setFeedback({
        type: 'error',
        message: 'Please fix the errors above before saving.'
      })
      return
    }

    setSaving(true)
    setFeedback({ type: 'idle', message: '' })

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          nationality: formData.nationality,
          emirate: formData.emirate
        })
      })

      if (response.ok) {
        const updatedData = await response.json()
        setProfile(updatedData.profile)
        setHasChanges(false)
        setFeedback({
          type: 'success',
          message: 'Profile updated successfully!'
        })
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setFeedback({ type: 'idle', message: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setFeedback({
          type: 'error',
          message: errorData.error || 'Failed to update profile. Please try again.'
        })
      }
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/dashboard')
      }
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#5C3A1F] mx-auto" />
          <p className="mt-4 text-[#A0A0A0]">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <User className="h-8 w-8 text-[#5C3A1F]" />
              <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F]">
                Edit Profile
              </h1>
            </div>

            {/* Feedback Messages */}
            {feedback.type !== 'idle' && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                feedback.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                {hasChanges && (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    You have unsaved changes
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      error={errors.first_name}
                      required
                      className={errors.first_name ? 'border-red-300' : ''}
                    />
                    <Input
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      error={errors.last_name}
                      required
                      className={errors.last_name ? 'border-red-300' : ''}
                    />
                  </div>

                  <div className="space-y-1">
                    <Input
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="+971 50 123 4567"
                      className={errors.phone ? 'border-red-300' : ''}
                    />
                    <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                      <Phone className="h-4 w-4" />
                      <span>Include country code (e.g., +971 for UAE)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Input
                        label="Nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        error={errors.nationality}
                        placeholder="e.g., Emirati, Indian, Pakistani"
                        className={errors.nationality ? 'border-red-300' : ''}
                      />
                      <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                        <Globe className="h-4 w-4" />
                        <span>Your country of citizenship</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Select
                        label="Emirate"
                        name="emirate"
                        value={formData.emirate}
                        onChange={handleChange}
                        options={[
                          { value: '', label: 'Select Emirate' },
                          ...EMIRATES.map(e => ({ value: e, label: e }))
                        ]}
                      />
                      <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                        <MapPin className="h-4 w-4" />
                        <span>Your current emirate of residence</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#E5E5E5] flex gap-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving || !hasChanges || Object.keys(errors).some(key => errors[key as keyof ValidationErrors])}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Profile Completion Status */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#5C3A1F]">Profile Completion</h3>
                    <p className="text-sm text-[#A0A0A0]">Complete your profile to unlock all features</p>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const fields = [formData.first_name, formData.last_name, formData.phone, formData.nationality, formData.emirate]
                      const completed = fields.filter(field => field.trim()).length
                      const percentage = Math.round((completed / fields.length) * 100)
                      
                      return (
                        <div>
                          <div className="text-2xl font-bold text-[#5C3A1F]">{percentage}%</div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-2 bg-[#5C3A1F] rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
