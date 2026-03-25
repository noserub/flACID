# Supabase Storage Setup

## Storage Buckets Configuration

Create the following storage buckets in your Supabase project dashboard:

### 1. `audio` Bucket
**Purpose:** Store music track files (MP3, OGG, FLAC)

**Settings:**
- Public: Yes
- File size limit: 50MB
- Allowed MIME types: `audio/mpeg`, `audio/mp3`, `audio/ogg`, `audio/flac`
- Cache Control: `public, max-age=31536000` (1 year)

**RLS Policies:** use `supabase/migrations/006_storage_admin_rls.sql` after buckets exist (replaces broad “authenticated” writes with **site admin** checks via `public.is_site_admin()` from migration 005).

Legacy reference — public read:
```sql
CREATE POLICY "Public audio files are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio');
```
Writes are defined in **006** (site admins only).

### 2. `covers` Bucket
**Purpose:** Store album and track cover images

**Settings:**
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Cache Control: `public, max-age=31536000` (1 year)

**RLS:** public read (run once in SQL Editor if missing):

```sql
CREATE POLICY "Public covers are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');
```

INSERT/UPDATE/DELETE for covers are in **006**.

### 3. `photos` Bucket
**Purpose:** Store photo gallery images

**Settings:**
- Public: Yes
- File size limit: 10MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Cache Control: `public, max-age=31536000` (1 year)

**RLS:** public read:

```sql
CREATE POLICY "Public photos are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');
```

INSERT/DELETE for photos are in **006**.

## CORS (Music player / Web Audio API)

The music player uses the Web Audio API (AnalyserNode) with audio from Supabase Storage. The app sets `crossOrigin = 'anonymous'` on the audio element so the browser can use the response with the analyser. Supabase Storage public URLs typically send CORS headers that allow cross-origin GET. If you see "MediaElementAudioSource outputs zeroes due to CORS access restrictions" in the console, ensure your app's origin (e.g. `https://your-site.vercel.app`) is allowed in Supabase: **Project Settings → API** (or Storage CORS if available) and that the `audio` bucket is **Public**.

## Cost Optimization Settings

### CDN and Caching
Supabase Storage uses a built-in CDN by default (no dashboard setting). To reduce egress:
- Set cache headers on upload (we use `public, max-age=31536000` in storage.service)
- Use image transformations for responsive images

### Bandwidth Optimization
1. **Image Transformations**: Use Supabase's built-in image transformations
   - Example: `https://your-project.supabase.co/storage/v1/object/public/photos/image.jpg?width=800&quality=85`
   
2. **WebP Format**: Always convert images to WebP before upload (done automatically by our image optimization utilities)

3. **Lazy Loading**: Implement lazy loading for images and audio (already done in components)

4. **Compression**: All images are compressed client-side before upload

### Expected Costs (Supabase Free Tier)
- **Storage**: 1 GB free
- **Bandwidth**: 2 GB egress/month free
- **Database**: 500 MB free

**Cost Saving Tips:**
- Store high-quality images compressed as WebP (~70-90% smaller than JPEG)
- Use CDN caching to reduce repeated downloads
- Implement pagination for photo galleries
- Consider external CDN (Cloudflare) for high-traffic sites

## Database migrations (SQL Editor)

Run these in order from `supabase/migrations/` (repo root):

1. `001_initial_schema.sql`
2. `002_profiles_and_rls.sql`
3. `003_site_settings_and_schema_updates.sql`
4. `004_tour_gallery_subtitles_newsletter.sql`
5. `005_site_admins_rls.sql` — admin-only CMS writes
6. `006_storage_admin_rls.sql` — after storage buckets exist

Paths are relative to the project root: e.g. `supabase/migrations/005_site_admins_rls.sql`.

## Setup Steps in Cursor

1. Create Supabase project at https://supabase.com
2. Go to Storage section
3. Create each bucket with the settings above
4. Run DB migrations through `005`, then run `006_storage_admin_rls.sql` after buckets exist (and add public SELECT policies above if needed)
5. Add your Supabase credentials to `.env.local`
6. Test uploads using the admin panel
