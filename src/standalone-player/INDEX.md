# Standalone Music Player - Complete Package

Welcome! This directory contains everything you need to extract and use the psychedelic music player in any React project.

## 🎯 Quick Start (Choose Your Path)

### Option A: Automated Setup (Recommended)
1. Run the setup script from your band website project root:
   ```bash
   chmod +x standalone-player/create-standalone.sh
   ./standalone-player/create-standalone.sh
   ```
2. Follow the "Next Steps" instructions printed by the script
3. Copy the entire `standalone-player/` directory to your Cursor project

### Option B: Manual Setup
1. Read `EXTRACTION_GUIDE.md` for detailed file-by-file instructions
2. Follow `COMPLETE_SETUP.md` for code modifications needed
3. Use `create-standalone.sh` as a reference for which files to copy

### Option C: Quick Reference
1. Check `README.md` for full API documentation and usage examples
2. Use `types.ts` for TypeScript interfaces
3. Refer to modification examples in `COMPLETE_SETUP.md`

## 📁 Files in This Directory

| File | Purpose | Status |
|------|---------|--------|
| `INDEX.md` | This file - navigation guide | ✅ Ready |
| `README.md` | Full documentation & API reference | ✅ Ready |
| `EXTRACTION_GUIDE.md` | Detailed extraction instructions | ✅ Ready |
| `COMPLETE_SETUP.md` | Step-by-step modification guide | ✅ Ready |
| `types.ts` | TypeScript interfaces | ✅ Ready |
| `create-standalone.sh` | Automated setup script | ✅ Ready |
| `PsychedelicVisualizer.tsx` | Visualizations component | ⚠️ Copy from project |
| `StandaloneMusicPlayer.tsx` | Main player component | ⚠️ Copy & modify |
| `StandaloneMusicPlayerEditDialog.tsx` | Edit dialog | ⚠️ Copy & modify |
| `EditComponents.tsx` | Reusable edit UI | ⚠️ Extract from project |
| `ui/` | UI components directory | ⚠️ Copy from project |

## 🔄 Workflow

```
Band Website Project
        ↓
   [Copy Files]
        ↓
  Make Modifications (remove context dependencies)
        ↓
standalone-player/ directory
        ↓
   [Copy to Cursor Project]
        ↓
    Your New App!
```

## ⚡ The Fastest Way

If you just want to get it working ASAP:

1. **Run the script:**
   ```bash
   ./standalone-player/create-standalone.sh
   ```

2. **Make 3 quick edits:**

   **Edit 1:** `standalone-player/StandaloneMusicPlayer.tsx`
   ```typescript
   // Line 1: Remove this
   import { useEditMode } from '../contexts/EditModeContext';
   
   // Line ~25: Replace this
   export function MusicPlayer() {
     const { content, isEditMode } = useEditMode();
     const tracks = content.musicPlayer.tracks;
   
   // With this
   export function StandaloneMusicPlayer({ 
     tracks, 
     enableEditMode = false 
   }: StandaloneMusicPlayerProps) {
     const isEditMode = enableEditMode;
   ```

   **Edit 2:** `standalone-player/StandaloneMusicPlayerEditDialog.tsx`
   ```typescript
   // Similar changes - remove useEditMode, add props
   // See COMPLETE_SETUP.md for details
   ```

   **Edit 3:** `standalone-player/EditComponents.tsx`
   ```typescript
   // Copy EditDialog and AudioUpload from EditableSection.tsx
   // See COMPLETE_SETUP.md for details
   ```

3. **Copy to your Cursor project and use:**
   ```tsx
   import { StandaloneMusicPlayer } from './standalone-player/StandaloneMusicPlayer';
   
   function App() {
     const tracks = [/* your tracks */];
     return <StandaloneMusicPlayer tracks={tracks} />;
   }
   ```

## 📚 Documentation Guide

### For First-Time Users
1. Start with `README.md` - understand what the player does
2. Read `COMPLETE_SETUP.md` - see exactly what changes to make
3. Run `create-standalone.sh` - automate the file copying
4. Follow the printed "Next Steps" - complete the modifications

### For Experienced Developers
1. Check `types.ts` - understand the interfaces
2. Run `create-standalone.sh` - get all files
3. Glance at `COMPLETE_SETUP.md` - see the modifications
4. Make changes and integrate

### For Troubleshooting
1. Review `EXTRACTION_GUIDE.md` - verify you have all files
2. Check `COMPLETE_SETUP.md` - ensure modifications are correct
3. Refer to `README.md` - check usage examples

## 🎵 What You're Getting

A complete, production-ready music player with:
- ✅ Full playback controls (play, pause, skip, seek, volume)
- ✅ 10 unique psychedelic visualizations
- ✅ Real-time EQ analysis (7 frequency bands)
- ✅ Playlist management
- ✅ Fullscreen mode with gestures
- ✅ Edit mode for track management
- ✅ Audio file upload (up to 50MB)
- ✅ Per-track visualization selection
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Zero external API dependencies (except Web Audio API)

## 🔧 Technical Details

### Dependencies Required
```json
{
  "lucide-react": "latest",
  "motion": "latest"
}
```

### Tailwind CSS
The player requires Tailwind CSS v3+ with default configuration.

### Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE: ❌ Not supported (uses Web Audio API)

## 🆘 Getting Help

### Common Issues

**Issue: "Cannot find module"**
- Solution: Ensure all files in `ui/` are copied
- Check: Run the setup script to copy all required files

**Issue: Visualizations not rendering**
- Solution: Verify PsychedelicVisualizer.tsx is complete (~1400 lines)
- Check: Ensure Web Audio API is supported (requires HTTPS or localhost)

**Issue: TypeScript errors**
- Solution: Ensure types.ts is imported correctly
- Check: Verify all interfaces match between files

**Issue: Edit mode not working**
- Solution: Pass `enableEditMode={true}` and `onTracksChange` callback
- Check: EditComponents.tsx must have EditDialog and AudioUpload

### Where to Look

| Problem | Check This File |
|---------|----------------|
| Player not rendering | `StandaloneMusicPlayer.tsx` |
| Visualizations broken | `PsychedelicVisualizer.tsx` |
| Edit mode not showing | Props and EditDialog |
| TypeScript errors | `types.ts` and imports |
| Styling issues | Tailwind CSS config |
| Audio not playing | Browser console, CORS |

## 🚀 Next Steps

1. Choose your setup path (automated or manual)
2. Follow the appropriate guide
3. Copy to your Cursor project
4. Import and use the component
5. Customize as needed!

## 📝 Notes

- The player is designed to be self-contained
- No backend required (files stored as data URLs during edit)
- For production, consider implementing proper file storage
- Edit mode caches audio in memory - clear on exit for performance
- All 10 visualizations are EQ-driven and respond to real audio

## 🎨 Customization

After setup, you can customize:
- Visualization colors (see PsychedelicVisualizer.tsx)
- Player styling (Tailwind classes)
- Add more visualizations
- Modify EQ band ranges
- Add playlist persistence
- Implement cloud storage for audio

## ✨ Credits

Created for the Crash Moons heavy rock band website. Designed for post-rock, stoner doom, progressive rock, post-metal, and psychedelic rock aesthetics.

---

**Ready to start? Run the setup script or dive into the guides above! 🎵**