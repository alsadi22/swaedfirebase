'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'
import { Search, Filter, UserCheck, UserX, Eye, Shield } from 'lucide-react'
import { useUser } from '@auth0/nextjs-auth0/client'

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    async function loadUsers() {
      try {
        // Using useUser hook instead of auth.getUser()
        
        if (!userResponse.data || userResponse.error) {
          router.push('/auth/login')
          return
        }

        const user = userResponse.data.user
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch users from API endpoint
        const response = await fetch(`/api/admin/users?role=${filterRole}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        } else if (response.status === 401) {
          router.push('/auth/login')
          return
        } else if (response.status === 403) {
          router.push('/dashboard')
          return
        } else {
          console.error('Failed to fetch users:', response.statusText)
        }
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [filterRole, router])

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          is_active: !currentStatus
        })
      })

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        ))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update user status')
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update user status')
    }
  }

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C3A1F] mb-2">
              User Management
            </h1>
            <p className="text-lg text-[#A0A0A0]">
              Manage platform users and permissions
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]" size={20} />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-[#A0A0A0]" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="flex-1 h-11 px-4 rounded-lg border border-[#E5E5E5] bg-white text-[#5C3A1F]"
                  >
                    <option value="all">All Roles</option>
                    <option value="volunteer">Volunteers</option>
                    <option value="student">Students</option>
                    <option value="organization">Organizations</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A1F] mx-auto"></div>
              <p className="mt-4 text-[#A0A0A0]">Loading users...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#D2A04A] rounded-full flex items-center justify-center text-white font-bold">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#5C3A1F]">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-sm text-[#A0A0A0]">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'admin' || user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'organization' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'student' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          variant={user.is_active ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? (
                            <><UserX size={16} className="mr-1" /> Suspend</>
                          ) : (
                            <><UserCheck size={16} className="mr-1" /> Activate</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
