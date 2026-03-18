# Standalone Music Player Architecture

## Component Hierarchy

```
StandaloneMusicPlayer (Main Component)
│
├── Audio Element (Web Audio API)
│   ├── Audio Context
│   ├── Analyser Node
│   └── Media Element Source
│
├── PsychedelicVisualizer
│   ├── Canvas Element
│   ├── Animation Loop
│   └── 10 Visualization Functions
│       ├── 0. Organic Flow Field
│       ├── 1. Depth Layers
│       ├── 2. Waveform Interference
│       ├── 3. Minimal Geometric
│       ├── 4. Atmospheric Noise
│       ├── 5. Kaleidoscope Fractals
│       ├── 6. Liquid Plasma
│       ├── 7. Neon Grid
│       ├── 8. Spiral Galaxy
│       └── 9. Crystal Lattice
│
├── Player Controls
│   ├── Play/Pause Button
│   ├── Skip Forward/Back
│   ├── Progress Slider
│   ├── Volume Control
│   ├── Fullscreen Toggle
│   └── Playlist Toggle
│
├── Playlist View
│   └── Track List Items
│
├── Fullscreen View (Portal)
│   ├── Visualizer (Full Screen)
│   ├── Track Info Overlay
│   ├── Controls Overlay
│   ├── Exit Button
│   └── Touch Gestures
│
└── Edit Mode (Optional)
    └── StandaloneMusicPlayerEditDialog
        ├── Add Track Button
        └── Track List (Accordion)
            └── For Each Track:
                ├── AudioUpload
                ├── Title Input
                ├── Artist Input
                ├── Album Input
                ├── Visualization Selector
                └── Remove Button
```

## Data Flow

### Without Edit Mode

```
Props (tracks) 
    ↓
StandaloneMusicPlayer
    ↓
[Internal State]
    ├── currentTrack
    ├── isPlaying
    ├── volume
    └── ...
    ↓
[Audio Processing]
    ├── Audio Element
    ├── Web Audio API
    └── Analyser Node
    ↓
[Visualization]
    └── PsychedelicVisualizer
        ├── Frequency Data
        ├── EQ Bands Calculation
        └── Canvas Rendering
```

### With Edit Mode

```
Props (tracks, onTracksChange)
    ↓
StandaloneMusicPlayer
    ↓
StandaloneMusicPlayerEditDialog
    ↓
[Local State] (tracks copy)
    ↓
User Edits Tracks
    ↓
Click "Save Changes"
    ↓
onTracksChange(updatedTracks)
    ↓
Parent Component Updates
    ↓
New Props Flow Back
```

## Key Interfaces

### Track
```typescript
interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;      // "MM:SS"
  url: string;           // Audio file URL
  visualizationId?: number;  // 0-9
}
```

### Props
```typescript
interface StandaloneMusicPlayerProps {
  tracks: Track[];
  enableEditMode?: boolean;
  onTracksChange?: (tracks: Track[]) => void;
  initialTrackIndex?: number;
  autoPlay?: boolean;
  className?: string;
}
```

### EQ Bands
```typescript
interface EQBands {
  subBass: number;    // 20-60 Hz
  bass: number;       // 60-250 Hz
  lowMid: number;     // 250-500 Hz
  mid: number;        // 500-2000 Hz
  highMid: number;    // 2000-4000 Hz
  high: number;       // 4000-8000 Hz
  presence: number;   // 8000-16000 Hz
  energy: number;     // Overall
}
```

## State Management

### Player State
```typescript
// Playback
const [currentTrack, setCurrentTrack] = useState(initialTrackIndex);
const [isPlaying, setIsPlaying] = useState(autoPlay);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [volume, setVolume] = useState(0.7);
const [isMuted, setIsMuted] = useState(false);

// UI
const [showPlaylist, setShowPlaylist] = useState(true);
const [isFullscreen, setIsFullscreen] = useState(false);
const [isVisualizerLoading, setIsVisualizerLoading] = useState(false);

// Audio
const [isAudioReady, setIsAudioReady] = useState(false);
const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

// Touch
const [touchStartY, setTouchStartY] = useState<number | null>(null);
const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
```

### Refs
```typescript
const audioRef = useRef<HTMLAudioElement>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
```

## Audio Processing Pipeline

```
Audio File (URL)
    ↓
HTML Audio Element
    ↓
AudioContext.createMediaElementSource()
    ↓
MediaElementAudioSourceNode
    ↓
AnalyserNode (FFT Size: 2048)
    ↓
FrequencyBinCount: 1024
    ↓
getByteFrequencyData(dataArray)
    ↓
Uint8Array[1024] (0-255 values)
    ↓
Calculate EQ Bands
    ├── subBass: avg(0-3% of bins)
    ├── bass: avg(3-10% of bins)
    ├── lowMid: avg(10-15% of bins)
    ├── mid: avg(15-40% of bins)
    ├── highMid: avg(40-60% of bins)
    ├── high: avg(60-80% of bins)
    ├── presence: avg(80-100% of bins)
    └── energy: avg(all bins)
    ↓
Pass to Visualizer
    ↓
Canvas Rendering (60 FPS)
```

## Visualization System

### Rendering Loop
```
requestAnimationFrame
    ↓
Check if visible (Intersection Observer)
    ↓
Get Frequency Data from Analyser
    ↓
Calculate EQ Bands
    ↓
Draw Background Gradient
    ↓
Call Visualization Function (based on visualizationId)
    ↓
Increment Time Counter
    ↓
requestAnimationFrame (loop)
```

### Visualization Selection
```typescript
switch (visualizationId % 10) {
  case 0: drawOrganicFlow()
  case 1: drawDepthLayers()
  case 2: drawWaveformInterference()
  case 3: drawMinimalGeometric()
  case 4: drawAtmosphericNoise()
  case 5: drawKaleidoscopeFractals()
  case 6: drawLiquidPlasma()
  case 7: drawNeonGrid()
  case 8: drawSpiralGalaxy()
  case 9: drawCrystalLattice()
}
```

## Edit Mode Architecture

```
EditDialog (UI Shell)
    ├── Dialog Header
    ├── Scrollable Content
    │   └── Track Management
    │       ├── Add Track Button
    │       └── Accordion
    │           └── For Each Track:
    │               ├── Track Info Display
    │               ├── Remove Button
    │               ├── AudioUpload Component
    │               ├── Text Inputs (Title, Artist, Album)
    │               └── Visualization Selector
    └── Save Button
```

### Audio Upload Flow
```
User Selects File
    ↓
Validate (type, size)
    ↓
FileReader.readAsDataURL()
    ↓
Data URL String
    ↓
Create Audio Element
    ↓
Extract Metadata (duration)
    ↓
Update Track Object
    ↓
Store in State
```

## Event Handling

### Audio Events
- `onTimeUpdate` → Update progress
- `onLoadedMetadata` → Get duration
- `onCanPlay` → Set ready state
- `onError` → Handle failures
- `onEnded` → Auto-play next

### User Events
- Click Play → Toggle playback
- Click Skip → Change track
- Drag Slider → Seek position
- Click Track → Select from playlist
- Click Fullscreen → Enter fullscreen
- Swipe Down → Exit fullscreen (touch)
- Press Escape → Exit fullscreen (keyboard)

## Performance Optimizations

### Canvas
- Limited pixel ratio (1.5x max)
- Intersection Observer (pause when not visible)
- `desynchronized` context for better performance

### Audio
- Single AudioContext (created once)
- Source node reused
- Analyser configured once

### Animation
- `requestAnimationFrame` for 60 FPS
- Conditional rendering based on play state
- Particle system with lifecycle management

## Dependencies Map

```
StandaloneMusicPlayer
├── react (useState, useRef, useEffect)
├── motion/react (AnimatePresence, motion)
├── lucide-react (Icons)
├── ./ui/button
├── ./ui/slider
├── ./PsychedelicVisualizer
├── ./StandaloneMusicPlayerEditDialog (if edit mode)
└── ./types

PsychedelicVisualizer
├── react (useEffect, useRef)
└── Browser APIs (Canvas, IntersectionObserver)

StandaloneMusicPlayerEditDialog
├── react (useState)
├── lucide-react (Icons)
├── ./EditComponents
├── ./ui/input
├── ./ui/label
├── ./ui/select
├── ./ui/accordion
└── ./types

EditComponents
├── react (useState, ReactNode)
├── lucide-react (Icons)
├── ./ui/button
├── ./ui/label
├── ./ui/dialog
└── Browser APIs (FileReader)
```

## Browser APIs Used

- **Web Audio API**
  - AudioContext
  - MediaElementAudioSourceNode
  - AnalyserNode
  - getByteFrequencyData

- **Canvas API**
  - 2D rendering context
  - Gradients
  - Path drawing

- **File API**
  - FileReader
  - readAsDataURL

- **Intersection Observer**
  - Visibility detection

- **Animation**
  - requestAnimationFrame
  - cancelAnimationFrame

## Styling System

### Tailwind Classes
- Responsive utilities
- Color utilities
- Layout utilities
- Animation utilities

### CSS Variables (from globals.css)
- `--primary`
- `--card`
- `--border`
- `--foreground`
- `--muted-foreground`

## Fullscreen Implementation

### Structure
```
Fixed Overlay (z-index: 9999)
├── Visualizer (full screen)
├── Track Info (centered)
├── Exit Button (top-right)
└── Controls (bottom)
```

### Animations
- Fade in/out
- Scale transform
- Loading indicator
- Swipe gesture tracking

## Security Considerations

- File size validation (50MB max)
- File type validation (audio/* only)
- CORS-compliant audio URLs
- No server-side processing
- Data URLs stored in memory only

## Future Enhancement Possibilities

1. **Cloud Storage Integration**
   - Replace data URLs with actual file uploads
   - Integrate with S3, Cloudinary, etc.

2. **Playlist Persistence**
   - Save to localStorage
   - Export/import playlists

3. **More Visualizations**
   - Plugin system for custom visualizations
   - Community-contributed effects

4. **Advanced Audio**
   - Equalizer controls
   - Audio effects (reverb, delay)
   - Crossfade between tracks

5. **Social Features**
   - Share playlists
   - Collaborative playlists

---

This architecture ensures:
- ✅ Modularity (easy to modify components)
- ✅ Performance (optimized rendering)
- ✅ Maintainability (clear structure)
- ✅ Extensibility (easy to add features)
- ✅ Portability (minimal dependencies)
