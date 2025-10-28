# Sentry Alerts Configuration Guide

This guide will help you set up email and Slack notifications for critical errors in your SwaedUAE platform.

## 🚨 Alert Configuration Overview

Your Sentry project is configured with:
- **Organization**: `swaeduae`
- **Project**: `swaeduae-platform`
- **DSN**: `https://ef3fb2a006048529732cd96985d28d40@o4510252954943488.ingest.de.sentry.io/4510252958810192`

## 📧 Email Notifications Setup

### 1. Access Alert Rules
1. Go to your Sentry project: https://sentry.io/organizations/swaeduae/projects/swaeduae-platform/
2. Navigate to **Settings** → **Alerts**
3. Click **Create Alert Rule**

### 2. Create Critical Error Alert
Configure the following alert rule:

**Alert Rule Name**: `Critical Errors - Production`

**Conditions**:
- **When**: `An event is seen`
- **Environment**: `production`
- **Level**: `error` or `fatal`
- **Filter**: Add filters for critical conditions:
  ```
  level:error OR level:fatal
  environment:production
  ```

**Actions**:
- **Send a notification via**: `Email`
- **Send to**: `Team` (or specific email addresses)
- **Email addresses**: Add your team emails:
  - `admin@swaeduae.ae`
  - `tech@swaeduae.ae`
  - Add other team member emails

### 3. Create High Volume Error Alert
**Alert Rule Name**: `High Error Volume - Production`

**Conditions**:
- **When**: `The count of events`
- **Is**: `greater than`
- **Value**: `10`
- **In**: `1 minute`
- **Environment**: `production`

**Actions**:
- **Send a notification via**: `Email`
- **Send to**: `Team`

## 💬 Slack Notifications Setup

### 1. Install Sentry Slack Integration
1. In your Sentry project, go to **Settings** → **Integrations**
2. Find **Slack** and click **Install**
3. Authorize Sentry to access your Slack workspace
4. Select the channels where you want notifications

### 2. Configure Slack Channels
Recommended channel setup:
- `#alerts-critical` - For critical errors and system failures
- `#alerts-errors` - For general error notifications
- `#dev-notifications` - For development team alerts

### 3. Create Slack Alert Rules

#### Critical Errors to Slack
**Alert Rule Name**: `Critical Errors - Slack`

**Conditions**:
- **When**: `An event is seen`
- **Environment**: `production`
- **Level**: `error` or `fatal`
- **Tags**: `component:server OR component:client OR component:edge`

**Actions**:
- **Send a notification via**: `Slack`
- **Workspace**: Your Slack workspace
- **Channel**: `#alerts-critical`
- **Tags**: Include `environment`, `level`, `url`, `user.email`

#### Performance Issues to Slack
**Alert Rule Name**: `Performance Issues - Slack`

**Conditions**:
- **When**: `The average of transaction.duration`
- **Is**: `greater than`
- **Value**: `2000` (2 seconds)
- **In**: `5 minutes`
- **Environment**: `production`

**Actions**:
- **Send a notification via**: `Slack`
- **Channel**: `#alerts-errors`

## 🔧 Advanced Alert Configurations

### 1. User Impact Alerts
**Alert Rule Name**: `High User Impact Errors`

**Conditions**:
- **When**: `The count of users affected by an event`
- **Is**: `greater than`
- **Value**: `5`
- **In**: `10 minutes`
- **Environment**: `production`

### 2. Database Connection Errors
**Alert Rule Name**: `Database Connection Issues`

**Conditions**:
- **When**: `An event is seen`
- **Environment**: `production`
- **Message**: `contains` `database` OR `connection` OR `postgres`
- **Level**: `error`

### 3. Authentication Failures
**Alert Rule Name**: `Authentication Failures`

**Conditions**:
- **When**: `The count of events`
- **Is**: `greater than`
- **Value**: `20`
- **In**: `5 minutes`
- **Environment**: `production`
- **Message**: `contains` `auth` OR `login` OR `unauthorized`

## 📊 Issue Ownership and Assignment

### 1. Set Up Code Owners
1. Go to **Settings** → **Ownership Rules**
2. Add ownership rules based on file paths:
   ```
   # Frontend components
   app/dashboard/* admin@swaeduae.ae
   app/auth/* security@swaeduae.ae
   
   # Backend API
   app/api/* backend@swaeduae.ae
   
   # Database related
   database/* dba@swaeduae.ae
   ```

### 2. Auto-Assignment Rules
Configure automatic issue assignment:
- **Path-based**: Assign based on file paths
- **Tag-based**: Assign based on error tags
- **Team-based**: Assign to specific teams

## 🎯 Alert Tuning and Best Practices

### 1. Alert Frequency Limits
- Set **rate limits** to avoid spam:
  - Maximum 1 alert per issue per hour
  - Maximum 10 alerts per project per hour

### 2. Environment Filtering
- Only alert on `production` environment
- Use separate rules for `staging` if needed

### 3. Error Grouping
Configure intelligent error grouping:
- **Fingerprint rules** for similar errors
- **Stack trace grouping** for code-related issues

### 4. Alert Escalation
Set up escalation policies:
1. **Level 1**: Email notification (immediate)
2. **Level 2**: Slack notification (if not resolved in 15 minutes)
3. **Level 3**: SMS/Phone call (if not resolved in 1 hour)

## 📱 Mobile Notifications

### 1. Sentry Mobile App
1. Download the Sentry mobile app
2. Log in with your account
3. Enable push notifications for your project

### 2. Configure Mobile Alerts
- **Critical errors**: Immediate push notification
- **High volume**: Push notification with summary
- **Performance issues**: Daily digest

## 🔍 Monitoring Dashboard Setup

### 1. Create Custom Dashboards
1. Go to **Dashboards** in Sentry
2. Create dashboards for:
   - **Error Overview**: Error rates, affected users
   - **Performance**: Transaction times, throughput
   - **User Experience**: User satisfaction, core web vitals

### 2. Key Metrics to Monitor
- **Error Rate**: Percentage of requests with errors
- **Apdex Score**: Application performance index
- **User Satisfaction**: Based on performance thresholds
- **Release Health**: Success rate of new deployments

## 🧪 Testing Your Alerts

### 1. Test Error Alerts
Run this test script to verify alerts are working:

```javascript
// test-sentry-alerts.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://ef3fb2a006048529732cd96985d28d40@o4510252954943488.ingest.de.sentry.io/4510252958810192',
  environment: 'production'
});

// Test critical error
Sentry.captureException(new Error('TEST: Critical error alert verification'));

// Test high volume (run multiple times)
for (let i = 0; i < 15; i++) {
  Sentry.captureMessage(`TEST: High volume alert ${i}`, 'error');
}
```

### 2. Verify Alert Delivery
1. Run the test script
2. Check your email inbox
3. Check your Slack channels
4. Verify mobile notifications

## 📋 Alert Checklist

- [ ] Email notifications configured for critical errors
- [ ] Slack integration installed and configured
- [ ] Alert rules created for different error types
- [ ] Rate limiting configured to prevent spam
- [ ] Team members added to notification lists
- [ ] Mobile app installed and configured
- [ ] Test alerts sent and verified
- [ ] Escalation policies defined
- [ ] Dashboard created for monitoring
- [ ] Documentation shared with team

## 🚀 Quick Setup Commands

After configuring alerts in the Sentry UI, you can test them with:

```bash
# Test critical error alert
node -e "
const Sentry = require('@sentry/node');
Sentry.init({dsn: process.env.SENTRY_DSN, environment: 'production'});
Sentry.captureException(new Error('TEST: Alert configuration verification'));
setTimeout(() => process.exit(0), 2000);
"

# Test performance alert (if configured)
node -e "
const Sentry = require('@sentry/node');
Sentry.init({dsn: process.env.SENTRY_DSN, environment: 'production'});
const transaction = Sentry.startTransaction({name: 'test-performance'});
setTimeout(() => {
  transaction.setStatus('ok');
  transaction.finish();
}, 3000);
"
```

## 📞 Support and Troubleshooting

If you encounter issues with alert configuration:

1. **Check Integration Status**: Ensure Slack/Email integrations are active
2. **Verify Permissions**: Make sure you have admin access to the Sentry project
3. **Test Connectivity**: Use the test commands above
4. **Review Logs**: Check Sentry's integration logs for errors
5. **Contact Support**: Reach out to Sentry support if needed

---

**Next Steps**: After configuring alerts, monitor them for a few days and adjust thresholds based on your application's normal behavior patterns.