#!/bin/bash

# SwaedUAE Platform - Automated Deployment Script
# This script prepares and deploys the platform to Vercel

echo "🚀 Starting SwaedUAE Platform Deployment..."

# Navigate to project directory
cd /workspace/swaeduae-platform

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo "📋 Your live URL will be displayed above"
