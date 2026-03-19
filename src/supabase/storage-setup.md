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

**RLS Policies:**
```sql
-- Public read access
CREATE POLICY "Public audio files are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio');

-- Authenticated write access
CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Authenticated users can update audio"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can delete audio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'audio');
```

### 2. `covers` Bucket
**Purpose:** Store album and track cover images

**Settings:**
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Cache Control: `public, max-age=31536000` (1 year)

**RLS Policies:**
```sql
CREATE POLICY "Public covers are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'covers');

CREATE POLICY "Authenticated users can update covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can delete covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'covers');
```

### 3. `photos` Bucket
**Purpose:** Store photo gallery images

**Settings:**
- Public: Yes
- File size limit: 10MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Cache Control: `public, max-age=31536000` (1 year)

**RLS Policies:**
```sql
CREATE POLICY "Public photos are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'photos');
```

## CORS (Music player / Web Audio API)

The music player uses the Web Audio API (AnalyserNode) with audio from Supabase Storage. The app sets `crossOrigin = 'anonymous'` on the audio element so the browser can use the response with the analyser. Supabase Storage public URLs typically send CORS headers that allow cross-origin GET. If you see "MediaElementAudioSource outputs zeroes due to CORS access restrictions" in the console, ensure your app's origin (e.g. `https://your-site.vercel.app`) is allowed in Supabase: **Project Settings → API** (or Storage CORS if available) and that the `audio` bucket is **Public**.

## Cost Optimization Settings

### Enable CDN Caching
In Supabase Dashboard > Storage > Settings:
- Enable CDN
- Set cache headers to maximize browser caching
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

Run these in order from `src/supabase/migrations/`:

1. `001_initial_schema.sql`
2. `002_profiles_and_rls.sql` (if present)
3. `003_site_settings_and_schema_updates.sql`
4. `004_tour_gallery_subtitles_newsletter.sql` — tour/gallery subtitles, `selling_fast` tour status, `newsletter_subscribers` table + RLS

## Setup Steps in Cursor

1. Create Supabase project at https://supabase.com
2. Go to Storage section
3. Create each bucket with the settings above
4. Copy and run the RLS policies in SQL Editor
5. Add your Supabase credentials to `.env.local`
6. Test uploads using the admin panel
