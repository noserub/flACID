# Migration Checklist: Figma Make → Cursor/Production

Use this checklist when transitioning the FLACID website from Figma Make to Cursor development and production.

## ✅ Pre-Migration (In Figma Make)

- [x] Remove debug components (DescentIntensityDebug)
- [x] Verify all features work in preview
- [x] Test Descent Mode activation/deactivation
- [x] Test music player with all visualization types
- [x] Verify Edit Mode functionality (Cmd/Ctrl + E)
- [x] Export/save current content from localStorage
- [x] Document any custom configurations

## 📦 Initial Setup (In Cursor)

### 1. Project Setup
- [ ] Download/clone project files to local machine
- [ ] Open project in Cursor
- [ ] Run `npm install`
- [ ] Verify project builds: `npm run dev`
- [ ] Check all pages load without errors

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Create Supabase project (https://supabase.com)
- [ ] Add `VITE_SUPABASE_URL` to `.env.local`
- [ ] Add `VITE_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Restart dev server to load env vars

### 3. Supabase Database Setup
- [ ] Open Supabase SQL Editor
- [ ] Run `/supabase/migrations/001_initial_schema.sql`
- [ ] Verify tables created:
  - [ ] `tracks`
  - [ ] `albums`
  - [ ] `tour_dates`
  - [ ] `photos`
- [ ] Check indexes are created
- [ ] Verify RLS policies are active

### 4. Supabase Storage Setup
- [ ] Create `audio` bucket (Public, 50MB limit)
- [ ] Create `covers` bucket (Public, 5MB limit)
- [ ] Create `photos` bucket (Public, 10MB limit)
- [ ] Apply RLS policies from `/supabase/storage-setup.md`
- [ ] Test bucket access (upload test file)
- [ ] Enable CDN caching in bucket settings

### 5. Code Activation
- [ ] Open `/lib/supabase.ts`
  - [ ] Uncomment Supabase client imports
  - [ ] Uncomment createClient code
  - [ ] Remove placeholder export
  - [ ] Test import works
  
- [ ] Open `/services/storage.service.ts`
  - [ ] Uncomment all Supabase storage calls
  - [ ] Remove console.log mocks
  - [ ] Test file upload function
  
- [ ] Open `/services/database.service.ts`
  - [ ] Uncomment all database queries
  - [ ] Remove console.log mocks
  - [ ] Test CRUD operations

### 6. Dependencies
- [ ] Install Supabase: `npm install @supabase/supabase-js`
- [ ] Verify all dependencies in package.json
- [ ] Run `npm install` again to ensure everything is installed
- [ ] Check for any TypeScript errors

## 🧪 Testing Phase

### Database Operations
- [ ] Test creating a track
- [ ] Test fetching tracks
- [ ] Test updating a track
- [ ] Test deleting a track
- [ ] Test creating an album
- [ ] Test creating a tour date
- [ ] Test uploading a photo

### Storage Operations
- [ ] Upload test audio file
- [ ] Verify audio file accessible via public URL
- [ ] Upload test image
- [ ] Verify image optimization works
- [ ] Check responsive variants generated
- [ ] Test file deletion
- [ ] Verify CDN caching headers

### Frontend Integration
- [ ] Music player loads tracks from database
- [ ] Album section shows database albums
- [ ] Tour dates display correctly
- [ ] Photo gallery loads from database
- [ ] Edit mode saves to database (not localStorage)
- [ ] All images load optimized versions

### Performance Testing
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Check bundle size (should be <500KB initial)
- [ ] Verify lazy loading works
- [ ] Test on mobile device
- [ ] Check network tab for optimized images
- [ ] Verify CDN cache hits

## 🎨 Content Migration

### Transfer Existing Content
- [ ] Export content from EditModeContext localStorage
- [ ] Create database entries for existing tracks
- [ ] Upload existing audio files to Supabase
- [ ] Upload existing cover images
- [ ] Migrate album data
- [ ] Migrate tour dates
- [ ] Upload gallery photos
- [ ] Verify all content displays correctly

### Content Organization
- [ ] Set proper `order_index` for tracks
- [ ] Set proper `order_index` for albums
- [ ] Set proper `order_index` for photos
- [ ] Add descriptions to albums
- [ ] Add streaming links (Spotify, Bandcamp, etc.)
- [ ] Add photographer credits to photos
- [ ] Add alt text to images for accessibility

## 🔐 Security Hardening

### Authentication Setup
- [ ] Enable Email/Password auth in Supabase
- [ ] Create admin user account
- [ ] Test admin login flow
- [ ] Verify RLS policies prevent unauthorized writes
- [ ] Test that public can still read content
- [ ] Consider adding admin panel component

### Environment Security
- [ ] Verify `.env.local` in `.gitignore`
- [ ] Never commit environment variables
- [ ] Use environment variables in deployment
- [ ] Rotate keys if accidentally committed

## 🚀 Deployment Preparation

### Build Optimization
- [ ] Run `npm run build`
- [ ] Check build output size
- [ ] Analyze bundle with `vite-bundle-visualizer` (optional)
- [ ] Ensure no console errors in production build
- [ ] Test production build: `npm run preview`

### Deployment Platform Setup (Vercel)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Run `vercel` in project directory
- [ ] Link to Vercel account
- [ ] Add environment variables in Vercel dashboard
- [ ] Configure domain (if custom)
- [ ] Deploy: `vercel --prod`

### Deployment Platform Setup (Netlify)
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Run `netlify init`
- [ ] Configure build settings
- [ ] Add environment variables in Netlify dashboard
- [ ] Deploy: `netlify deploy --prod`

### Post-Deployment
- [ ] Test production site
- [ ] Verify all images load
- [ ] Test music player functionality
- [ ] Test Descent Mode
- [ ] Check all links work
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Run Lighthouse on production URL

## 📊 Monitoring Setup

### Supabase Monitoring
- [ ] Set up billing alerts
- [ ] Monitor storage usage
- [ ] Monitor bandwidth usage
- [ ] Monitor database size
- [ ] Set up email notifications for errors

### Analytics (Optional)
- [ ] Add Google Analytics (if desired)
- [ ] Add Plausible/Fathom (privacy-friendly option)
- [ ] Track page views
- [ ] Track music plays
- [ ] Monitor performance metrics

## 🎯 Feature Additions (Optional)

### Admin Panel
- [ ] Create admin login page
- [ ] Build track upload UI
- [ ] Build album management UI
- [ ] Build tour date management UI
- [ ] Build photo upload UI
- [ ] Add drag-and-drop reordering

### Enhanced Features
- [ ] Add newsletter signup
- [ ] Add merchandise section
- [ ] Add lyrics display for tracks
- [ ] Add concert photo uploads
- [ ] Add press kit download
- [ ] Add RSS feed for news

### PWA Features
- [ ] Add service worker
- [ ] Add offline support
- [ ] Add install prompt
- [ ] Add push notifications
- [ ] Generate icons and manifest

## 🐛 Final Verification

### Functionality Checklist
- [ ] All pages load without errors
- [ ] Music player works with database tracks
- [ ] Visualizations sync with audio
- [ ] Descent Mode activates/deactivates smoothly
- [ ] All images optimized and loading fast
- [ ] Edit mode works (if admin authenticated)
- [ ] All links functional
- [ ] Mobile responsive
- [ ] Cross-browser compatible

### Performance Checklist
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 90+
- [ ] Lighthouse Best Practices: 90+
- [ ] Lighthouse SEO: 90+
- [ ] Images all WebP format
- [ ] CDN caching active
- [ ] Lazy loading working
- [ ] Bundle size optimized

### SEO Checklist
- [ ] Add meta tags to index.html
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Add favicon
- [ ] Add sitemap.xml
- [ ] Add robots.txt
- [ ] Submit to Google Search Console

## 📝 Documentation

- [ ] Update README.md with production URL
- [ ] Document admin credentials (securely)
- [ ] Create content management guide
- [ ] Document deployment process
- [ ] Create troubleshooting guide
- [ ] Document API endpoints (if any)

## ✨ Launch

- [ ] Final production deploy
- [ ] Smoke test all features
- [ ] Share with band members
- [ ] Announce on social media
- [ ] Monitor for issues
- [ ] Celebrate! 🎉

---

## Quick Links for Reference

- [Cursor Setup Guide](./CURSOR_SETUP.md)
- [Optimization Guide](./OPTIMIZATION_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Supabase Dashboard](https://app.supabase.com)
- [Deployment Platform](#) (add your URL)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase dashboard for API errors
3. Verify environment variables are set
4. Review the documentation files
5. Check Supabase status page

---

**Remember:** Test thoroughly in development before deploying to production!
