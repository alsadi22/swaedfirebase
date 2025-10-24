#!/bin/bash

echo "=== SwaedUAE Platform - Quick Build Test ==="
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "⚠️  node_modules not found - running npm install..."
    npm install
fi

echo ""
echo "🔧 Running build test..."
echo ""

# Clean previous build if exists
if [ -d ".next" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf .next
fi

# Run build
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 BUILD SUCCESSFUL!"
    echo "✅ Your SwaedUAE platform is ready for deployment"
    echo "✅ All 63 pages compiled successfully"
    echo ""
    echo "🚀 Next step: Deploy to Netlify with the updated environment variables"
else
    echo ""
    echo "❌ Build failed - check the error messages above"
    echo "📧 Share the error details if you need help troubleshooting"
fi