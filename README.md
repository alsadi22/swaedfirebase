# SwaedUAE - UAE's Premier Volunteer Management Platform

A comprehensive volunteer management platform connecting volunteers with verified organizations across the UAE.

## Features

- Multi-role authentication (Volunteer, Student, Organization, Admin, Super Admin)
- Event discovery and management
- QR code attendance tracking with GPS verification
- Gamification system with badges and achievements
- Student academic integration with guardian consent
- Certificate generation and verification
- Real-time notifications
- Arabic/English language support
- Progressive Web App capabilities

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS with UAE Ministry design system
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React

## Database Schema

22 tables including:
- User profiles and roles
- Organizations and members
- Events and sessions
- Attendance tracking
- Volunteer hours
- Gamification (badges, achievements)
- Certificates
- Notifications
- Activity logs

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Design System

Official UAE Ministry theme colors:
- Background: `#FDFBF7` (Warm Off-White)
- Primary Text: `#5C3A1F` (Deep Muted Brown)
- Accent: `#D2A04A` (Muted Gold/Ochre)
- UAE Flag Colors: Red `#CE1126`, Green `#00732F`, Black `#000000`

## Project Structure

```
swaeduae-platform/
├── app/              # Next.js app directory
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # User dashboard
│   ├── events/       # Event pages
│   └── ...
├── components/       # React components
│   ├── ui/           # UI components
│   └── layout/       # Layout components
├── lib/              # Utilities and Supabase client
└── supabase/         # Database migrations
```

## Deployment

The application is deployed on Vercel with automatic Supabase integration.

## License

Copyright 2025 SwaedUAE. All rights reserved.

## Contact

- Email: support@swaeduae.ae
- Phone: +971 4 123 4567
- Location: Dubai, UAE
