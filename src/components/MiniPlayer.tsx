import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { usePlayback } from '../contexts/PlaybackContext';
import { generateEQData } from '../lib/eqSimulator';
import { motion, AnimatePresence } from 'motion/react';

const EQ_BAR_COUNT = 12;
const dataArray = new Uint8Array(1024);

function MiniEQ({ isPlaying, currentTrack }: { isPlaying: boolean; currentTrack: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const musicTimeRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);
  const currentTrackRef = useRef(currentTrack);
  isPlayingRef.current = isPlaying;
  currentTrackRef.current = currentTrack;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const barWidth = w / EQ_BAR_COUNT - 2;
    let raf: number;

    const draw = () => {
      const playing = isPlayingRef.current;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, w, h);
      let bands: number[];
      if (playing) {
        timeRef.current += 1;
        musicTimeRef.current += 16;
        const eq = generateEQData(dataArray, currentTrackRef.current % 5, musicTimeRef.current, timeRef.current);
        bands = [
          eq.subBass,
          eq.bass,
          eq.lowMid,
          eq.mid,
          eq.highMid,
          eq.high,
          eq.presence,
          eq.energy,
          eq.mid,
          eq.highMid,
          eq.bass,
          eq.subBass,
        ];
      } else {
        bands = [12, 8, 10, 6, 8, 6, 8, 10, 6, 8, 8, 12];
      }
      bands.forEach((val, i) => {
        const x = i * (barWidth + 2) + 1;
        const barH = Math.min((val / 255) * h * 0.9, h - 2);
        const gradient = ctx.createLinearGradient(x, h, x + barWidth, 0);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.5)');
        gradient.addColorStop(1, 'rgba(217, 70, 239, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, h - barH, barWidth, barH);
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={28}
      className="rounded overflow-hidden flex-shrink-0"
      aria-hidden
    />
  );
}

export function MiniPlayer() {
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTrackData,
    togglePlay,
    skipForward,
    skipBack,
    isFullscreen,
  } = usePlayback();
  const [playerInView, setPlayerInView] = useState(true);

  const scrollToFullPlayer = () => {
    document.getElementById('music-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Section is lazy-loaded so #music-player may not exist on first mount; retry until it does
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const attach = (el: Element) => {
      // Shrink effective viewport from top so mini shows once player has scrolled up past ~header height
      io = new IntersectionObserver(
        ([entry]) => setPlayerInView(entry?.isIntersecting ?? false),
        { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
      );
      io.observe(el);
    };
    const el = document.getElementById('music-player');
    if (el) {
      attach(el);
      return () => { io?.disconnect(); };
    }
    const id = setInterval(() => {
      const el = document.getElementById('music-player');
      if (el) {
        clearInterval(id);
        attach(el);
      }
    }, 400);
    return () => {
      clearInterval(id);
      io?.disconnect();
    };
  }, []);

  // Only hide when full player is in view or fullscreen is active
  const show = tracks.length > 0 && currentTrackData && !playerInView && !isFullscreen;
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="fixed md:relative md:justify-self-center left-1/2 md:left-auto bottom-2 md:bottom-auto -translate-x-1/2 md:translate-x-0 z-[45] flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl bg-background/90 backdrop-blur-md border border-cyan-500/20 shadow-lg w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] md:w-auto md:min-w-[280px] md:max-w-[420px]"
        style={{ bottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={skipBack}
            disabled={currentTrack === 0}
            className="hidden sm:inline-flex p-1.5 rounded-md text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!currentTrackData?.url}
            className="p-2 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white disabled:opacity-50 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={skipForward}
            disabled={currentTrack === tracks.length - 1}
            className="hidden sm:inline-flex p-1.5 rounded-md text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 min-w-0 text-left sm:text-center">
          <p className="text-sm font-medium text-foreground truncate">{currentTrackData.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentTrackData.album || currentTrackData.artist}</p>
        </div>
        <button
          type="button"
          onClick={scrollToFullPlayer}
          className="flex-shrink-0 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Go to full player"
        >
          <MiniEQ isPlaying={isPlaying} currentTrack={currentTrack} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
