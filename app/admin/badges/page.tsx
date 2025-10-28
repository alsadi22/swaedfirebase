'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/form'
import { Select } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

interface Badge {
  id: number
  name: string
  description: string
  image_url?: string
  type: 'bronze' | 'silver' | 'gold' | 'platinum'
  criteria: Record<string, any>
  points: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface BadgeStats {
  totalBadges: number
  totalUsers: number
  totalAwards: number
  bronzeAwards: number
  silverAwards: number
  goldAwards: number
  platinumAwards: number
}

interface CreateBadgeForm {
  name: string
  description: string
  image_url: string
  type: 'bronze' | 'silver' | 'gold' | 'platinum'
  criteria: {
    totalHours?: number
    eventsCompleted?: number
    organizationsCount?: number
    activeMonths?: number
  }
  points: number
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState<BadgeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [createForm, setCreateForm] = useState<CreateBadgeForm>({
    name: '',
    description: '',
    image_url: '',
    type: 'bronze',
    criteria: {},
    points: 10
  })

  const { addToast } = useToast()

  useEffect(() => {
    fetchBadges()
    fetchStats()
  }, [])

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges?admin=true')
      if (response.ok) {
        const data = await response.json()
        setBadges(data.badges || [])
      } else {
        addToast({ message: 'Failed to fetch badges', type: 'error' })
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
      addToast({ message: 'Error fetching badges', type: 'error' })
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/badges/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        addToast({ message: 'Badge created successfully', type: 'success' })
        setShowCreateModal(false)
        setCreateForm({
          name: '',
          description: '',
          image_url: '',
          type: 'bronze',
          criteria: {},
          points: 10
        })
        fetchBadges()
        fetchStats()
      } else {
        const error = await response.json()
        addToast({ message: error.error || 'Failed to create badge', type: 'error' })
      }
    } catch (error) {
      console.error('Error creating badge:', error)
      addToast({ message: 'Error creating badge', type: 'error' })
    }
  }

  const handleUpdateBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingBadge) return

    try {
      const response = await fetch('/api/badges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingBadge.id,
          ...createForm
        })
      })

      if (response.ok) {
        addToast({ message: 'Badge updated successfully', type: 'success' })
        setEditingBadge(null)
        setCreateForm({
          name: '',
          description: '',
          image_url: '',
          type: 'bronze',
          criteria: {},
          points: 10
        })
        fetchBadges()
        fetchStats()
      } else {
        const error = await response.json()
        addToast({ message: error.error || 'Failed to update badge', type: 'error' })
      }
    } catch (error) {
      console.error('Error updating badge:', error)
      addToast({ message: 'Error updating badge', type: 'error' })
    }
  }

  const handleDeleteBadge = async (badgeId: number) => {
    if (!confirm('Are you sure you want to delete this badge?')) return

    try {
      const response = await fetch(`/api/badges?id=${badgeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addToast({ message: 'Badge deleted successfully', type: 'success' })
        fetchBadges()
        fetchStats()
      } else {
        const error = await response.json()
        addToast({ message: error.error || 'Failed to delete badge', type: 'error' })
      }
    } catch (error) {
      console.error('Error deleting badge:', error)
      addToast({ message: 'Error deleting badge', type: 'error' })
    }
  }

  const handleEditBadge = (badge: Badge) => {
    setEditingBadge(badge)
    setCreateForm({
      name: badge.name,
      description: badge.description,
      image_url: badge.image_url || '',
      type: badge.type,
      criteria: badge.criteria || {},
      points: badge.points
    })
    setShowCreateModal(true)
  }

  const getBadgeTypeColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-amber-600'
      case 'silver': return 'bg-gray-400'
      case 'gold': return 'bg-yellow-500'
      case 'platinum': return 'bg-purple-600'
      default: return 'bg-gray-500'
    }
  }

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'bronze': return '🥉'
      case 'silver': return '🥈'
      case 'gold': return '🥇'
      case 'platinum': return '💎'
      default: return '🏆'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading badges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Badge Management</h1>
          <Button 
            onClick={() => {
              setEditingBadge(null)
              setCreateForm({
                name: '',
                description: '',
                image_url: '',
                type: 'bronze',
                criteria: {},
                points: 10
              })
              setShowCreateModal(true)
            }}
            className="bg-accent hover:bg-accent/90"
          >
            Create Badge
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">{stats.totalBadges}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">{stats.totalAwards}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">🥉 {stats.bronzeAwards}</Badge>
                  <Badge variant="secondary" className="text-xs">🥈 {stats.silverAwards}</Badge>
                  <Badge variant="secondary" className="text-xs">🥇 {stats.goldAwards}</Badge>
                  <Badge variant="secondary" className="text-xs">💎 {stats.platinumAwards}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map(badge => (
            <Card key={badge.id} className={`${!badge.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${getBadgeTypeColor(badge.type)} rounded-full mx-auto mb-3 text-2xl flex items-center justify-center text-white`}>
                  {badge.image_url ? (
                    <img src={badge.image_url} alt={badge.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    getBadgeIcon(badge.type)
                  )}
                </div>
                <CardTitle className="text-lg">{badge.name}</CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={badge.type === 'gold' ? 'default' : 'secondary'}>
                    {badge.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{badge.points} pts</Badge>
                  {!badge.is_active && <Badge variant="destructive">Inactive</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-4">{badge.description}</p>
                
                {/* Criteria */}
                {badge.criteria && Object.keys(badge.criteria).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                    <div className="space-y-1">
                      {badge.criteria.totalHours && (
                        <div className="text-xs text-text-secondary">• {badge.criteria.totalHours} volunteer hours</div>
                      )}
                      {badge.criteria.eventsCompleted && (
                        <div className="text-xs text-text-secondary">• {badge.criteria.eventsCompleted} events completed</div>
                      )}
                      {badge.criteria.organizationsCount && (
                        <div className="text-xs text-text-secondary">• {badge.criteria.organizationsCount} organizations</div>
                      )}
                      {badge.criteria.activeMonths && (
                        <div className="text-xs text-text-secondary">• {badge.criteria.activeMonths} active months</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditBadge(badge)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingBadge ? 'Edit Badge' : 'Create New Badge'}
              </h2>
              
              <form onSubmit={editingBadge ? handleUpdateBadge : handleCreateBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={createForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setCreateForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={3}
                    value={createForm.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      setCreateForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                  <Input
                    type="url"
                    value={createForm.image_url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setCreateForm(prev => ({ ...prev, image_url: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select
                    value={createForm.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      setCreateForm(prev => ({ ...prev, type: e.target.value as any }))
                    }
                    options={[
                      { value: 'bronze', label: 'Bronze' },
                      { value: 'silver', label: 'Silver' },
                      { value: 'gold', label: 'Gold' },
                      { value: 'platinum', label: 'Platinum' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Points</label>
                  <Input
                    type="number"
                    min="1"
                    value={createForm.points}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setCreateForm(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Criteria</label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Total Hours</label>
                      <Input
                        type="number"
                        min="0"
                        value={createForm.criteria.totalHours || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setCreateForm(prev => ({ 
                            ...prev, 
                            criteria: { 
                              ...prev.criteria, 
                              totalHours: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Events Completed</label>
                      <Input
                        type="number"
                        min="0"
                        value={createForm.criteria.eventsCompleted || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setCreateForm(prev => ({ 
                            ...prev, 
                            criteria: { 
                              ...prev.criteria, 
                              eventsCompleted: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Organizations Count</label>
                      <Input
                        type="number"
                        min="0"
                        value={createForm.criteria.organizationsCount || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setCreateForm(prev => ({ 
                            ...prev, 
                            criteria: { 
                              ...prev.criteria, 
                              organizationsCount: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Active Months</label>
                      <Input
                        type="number"
                        min="0"
                        value={createForm.criteria.activeMonths || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setCreateForm(prev => ({ 
                            ...prev, 
                            criteria: { 
                              ...prev.criteria, 
                              activeMonths: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90">
                    {editingBadge ? 'Update Badge' : 'Create Badge'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingBadge(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
