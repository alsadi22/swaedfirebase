# SwaedUAE Deployment Instructions

## Current Status
The SwaedUAE platform foundation and authentication system are complete and ready for deployment after Firebase configuration.

## Pre-Deployment Checklist

### 1. Firebase Project Setup (REQUIRED)

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `swaeduae-prod` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Click "Create project"

#### Upgrade to Blaze Plan
Firebase Cloud Functions require the Blaze (pay-as-you-go) plan:
1. Go to Project Settings > Usage and billing
2. Click "Modify plan"
3. Select "Blaze plan"
4. Add payment method

### 2. Enable Firebase Services

#### Authentication
1. Go to Authentication > Sign-in method
2. Enable the following providers:
   - **Email/Password**: Click "Enable" and save
   - **Google**: 
     - Click "Enable"
     - Add support email
     - Save
   - **Facebook**:
     - Create Facebook App at [developers.facebook.com](https://developers.facebook.com)
     - Get App ID and App Secret
     - Add to Firebase
     - Add OAuth redirect URI to Facebook app
   - **Apple Sign In**:
     - Requires Apple Developer account
     - Configure Sign in with Apple
     - Add configuration to Firebase

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Select "Start in production mode"
4. Choose location: `asia-southeast1` (Singapore - closest to UAE)
5. Click "Enable"

#### Cloud Storage
1. Go to Storage
2. Click "Get started"
3. Start in production mode
4. Choose location: `asia-southeast1`
5. Click "Done"

#### Cloud Functions
1. Go to Functions
2. Click "Get started"
3. Follow the setup instructions
4. Functions will be deployed via CLI

#### Hosting
1. Go to Hosting
2. Click "Get started"
3. We'll use Firebase CLI for deployment

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click web icon (</>) to add a web app
4. Register app with nickname: "SwaedUAE Web"
5. Copy the Firebase configuration object
6. Save these values for `.env.local`

### 4. Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Confirm and download the JSON file
4. **IMPORTANT**: Keep this file secure - DO NOT commit to Git
5. Extract these values for `.env.local`:
   - `project_id`
   - `client_email`
   - `private_key`

### 5. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

### 6. Deploy Firebase Security Rules

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project (if not done)
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules
```

### 7. Build and Deploy Cloud Functions

```bash
# Install dependencies
cd functions
npm install

# Build functions
npm run build

# Deploy functions
cd ..
firebase deploy --only functions
```

### 8. Build and Test Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# In another terminal, start Firebase emulators
pnpm emulators
```

Visit http://localhost:3000 and test:
- Homepage loads correctly
- Login page accessible
- Registration page accessible
- All links working

### 9. Deploy to Production

#### Option A: Deploy to Firebase Hosting

```bash
# Build the application
pnpm build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### Option B: Deploy to Vercel

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 10. Configure GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository:

1. Go to GitHub repository > Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `FIREBASE_SERVICE_ACCOUNT`: Full JSON from service account file
   - `FIREBASE_TOKEN`: Run `firebase login:ci` and copy token
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Post-Deployment Testing

### Test Authentication Flows

1. **Email Registration**
   - Register new volunteer account
   - Verify email sent
   - Complete email verification
   - Login with credentials

2. **Social Login** (if configured)
   - Test Google login
   - Test Facebook login
   - Test Apple login
   - Verify profile creation

3. **Organization Registration**
   - Register organization account
   - Verify all fields save correctly
   - Test login

4. **Password Reset**
   - Request password reset
   - Verify email received
   - Reset password successfully
   - Login with new password

5. **Role-Based Access**
   - Login as volunteer
   - Verify volunteer dashboard
   - Login as organization admin
   - Verify organization dashboard

### Monitor Application

1. Check Firebase Console > Authentication for new users
2. Check Firestore for user documents
3. Check Cloud Functions logs for errors
4. Monitor performance in Firebase Console

## Security Checklist

- [ ] Environment variables configured (not committed to Git)
- [ ] Service account key secured (not in repository)
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Firebase Authentication enabled
- [ ] OAuth credentials configured
- [ ] HTTPS enforced
- [ ] CORS configured correctly

## Performance Optimization

- [ ] Next.js build optimized
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] CDN configured (Firebase Hosting or Vercel)
- [ ] Caching strategies implemented

## Monitoring & Maintenance

### Set Up Monitoring

1. Enable Firebase Performance Monitoring
2. Set up error tracking (Firebase Crashlytics or Sentry)
3. Configure usage alerts
4. Set up billing alerts

### Regular Maintenance

- Monitor Firebase usage and costs
- Review security rules periodically
- Update dependencies monthly
- Backup Firestore data weekly
- Review and rotate API keys quarterly

## Troubleshooting

### Common Issues

**Firebase Authentication Not Working**
- Verify environment variables
- Check Firebase Console > Authentication settings
- Ensure OAuth credentials configured
- Check browser console for errors

**Firestore Permission Denied**
- Verify security rules deployed
- Check user authentication state
- Review Firestore rules in Firebase Console

**Build Fails**
- Run `pnpm type-check` locally
- Fix TypeScript errors
- Ensure all dependencies installed

**OAuth Login Fails**
- Verify OAuth app configuration
- Check redirect URLs match
- Ensure OAuth consent screen configured

## Support

- Firebase Documentation: https://firebase.google.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Project Documentation: See `/docs` folder

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Ready for deployment after Firebase setup
