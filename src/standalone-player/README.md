# Standalone Psychedelic Music Player

A fully-featured music player with EQ-driven psychedelic visualizations, playlist management, edit capabilities, and fullscreen mode. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🎵 **Full-featured Music Player**: Play, pause, skip, seek, volume control
- 🌀 **10 Psychedelic Visualizations**: EQ-driven, responsive to 7 frequency bands
- 🎨 **Per-Track Visualization Selection**: Different visual for each song
- 📝 **Edit Mode**: Add/remove tracks, upload audio, configure visualizations
- 🖥️ **Fullscreen Mode**: Immersive visualization experience
- 📱 **Responsive**: Works on desktop and mobile
- 🎚️ **Real-time Audio Analysis**: Web Audio API integration

## Installation

### 1. Copy Files

Copy the entire `/standalone-player` directory to your project:

```
standalone-player/
├── StandaloneMusicPlayer.tsx    # Main component
├── PsychedelicVisualizer.tsx    # Visualization engine
├── MusicPlayerEditDialog.tsx    # Edit mode dialog
├── types.ts                     # TypeScript interfaces
└── README.md                    # This file
```

### 2. Dependencies

Install required dependencies:

```bash
npm install lucide-react motion
```

Also ensure you have the shadcn/ui components required:
- Button
- Slider
- Input
- Label
- Select
- Dialog
- Accordion

Or copy them from the `/components/ui` directory.

### 3. Tailwind CSS

The player uses Tailwind CSS. Make sure your project has Tailwind configured.

## Usage

### Basic Usage

```tsx
import { StandaloneMusicPlayer } from './standalone-player/StandaloneMusicPlayer';

function App() {
  const tracks = [
    {
      id: 1,
      title: 'Ethereal Descent',
      artist: 'Crash Moons',
      album: 'Cosmic Doom',
      duration: '8:42',
      url: 'https://example.com/track1.mp3',
      visualizationId: 0
    },
    // ... more tracks
  ];

  return (
    <div>
      <StandaloneMusicPlayer 
        tracks={tracks}
        enableEditMode={false}
      />
    </div>
  );
}
```

### With Edit Mode

```tsx
import { StandaloneMusicPlayer } from './standalone-player/StandaloneMusicPlayer';
import type { Track } from './standalone-player/types';

function App() {
  const [tracks, setTracks] = useState<Track[]>([...]);

  const handleTracksChange = (updatedTracks: Track[]) => {
    setTracks(updatedTracks);
    // Save to your backend, localStorage, etc.
  };

  return (
    <StandaloneMusicPlayer 
      tracks={tracks}
      enableEditMode={true}
      onTracksChange={handleTracksChange}
    />
  );
}
```

### Custom Styling

The player uses Tailwind classes and CSS variables. To customize:

```css
/* In your globals.css */
:root {
  --primary: 270 70% 60%;
  --card: 0 0% 10%;
  --border: 0 0% 20%;
  /* ... etc */
}
```

## Props API

### StandaloneMusicPlayer

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tracks` | `Track[]` | Yes | - | Array of track objects |
| `enableEditMode` | `boolean` | No | `false` | Enable/disable edit functionality |
| `onTracksChange` | `(tracks: Track[]) => void` | No | - | Callback when tracks are modified |
| `initialTrackIndex` | `number` | No | `0` | Index of track to play first |
| `autoPlay` | `boolean` | No | `false` | Auto-play on mount |
| `className` | `string` | No | - | Additional CSS classes |

### Track Interface

```typescript
interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;      // Format: "8:42"
  url: string;           // Audio file URL or data URL
  visualizationId?: number; // 0-9, defaults to track index % 10
}
```

## Visualizations

The player includes 10 unique psychedelic visualizations:

1. **Organic Flow Field** - Particle system with flow fields
2. **Depth Layers** - Layered depth with frequency-based particles
3. **Waveform Interference** - Complex wave interference patterns
4. **Minimal Geometric** - Rotating geometric shapes
5. **Atmospheric Noise** - Smoky atmospheric effects
6. **Kaleidoscope Fractals** - Mirrored kaleidoscope patterns
7. **Liquid Plasma** - Fluid plasma-like motion
8. **Neon Grid** - Cyberpunk-style grid visualization
9. **Spiral Galaxy** - Rotating spiral arms
10. **Crystal Lattice** - Crystalline geometric structures

Each visualization responds to 7 EQ frequency bands plus overall energy:
- Sub-bass (20-60 Hz)
- Bass (60-250 Hz)
- Low-mid (250-500 Hz)
- Mid (500-2000 Hz)
- High-mid (2000-4000 Hz)
- High (4000-8000 Hz)
- Presence (8000-16000 Hz)

## Edit Mode Features

When `enableEditMode={true}`:

- ✏️ Add/remove tracks
- 🎵 Upload audio files (up to 50MB)
- 🎨 Select visualization per track
- 📝 Edit track metadata (title, artist, album)
- 💾 Auto-extracts duration from audio files

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design with touch gestures

## Performance Notes

- Visualizations use `requestAnimationFrame` for smooth 60fps
- Canvas rendering is optimized with pixel ratio limiting
- Intersection Observer pauses rendering when not visible
- Audio files are cached in memory during edit mode
- Large audio files cleared from memory when exiting edit mode

## Keyboard Shortcuts

- `Space`: Play/Pause (when focused)
- `Escape`: Exit fullscreen
- Arrow keys: Seek (when progress bar focused)

## Touch Gestures

- **Swipe down**: Exit fullscreen (when in fullscreen mode)

## Troubleshooting

### Audio not playing
- Check that audio URLs are accessible (CORS)
- Ensure audio format is supported (MP3, OGG, WAV)
- Browser autoplay policies may block playback without user interaction

### Visualizations not working
- Web Audio API requires a secure context (HTTPS or localhost)
- Check browser console for errors
- Ensure audio context is created after user interaction

### Memory issues
- Large audio files (>50MB) may cause issues
- Exit edit mode to clear audio cache
- Consider using streaming URLs instead of data URLs

## License

MIT License - feel free to use in any project

## Credits

Created for Crash Moons heavy rock band website
Psychedelic visualizations inspired by heavy music aesthetics