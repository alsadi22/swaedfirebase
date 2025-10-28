#!/usr/bin/env node

/**
 * Health Check Script for SwaedUAE Platform
 * This script performs comprehensive health checks for production monitoring
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const http = require('http')

// Configuration
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'swaeduae',
}

const APP_PORT = process.env.PORT || 3000
const APP_HOST = process.env.HOST || 'localhost'

class HealthChecker {
  constructor() {
    this.results = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    }
  }

  async checkDatabase() {
    console.log('🔍 Checking database connection...')
    
    try {
      const pool = new Pool(config)
      const client = await pool.connect()
      
      // Test basic connection
      const result = await client.query('SELECT NOW() as current_time')
      
      // Test table access
      const profileCount = await client.query('SELECT COUNT(*) FROM profiles')
      const eventCount = await client.query('SELECT COUNT(*) FROM events')
      const orgCount = await client.query('SELECT COUNT(*) FROM organizations')
      
      client.release()
      await pool.end()
      
      this.results.checks.database = {
        status: 'healthy',
        response_time: Date.now(),
        details: {
          connection: 'successful',
          profiles: parseInt(profileCount.rows[0].count),
          events: parseInt(eventCount.rows[0].count),
          organizations: parseInt(orgCount.rows[0].count),
          server_time: result.rows[0].current_time
        }
      }
      
      console.log('✅ Database: Healthy')
      
    } catch (error) {
      this.results.checks.database = {
        status: 'unhealthy',
        error: error.message,
        details: {
          connection: 'failed'
        }
      }
      this.results.overall = 'unhealthy'
      console.log('❌ Database: Unhealthy -', error.message)
    }
  }

  async checkApplication() {
    console.log('🔍 Checking application server...')
    
    return new Promise((resolve) => {
      const startTime = Date.now()
      
      const req = http.request({
        hostname: APP_HOST,
        port: APP_PORT,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        const responseTime = Date.now() - startTime
        
        if (res.statusCode === 200) {
          this.results.checks.application = {
            status: 'healthy',
            response_time: responseTime,
            details: {
              status_code: res.statusCode,
              port: APP_PORT,
              host: APP_HOST
            }
          }
          console.log(`✅ Application: Healthy (${responseTime}ms)`)
        } else {
          this.results.checks.application = {
            status: 'unhealthy',
            response_time: responseTime,
            details: {
              status_code: res.statusCode,
              port: APP_PORT,
              host: APP_HOST
            }
          }
          this.results.overall = 'unhealthy'
          console.log(`❌ Application: Unhealthy - Status ${res.statusCode}`)
        }
        resolve()
      })

      req.on('error', (error) => {
        this.results.checks.application = {
          status: 'unhealthy',
          error: error.message,
          details: {
            port: APP_PORT,
            host: APP_HOST
          }
        }
        this.results.overall = 'unhealthy'
        console.log('❌ Application: Unhealthy -', error.message)
        resolve()
      })

      req.on('timeout', () => {
        req.destroy()
        this.results.checks.application = {
          status: 'unhealthy',
          error: 'Request timeout',
          details: {
            port: APP_PORT,
            host: APP_HOST,
            timeout: '5000ms'
          }
        }
        this.results.overall = 'unhealthy'
        console.log('❌ Application: Unhealthy - Request timeout')
        resolve()
      })

      req.end()
    })
  }

  checkSystemResources() {
    console.log('🔍 Checking system resources...')
    
    try {
      const memUsage = process.memoryUsage()
      const uptime = process.uptime()
      
      // Convert bytes to MB
      const memoryMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }
      
      // Check if memory usage is concerning (>500MB heap)
      const memoryStatus = memoryMB.heapUsed > 500 ? 'warning' : 'healthy'
      
      this.results.checks.system = {
        status: memoryStatus,
        details: {
          memory_mb: memoryMB,
          uptime_seconds: Math.round(uptime),
          node_version: process.version,
          platform: process.platform,
          arch: process.arch
        }
      }
      
      if (memoryStatus === 'warning') {
        console.log(`⚠️  System: Warning - High memory usage (${memoryMB.heapUsed}MB)`)
      } else {
        console.log(`✅ System: Healthy (${memoryMB.heapUsed}MB heap)`)
      }
      
    } catch (error) {
      this.results.checks.system = {
        status: 'unhealthy',
        error: error.message
      }
      this.results.overall = 'unhealthy'
      console.log('❌ System: Unhealthy -', error.message)
    }
  }

  checkEnvironment() {
    console.log('🔍 Checking environment configuration...')
    
    const requiredEnvVars = [
      'POSTGRES_HOST',
      'POSTGRES_USER',
      'POSTGRES_DB'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      this.results.checks.environment = {
        status: 'healthy',
        details: {
          node_env: process.env.NODE_ENV || 'development',
          required_vars_present: true,
          database_configured: !!process.env.POSTGRES_HOST
        }
      }
      console.log('✅ Environment: Healthy')
    } else {
      this.results.checks.environment = {
        status: 'unhealthy',
        details: {
          missing_variables: missingVars,
          required_vars_present: false
        }
      }
      this.results.overall = 'unhealthy'
      console.log('❌ Environment: Unhealthy - Missing variables:', missingVars.join(', '))
    }
  }

  async runAllChecks() {
    console.log('🏥 SwaedUAE Health Check Starting...')
    console.log('=' .repeat(50))
    
    // Run all health checks
    this.checkEnvironment()
    this.checkSystemResources()
    await this.checkDatabase()
    await this.checkApplication()
    
    console.log('=' .repeat(50))
    console.log(`🏥 Overall Status: ${this.results.overall.toUpperCase()}`)
    
    // Output JSON for monitoring systems
    if (process.argv.includes('--json')) {
      console.log('\n📊 JSON Output:')
      console.log(JSON.stringify(this.results, null, 2))
    }
    
    // Exit with appropriate code
    process.exit(this.results.overall === 'healthy' ? 0 : 1)
  }
}

// Run health check
const healthChecker = new HealthChecker()
healthChecker.runAllChecks().catch(error => {
  console.error('❌ Health check failed:', error)
  process.exit(1)
})