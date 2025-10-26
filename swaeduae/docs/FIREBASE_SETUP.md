# SwaedUAE Firebase Project Setup Guide

This guide provides step-by-step instructions for setting up the Firebase project for SwaedUAE.

## Firebase Console Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `swaeduae` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Enable
   - **Google**: Enable (configure OAuth)
   - **Facebook**: Enable (requires Facebook App setup)
   - **Apple**: Enable (requires Apple Developer account)

### 3. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode" (we'll deploy custom rules)
4. Choose location: `asia-southeast1` (Singapore - closest to UAE)
5. Click "Enable"

### 4. Set up Cloud Storage

1. Go to "Storage"
2. Click "Get started"
3. Start in production mode
4. Choose location: `asia-southeast1`
5. Click "Done"

### 5. Enable Cloud Functions

1. Go to "Functions"
2. Click "Get started"
3. Follow the setup instructions
4. Upgrade to Blaze plan (pay-as-you-go) - required for Cloud Functions

### 6. Configure Hosting

1. Go to "Hosting"
2. Click "Get started"
3. Follow the setup wizard (we'll use Firebase CLI for actual setup)

### 7. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click on web icon (</>) to add a web app
4. Register app with nickname: "SwaedUAE Web"
5. Copy the Firebase configuration object
6. Save it for `.env.local` file

### 8. Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Confirm and download the JSON file
4. Keep this file secure - DO NOT commit to Git
5. Extract the values for `.env.local`:
   - `project_id`
   - `client_email`
   - `private_key`

## Local Development Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase in Project

From the project root directory:

```bash
firebase init
```

Select the following features:
- [ ] Firestore
- [ ] Functions
- [ ] Hosting
- [ ] Storage
- [ ] Emulators

Configuration choices:
- **Firestore rules**: `firebase/firestore.rules`
- **Firestore indexes**: `firebase/firestore.indexes.json`
- **Functions language**: TypeScript
- **Functions directory**: `functions`
- **Hosting public directory**: `out`
- **Single-page app**: Yes
- **GitHub automatic builds**: No (we'll use GitHub Actions)
- **Storage rules**: `firebase/storage.rules`
- **Emulators**: Select all (Auth, Functions, Firestore, Storage)

### 4. Configure Environment Variables

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Fill in the Firebase configuration values you copied earlier

### 5. Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 6. Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

## GitHub Repository Setup

### 1. Connect to GitHub

If not already connected:

```bash
git remote add origin https://github.com/alsadi22/swaedfirebase.git
```

### 2. Add GitHub Secrets

Go to your GitHub repository > Settings > Secrets and variables > Actions

Add the following secrets:

1. **FIREBASE_SERVICE_ACCOUNT**
   - Value: The entire JSON content from the service account key file
   
2. **FIREBASE_TOKEN**
   - Get it by running: `firebase login:ci`
   - Copy the token provided
   
3. **FIREBASE_PROJECT_ID**
   - Your Firebase project ID
   
4. **NEXT_PUBLIC_FIREBASE_API_KEY**
5. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
6. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
7. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
8. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
9. **NEXT_PUBLIC_FIREBASE_APP_ID**
   - All these values from your Firebase config

### 3. Test GitHub Actions

Push to the main branch to trigger the deployment workflow:

```bash
git add .
git commit -m "Initial Firebase setup"
git push origin main
```

## Firebase Emulators for Local Development

### Start Emulators

```bash
pnpm emulators
```

This starts:
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Functions Emulator**: http://localhost:5001
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### Using Emulators

Set this environment variable in your `.env.local`:
```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

The app will automatically connect to emulators in development mode.

### Export/Import Emulator Data

Export data:
```bash
pnpm emulators:export
```

Import data on next start:
```bash
pnpm emulators:import
```

## Testing the Setup

### 1. Test Authentication

1. Start the dev server: `pnpm dev`
2. Go to http://localhost:3000
3. Try registering a new account
4. Check Firebase Console > Authentication to see the user

### 2. Test Firestore

1. Create some data through the app
2. Check Firebase Console > Firestore Database
3. Verify data is being stored correctly

### 3. Test Cloud Functions

1. Deploy a test function
2. Trigger it through the app or Firebase Console
3. Check Firebase Console > Functions > Logs

### 4. Test Storage

1. Upload a file through the app
2. Check Firebase Console > Storage
3. Verify file is stored correctly

## Deployment

### Manual Deployment

```bash
# Build the app
pnpm build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Automatic Deployment via GitHub Actions

Push to `main` or `production` branch:

```bash
git push origin main
```

The GitHub Actions workflow will:
1. Run linting and type checking
2. Build the Next.js app
3. Build Cloud Functions
4. Deploy to Firebase Hosting
5. Deploy Cloud Functions
6. Deploy security rules

## Monitoring and Maintenance

### View Logs

```bash
# Function logs
firebase functions:log

# All logs
firebase functions:log --only <function-name>
```

### Monitor Performance

1. Go to Firebase Console > Performance
2. View app performance metrics
3. Identify and fix bottlenecks

### Check Usage

1. Go to Firebase Console > Usage and billing
2. Monitor your usage against quotas
3. Set up billing alerts

## Troubleshooting

### Common Issues

1. **Functions deployment fails**
   - Ensure you're on the Blaze plan
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed

2. **Authentication not working**
   - Verify environment variables
   - Check Firebase Console > Authentication settings
   - Ensure OAuth credentials are configured

3. **Firestore permission denied**
   - Check security rules
   - Verify user authentication
   - Review Firestore indexes

4. **Storage upload fails**
   - Check storage rules
   - Verify file size limits
   - Check CORS configuration

### Getting Help

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: Tag questions with `firebase`

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] Service account key stored securely
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] Authentication providers properly configured
- [ ] Billing alerts set up
- [ ] CORS configured for production domain
- [ ] GitHub secrets properly configured
- [ ] Production API keys different from development

## Next Steps

After completing this setup:

1. Start developing the core features
2. Set up staging environment
3. Configure custom domain
4. Set up monitoring and analytics
5. Implement backup strategy
6. Create runbook for common operations

---

For additional help, refer to the main README.md or contact the development team.
