#!/bin/bash

# SwaedUAE Platform - Fixed Build & Deploy Script
# Fixed dependency conflicts and version compatibility

echo "🔧 Starting Fixed Build & Deploy Process..."

# Navigate to project directory
cd /workspace/swaeduae-platform

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules
rm -rf .next
rm -f package-lock.json
rm -f yarn.lock

# Check if we have yarn
if command -v yarn &> /dev/null; then
    echo "📦 Installing dependencies with yarn..."
    yarn install --frozen-lockfile
else
    echo "📦 Installing dependencies with npm..."
    npm install
fi

# Build the project
echo "🏗️ Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Ready for deployment!"
    
    # Show deployment options
    echo ""
    echo "📋 DEPLOYMENT OPTIONS:"
    echo "1. Vercel: vercel --prod"
    echo "2. Netlify: netlify deploy --prod --dir=.next"
    echo "3. Static export: npm run export"
    
else
    echo "❌ Build failed!"
    echo "Please check the error messages above."
    exit 1
fi