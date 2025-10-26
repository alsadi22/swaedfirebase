# SwaedUAE - UAE Volunteer Management Platform

A comprehensive volunteer management platform for the United Arab Emirates, featuring QR check-in/out, GPS geofencing, certificate generation, and multi-role authentication.

## Features

- Multi-role authentication (Volunteers, Organizations, Admins)
- Event management with QR code check-in/out
- GPS geofencing for attendance verification
- Digital certificate generation and verification
- Real-time notifications
- Bilingual support (Arabic/English)
- Payment integration with Stripe
- Progressive Web App (PWA) capabilities
- Admin dashboard with analytics

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **Maps**: Leaflet with React-Leaflet
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **PDF Generation**: jsPDF
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack React Query

## Project Structure

```
swaeduae/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components (buttons, dialogs, etc.)
│   ├── forms/            # Form components
│   ├── auth/             # Authentication components
│   ├── events/           # Event-related components
│   ├── attendance/       # Attendance tracking components
│   ├── certificates/     # Certificate components
│   ├── admin/            # Admin dashboard components
│   └── shared/           # Shared components
├── lib/                   # Utility functions and configurations
│   ├── firebase/         # Firebase configuration
│   └── utils.ts          # Utility functions
├── types/                 # TypeScript type definitions
├── functions/             # Firebase Cloud Functions
│   └── src/              # Functions source code
├── firebase/              # Firebase configuration files
│   ├── firestore.rules   # Firestore security rules
│   ├── storage.rules     # Storage security rules
│   └── firestore.indexes.json
├── public/                # Static assets
└── docs/                  # Documentation

```

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm (recommended) or npm
- Firebase CLI (`npm install -g firebase-tools`)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alsadi22/swaedfirebase.git
cd swaedfirebase
```

2. Install dependencies:
```bash
pnpm install
```

3. Install Firebase Functions dependencies:
```bash
cd functions
npm install
cd ..
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable the following Firebase services:
   - Authentication (Email/Password, Google, Facebook, Apple)
   - Firestore Database
   - Cloud Storage
   - Cloud Functions
   - Hosting

3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click on the web app icon or "Add app"
   - Copy the configuration values

4. Generate Firebase Admin SDK credentials:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

5. Create `.env.local` file in the project root:
```bash
cp .env.local.example .env.local
```

6. Fill in your Firebase credentials in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

7. Initialize Firebase in your project:
```bash
firebase login
firebase init
```

Select the following options:
- Firestore
- Functions
- Hosting
- Storage
- Emulators

8. Deploy Firestore rules and indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### Development

1. Run the development server:
```bash
pnpm dev
```

2. Run Firebase Emulators (recommended for local development):
```bash
pnpm emulators
```

This will start:
- Firestore Emulator: localhost:8080
- Authentication Emulator: localhost:9099
- Storage Emulator: localhost:9199
- Functions Emulator: localhost:5001
- Emulator UI: localhost:4000

3. Access the application at [http://localhost:3000](http://localhost:3000)

### Building for Production

1. Build the Next.js application:
```bash
pnpm build
```

2. Build Cloud Functions:
```bash
pnpm functions:build
```

3. Deploy to Firebase:
```bash
pnpm deploy
```

Or deploy specific services:
```bash
pnpm deploy:hosting    # Deploy hosting only
pnpm deploy:functions  # Deploy functions only
pnpm deploy:rules      # Deploy security rules only
```

## GitHub Integration

### Setting up GitHub Actions

1. Add the following secrets to your GitHub repository:
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON
   - `FIREBASE_TOKEN`: Firebase CI token (`firebase login:ci`)
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_*`: All public Firebase config values

2. Push to `main` or `production` branch to trigger automatic deployment

## Authentication Roles

### Volunteers
- Browse and apply for events
- Track volunteer hours
- View certificates
- Login via email, social media, or UAE Pass

### Organizations
- Create and manage events
- Review volunteer applications
- Generate certificates
- Track organization impact
- Email/password authentication only

### Administrators
- Verify organizations
- Approve events
- Monitor platform activity
- Manage users and content
- Access analytics and reports

## Key Features Implementation

### QR Code Check-in/out
- Unique QR codes generated for each event
- GPS validation at time of scanning
- Automatic hour calculation
- Violation detection for early departures

### GPS Geofencing
- Configurable geofence radius (50-500m)
- Real-time location tracking during events
- Movement pattern analysis
- Privacy-focused (data auto-deleted after 30 days)

### Certificate Generation
- Automatic generation upon event completion
- QR code verification
- Downloadable PDF format
- Public verification portal

### Gamification
- Badge system based on hours and achievements
- Local and national leaderboards
- Progress tracking
- Social sharing features

## Security

- Firebase Authentication with JWT tokens
- Role-based access control (RBAC)
- Firestore security rules
- Storage security rules
- Input validation with Zod
- HTTPS encryption
- Rate limiting

## Environment Variables

See `.env.local.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential to SwaedUAE.

## Support

For support and questions, contact the development team.

## Roadmap

### Phase 1 (Current)
- Core platform features
- Basic authentication
- Event management
- QR attendance system

### Phase 2
- UAE Pass integration
- Mobile app (React Native)
- Advanced analytics
- Corporate CSR portal

### Phase 3
- Blockchain certificate verification
- AI-powered volunteer matching
- International expansion
- Advanced integrations

---

Built with dedication for the UAE volunteer community
