'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/form'
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/toast'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Send, Users, Building2, GraduationCap, Globe } from 'lucide-react'

interface NotificationForm {
  recipientType: 'all' | 'volunteers' | 'organizations' | 'students'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  type: 'info' | 'success' | 'warning' | 'error'
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const { user: authUser, error, isLoading: authLoading } = useUser()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sending, setSending] = useState(false)
  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  const [form, setForm] = useState<NotificationForm>({
    recipientType: 'all',
    title: '',
    message: '',
    priority: 'medium',
    type: 'info'
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    volunteers: 0,
    organizations: 0,
    students: 0
  })

  useEffect(() => {
    async function checkAuth() {
      try {
        if (authLoading) return
        
        if (!authUser) {
          router.push('/auth/login')
          return
        }

        // Map Auth0 user to local user format
        const currentUser = {
          id: authUser.sub,
          email: authUser.email,
          name: authUser.name,
          user_type: authUser['https://swaeduae.com/user_type'] || 'student'
        }
        
        setUser(currentUser)
        
        if (currentUser.user_type !== 'admin') {
          router.push('/dashboard')
          return
        }

        setIsAdmin(true)
        await loadStats()
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, authUser, authLoading])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleInputChange = (field: keyof NotificationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const getRecipientCount = () => {
    switch (form.recipientType) {
      case 'volunteers':
        return stats.volunteers
      case 'organizations':
        return stats.organizations
      case 'students':
        return stats.students
      default:
        return stats.totalUsers
    }
  }

  const getRecipientIcon = () => {
    switch (form.recipientType) {
      case 'volunteers':
        return <Users className="w-5 h-5" />
      case 'organizations':
        return <Building2 className="w-5 h-5" />
      case 'students':
        return <GraduationCap className="w-5 h-5" />
      default:
        return <Globe className="w-5 h-5" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim() || !form.message.trim()) {
      errorToast('Please fill in all required fields')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        const data = await response.json()
        successToast(
          `Notification sent successfully to ${data.recipientCount} ${form.recipientType === 'all' ? 'users' : form.recipientType}`,
          'Notification Sent'
        )
        
        // Reset form
        setForm({
          recipientType: 'all',
          title: '',
          message: '',
          priority: 'medium',
          type: 'info'
        })
      } else {
        const error = await response.json()
        errorToast(error.message || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      errorToast('An error occurred while sending the notification')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
          <p className="mt-4 text-[#A0A0A0]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              Send Notifications
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Send notifications to users across the platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Compose Notification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
                        Recipient Type *
                      </label>
                      <Select
                        value={form.recipientType}
                        onChange={(e) => handleInputChange('recipientType', e.target.value as any)}
                        className="w-full"
                        options={[
                          { value: 'all', label: 'All Users' },
                          { value: 'volunteers', label: 'Volunteers Only' },
                          { value: 'organizations', label: 'Organizations Only' },
                          { value: 'students', label: 'Students Only' }
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
                          Priority
                        </label>
                        <Select
                          value={form.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="w-full"
                          options={[
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' }
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
                          Type
                        </label>
                        <Select
                          value={form.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full"
                          options={[
                            { value: 'info', label: 'Information' },
                            { value: 'success', label: 'Success' },
                            { value: 'warning', label: 'Warning' },
                            { value: 'error', label: 'Error' }
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
                        Title *
                      </label>
                      <Input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter notification title"
                        className="w-full"
                        maxLength={100}
                      />
                      <p className="text-xs text-[#A0A0A0] mt-1">
                        {form.title.length}/100 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
                        Message *
                      </label>
                      <Textarea
                        value={form.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Enter notification message"
                        rows={5}
                        className="w-full"
                        maxLength={500}
                      />
                      <p className="text-xs text-[#A0A0A0] mt-1">
                        {form.message.length}/500 characters
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={sending || !form.title.trim() || !form.message.trim()}
                      className="w-full"
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Notification
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Stats */}
            <div className="space-y-6">
              {/* Recipient Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getRecipientIcon()}
                    <span>Recipients</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#5C3A1F] mb-2">
                      {getRecipientCount().toLocaleString()}
                    </div>
                    <p className="text-sm text-[#A0A0A0]">
                      {form.recipientType === 'all' ? 'Total Users' : 
                       form.recipientType.charAt(0).toUpperCase() + form.recipientType.slice(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-[#E5E5E5] rounded-lg p-4 bg-[#FDFBF7]">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        form.priority === 'high' ? 'bg-red-500' :
                        form.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#5C3A1F] mb-1">
                          {form.title || 'Notification Title'}
                        </h4>
                        <p className="text-sm text-[#A0A0A0]">
                          {form.message || 'Notification message will appear here...'}
                        </p>
                        <p className="text-xs text-[#A0A0A0] mt-2">
                          Just now
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#A0A0A0]">Total Users</span>
                      <span className="font-medium">{stats.totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#A0A0A0]">Volunteers</span>
                      <span className="font-medium">{stats.volunteers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#A0A0A0]">Organizations</span>
                      <span className="font-medium">{stats.organizations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#A0A0A0]">Students</span>
                      <span className="font-medium">{stats.students.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
