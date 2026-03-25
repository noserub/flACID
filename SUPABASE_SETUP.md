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

Production builds require both variables (enforced in `vite.config.ts`).

---

## 2. Run Migrations

Run these SQL scripts in order in the **Supabase SQL Editor** (Dashboard → SQL Editor).

| Order | File | Purpose |
|------|------|---------|
| 1 | `supabase/migrations/001_initial_schema.sql` | Tracks, albums, tour_dates, photos, RLS |
| 2 | `supabase/migrations/002_profiles_and_rls.sql` | Profiles |
| 3 | `supabase/migrations/003_site_settings_and_schema_updates.sql` | `site_settings`, schema tweaks |
| 4 | `supabase/migrations/004_tour_gallery_subtitles_newsletter.sql` | Newsletter table, tour status, subtitles |
| 5 | `supabase/migrations/005_site_admins_rls.sql` | **Site admins** + replace broad authenticated writes with admin-only policies |
| 6 | `supabase/migrations/006_storage_admin_rls.sql` | Storage write policies (run **after** buckets exist; see below) |

### Site admins (required for Edit mode / Publish)

Migration **005** creates `site_admins` and restricts CMS + DB writes to users listed there. **Authenticated users who are not in this table cannot publish or upload.**

After migration 005, add your user id once (from **Authentication → Users** in the dashboard, or query `auth.users`):

```sql
INSERT INTO public.site_admins (user_id)
VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
ON CONFLICT DO NOTHING;
```

---

## 3. Storage Buckets

Create buckets `audio`, `covers`, and `photos` as described in `src/supabase/storage-setup.md`, then run migration **006** to apply admin-only storage policies.

---

## 4. Legacy note (auth bypass)

The app does **not** implement `localStorage.auth_bypass`. Edit mode requires a signed-in user who appears in `site_admins`.
