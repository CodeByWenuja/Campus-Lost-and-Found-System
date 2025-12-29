# Quick Start Guide

Get your Lost & Found app running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and API keys from Settings > API

## Step 3: Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials.

## Step 4: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Add keys to `.env.local`.

## Step 5: Run Migrations

1. Open Supabase Dashboard > SQL Editor
2. Copy content from `migrations/schema.sql`
3. Paste and run

## Step 6: Create Storage Bucket

1. Supabase Dashboard > Storage
2. Create bucket named `images`
3. Make it **Public**

## Step 7: Seed Database (Optional)

```bash
npm run seed
```

## Step 8: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run tests
npm run lint     # Check code quality
npm run seed     # Add sample data
```

## Need Help?

Check the full [README.md](./README.md) for detailed instructions.
