# Sentry Setup Instructions for Error Reporting

## Step 1: Create Sentry Account and Project

1. **Sign up for Sentry**
   - Go to https://sentry.io
   - Click "Get Started" or "Sign Up"
   - Create account with your email: `admin@swaeduae.ae`

2. **Create New Project**
   - After login, click "Create Project"
   - Select platform: **Next.js**
   - Set project name: `swaeduae-platform`
   - Set team/organization: `swaeduae`
   - Click "Create Project"

3. **Get Your DSN**
   - After project creation, you'll see the DSN
   - Format: `https://[PUBLIC_KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]`
   - Example: `https://abc123def456@o1234567.ingest.sentry.io/7654321`

## Step 2: Update Environment Variables

Replace the placeholder values in `.env.production`:

```bash
# Current placeholders:
SENTRY_DSN=https://YOUR_SENTRY_PUBLIC_KEY@o0.ingest.sentry.io/YOUR_PROJECT_ID
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_PUBLIC_KEY@o0.ingest.sentry.io/YOUR_PROJECT_ID

# Replace with your actual DSN:
SENTRY_DSN=https://[YOUR_ACTUAL_DSN]
NEXT_PUBLIC_SENTRY_DSN=https://[YOUR_ACTUAL_DSN]
SENTRY_ORG=swaeduae
SENTRY_PROJECT=swaeduae-platform
```

## Step 3: Configure Sentry Settings

1. **Set Environment**
   - In Sentry Dashboard > Settings > Environments
   - Add "production" environment

2. **Configure Alerts**
   - Go to Alerts > Create Alert Rule
   - Set up notifications for errors
   - Configure email notifications to `admin@swaeduae.ae`

3. **Set up Performance Monitoring**
   - Go to Performance > Settings
   - Enable performance monitoring
   - Set sample rate (currently set to 10% in config)

## Step 4: Test Error Reporting

After updating the DSN, test error reporting:

1. **Trigger a test error** (in development):
   ```javascript
   // Add this temporarily to any page
   throw new Error("Test Sentry integration");
   ```

2. **Check Sentry Dashboard**
   - Errors should appear in Issues tab
   - Verify source maps are working
   - Check performance data in Performance tab

## Step 5: Production Deployment

1. **Source Maps Upload** (optional but recommended):
   - Sentry will automatically upload source maps during build
   - Configured in `next.config.js` with `withSentryConfig`

2. **Environment Variables**:
   - Ensure all Sentry environment variables are set in production
   - Verify `SENTRY_ENVIRONMENT=production`

## Current Configuration Status

✅ **Already Configured:**
- Sentry SDK installed (`@sentry/nextjs`)
- Configuration files created:
  - `instrumentation-client.ts` (client-side)
  - `sentry.server.config.ts` (server-side)  
  - `sentry.edge.config.ts` (edge runtime)
  - `instrumentation.ts` (loader)
- Next.js integration (`withSentryConfig`)
- Content Security Policy updated
- Environment variables prepared

🔄 **Needs Your Action:**
- Create Sentry account and project
- Get actual DSN
- Update environment variables
- Test error reporting

## Useful Sentry Features

- **Error Tracking**: Automatic error capture and grouping
- **Performance Monitoring**: Track page load times and API calls
- **Release Tracking**: Monitor deployments and regressions
- **User Context**: See which users are affected by errors
- **Source Maps**: Debug with original source code
- **Alerts**: Get notified of new errors or performance issues