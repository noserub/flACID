# Quick Reference Guide

## Common Tasks in Cursor

### Upload a New Track

```typescript
import { uploadAudio, uploadImage } from './services/storage.service';
import { createTrack } from './services/database.service';

// 1. Upload audio file
const { publicUrl: audioUrl, metadata } = await uploadAudio(
  audioFile,
  `tracks/${Date.now()}_${audioFile.name}`,
  (progress) => console.log(`${progress.percentage}%`)
);

// 2. Upload cover image (optional)
const { publicUrl: coverUrl } = await uploadImage(
  coverFile,
  'covers',
  `${Date.now()}_cover.webp`
);

// 3. Save to database
await createTrack({
  title: 'Song Title',
  artist: 'FLACID',
  album: 'Album Name',
  duration: metadata.duration,
  audio_url: audioUrl,
  cover_image_url: coverUrl,
  visualization_type: 'flowField',
  order_index: 0,
});
```

### Upload Album Artwork

```typescript
import { uploadImage } from './services/storage.service';
import { createAlbum } from './services/database.service';

const { publicUrl } = await uploadImage(
  coverFile,
  'covers',
  `albums/${Date.now()}_${albumTitle}.webp`
);

await createAlbum({
  title: 'Album Title',
  artist: 'FLACID',
  year: 2024,
  cover_image_url: publicUrl,
  description: 'Album description',
  spotify_url: 'https://spotify.com/...',
  bandcamp_url: 'https://bandcamp.com/...',
  order_index: 0,
});
```

### Upload Gallery Photos

```typescript
import { uploadResponsiveImage } from './services/storage.service';
import { createPhoto } from './services/database.service';

// Upload with multiple sizes
const { urls } = await uploadResponsiveImage(
  photoFile,
  'photos',
  `gallery/${Date.now()}_photo`
);

await createPhoto({
  url: urls.large,
  thumbnail_url: urls.thumbnail,
  alt_text: 'Photo description',
  photographer: 'Photographer Name',
  order_index: 0,
});
```

### Add Tour Date

```typescript
import { createTourDate } from './services/database.service';

await createTourDate({
  date: '2024-12-31',
  venue: 'The Venue',
  city: 'Los Angeles',
  country: 'USA',
  ticket_url: 'https://tickets.com/...',
  status: 'upcoming', // or 'sold_out', 'cancelled'
});
```

## File Size Guidelines

### Images
- **Album Covers**: 1000×1000px, WebP, 85% quality (~100-200KB)
- **Photos**: Max 1920px wide, WebP, 85% quality (~200-500KB)
- **Thumbnails**: Auto-generated at 300px (~20-50KB)

### Audio
- **Format**: MP3 @ 192kbps (or OGG Vorbis)
- **Size**: ~1.5MB per minute (5-6MB for 4-minute track)
- **Max**: 50MB per file

## Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx...

# Optional
VITE_ENV=production
```

## Supabase SQL Snippets

### View All Tracks
```sql
SELECT * FROM tracks ORDER BY order_index;
```

### Update Track Order
```sql
UPDATE tracks SET order_index = 1 WHERE id = 'track-uuid';
```

### Delete Old Tour Dates
```sql
DELETE FROM tour_dates WHERE date < '2024-01-01';
```

### Check Storage Usage
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as size_mb
FROM storage.objects
GROUP BY bucket_id;
```

## Keyboard Shortcuts

- **Cmd/Ctrl + E**: Toggle Edit Mode
- **Descent Mode Button**: Click logo or toggle in header

## Image Optimization Settings

```typescript
// High quality for covers
await optimizeImage(file, {
  maxWidth: 1000,
  quality: 0.9,
  format: 'image/webp'
});

// Standard quality for photos
await optimizeImage(file, {
  maxWidth: 1920,
  quality: 0.85,
  format: 'image/webp'
});

// Thumbnails
await optimizeImage(file, {
  maxWidth: 300,
  quality: 0.8,
  format: 'image/webp'
});
```

## Visualization Types

When creating tracks, choose from:
- `flowField` - Flowing particles (default)
- `particleSystem` - Energy bursts
- `waveInterference` - Wave patterns
- `geometric` - Sacred geometry
- `frequencyBars` - Spectrum bars
- `radial` - Circular spectrum
- `waveform` - Time domain

## Database Schema Quick Reference

### Tracks
```typescript
{
  id: UUID,
  title: string,
  artist: string,
  album: string | null,
  duration: number, // seconds
  audio_url: string,
  cover_image_url: string | null,
  visualization_type: string,
  order_index: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Albums
```typescript
{
  id: UUID,
  title: string,
  artist: string,
  year: number,
  cover_image_url: string,
  description: string | null,
  spotify_url: string | null,
  apple_music_url: string | null,
  bandcamp_url: string | null,
  order_index: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Tour Dates
```typescript
{
  id: UUID,
  date: date,
  venue: string,
  city: string,
  country: string,
  ticket_url: string | null,
  status: 'upcoming' | 'sold_out' | 'cancelled',
  created_at: timestamp,
  updated_at: timestamp
}
```

### Photos
```typescript
{
  id: UUID,
  url: string,
  thumbnail_url: string,
  alt_text: string | null,
  photographer: string | null,
  order_index: number,
  created_at: timestamp
}
```

## Storage Bucket Paths

- **Audio**: `audio/tracks/[filename].mp3`
- **Covers**: `covers/[timestamp]_[name].webp`
- **Photos**: `photos/gallery/[timestamp]_[name].webp`

## Troubleshooting

### "Cannot read properties of null (supabase)"
→ Uncomment Supabase client code in `/lib/supabase.ts`

### "Storage bucket not found"
→ Create buckets in Supabase dashboard, run RLS policies

### "Row Level Security policy violation"
→ Make sure you're authenticated, check RLS policies

### Images not loading
→ Check bucket is public, verify CORS settings

### Large bundle size
→ Ensure lazy loading is working, check imports

## Performance Monitoring

### Check Bundle Size
```bash
npm run build
# Check dist/ folder sizes
```

### Lighthouse Audit
```bash
npm run build
npm run preview
# Open Chrome DevTools > Lighthouse
```

### Supabase Usage
Dashboard → Settings → Billing → Usage

## Quick Links

- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Motion Docs](https://motion.dev)
