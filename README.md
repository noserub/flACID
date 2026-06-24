# flACID — Official Band Page

A psychedelic, performance-optimized band website for **flACID**. Fans get an immersive music experience with EQ-reactive visualizations, a full-screen **Descent Mode**, and a dedicated **Stage Mode** for live venue projection. Admins can manage all site content through an authenticated edit workflow backed by Supabase.

## Capabilities

### Music Player

- **Hero-first playback** — the hero stage is the primary listening surface: logo + mini player when idle, full visualizer + docked transport when a track is playing
- **Discography** lists each release with its tracks; streamable songs (matched to the audio catalog) play on the hero without leaving the page
- Full playback controls on the hero dock and header mini player: play/pause, skip, seek, volume, and playlist panel
- **7-band EQ analysis** (sub bass through brilliance) drives every visualization in real time via the Web Audio API
- **20 visualization modes** — assign a different visual to each track
- Adjustable visualization sensitivity
- Legacy fullscreen player UI remains in the codebase for the standalone player reference; it is not part of the default fan scroll path

### Visualizations (20)

Each mode reacts to frequency bands, waveform data, and track energy:

| # | Name | # | Name |
|---|------|---|------|
| 1 | Organic Flow Field | 11 | Breathing Mandala |
| 2 | Depth Layers | 12 | IFS Kaleidoscope |
| 3 | Waveform Interference | 13 | Prism Spectrum |
| 4 | Minimal Geometric | 14 | Metaballs |
| 5 | Atmospheric Noise | 15 | Reaction Diffusion |
| 6 | Kaleidoscope Fractals | 16 | Pulse Horizon |
| 7 | Liquid Plasma | 17 | Light Speed Warp |
| 8 | Neon Grid | 18 | Tron Corridor |
| 9 | Spiral Galaxy | 19 | Lite-Brite Magic |
| 10 | Crystal Lattice | 20 | Neon Tunnel 3D (WebGL) |

### Descent Mode

A full-site psychedelic takeover layered on top of the normal page experience:

- Intelligent particle organisms with flocking behaviors
- Chromatic aberration, VHS scanlines, and organic tendrils
- Breathing background with mouse-reactive panning
- Scroll-boundary glow and tunnel-vision vignette
- All effects synchronized to music intensity via the shared audio analyser
- Desktop-only (hidden on touch-primary devices)

### Stage Mode (`/stage`)

Built for projecting visuals at live shows:

- Reacts to **live audio** from a microphone or line-in instead of playback
- Manual or auto-cycling visualization selection
- Separate **projection view** for a second display or projector
- Cross-window sync between control and projection windows
- Demo mode when no audio input is available

### Site Content

| Section | What it does |
|---------|--------------|
| **Hero** | Landing with glitch effects and band branding |
| **About** | Band bio and story |
| **Discography** | Albums with track lists — streamable tracks play on the hero stage |
| **Photo Gallery** | Masonry layout with lazy-loaded images |
| **Tour** | Upcoming show dates |
| **Footer** | Social links and newsletter signup |

### Admin & Content Management

- Sign in via Supabase Auth to unlock **Edit Mode**
- Edit all sections inline: hero copy, about text, tracks, albums, photos, tour dates, footer
- Upload audio and images directly to Supabase Storage
- Draft → publish workflow — changes are saved as drafts until published
- Show/hide individual sections

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4, shadcn/ui, Motion |
| Audio | Web Audio API (7-band EQ analyser) |
| Graphics | HTML5 Canvas + Three.js (Neon Tunnel 3D) |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Deployment | Vercel (SPA rewrites, long-cache asset headers) |
| Analytics | Vercel Analytics |

## Performance

- Lazy-loaded below-the-fold sections with skeleton fallbacks
- Code splitting and tree shaking via Vite
- WebP image optimization with responsive sizes
- Audio `preload="none"` and client-side validation
- 1-year immutable cache headers on static assets

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project (for content management and auth)

### Install & run

```bash
npm install
cp .env.local.example .env.local   # add your Supabase URL and anon key
npm run dev
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Build and preview locally |
| `npm run analyze` | Build with bundle visualizer |
| `npm test` | Run tests (Vitest) |

## Project Structure

```
src/
├── components/          # UI components (player, visualizer, sections, edit dialogs)
│   └── visualizer/      # Canvas/WebGL visualization engine and draw functions
├── contexts/            # React context (auth, edit mode, descent mode, playback)
├── hooks/               # Custom hooks (auth, SEO, descent support)
├── lib/                 # Utilities (Supabase client, audio control, mappers)
├── pages/               # Route-level pages (StagePage)
├── services/            # Supabase content sync and upload services
├── standalone-player/   # Portable music player module (see src/standalone-player/README.md)
└── App.tsx              # Entry point and routing
```

## Additional Documentation

Detailed setup guides and architecture notes live in `src/`:

- [`src/README.md`](src/README.md) — extended feature overview and Supabase setup
- [`src/START_HERE.md`](src/START_HERE.md) — onboarding guide for new developers
- [`src/PROJECT_SUMMARY.md`](src/PROJECT_SUMMARY.md) — architecture and file map
- [`src/standalone-player/README.md`](src/standalone-player/README.md) — embeddable player module

## License

Private project. All rights reserved.
