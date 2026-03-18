# Complete Standalone Player Setup

This is the **easiest way** to set up the standalone music player in your Cursor project.

## Quick Setup (Recommended)

### Step 1: Copy the Entire `/standalone-player` Directory

Simply copy this entire `/standalone-player` directory to your target Cursor project.

### Step 2: Copy Required Files from Current Project

You need to copy a few files from your current band website project:

```bash
# In your band website project root:

# 1. Copy the complete visualizer (this is the big one!)
cp components/PsychedelicVisualizer.tsx standalone-player/

# 2. Copy UI components
cp -r components/ui standalone-player/
```

### Step 3: Install Dependencies

In your target Cursor project:

```bash
npm install lucide-react motion
```

### Step 4: Complete the StandaloneMusicPlayer Component

The file `Standalone MusicPlayer.tsx` in this directory needs the complete implementation.  
**Copy the entire contents** of `/components/MusicPlayer.tsx` and make these changes:

#### Changes to Make:

1. **Remove these imports:**
```typescript
import { useEditMode } from '../contexts/EditModeContext';
```

2. **Add props interface at the top:**
```typescript
export interface StandaloneMusicPlayerProps {
  tracks: Track[];
  enableEditMode?: boolean;
  onTracksChange?: (tracks: Track[]) => void;
  initialTrackIndex?: number;
  autoPlay?: boolean;
  className?: string;
}
```

3. **Replace the component signature:**
```typescript
// OLD:
export function MusicPlayer() {
  const { content, isEditMode } = useEditMode();
  const tracks = content.musicPlayer.tracks;

// NEW:
export function StandaloneMusicPlayer({
  tracks,
  enableEditMode = false,
  onTracksChange,
  initialTrackIndex = 0,
  autoPlay = false,
  className = ''
}: StandaloneMusicPlayerProps) {
  const isEditMode = enableEditMode;
```

4. **Update the initial track state:**
```typescript
// OLD:
const [currentTrack, setCurrentTrack] = useState(0);

// NEW:
const [currentTrack, setCurrentTrack] = useState(initialTrackIndex);
```

5. **Replace the edit dialog:**
```typescript
// OLD:
{isEditMode && <MusicPlayerEditDialog />}

// NEW:
{isEditMode && onTracksChange && (
  <StandaloneMusicPlayerEditDialog 
    tracks={tracks}
    onTracksChange={onTracksChange}
  />
)}
```

6. **Update the container div:**
```typescript
// OLD:
<div className="w-full max-w-6xl mx-auto relative">

// NEW:
<div className={`w-full max-w-6xl mx-auto relative ${className}`}>
```

That's it! The rest of the file stays exactly the same.

## Alternative: Use Pre-Made Templates

I've created template files in this directory that show these modifications. You can:

1. Look at `StandaloneMusicPlayer.TEMPLATE.tsx` for reference
2. Or simply copy `/components/MusicPlayer.tsx` and apply the changes above

## Files in This Directory

- `README.md` - Complete documentation and API reference
- `EXTRACTION_GUIDE.md` - Detailed extraction instructions
- `COMPLETE_SETUP.md` - This file (quick setup guide)
- `types.ts` - TypeScript interfaces
- `Standalone MusicPlayer.tsx` - Main player component (needs completion as above)
- `StandaloneMusicPlayerEditDialog.tsx` - Edit dialog (needs creation)
- `EditComponents.tsx` - Reusable edit UI (needs creation)

## Create the Missing Components

### StandaloneMusicPlayerEditDialog.tsx

Copy from `/components/MusicPlayerEditDialog.tsx` and make these changes:

1. Remove `useEditMode` import
2. Add props interface:
```typescript
interface Props {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
}

export function StandaloneMusicPlayerEditDialog({ tracks: initialTracks, onTracksChange }: Props) {
  const [tracks, setTracks] = useState(initialTracks);
```

3. Replace the save handler:
```typescript
const handleSave = () => {
  onTracksChange(tracks);
};
```

4. Create inline uploadAudio function:
```typescript
const uploadAudio = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 50 * 1024 * 1024) {
      reject(new Error('Audio file too large. Maximum size is 50MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

### EditComponents.tsx

Extract `EditDialog` and `AudioUpload` from `/components/EditableSection.tsx`:

1. Copy the `EditDialog` component (lines 76-113)
2. Copy the `AudioUpload` component (lines 200-301)
3. Make AudioUpload standalone by adding inline uploadAudio function

## Testing

Create a test file in your new project:

```tsx
import { StandaloneMusicPlayer } from './standalone-player/StandaloneMusicPlayer';
import { useState } from 'react';

function App() {
  const [tracks, setTracks] = useState([
    {
      id: 1,
      title: 'Test Track',
      artist: 'Test Artist',
      album: 'Test Album',
      duration: '3:45',
      url: 'https://example.com/track.mp3',
      visualizationId: 0
    }
  ]);

  return (
    <div className="min-h-screen bg-black p-8">
      <StandaloneMusicPlayer 
        tracks={tracks}
        enableEditMode={true}
        onTracksChange={setTracks}
      />
    </div>
  );
}
```

## Troubleshooting

### "Cannot find module" errors
- Make sure you copied all UI components
- Check import paths match your project structure

### Visualizations not working
- Ensure you copied the COMPLETE PsychedelicVisualizer.tsx file
- It should be ~1400 lines with all 10 visualization functions

### Tailwind classes not working
- Ensure Tailwind CSS is properly configured in your project
- Check that `globals.css` includes Tailwind directives

## Need Help?

If you encounter issues:
1. Check that all files are copied
2. Verify all dependencies are installed
3. Ensure Tailwind CSS is configured
4. Check the browser console for specific error messages

The complete, working implementation exists in your current band website project at `/components/MusicPlayer.tsx` - you can always refer back to it!
