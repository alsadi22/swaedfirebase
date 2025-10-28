#!/bin/bash

# SwaedUAE Platform - Quick Deploy Script

echo "=========================================="
echo "SwaedUAE Platform - Quick Deploy"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the swaeduae-platform directory"
    exit 1
fi

echo "Step 1: Initialize Git repository"
git init
git add .
git commit -m "Initial commit: SwaedUAE volunteer management platform"
echo "✓ Git repository initialized"
echo ""

echo "Step 2: Next steps to deploy to Vercel:"
echo ""
echo "1. Create a new repository on GitHub"
echo "2. Run these commands:"
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git push -u origin main"
echo ""
echo "3. Go to https://vercel.com/new"
echo "4. Import your GitHub repository"
echo "5. Vercel will auto-detect the Next.js project"
echo "6. Click 'Deploy' - no environment variables needed!"
echo ""
echo "Your site will be live in 2-3 minutes!"
echo ""
echo "=========================================="
echo "Project Details:"
echo "=========================================="
echo "- PostgreSQL Database: Local PostgreSQL instance"
echo "- Database: 22 tables, fully configured"
echo "- Storage: 4 buckets ready"
echo "- Frontend: 11 pages, responsive design"
echo "- Tech: Next.js 16 + TypeScript + Tailwind CSS"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo "=========================================="
