# SwaedUAE Platform - Deployment Guide

## Quick Deploy to Vercel

1. **Prerequisites**:
   - GitHub account
   - Vercel account (free tier is fine)

2. **Steps**:
   
   a. Push the code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SwaedUAE platform"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

   b. Connect to Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js project
   
   c. Environment Variables (already configured in code):
   - No additional env vars needed - Supabase credentials are hardcoded in `lib/supabase.ts`

   d. Deploy:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your site will be live!

## Alternative: Manual Build and Deploy

If you have Node.js 20+ locally:

```bash
cd swaeduae-platform
pnpm install
pnpm build
```

Then deploy the `.next` folder to any Node.js hosting service.

## What's Included

### Backend (Supabase):
- 22 database tables with complete schema
- Row Level Security policies for all tables
- 4 storage buckets (profile-photos, event-photos, organization-documents, certificates)
- Sample data (10 badges, 4 educational institutions, system settings)

### Frontend (Next.js):
- Homepage with hero section and features
- Authentication (login/register)
- User dashboard with stats
- Events listing with search and filters
- About, Contact, FAQ, Privacy, Terms pages
- Organizations directory (placeholder)
- Responsive design with UAE Ministry color scheme

### Core Features Implemented:
1. User authentication and registration
2. Multi-role support (volunteer, student, organization)
3. Event browsing with filters
4. Dashboard with volunteer statistics
5. Profile management
6. Complete UAE Ministry design system
7. Mobile-responsive layout

### Ready for Extension:
- QR code system (libraries installed)
- Gamification system (database ready)
- Certificate generation (database ready)
- Organization portal (structure in place)
- Admin dashboard (can be added)

## Supabase Configuration

Already configured with:
- Project URL: https://mlvbiftpsadphfihrnqx.supabase.co
- Anonymous key: Embedded in code
- All tables created
- RLS policies enabled
- Storage buckets ready

## Post-Deployment Tasks

1. Create test accounts through the register page
2. Add sample events through the database
3. Test authentication flow
4. Customize content as needed
5. Add real organization data

## Support

For deployment issues:
- Check Vercel build logs
- Ensure Node.js version >= 20.9.0 on deployment platform
- Verify Supabase connection

## Production Checklist

- [x] Database schema created
- [x] RLS policies configured
- [x] Storage buckets created
- [x] Sample data inserted
- [x] Authentication flow implemented
- [x] Core pages built
- [x] Responsive design
- [ ] Add real content
- [ ] Configure custom domain
- [ ] Enable analytics
- [ ] Setup error monitoring
