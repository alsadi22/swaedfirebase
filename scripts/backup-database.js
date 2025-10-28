#!/usr/bin/env node

/**
 * Database Backup Script for SwaedUAE Platform
 * This script creates automated backups of the PostgreSQL database
 */

require('dotenv').config({ path: '.env.local' })
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  database: process.env.POSTGRES_DB || 'swaeduae',
  password: process.env.POSTGRES_PASSWORD
}

const BACKUP_DIR = process.env.BACKUP_DIR || './backups'
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30')

class DatabaseBackup {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.backupDir = BACKUP_DIR
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  async createBackup() {
    console.log('🗄️  Starting database backup...')
    console.log(`📅 Timestamp: ${this.timestamp}`)
    
    const backupFile = path.join(this.backupDir, `swaeduae-backup-${this.timestamp}.sql`)
    
    // Set PGPASSWORD environment variable for pg_dump
    const env = { ...process.env, PGPASSWORD: config.password }
    
    const dumpCommand = [
      'pg_dump',
      `-h ${config.host}`,
      `-p ${config.port}`,
      `-U ${config.user}`,
      `-d ${config.database}`,
      '--verbose',
      '--clean',
      '--if-exists',
      '--create',
      '--format=plain',
      `--file=${backupFile}`
    ].join(' ')
    
    return new Promise((resolve, reject) => {
      console.log('🔄 Running pg_dump...')
      
      exec(dumpCommand, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Backup failed:', error.message)
          reject(error)
          return
        }
        
        // Check if backup file was created and has content
        if (fs.existsSync(backupFile)) {
          const stats = fs.statSync(backupFile)
          const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2)
          
          console.log('✅ Backup completed successfully!')
          console.log(`📁 File: ${backupFile}`)
          console.log(`📊 Size: ${fileSizeMB} MB`)
          
          resolve({
            success: true,
            file: backupFile,
            size: stats.size,
            sizeMB: fileSizeMB,
            timestamp: this.timestamp
          })
        } else {
          reject(new Error('Backup file was not created'))
        }
      })
    })
  }

  async createCompressedBackup() {
    console.log('🗄️  Starting compressed database backup...')
    console.log(`📅 Timestamp: ${this.timestamp}`)
    
    const backupFile = path.join(this.backupDir, `swaeduae-backup-${this.timestamp}.sql.gz`)
    
    // Set PGPASSWORD environment variable for pg_dump
    const env = { ...process.env, PGPASSWORD: config.password }
    
    const dumpCommand = [
      'pg_dump',
      `-h ${config.host}`,
      `-p ${config.port}`,
      `-U ${config.user}`,
      `-d ${config.database}`,
      '--verbose',
      '--clean',
      '--if-exists',
      '--create',
      '--format=custom',
      '--compress=9',
      `--file=${backupFile}`
    ].join(' ')
    
    return new Promise((resolve, reject) => {
      console.log('🔄 Running compressed pg_dump...')
      
      exec(dumpCommand, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Compressed backup failed:', error.message)
          reject(error)
          return
        }
        
        // Check if backup file was created and has content
        if (fs.existsSync(backupFile)) {
          const stats = fs.statSync(backupFile)
          const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2)
          
          console.log('✅ Compressed backup completed successfully!')
          console.log(`📁 File: ${backupFile}`)
          console.log(`📊 Size: ${fileSizeMB} MB`)
          
          resolve({
            success: true,
            file: backupFile,
            size: stats.size,
            sizeMB: fileSizeMB,
            timestamp: this.timestamp,
            compressed: true
          })
        } else {
          reject(new Error('Compressed backup file was not created'))
        }
      })
    })
  }

  async cleanOldBackups() {
    console.log('🧹 Cleaning old backups...')
    
    try {
      const files = fs.readdirSync(this.backupDir)
      const backupFiles = files.filter(file => 
        file.startsWith('swaeduae-backup-') && 
        (file.endsWith('.sql') || file.endsWith('.sql.gz'))
      )
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)
      
      let deletedCount = 0
      let deletedSize = 0
      
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime < cutoffDate) {
          deletedSize += stats.size
          fs.unlinkSync(filePath)
          deletedCount++
          console.log(`🗑️  Deleted old backup: ${file}`)
        }
      }
      
      if (deletedCount > 0) {
        const deletedSizeMB = (deletedSize / 1024 / 1024).toFixed(2)
        console.log(`✅ Cleaned ${deletedCount} old backups (${deletedSizeMB} MB freed)`)
      } else {
        console.log('✅ No old backups to clean')
      }
      
      return { deletedCount, deletedSize }
      
    } catch (error) {
      console.error('❌ Error cleaning old backups:', error.message)
      throw error
    }
  }

  async listBackups() {
    console.log('📋 Listing available backups...')
    
    try {
      const files = fs.readdirSync(this.backupDir)
      const backupFiles = files.filter(file => 
        file.startsWith('swaeduae-backup-') && 
        (file.endsWith('.sql') || file.endsWith('.sql.gz'))
      )
      
      if (backupFiles.length === 0) {
        console.log('📭 No backups found')
        return []
      }
      
      const backups = backupFiles.map(file => {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
        
        return {
          file,
          path: filePath,
          size: stats.size,
          sizeMB,
          created: stats.mtime,
          compressed: file.endsWith('.gz')
        }
      }).sort((a, b) => b.created - a.created)
      
      console.log('\n📊 Available Backups:')
      console.log('=' .repeat(80))
      
      backups.forEach((backup, index) => {
        const age = Math.floor((Date.now() - backup.created.getTime()) / (1000 * 60 * 60 * 24))
        const type = backup.compressed ? 'Compressed' : 'Plain SQL'
        
        console.log(`${index + 1}. ${backup.file}`)
        console.log(`   📊 Size: ${backup.sizeMB} MB (${type})`)
        console.log(`   📅 Created: ${backup.created.toISOString()} (${age} days ago)`)
        console.log('')
      })
      
      return backups
      
    } catch (error) {
      console.error('❌ Error listing backups:', error.message)
      throw error
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'backup'
  
  const backup = new DatabaseBackup()
  
  try {
    switch (command) {
      case 'backup':
        await backup.createBackup()
        await backup.cleanOldBackups()
        break
        
      case 'compressed':
        await backup.createCompressedBackup()
        await backup.cleanOldBackups()
        break
        
      case 'list':
        await backup.listBackups()
        break
        
      case 'clean':
        await backup.cleanOldBackups()
        break
        
      case 'full':
        console.log('🔄 Running full backup process...')
        await backup.createBackup()
        await backup.createCompressedBackup()
        await backup.cleanOldBackups()
        await backup.listBackups()
        break
        
      default:
        console.log('📖 SwaedUAE Database Backup Tool')
        console.log('')
        console.log('Usage:')
        console.log('  node scripts/backup-database.js [command]')
        console.log('')
        console.log('Commands:')
        console.log('  backup     Create a plain SQL backup (default)')
        console.log('  compressed Create a compressed backup')
        console.log('  list       List all available backups')
        console.log('  clean      Clean old backups')
        console.log('  full       Create both backups, clean old ones, and list')
        console.log('')
        console.log('Environment Variables:')
        console.log('  BACKUP_DIR              Backup directory (default: ./backups)')
        console.log('  BACKUP_RETENTION_DAYS   Days to keep backups (default: 30)')
        break
    }
    
  } catch (error) {
    console.error('❌ Backup operation failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = DatabaseBackup