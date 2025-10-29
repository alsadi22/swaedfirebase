#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Bundle Size Monitor
 * Tracks and reports bundle size changes
 */

const BUNDLE_STATS_FILE = path.join(__dirname, '../.next/bundle-stats.json')
const SIZE_LIMITS = {
  'pages/_app.js': 250 * 1024, // 250KB
  'pages/index.js': 100 * 1024, // 100KB
  'chunks/main.js': 200 * 1024, // 200KB
  'chunks/framework.js': 150 * 1024, // 150KB
  'chunks/commons.js': 100 * 1024, // 100KB
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function analyzeBundleStats() {
  const buildDir = path.join(__dirname, '../.next')
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.')
    process.exit(1)
  }

  const buildManifest = path.join(buildDir, 'build-manifest.json')
  
  if (!fs.existsSync(buildManifest)) {
    console.error('❌ Build manifest not found. Run "npm run build" first.')
    process.exit(1)
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'))
    const staticDir = path.join(buildDir, 'static')
    
    console.log('📊 Bundle Size Analysis')
    console.log('=' .repeat(50))
    
    let totalSize = 0
    let warnings = []
    let errors = []

    // Analyze pages
    if (manifest.pages) {
      console.log('\n📄 Pages:')
      for (const [page, files] of Object.entries(manifest.pages)) {
        let pageSize = 0
        
        for (const file of files) {
          const filePath = path.join(staticDir, file)
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath)
            pageSize += stats.size
          }
        }
        
        totalSize += pageSize
        const sizeStr = formatBytes(pageSize)
        
        // Check against limits
        const limit = SIZE_LIMITS[`pages${page}.js`]
        if (limit && pageSize > limit) {
          errors.push(`${page}: ${sizeStr} (exceeds ${formatBytes(limit)})`)
          console.log(`  ❌ ${page}: ${sizeStr}`)
        } else if (limit && pageSize > limit * 0.8) {
          warnings.push(`${page}: ${sizeStr} (approaching ${formatBytes(limit)})`)
          console.log(`  ⚠️  ${page}: ${sizeStr}`)
        } else {
          console.log(`  ✅ ${page}: ${sizeStr}`)
        }
      }
    }

    // Analyze chunks
    if (manifest.sortedPages) {
      console.log('\n📦 Chunks:')
      const chunksDir = path.join(staticDir, 'chunks')
      
      if (fs.existsSync(chunksDir)) {
        const chunkFiles = fs.readdirSync(chunksDir)
        
        for (const chunkFile of chunkFiles) {
          if (chunkFile.endsWith('.js')) {
            const filePath = path.join(chunksDir, chunkFile)
            const stats = fs.statSync(filePath)
            const sizeStr = formatBytes(stats.size)
            
            totalSize += stats.size
            
            // Check against limits
            const limit = SIZE_LIMITS[`chunks/${chunkFile}`]
            if (limit && stats.size > limit) {
              errors.push(`chunks/${chunkFile}: ${sizeStr} (exceeds ${formatBytes(limit)})`)
              console.log(`  ❌ ${chunkFile}: ${sizeStr}`)
            } else if (limit && stats.size > limit * 0.8) {
              warnings.push(`chunks/${chunkFile}: ${sizeStr} (approaching ${formatBytes(limit)})`)
              console.log(`  ⚠️  ${chunkFile}: ${sizeStr}`)
            } else {
              console.log(`  ✅ ${chunkFile}: ${sizeStr}`)
            }
          }
        }
      }
    }

    console.log('\n' + '=' .repeat(50))
    console.log(`📊 Total Bundle Size: ${formatBytes(totalSize)}`)
    
    // Save stats
    const stats = {
      timestamp: new Date().toISOString(),
      totalSize,
      warnings: warnings.length,
      errors: errors.length,
      details: {
        warnings,
        errors
      }
    }
    
    fs.writeFileSync(BUNDLE_STATS_FILE, JSON.stringify(stats, null, 2))
    console.log(`📁 Stats saved to: ${BUNDLE_STATS_FILE}`)

    // Summary
    if (errors.length > 0) {
      console.log(`\n❌ ${errors.length} size limit(s) exceeded:`)
      errors.forEach(error => console.log(`  - ${error}`))
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  ${warnings.length} warning(s):`)
      warnings.forEach(warning => console.log(`  - ${warning}`))
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✅ All bundle sizes are within limits!')
    }

    // Exit with error code if there are size violations
    process.exit(errors.length > 0 ? 1 : 0)

  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
Bundle Size Monitor

Usage:
  node scripts/bundle-monitor.js [command]

Commands:
  analyze    Analyze current bundle sizes (default)
  history    Show bundle size history
  limits     Show current size limits
  help       Show this help message

Examples:
  npm run build && node scripts/bundle-monitor.js
  node scripts/bundle-monitor.js history
  node scripts/bundle-monitor.js limits
`)
}

function showHistory() {
  if (!fs.existsSync(BUNDLE_STATS_FILE)) {
    console.log('❌ No bundle stats found. Run analysis first.')
    return
  }

  try {
    const stats = JSON.parse(fs.readFileSync(BUNDLE_STATS_FILE, 'utf8'))
    console.log('📈 Bundle Size History')
    console.log('=' .repeat(50))
    console.log(`Last Analysis: ${new Date(stats.timestamp).toLocaleString()}`)
    console.log(`Total Size: ${formatBytes(stats.totalSize)}`)
    console.log(`Warnings: ${stats.warnings}`)
    console.log(`Errors: ${stats.errors}`)
  } catch (error) {
    console.error('❌ Error reading bundle stats:', error.message)
  }
}

function showLimits() {
  console.log('📏 Bundle Size Limits')
  console.log('=' .repeat(50))
  
  for (const [file, limit] of Object.entries(SIZE_LIMITS)) {
    console.log(`${file}: ${formatBytes(limit)}`)
  }
}

// Main execution
const command = process.argv[2] || 'analyze'

switch (command) {
  case 'analyze':
    analyzeBundleStats()
    break
  case 'history':
    showHistory()
    break
  case 'limits':
    showLimits()
    break
  case 'help':
    showHelp()
    break
  default:
    console.error(`❌ Unknown command: ${command}`)
    showHelp()
    process.exit(1)
}