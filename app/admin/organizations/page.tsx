'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/form'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, FileText, Building2, AlertCircle } from 'lucide-react'

export default function AdminOrganizationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
          router.push('/dashboard')
          return
        }

        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setOrganizations(data || [])
      } catch (error) {
        console.error('Error loading organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganizations()
  }, [router])

  const handleApprove = async (orgId: string) => {
    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('organizations')
        .update({
          verification_status: 'approved',
          verification_date: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', orgId)

      if (error) throw error

      setOrganizations(organizations.map(org =>
        org.id === orgId ? { ...org, verification_status: 'approved' } : org
      ))

      setSelectedOrg(null)
      alert('Organization approved successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to approve organization')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (orgId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('organizations')
        .update({
          verification_status: 'rejected',
          verification_date: new Date().toISOString(),
          verified_by: user?.id,
          rejection_reason: rejectionReason
        })
        .eq('id', orgId)

      if (error) throw error

      setOrganizations(organizations.map(org =>
        org.id === orgId ? { ...org, verification_status: 'rejected', rejection_reason: rejectionReason } : org
      ))

      setSelectedOrg(null)
      setRejectionReason('')
      alert('Organization rejected')
    } catch (error: any) {
      alert(error.message || 'Failed to reject organization')
    } finally {
      setProcessing(false)
    }
  }

  const pendingOrgs = organizations.filter(org => org.verification_status === 'pending')
  const approvedOrgs = organizations.filter(org => org.verification_status === 'approved')
  const rejectedOrgs = organizations.filter(org => org.verification_status === 'rejected')

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              Organization Verification
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Review and verify organization applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-[#D2A04A] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[#5C3A1F]">{pendingOrgs.length}</p>
                <p className="text-sm text-[#A0A0A0]">Pending Review</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-[#00732F] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[#5C3A1F]">{approvedOrgs.length}</p>
                <p className="text-sm text-[#A0A0A0]">Approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <XCircle className="w-12 h-12 text-[#CE1126] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[#5C3A1F]">{rejectedOrgs.length}</p>
                <p className="text-sm text-[#A0A0A0]">Rejected</p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
              <p className="mt-4 text-[#A0A0A0]">Loading organizations...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingOrgs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#5C3A1F] mb-4">Pending Verification</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {pendingOrgs.map((org) => (
                      <Card key={org.id} className="border-l-4 border-[#D2A04A]">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="w-16 h-16 bg-[#5C3A1F] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building2 className="text-white" size={32} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-[#5C3A1F] mb-1">{org.name}</h3>
                                <p className="text-sm text-[#A0A0A0] mb-2">{org.type}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                  <div>
                                    <span className="text-[#A0A0A0]">License:</span>{' '}
                                    <span className="text-[#5C3A1F]">{org.trade_license || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#A0A0A0]">Location:</span>{' '}
                                    <span className="text-[#5C3A1F]">{org.emirate}, {org.city}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#A0A0A0]">Email:</span>{' '}
                                    <span className="text-[#5C3A1F]">{org.contact_email}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#A0A0A0]">Phone:</span>{' '}
                                    <span className="text-[#5C3A1F]">{org.contact_phone}</span>
                                  </div>
                                </div>
                                {org.description && (
                                  <p className="text-sm text-[#5C3A1F] mb-3">{org.description}</p>
                                )}
                                {selectedOrg?.id === org.id && (
                                  <div className="mt-4 space-y-3">
                                    <Textarea
                                      label="Rejection Reason (required)"
                                      placeholder="Please provide a reason for rejection..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="danger"
                                        onClick={() => handleReject(org.id)}
                                        disabled={processing}
                                      >
                                        Confirm Rejection
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedOrg(null)
                                          setRejectionReason('')
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {!selectedOrg && (
                              <div className="flex flex-col space-y-2 ml-4">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleApprove(org.id)}
                                  disabled={processing}
                                >
                                  <CheckCircle size={16} className="mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => setSelectedOrg(org)}
                                >
                                  <XCircle size={16} className="mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {approvedOrgs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#5C3A1F] mb-4">Approved Organizations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedOrgs.map((org) => (
                      <Card key={org.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-[#00732F] rounded-lg flex items-center justify-center">
                              <Building2 className="text-white" size={24} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#5C3A1F]">{org.name}</h3>
                              <p className="text-xs text-[#A0A0A0]">{org.type}</p>
                            </div>
                          </div>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Verified
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
