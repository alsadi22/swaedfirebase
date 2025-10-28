'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  user_name: string
  user_email: string
  action: string
  resource_type: string
  resource_id: string
  old_values: any
  new_values: any
  ip_address: string
  user_agent: string
  session_id: string
  created_at: string
}

interface AuditStats {
  action: string
  resource_type: string
  count: number
  date: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resourceType: '',
    resourceId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { addToast } = useToast()

  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'auth_login', label: 'Login' },
    { value: 'auth_logout', label: 'Logout' },
    { value: 'auth_register', label: 'Registration' },
    { value: 'user_create', label: 'User Created' },
    { value: 'user_update', label: 'User Updated' },
    { value: 'user_delete', label: 'User Deleted' },
    { value: 'event_create', label: 'Event Created' },
    { value: 'event_update', label: 'Event Updated' },
    { value: 'event_delete', label: 'Event Deleted' },
    { value: 'organization_create', label: 'Organization Created' },
    { value: 'organization_update', label: 'Organization Updated' },
    { value: 'admin_approve_organization', label: 'Organization Approved' },
    { value: 'admin_reject_organization', label: 'Organization Rejected' },
    { value: 'security_failed_login', label: 'Failed Login' },
    { value: 'security_permission_denied', label: 'Permission Denied' }
  ]

  const resourceTypes = [
    { value: '', label: 'All Resources' },
    { value: 'user', label: 'User' },
    { value: 'event', label: 'Event' },
    { value: 'organization', label: 'Organization' },
    { value: 'application', label: 'Application' },
    { value: 'notification', label: 'Notification' },
    { value: 'security', label: 'Security' },
    { value: 'system', label: 'System' }
  ]

  useEffect(() => {
    fetchLogs()
  }, [filters])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch audit logs'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (timeframe: 'day' | 'week' | 'month' = 'week') => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'getStats',
          timeframe
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch audit stats')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching audit stats:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch audit statistics'
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const clearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      resourceType: '',
      resourceId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 50
    })
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const getActionIcon = (action: string) => {
    if (action.includes('auth')) return <User className="w-4 h-4" />
    if (action.includes('admin')) return <Shield className="w-4 h-4" />
    if (action.includes('security')) return <AlertTriangle className="w-4 h-4" />
    if (action.includes('create')) return <CheckCircle className="w-4 h-4" />
    if (action.includes('delete')) return <XCircle className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('security') || action.includes('failed')) return 'destructive'
    if (action.includes('admin')) return 'secondary'
    if (action.includes('create')) return 'default'
    if (action.includes('delete')) return 'destructive'
    return 'outline'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const exportLogs = async () => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          queryParams.append(key, value.toString())
        }
      })
      queryParams.append('limit', '10000') // Export more records

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to export audit logs')
      }

      const data = await response.json()
      const csv = convertToCSV(data.logs)
      downloadCSV(csv, 'audit-logs.csv')
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Audit logs exported successfully'
      })
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to export audit logs'
      })
    }
  }

  const convertToCSV = (data: AuditLog[]) => {
    const headers = ['Date', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address']
    const rows = data.map(log => [
      formatDate(log.created_at),
      log.user_name || 'System',
      log.action,
      log.resource_type,
      log.resource_id || '',
      log.ip_address || ''
    ])
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F4C3A] to-[#2D5A4A]">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
          <p className="text-[#FDFBF7] opacity-80">
            Monitor and track all system activities and user actions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
                <Activity className="w-8 h-8 text-[#D2A04A]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Events</p>
                  <p className="text-2xl font-bold">
                    {stats.filter(s => s.action.includes('security')).reduce((sum, s) => sum + s.count, 0)}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Actions</p>
                  <p className="text-2xl font-bold">
                    {stats.filter(s => s.action.includes('admin')).reduce((sum, s) => sum + s.count, 0)}
                  </p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Auth Events</p>
                  <p className="text-2xl font-bold">
                    {stats.filter(s => s.action.includes('auth')).reduce((sum, s) => sum + s.count, 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Actions
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportLogs}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchLogs}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User ID</label>
                  <Input
                    placeholder="User ID"
                    value={filters.userId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('userId', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Action</label>
                  <Select
                    value={filters.action}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('action', e.target.value)}
                    options={actionTypes}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Resource Type</label>
                  <Select
                    value={filters.resourceType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('resourceType', e.target.value)}
                    options={resourceTypes}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Resource ID</label>
                  <Input
                    placeholder="Resource ID"
                    value={filters.resourceId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('resourceId', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading audit logs...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date/Time</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Action</th>
                        <th className="text-left py-3 px-4">Resource</th>
                        <th className="text-left py-3 px-4">IP Address</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDate(log.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{log.user_name || 'System'}</div>
                              <div className="text-sm text-gray-500">{log.user_email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getActionColor(log.action)} className="flex items-center gap-1 w-fit">
                              {getActionIcon(log.action)}
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{log.resource_type}</div>
                              {log.resource_id && (
                                <div className="text-sm text-gray-500">ID: {log.resource_id}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono">{log.ip_address || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} entries
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Audit Log Details</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium">Date/Time:</label>
                      <p>{formatDate(selectedLog.created_at)}</p>
                    </div>
                    <div>
                      <label className="font-medium">User:</label>
                      <p>{selectedLog.user_name || 'System'}</p>
                    </div>
                    <div>
                      <label className="font-medium">Action:</label>
                      <p>{selectedLog.action}</p>
                    </div>
                    <div>
                      <label className="font-medium">Resource Type:</label>
                      <p>{selectedLog.resource_type}</p>
                    </div>
                    <div>
                      <label className="font-medium">Resource ID:</label>
                      <p>{selectedLog.resource_id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium">IP Address:</label>
                      <p>{selectedLog.ip_address || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {selectedLog.old_values && (
                    <div>
                      <label className="font-medium">Old Values:</label>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {selectedLog.new_values && (
                    <div>
                      <label className="font-medium">New Values:</label>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(selectedLog.new_values, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {selectedLog.user_agent && (
                    <div>
                      <label className="font-medium">User Agent:</label>
                      <p className="text-sm break-all">{selectedLog.user_agent}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}