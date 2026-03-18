# FLACID Band Website - Cursor Development Setup

## Project Overview

This is a heavy rock band website for **FLACID** featuring:
- Psychedelic visual effects and music player with EQ-reactive visualizations
- "Descent Mode" - immersive psychedelic experience with particle systems
- Optimized for low bandwidth and storage costs
- Ready for Supabase integration for song/image uploads

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (formerly Framer Motion)
- **Backend**: Supabase (Postgres + Storage + Auth)
- **Optimization**: Client-side image/audio compression

## Getting Started in Cursor

### 1. Install Dependencies

```bash
npm install

# Install Supabase client
npm install @supabase/supabase-js
```

### 2. Environment Setup

Create `.env.local` in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Production settings
VITE_ENV=development
VITE_ENABLE_ANALYTICS=false
```

### 3. Supabase Setup

#### A. Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key to `.env.local`

#### B. Run Database Migration
1. Open Supabase SQL Editor
2. Run `/supabase/migrations/001_initial_schema.sql`
3. Verify tables are created

#### C. Configure Storage Buckets
Follow instructions in `/supabase/storage-setup.md`:
- Create `audio`, `covers`, and `photos` buckets
- Set up RLS policies
- Enable CDN caching

### 4. Uncomment Supabase Code

The app is structured with placeholder code. Uncomment these files:

#### `/lib/supabase.ts`
```typescript
// Uncomment the createClient import and configuration
// Remove the placeholder export
```

#### `/services/storage.service.ts`
```typescript
// Uncomment all Supabase storage upload calls
// Replace console.log mock implementations
```

#### `/services/database.service.ts`
```typescript
// Uncomment all Supabase database queries
// Replace console.log mock implementations
```

### 5. Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
/
├── src/
│   ├── components/          # React components
│   │   ├── MusicPlayer.tsx  # Main music player with visualizations
│   │   ├── DescentModeEffects.tsx  # Psychedelic effects
│   │   ├── PsychedelicVisualizer.tsx  # EQ-reactive visualizations
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   ├── EditModeContext.tsx  # Content management
│   │   ├── DescentModeContext.tsx  # Psychedelic mode state
│   │   └── DescentIntensityContext.tsx  # Audio analysis
│   ├── lib/                 # Utilities
│   │   ├── supabase.ts      # Supabase client config
│   │   ├── imageOptimization.ts  # Image compression
│   │   └── audioOptimization.ts  # Audio validation
│   ├── services/            # Business logic
│   │   ├── storage.service.ts  # File upload service
│   │   └── database.service.ts  # Database queries
│   └── App.tsx              # Main entry point
├── supabase/
│   ├── migrations/          # Database schema
│   └── storage-setup.md     # Storage configuration guide
├── CURSOR_SETUP.md          # This file
└── OPTIMIZATION_GUIDE.md    # Cost optimization strategies
```

## Key Features to Understand

### 1. Music Player (`/components/MusicPlayer.tsx`)
- 7-band EQ analysis for visualizations
- Multiple visualization types (flow fields, particles, waves)
- Integrates with Descent Mode for synchronized effects

### 2. Descent Mode (`/contexts/DescentModeContext.tsx`)
- Psychedelic takeover mode with effects:
  - Chromatic aberration
  - VHS scanlines
  - Organic tendrils
  - Particle systems (120 intelligent organisms)
  - Breathing background
- Activated via toggle button in header

### 3. Edit Mode (`/contexts/EditModeContext.tsx`)
- Content management system built-in
- Enable with Cmd/Ctrl + E
- Stores content in localStorage
- Ready to migrate to Supabase

### 4. Image Optimization (`/lib/imageOptimization.ts`)
- Automatic WebP conversion
- Responsive image variants (thumbnail, small, medium, large)
- Client-side compression before upload
- Reduces storage costs by 70-90%

## Implementing Uploads

### Example: Add Track Upload UI

1. Create upload component in `/components/admin/`:

```typescript
import { uploadAudio, uploadImage } from '../services/storage.service';
import { createTrack } from '../services/database.service';

export function TrackUploadDialog() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!audioFile) return;
    
    setUploading(true);
    try {
      // Upload audio
      const { publicUrl: audioUrl, metadata } = await uploadAudio(
        audioFile,
        `tracks/${Date.now()}_${audioFile.name}`
      );
      
      // Upload cover if provided
      let coverUrl = null;
      if (coverFile) {
        const { publicUrl } = await uploadImage(
          coverFile,
          'covers',
          `covers/${Date.now()}_${coverFile.name}`
        );
        coverUrl = publicUrl;
      }
      
      // Save to database
      await createTrack({
        title: metadata.title || 'Untitled',
        artist: 'FLACID',
        duration: metadata.duration || 0,
        audio_url: audioUrl,
        cover_image_url: coverUrl,
        visualization_type: 'flowField',
        order_index: 0,
      });
      
      alert('Track uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    // UI implementation
  );
}
```

2. Add to admin panel or edit mode UI

### Example: Fetch Tracks from Database

Update `/components/MusicPlayer.tsx` to use Supabase:

```typescript
import { getTracks } from '../services/database.service';

export function MusicPlayer() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const data = await getTracks();
      setTracks(data);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
}
```

## Cost Optimization Checklist

- [x] Client-side image compression to WebP
- [x] Responsive image variants
- [x] Lazy loading for all images
- [x] CDN caching headers (1 year)
- [x] Audio file validation (prevent huge uploads)
- [x] Optimized database queries with indexes
- [ ] Implement pagination for galleries
- [ ] Add service worker for offline caching
- [ ] Monitor Supabase usage dashboard

## Security Notes

⚠️ **Important**: 
- Row Level Security (RLS) is enabled on all tables
- Only authenticated users can upload/modify content
- Set up admin authentication in Supabase Dashboard
- Consider using Supabase Auth with email/password
- Never commit `.env.local` to git (already in `.gitignore`)

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Common Issues

### "Missing Supabase environment variables"
- Ensure `.env.local` exists and has correct values
- Restart dev server after adding env vars

### "Storage bucket not found"
- Create buckets in Supabase dashboard
- Run RLS policies from `/supabase/storage-setup.md`

### Large bundle size
- Lazy loading is already implemented
- Consider code splitting for admin components
- Use dynamic imports for heavy visualizations

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database migrations
3. ✅ Configure storage buckets
4. ✅ Uncomment Supabase code in services
5. ✅ Test file uploads
6. ✅ Set up authentication
7. ✅ Deploy to production
8. ✅ Monitor costs in Supabase dashboard

## Support

For questions or issues:
- Check Supabase documentation: https://supabase.com/docs
- Review optimization guide: `/OPTIMIZATION_GUIDE.md`
- Inspect browser console for detailed error messages

---

**Built with** 🎸 **by FLACID**
