'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Activity, 
  Clock, 
  Database, 
  Server, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface PerformanceStats {
  api: {
    totalRequests: number
    averageResponseTime: number
    errorRate: number
    requestsPerMinute: number
  }
  pages: {
    totalPageViews: number
    averageLoadTime: number
    averageTTFB: number
    averageFCP: number
    averageLCP: number
  }
  database: {
    totalQueries: number
    averageQueryTime: number
    successRate: number
  }
  cache: {
    hitRate: number
    totalOperations: number
    averageResponseTime: number
  }
  timeRange: number
  timestamp: number
}

interface PerformanceAlert {
  type: string
  message: string
  severity: 'error' | 'warning' | 'info'
  timestamp: number
}

export function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      
      // Fetch performance stats
      const statsResponse = await fetch('/api/admin/performance/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch alerts
      const alertsResponse = await fetch('/api/admin/performance/alerts')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchPerformanceData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
    if (value <= thresholds.warning) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
    return <Badge variant="destructive">Critical</Badge>
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading performance data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system performance and health metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'error' ? 'destructive' : 'default'}>
              {alert.severity === 'error' ? (
                <XCircle className="h-4 w-4" />
              ) : alert.severity === 'warning' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertTitle className="capitalize">{alert.severity}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Performance Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="pages">Page Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatDuration(stats.api.averageResponseTime) : 'N/A'}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {stats && getStatusBadge(stats.api.averageResponseTime, { good: 500, warning: 1000 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatDuration(stats.pages.averageLoadTime) : 'N/A'}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {stats && getStatusBadge(stats.pages.averageLoadTime, { good: 2000, warning: 4000 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Query Time</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatDuration(stats.database.averageQueryTime) : 'N/A'}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {stats && getStatusBadge(stats.database.averageQueryTime, { good: 100, warning: 500 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatPercentage(stats.cache.hitRate) : 'N/A'}
                </div>
                <div className="mt-2">
                  <Progress value={stats ? stats.cache.hitRate * 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Performance Metrics</CardTitle>
                <CardDescription>Last {stats?.timeRange ? stats.timeRange / 60 : 60} minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Requests:</span>
                  <span className="font-medium">{stats?.api.totalRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Requests/Minute:</span>
                  <span className="font-medium">{stats?.api.requestsPerMinute || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Response Time:</span>
                  <span className={`font-medium ${stats ? getStatusColor(stats.api.averageResponseTime, { good: 500, warning: 1000 }) : ''}`}>
                    {stats ? formatDuration(stats.api.averageResponseTime) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className={`font-medium ${stats ? getStatusColor(stats.api.errorRate * 100, { good: 1, warning: 5 }) : ''}`}>
                    {stats ? formatPercentage(stats.api.errorRate) : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>Performance thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Excellent (&lt; 500ms)</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Good (500ms - 1s)</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Poor (&gt; 1s)</span>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance Metrics</CardTitle>
              <CardDescription>Core Web Vitals and loading performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Page Views:</span>
                    <span className="font-medium">{stats?.pages.totalPageViews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Load Time:</span>
                    <span className="font-medium">{stats ? formatDuration(stats.pages.averageLoadTime) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time to First Byte (TTFB):</span>
                    <span className="font-medium">{stats ? formatDuration(stats.pages.averageTTFB) : 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>First Contentful Paint (FCP):</span>
                    <span className="font-medium">{stats ? formatDuration(stats.pages.averageFCP) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Largest Contentful Paint (LCP):</span>
                    <span className="font-medium">{stats ? formatDuration(stats.pages.averageLCP) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Query performance and success rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.database.totalQueries || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Queries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats ? formatDuration(stats.database.averageQueryTime) : 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Average Query Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats ? formatPercentage(stats.database.successRate) : 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Redis cache statistics and hit rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats ? formatPercentage(stats.cache.hitRate) : 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Hit Rate</div>
                  <Progress value={stats ? stats.cache.hitRate * 100 : 0} className="h-2 mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.cache.totalOperations || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Operations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats ? formatDuration(stats.cache.averageResponseTime) : 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Average Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PerformanceDashboard