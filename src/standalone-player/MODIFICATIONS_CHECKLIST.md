# Modifications Checklist

Use this checklist to ensure you've made all necessary changes to create the standalone version.

## ✅ Before You Start

- [ ] Read `INDEX.md` for overview
- [ ] Read `COMPLETE_SETUP.md` for detailed instructions
- [ ] Run `create-standalone.sh` to copy files
- [ ] Have `/components/` directory accessible

## 📝 File 1: StandaloneMusicPlayer.tsx

### Imports
- [ ] Remove: `import { useEditMode } from '../contexts/EditModeContext';`
- [ ] Remove: `import { MusicPlayerEditDialog } from './MusicPlayerEditDialog';`
- [ ] Add: `import { StandaloneMusicPlayerEditDialog } from './StandaloneMusicPlayerEditDialog';`
- [ ] Add: `import type { StandaloneMusicPlayerProps, Track } from './types';`

### Component Signature
- [ ] Remove old function signature:
  ```typescript
  export function MusicPlayer() {
    const { content, isEditMode } = useEditMode();
    const tracks = content.musicPlayer.tracks;
  ```

- [ ] Add new function signature:
  ```typescript
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

### State Initialization
- [ ] Update: `const [currentTrack, setCurrentTrack] = useState(initialTrackIndex);`
- [ ] Update: `const [isPlaying, setIsPlaying] = useState(autoPlay);`

### Edit Dialog
- [ ] Replace in both places (line ~366 and ~376):
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

### Container
- [ ] Update main container div (line ~375):
  ```typescript
  // OLD:
  <div className="w-full max-w-6xl mx-auto relative">
  
  // NEW:
  <div className={`w-full max-w-6xl mx-auto relative ${className}`}>
  ```

### Remove Unused Dependencies
- [ ] Remove any other `content.musicPlayer.*` references (should be none)
- [ ] Remove any other `useEditMode()` calls (should be none)

## 📝 File 2: StandaloneMusicPlayerEditDialog.tsx

### Imports
- [ ] Remove: `import { useEditMode } from '../contexts/EditModeContext';`
- [ ] Remove: `import { EditDialog, AudioUpload } from './EditableSection';`
- [ ] Add: `import { EditDialog, AudioUpload } from './EditComponents';`
- [ ] Add: `import type { Track } from './types';`

### Props Interface
- [ ] Add at top of file:
  ```typescript
  interface StandaloneMusicPlayerEditDialogProps {
    tracks: Track[];
    onTracksChange: (tracks: Track[]) => void;
  }
  ```

### Component Signature
- [ ] Replace:
  ```typescript
  // OLD:
  export function MusicPlayerEditDialog() {
    const { content, updateContent } = useEditMode();
    const [tracks, setTracks] = useState(content.musicPlayer.tracks);
  
  // NEW:
  export function StandaloneMusicPlayerEditDialog({ 
    tracks: initialTracks, 
    onTracksChange 
  }: StandaloneMusicPlayerEditDialogProps) {
    const [tracks, setTracks] = useState(initialTracks);
  ```

### Save Handler
- [ ] Replace the `handleSave` function:
  ```typescript
  const handleSave = () => {
    onTracksChange(tracks);
  };
  ```

### Remove Old Save Logic
- [ ] Delete: Any `updateContent()` calls
- [ ] Delete: Any reference to `content.musicPlayer`

## 📝 File 3: EditComponents.tsx

### Copy EditDialog Component
- [ ] Copy from `/components/EditableSection.tsx` lines 69-113
- [ ] Ensure it includes:
  - Props interface
  - State management
  - Dialog structure
  - Save button

### Copy AudioUpload Component
- [ ] Copy from `/components/EditableSection.tsx` lines 194-301
- [ ] Remove: `const { uploadAudio } = useEditMode();`
- [ ] Add inline uploadAudio function:
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

### Update Imports
- [ ] Ensure all necessary imports are present
- [ ] Remove any context-related imports
- [ ] Check UI component imports point to `./ui/...`

## 📝 File 4: PsychedelicVisualizer.tsx

- [ ] Copy entire file from `/components/PsychedelicVisualizer.tsx`
- [ ] **No modifications needed** ✓
- [ ] Verify file is complete (~1400 lines)
- [ ] Verify all 10 visualization functions are present

## 📁 UI Components

- [ ] Copy `/components/ui/button.tsx`
- [ ] Copy `/components/ui/slider.tsx`
- [ ] Copy `/components/ui/input.tsx`
- [ ] Copy `/components/ui/label.tsx`
- [ ] Copy `/components/ui/select.tsx`
- [ ] Copy `/components/ui/dialog.tsx`
- [ ] Copy `/components/ui/accordion.tsx`

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Player renders without errors
- [ ] Track info displays correctly
- [ ] Play button works
- [ ] Skip forward/back works
- [ ] Volume slider works
- [ ] Seek bar works
- [ ] Playlist displays

### Visualizations
- [ ] Visualizations render in normal view
- [ ] Fullscreen mode works
- [ ] Visualization responds to audio (if URL provided)
- [ ] Each track can have different visualization
- [ ] Swipe down to exit fullscreen works

### Edit Mode (if enabled)
- [ ] Edit button appears when `enableEditMode={true}`
- [ ] Edit dialog opens
- [ ] Can add new track
- [ ] Can remove track
- [ ] Can upload audio file
- [ ] Can select visualization per track
- [ ] Changes are saved when clicking "Save Changes"
- [ ] `onTracksChange` callback is called with updated tracks

### Props
- [ ] `tracks` prop works
- [ ] `enableEditMode` prop toggles edit functionality
- [ ] `onTracksChange` callback receives updates
- [ ] `initialTrackIndex` sets starting track
- [ ] `autoPlay` starts playing on mount
- [ ] `className` applies to container

## 🚀 Final Verification

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No unused imports
- [ ] All props are properly typed

### File Structure
```
standalone-player/
├── StandaloneMusicPlayer.tsx ✓
├── StandaloneMusicPlayerEditDialog.tsx ✓
├── PsychedelicVisualizer.tsx ✓
├── EditComponents.tsx ✓
├── types.ts ✓
├── README.md ✓
└── ui/
    ├── button.tsx ✓
    ├── slider.tsx ✓
    ├── input.tsx ✓
    ├── label.tsx ✓
    ├── select.tsx ✓
    ├── dialog.tsx ✓
    └── accordion.tsx ✓
```

## 📦 Ready to Ship

- [ ] All files present
- [ ] All modifications complete
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Ready to copy to Cursor project

---

## Need Help?

If any item isn't clear:
1. Check `COMPLETE_SETUP.md` for code examples
2. Check `EXTRACTION_GUIDE.md` for file details
3. Compare with original files in `/components/`
4. Review error messages in browser console

## Completed? 🎉

Once all items are checked:
1. Copy `standalone-player/` to your Cursor project
2. Install dependencies: `npm install lucide-react motion`
3. Import and use: `import { StandaloneMusicPlayer } from './standalone-player/StandaloneMusicPlayer';`

**You're done!** 🎵
