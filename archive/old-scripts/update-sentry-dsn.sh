#!/bin/bash

# Sentry DSN Update Script
# Usage: ./update-sentry-dsn.sh "your-actual-dsn-here"

echo "🔧 Sentry DSN Update Script"
echo "============================"

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 \"your-sentry-dsn\""
    echo "   Example: $0 \"https://abc123@o1234567.ingest.sentry.io/7654321\""
    echo ""
    echo "📋 To get your DSN:"
    echo "1. Go to https://sentry.io"
    echo "2. Create account with admin@swaeduae.ae"
    echo "3. Create project: swaeduae-platform"
    echo "4. Copy the DSN from project settings"
    exit 1
fi

DSN="$1"

# Validate DSN format
if [[ ! "$DSN" =~ ^https://.*@o[0-9]+\.ingest\.sentry\.io/[0-9]+$ ]]; then
    echo "❌ Invalid DSN format. Expected format:"
    echo "   https://[key]@o[org-id].ingest.sentry.io/[project-id]"
    exit 1
fi

echo "🔄 Updating .env.production with Sentry DSN..."

# Backup original file
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# Update DSN values
sed -i "s|SENTRY_DSN=https://YOUR_SENTRY_PUBLIC_KEY@o0.ingest.sentry.io/YOUR_PROJECT_ID|SENTRY_DSN=$DSN|g" .env.production
sed -i "s|NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_PUBLIC_KEY@o0.ingest.sentry.io/YOUR_PROJECT_ID|NEXT_PUBLIC_SENTRY_DSN=$DSN|g" .env.production

echo "✅ Sentry DSN updated successfully!"
echo "📁 Backup created: .env.production.backup.$(date +%Y%m%d_%H%M%S)"
echo ""
echo "🔄 Next steps:"
echo "1. Restart your application"
echo "2. Test error reporting"
echo "3. Check Sentry dashboard for incoming events"
echo ""
echo "🧪 Test error reporting:"
echo "   Add 'throw new Error(\"Test Sentry\");' to any page temporarily"
