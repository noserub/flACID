# Supabase Setup Guide

## 1. Environment Variables

### Local development

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace the placeholders:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api).

### Vercel (Preview & Production)

For newsletter signup and other Supabase features to work on Vercel deployments:

1. Open your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings → Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key
4. Apply to **Preview** and **Production**
5. Redeploy

---

## 2. Run Migrations

Run these SQL scripts in the **Supabase SQL Editor** (Dashboard → SQL Editor).

### Step 1: Initial Schema

Run `src/supabase/migrations/001_initial_schema.sql` first. This creates:

- `tracks` – music tracks
- `albums` – discography
- `tour_dates` – tour dates
- `photos` – gallery images
- Indexes and RLS policies

### Step 2: Profiles & Auth

Run `src/supabase/migrations/002_profiles_and_rls.sql`. This creates:

- `profiles` – user profiles for auth
- RLS policies for profile access

---

## 3. Storage Buckets (Optional)

For image and audio uploads, create these storage buckets in Supabase:

- `images` – general images
- `audio` – music tracks
- `covers` – album art
- `photos` – gallery photos

Configure each bucket with appropriate public/private access.

---

## 4. Auth Bypass (Development)

For local development without Supabase Auth, use the bypass:

```javascript
// In browser console or a dev component:
localStorage.setItem('auth_bypass', 'true');
```

Reload the page. Edit mode will work without signing in. Remove or set to `'false'` for production.
