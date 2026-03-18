# Quick Reference Card

## 🚀 Getting Started (30 Seconds)

```bash
# 1. Copy files
./standalone-player/create-standalone.sh

# 2. Make 3 edits (see MODIFICATIONS_CHECKLIST.md)
# 3. Copy to your project
# 4. Use it!
```

## 📦 Basic Usage

```tsx
import { StandaloneMusicPlayer } from './standalone-player/StandaloneMusicPlayer';

<StandaloneMusicPlayer 
  tracks={[
    {
      id: 1,
      title: 'Song Name',
      artist: 'Artist Name',
      album: 'Album Name',
      duration: '3:45',
      url: 'https://example.com/song.mp3',
      visualizationId: 0
    }
  ]}
/>
```

## 🎛️ Props Quick Reference

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `tracks` | `Track[]` | ✅ Yes | - |
| `enableEditMode` | `boolean` | No | `false` |
| `onTracksChange` | `function` | No | - |
| `initialTrackIndex` | `number` | No | `0` |
| `autoPlay` | `boolean` | No | `false` |
| `className` | `string` | No | `''` |

## 🎨 Visualization IDs

| ID | Name | Style |
|----|------|-------|
| 0 | Organic Flow Field | Particle flows |
| 1 | Depth Layers | Layered particles |
| 2 | Waveform Interference | Wave patterns |
| 3 | Minimal Geometric | Rotating shapes |
| 4 | Atmospheric Noise | Smoky atmosphere |
| 5 | Kaleidoscope Fractals | Colorful symmetry |
| 6 | Liquid Plasma | Fluid blobs |
| 7 | Neon Grid | Cyberpunk grid |
| 8 | Spiral Galaxy | Cosmic spirals |
| 9 | Crystal Lattice | Geometric crystals |

## 🔧 Common Tasks

### Add Edit Mode
```tsx
const [tracks, setTracks] = useState([...]);

<StandaloneMusicPlayer
  tracks={tracks}
  enableEditMode={true}
  onTracksChange={setTracks}
/>
```

### Start Playing Automatically
```tsx
<StandaloneMusicPlayer
  tracks={tracks}
  autoPlay={true}
/>
```

### Start on Specific Track
```tsx
<StandaloneMusicPlayer
  tracks={tracks}
  initialTrackIndex={2}
/>
```

### Add Custom Styling
```tsx
<StandaloneMusicPlayer
  tracks={tracks}
  className="shadow-2xl border-4 border-purple-500"
/>
```

## 📁 Required Files

```
standalone-player/
├── StandaloneMusicPlayer.tsx ⚙️
├── StandaloneMusicPlayerEditDialog.tsx ⚙️
├── PsychedelicVisualizer.tsx ✅
├── EditComponents.tsx ⚙️
├── types.ts ✅
└── ui/
    ├── button.tsx ✅
    ├── slider.tsx ✅
    ├── input.tsx ✅
    ├── label.tsx ✅
    ├── select.tsx ✅
    ├── dialog.tsx ✅
    └── accordion.tsx ✅

✅ = Copy as-is
⚙️ = Needs modifications
```

## 🛠️ Modifications Needed

### StandaloneMusicPlayer.tsx
```diff
- import { useEditMode } from '../contexts/EditModeContext';
+ import type { StandaloneMusicPlayerProps } from './types';

- export function MusicPlayer() {
-   const { content, isEditMode } = useEditMode();
-   const tracks = content.musicPlayer.tracks;
+ export function StandaloneMusicPlayer({
+   tracks,
+   enableEditMode = false,
+   onTracksChange
+ }: StandaloneMusicPlayerProps) {
+   const isEditMode = enableEditMode;
```

### StandaloneMusicPlayerEditDialog.tsx
```diff
- import { useEditMode } from '../contexts/EditModeContext';
+ import type { Track } from './types';

- export function MusicPlayerEditDialog() {
-   const { content, updateContent } = useEditMode();
+ export function StandaloneMusicPlayerEditDialog({
+   tracks: initialTracks,
+   onTracksChange
+ }) {

  const handleSave = () => {
-   updateContent('musicPlayer', { tracks });
+   onTracksChange(tracks);
  };
```

### EditComponents.tsx
```typescript
// Copy EditDialog from EditableSection.tsx
// Copy AudioUpload from EditableSection.tsx
// Add inline uploadAudio function
```

## 📚 Documentation Files

| File | Use For |
|------|---------|
| `INDEX.md` | Navigation & overview |
| `README.md` | API docs & examples |
| `EXTRACTION_GUIDE.md` | Detailed instructions |
| `COMPLETE_SETUP.md` | Step-by-step setup |
| `MODIFICATIONS_CHECKLIST.md` | What to change |
| `ARCHITECTURE.md` | How it works |
| `QUICK_REFERENCE.md` | This file |

## ⚡ Commands

```bash
# Copy files automatically
./standalone-player/create-standalone.sh

# Install dependencies
npm install lucide-react motion

# Copy to another project
cp -r standalone-player /path/to/project/
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot find module | Copy all UI components |
| Visualizer blank | Check console for errors |
| Audio not playing | Check URL, CORS, console |
| Edit mode not showing | Pass `enableEditMode={true}` |
| Changes not saving | Pass `onTracksChange` callback |

## 🎯 Checklist

- [ ] Files copied
- [ ] Modifications made
- [ ] Dependencies installed
- [ ] Tailwind configured
- [ ] Component renders
- [ ] Audio plays
- [ ] Visualizations work
- [ ] Edit mode works (if enabled)

## 💡 Tips

- Start with `enableEditMode={false}` for testing
- Use data URLs for testing, real URLs for production
- Visualizations need audio analysis - won't animate without audio
- Fullscreen works best on larger screens
- Touch gestures work on mobile/tablet
- Edit mode keeps audio in memory - clear when done

## 🔗 Quick Links

- [Full Documentation](README.md)
- [Setup Guide](COMPLETE_SETUP.md)
- [Checklist](MODIFICATIONS_CHECKLIST.md)
- [Architecture](ARCHITECTURE.md)

---

**Need more detail?** → See INDEX.md for navigation to full guides!
