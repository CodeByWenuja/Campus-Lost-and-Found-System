# Lost & Found - University Campus PWA

A production-ready Progressive Web App (PWA) for managing lost and found items on university campuses. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Project Overview

Lost & Found is a gamified platform that helps students, faculty, and staff reconnect with their lost belongings. Users can browse found items, post new findings, claim items, and earn points and badges for their contributions to the community.

### Key Features

- **Item Management**: Post, browse, and claim lost items with up to 3 optimized images
- **Real-time Updates**: Live feed with infinite scroll
- **Gamification**: Points system, badges, and leaderboards to encourage participation
- **Image Optimization**: Automatic compression and WebP conversion
- **PWA Support**: Offline capabilities and installable on mobile devices
- **Push Notifications**: Real-time updates for item status changes
- **Admin Dashboard**: Moderate content and manage users
- **Responsive Design**: Apple-grade UI with clean, accessible design

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js App Router (React 19 + TypeScript)          │  │
│  │  - Pages: Feed, Post, Item Detail, Profile, Admin    │  │
│  │  - Components: Card, ImageUploader, Carousel, etc.   │  │
│  │  - PWA: Service Worker, Offline Support              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase Backend                                     │  │
│  │  - PostgreSQL Database (RLS enabled)                 │  │
│  │  - Authentication (Email/OAuth)                      │  │
│  │  - Storage (Image uploads)                           │  │
│  │  - Real-time Subscriptions                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Deployment & CI/CD                        │
│  - Vercel (Hosting)                                          │
│  - GitHub Actions (CI/CD Pipeline)                           │
│  - Web Push (Notifications via VAPID)                        │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15.1.0 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4
- **PWA**: next-pwa 5.6
- **Image Processing**: browser-image-compression
- **Animations**: canvas-confetti

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### DevOps
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Testing**: Vitest + Playwright
- **Code Quality**: ESLint + Prettier

## Setup Instructions

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- A Supabase account
- A Vercel account (for deployment)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lost-and-found
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Go to Project Settings > API > Service Role and copy the service role key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# VAPID keys (see section below)
PUSH_VAPID_PUBLIC=your-vapid-public-key
PUSH_VAPID_PRIVATE=your-vapid-private-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 5. Generate VAPID Keys for Push Notifications

```bash
npx web-push generate-vapid-keys
```

Copy the generated keys to your `.env.local` file.

### 6. Run Database Migrations

In your Supabase project dashboard:

1. Go to SQL Editor
2. Open `migrations/schema.sql`
3. Copy the entire content
4. Paste into the SQL Editor and click "Run"

This will create all tables, indexes, functions, and Row Level Security policies.

### 7. Configure Supabase Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `images`
3. Set it as **Public**
4. Add the following policy for uploads:

```sql
-- Policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

### 8. Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

### 9. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Local Development Guide

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests with Vitest
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run seed` - Seed database with sample data

### Project Structure

```
lost-and-found/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Feed page
│   │   ├── about/           # About page
│   │   ├── post/new/        # New post page
│   │   ├── item/[id]/       # Item detail page
│   │   ├── profile/[id]/    # Profile page
│   │   ├── admin/           # Admin dashboard
│   │   └── auth/            # Authentication pages
│   ├── components/          # React components
│   │   ├── Card.tsx
│   │   ├── ImageCarousel.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── Badge.tsx
│   │   ├── Leaderboard.tsx
│   │   └── Navigation.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useConfetti.ts
│   ├── lib/                 # Utility functions
│   │   ├── supabase/        # Supabase clients
│   │   ├── gamification.ts  # Points & badges logic
│   │   └── image-utils.ts   # Image processing
│   └── types/               # TypeScript types
│       └── database.ts
├── migrations/              # Database migrations
│   └── schema.sql
├── scripts/                 # Utility scripts
│   └── seed.ts
├── test/                    # Unit tests
├── e2e/                     # E2E tests
├── public/                  # Static assets
│   └── manifest.json        # PWA manifest
└── .github/workflows/       # CI/CD workflows
```

### Adding a New Admin User

Admins must be manually added to the database:

```sql
-- Replace with the actual user ID from auth.users
INSERT INTO admins (user_id) VALUES ('user-uuid-here');
```

## Deployment Guide (Vercel)

### 1. Connect Your Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

### 2. Configure Environment Variables

In Vercel dashboard, add all environment variables from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUSH_VAPID_PUBLIC`
- `PUSH_VAPID_PRIVATE`

### 3. Deploy

Click "Deploy" and wait for the build to complete.

### 4. Configure Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 5. Enable PWA Features

Ensure your production URL is added to:
- Supabase Auth redirect URLs
- Web Push subscription endpoint

## Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `PUSH_VAPID_PUBLIC` | VAPID public key for push notifications | Yes |
| `PUSH_VAPID_PRIVATE` | VAPID private key for push notifications | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NODE_ENV` | Environment (development/production) | Auto-set |

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
npm test
```

### E2E Tests

Run end-to-end tests with Playwright:

```bash
npm run test:e2e
```

To run tests in UI mode:

```bash
npx playwright test --ui
```

## Manual Setup Tasks Checklist

- [ ] Create Supabase project
- [ ] Run database migrations (`migrations/schema.sql`)
- [ ] Create `images` storage bucket in Supabase (public)
- [ ] Configure storage policies for image uploads
- [ ] Enable Email authentication in Supabase Auth
- [ ] (Optional) Enable OAuth providers (Google, GitHub)
- [ ] Generate VAPID keys for push notifications
- [ ] Add environment variables to `.env.local`
- [ ] Run seed script to populate sample data
- [ ] Add at least one admin user to `admins` table
- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Configure custom domain (optional)
- [ ] Test PWA installation on mobile device

## Features in Detail

### Image Upload & Optimization

- Client-side compression to WebP format
- Maximum 3 images per post
- Auto-resize to 1024px max width
- Quality optimization (~70%)
- Total size limit: 1.5MB

### Gamification System

**Points:**
- New post: +10 points
- Verified claim: +20 points
- Comment: +2 points

**Badges:**
- **First Post**: Created your first post
- **Finder Level 1**: Posted 10 items
- **Finder Level 2**: Posted 25 items
- **Finder Level 3**: Posted 50 items
- **Campus Hero**: Weekly top contributor

### Security Features

- Row Level Security (RLS) on all tables
- Authentication required for posting, claiming, commenting
- Admin-only access to dashboard
- Secure image storage with Supabase
- CSRF protection via Supabase Auth

## Troubleshooting

### Images Not Loading

- Check Supabase storage bucket is public
- Verify image upload policy is correct
- Check browser console for CORS errors

### Authentication Issues

- Verify Supabase URL and keys are correct
- Check if email confirmation is required
- Ensure redirect URLs are configured in Supabase

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check all environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Create a Pull Request

## License

MIT License - feel free to use this project for your university or organization.

## Support

For issues and questions:
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review Supabase documentation
- Check Next.js documentation

---

Built with ❤️ for campus communities
