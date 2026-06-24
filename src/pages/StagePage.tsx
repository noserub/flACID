/**
 * Stage / Live mode — for projecting visualizations at venues.
 * Reacts to live audio (mic/line-in) instead of playback.
 *
 * Link in overflow menu (signed-in only). Direct URL: /stage
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PsychedelicVisualizer } from '../components/PsychedelicVisualizer';
import { Mic, Loader2, Monitor, Settings2, SkipBack, SkipForward, Timer } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { cn } from '../components/ui/utils';
import {
  brandOverlayChromeButtonClass,
  brandSpinnerClass,
  brandStageOutlineButtonClass,
  brandStagePanelClass,
  brandStageSelectContentClass,
  brandStageSelectTriggerClass,
} from '../lib/brandClasses';
import { onDark, overlay } from '../lib/colors';
import { zIndex } from '../lib/layoutTokens';
import {
  useVizSensitivity,
  VIZ_SENSITIVITY_MAX,
  VIZ_SENSITIVITY_MIN,
} from '../contexts/VizSensitivityContext';

import { VISUALIZATION_NAMES } from '../lib/visualizationNames';

const VIZ_NAMES = VISUALIZATION_NAMES;

const AUTO_CYCLE_DURATIONS = [5, 6, 8, 10, 12, 16] as const;

const STAGE_VIZ_CHANNEL = 'stage-viz-sync';
const STAGE_VIZ_STORAGE_KEY = 'stage-viz-id';

/** Projection-only view: viz only, no controls. For second display / projector. */
function StageProjectionView() {
  // Prefer localStorage (control writes on every viz change) — reliable cross-window sync
  const initialViz = (() => {
    if (typeof window === 'undefined') return 0;
    const fromStorage = localStorage.getItem(STAGE_VIZ_STORAGE_KEY);
    if (fromStorage !== null) {
      const n = parseInt(fromStorage, 10);
      if (!Number.isNaN(n)) return n % VIZ_NAMES.length;
    }
    const fromUrl = new URLSearchParams(window.location.search).get('viz');
    return parseInt(fromUrl ?? '0', 10) % VIZ_NAMES.length;
  })();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [vizId, setVizId] = useState(initialViz);
  const [demoMode, setDemoMode] = useState(false);
  const [showTapOverlay, setShowTapOverlay] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  streamRef.current = stream;

  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => setShowTapOverlay(false)).catch(() => {});
    } else {
      setShowTapOverlay(false);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setShowTapOverlay(!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const deviceIdFromUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('device') ?? ''
    : '';
  const [deviceId, setDeviceId] = useState(deviceIdFromUrl);

  useEffect(() => {
    let ch: BroadcastChannel | null = null;
    const t = window.setTimeout(() => {
      if (typeof BroadcastChannel === 'undefined') return;
      ch = new BroadcastChannel(STAGE_VIZ_CHANNEL);
      ch.addEventListener('message', (e: MessageEvent) => {
        if (typeof e.data?.vizId === 'number') setVizId(e.data.vizId);
        if (typeof e.data?.deviceId === 'string') setDeviceId(e.data.deviceId);
      });
    }, 400);
    return () => {
      clearTimeout(t);
      ch?.close();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
          video: false,
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(mediaStream);
        const gain = ctx.createGain();
        gain.gain.value = 1.5; // Boost low-volume sources (e.g. line-in)
        const a = ctx.createAnalyser();
        a.fftSize = 2048;
        source.connect(gain);
        gain.connect(a);
        setAnalyser(a);
        if (ctx.state === 'suspended') await ctx.resume();
      } catch {
        setDemoMode(true);
      }
    };
    init();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [deviceId]);

  return (
    <div className={cn('fixed inset-0', zIndex.fullscreen, overlay.fullscreen)}>
      <PsychedelicVisualizer
        analyser={demoMode ? null : analyser}
        isPlaying={!!stream || demoMode}
        currentTrack={vizId}
        visualizationId={vizId}
      />
      {showTapOverlay && (
        <button
          type="button"
          onClick={enterFullscreen}
          className={cn(
            'absolute inset-0 flex items-center justify-center backdrop-blur-[2px] cursor-pointer transition-opacity',
            overlay.scrimLight,
            'hover:bg-void-scrim focus:outline-none focus:ring-2 focus:ring-neon-green/50'
          )}
          aria-label="Tap to present fullscreen"
        >
          <span className={cn(onDark.body, 'text-lg font-medium px-6 py-3 rounded-lg border border-white/20', overlay.scrimLight)}>
            Tap anywhere to present
          </span>
        </button>
      )}
    </div>
  );
}

interface AudioDevice {
  deviceId: string;
  label: string;
}

const isProjection = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('projection') === '1';

export function StagePage() {
  const { sensitivity, setSensitivity } = useVizSensitivity();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [vizId, setVizId] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [autoCycleEnabled, setAutoCycleEnabled] = useState(false);
  const [autoCycleMinutes, setAutoCycleMinutes] = useState(8);
  const justShowedRef = useRef(0);
  const vizIdRef = useRef(vizId);
  vizIdRef.current = vizId; // Always current for Project button (avoids stale closure)
  const selectedDeviceIdRef = useRef(selectedDeviceId);
  selectedDeviceIdRef.current = selectedDeviceId;
  const projectionWindowRef = useRef<Window | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  streamRef.current = stream;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setAnalyser(null);
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
  }, []);

  const startLiveInput = useCallback(
    async (deviceId?: string) => {
      stopStream();
      setError(null);
      setLoading(true);

      try {
        const constraints: MediaStreamConstraints = {
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
          video: false,
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(mediaStream);
        const gain = ctx.createGain();
        gain.gain.value = 1.5; // Boost low-volume sources (e.g. line-in)
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 2048;
        source.connect(gain);
        gain.connect(analyserNode);
        setAnalyser(analyserNode);

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
      } catch (e) {
        const isPermissionDenied =
          e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError');
        const msg = isPermissionDenied
          ? 'Permission denied'
          : e instanceof Error
            ? e.message
            : 'Could not access microphone';
        setError(msg);
        setAnalyser(null);
      } finally {
        setLoading(false);
      }
    },
    [stopStream]
  );

  // List devices and start with default on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = list
          .filter((d) => d.kind === 'audioinput' && d.deviceId)
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 8)}` }));
        if (mounted) {
          setDevices(audioInputs);
          if (audioInputs.length > 0) {
            setSelectedDeviceId(audioInputs[0].deviceId);
            await startLiveInput(audioInputs[0].deviceId);
          } else {
            await startLiveInput();
          }
        }
      } catch {
        if (mounted) startLiveInput();
      }
    };

    init();
    return () => {
      mounted = false;
      stopStream();
    };
  }, [startLiveInput, stopStream]);

  // Broadcast vizId and deviceId for projection window sync (live updates only)
  const vizChannelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(STAGE_VIZ_CHANNEL);
    vizChannelRef.current = ch;
    return () => { ch.close(); vizChannelRef.current = null; };
  }, []);
  const vizBroadcastInitRef = useRef(false);
  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STAGE_VIZ_STORAGE_KEY, String(vizId));
    if (!vizBroadcastInitRef.current) {
      vizBroadcastInitRef.current = true;
      return;
    }
    vizChannelRef.current?.postMessage({ vizId });
  }, [vizId]);
  useEffect(() => {
    vizChannelRef.current?.postMessage({ deviceId: selectedDeviceId });
  }, [selectedDeviceId]);

  // Auto-cycle: advance viz every N minutes when enabled
  useEffect(() => {
    if (!autoCycleEnabled) return;
    const ms = autoCycleMinutes * 60 * 1000;
    const id = window.setInterval(() => {
      setVizId((v) => {
        const next = (v + 1) % VIZ_NAMES.length;
        vizIdRef.current = next;
        if (typeof localStorage !== 'undefined') localStorage.setItem(STAGE_VIZ_STORAGE_KEY, String(next));
        return next;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [autoCycleEnabled, autoCycleMinutes]);

  const handleNextViz = () => {
    setVizId((v) => {
      const next = (v + 1) % VIZ_NAMES.length;
      vizIdRef.current = next;
      if (typeof localStorage !== 'undefined') localStorage.setItem(STAGE_VIZ_STORAGE_KEY, String(next));
      return next;
    });
  };

  const handlePrevViz = () => {
    setVizId((v) => {
      const next = (v - 1 + VIZ_NAMES.length) % VIZ_NAMES.length;
      vizIdRef.current = next;
      if (typeof localStorage !== 'undefined') localStorage.setItem(STAGE_VIZ_STORAGE_KEY, String(next));
      return next;
    });
  };

  // Restart when device changes
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startLiveInput(deviceId);
  };

  const handleBackgroundClick = () => {
    if (Date.now() - justShowedRef.current < 300) return;
    setShowControls((v) => !v);
  };

  // Projection-only view: viz only, no controls. Syncs vizId from main via BroadcastChannel.
  if (isProjection) {
    return <StageProjectionView />;
  }

  return (
    <div
      className={cn('fixed inset-0 flex flex-col cursor-pointer', zIndex.fullscreen, overlay.fullscreen)}
      onClick={handleBackgroundClick}
    >
      {/* Fullscreen visualizer */}
      <div className="absolute inset-0">
        <PsychedelicVisualizer
          analyser={demoMode ? null : analyser}
          isPlaying={!!stream || demoMode}
          currentTrack={vizId}
          visualizationId={vizId}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className={cn('absolute inset-0 flex items-center justify-center z-10', overlay.scrimHeavy)} onClick={(e) => e.stopPropagation()}>
          <div className="text-center space-y-4">
            <Loader2 className={cn('h-12 w-12 animate-spin mx-auto', brandSpinnerClass)} />
            <p className={onDark.body}>Requesting microphone access…</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && !demoMode && (
        <div className={cn('absolute inset-0 flex items-center justify-center z-10 p-6', overlay.scrimHeavy)} onClick={(e) => e.stopPropagation()}>
          <div className="text-center space-y-5 max-w-md">
            <Mic className="h-16 w-16 text-amber-500/80 mx-auto" />
            <p className={cn(onDark.heading, 'text-lg font-medium')}>{error}</p>
            <p className={cn(onDark.muted, 'text-sm')}>
              To allow mic access: click the lock or info icon in the address bar → Site settings → Microphone → Allow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => startLiveInput(selectedDeviceId || undefined)}
                variant="outline"
                className={brandStageOutlineButtonClass}
              >
                Try again
              </Button>
              <Button
                onClick={() => {
                  setError(null);
                  setDemoMode(true);
                }}
                variant="secondary"
                className={cn(brandStageOutlineButtonClass, 'bg-white/20 hover:bg-white/30')}
              >
                Use Demo Mode
              </Button>
            </div>
            <p className={cn(onDark.faint, 'text-xs')}>Demo mode shows simulated visuals for testing without a mic.</p>
          </div>
        </div>
      )}

      {/* Controls — tap to show/hide (like fullscreen player) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            key="stage-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-0 right-0 z-[100] flex flex-col items-end gap-2 p-4 pointer-events-auto"
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
            onClick={(e) => {
              e.stopPropagation();
              justShowedRef.current = Date.now();
            }}
          >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevViz}
            className={cn('h-10 w-10', brandOverlayChromeButtonClass)}
            aria-label="Previous visualization"
            title="Previous visualization"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextViz}
            className={cn('h-10 w-10', brandOverlayChromeButtonClass)}
            aria-label="Next visualization"
            title="Next visualization"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings((s) => !s)}
            className={cn('h-10 w-10', brandOverlayChromeButtonClass)}
            aria-label="Settings"
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>

        {showSettings && (
          <div className={cn(brandStagePanelClass, 'space-y-3 min-w-[220px]')}>
            {demoMode ? (
              <div className="space-y-2">
                <p className={cn(onDark.accent, 'text-sm')}>Demo mode (simulated audio)</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-white border-white/30 hover:bg-white/20"
                  onClick={() => {
                    setDemoMode(false);
                    startLiveInput(selectedDeviceId || undefined);
                  }}
                >
                  Switch to live input
                </Button>
              </div>
            ) : (
              <>
                <label className={cn(onDark.body, 'text-sm block')}>Audio input</label>
                <Select
                  value={selectedDeviceId || (devices[0]?.deviceId ?? '')}
                  onValueChange={handleDeviceChange}
                >
                  <SelectTrigger className={brandStageSelectTriggerClass}>
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
              <SelectContent className={cn(brandStageSelectContentClass, zIndex.lightboxChrome)}>
                {devices
                  .filter((d) => d.deviceId)
                  .map((d) => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <label className={cn(onDark.body, 'text-sm block')}>Visualization</label>
            <Select value={String(vizId)} onValueChange={(v) => {
                const n = Number(v);
                vizIdRef.current = n;
                if (typeof localStorage !== 'undefined') localStorage.setItem(STAGE_VIZ_STORAGE_KEY, String(n));
                setVizId(n);
              }}>
              <SelectTrigger className={brandStageSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={cn(brandStageSelectContentClass, zIndex.lightboxChrome)}>
                {VIZ_NAMES.map((name, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-1.5">
              <Label className={cn(onDark.body, 'text-sm block')}>Visualizer reactivity</Label>
              <Slider
                value={[sensitivity]}
                min={VIZ_SENSITIVITY_MIN}
                max={VIZ_SENSITIVITY_MAX}
                step={0.05}
                onValueChange={(v) => setSensitivity(v[0] ?? 1)}
                className="cursor-pointer"
                aria-label="Visualizer reactivity"
              />
              <p className={cn(onDark.faint, 'text-[11px]')}>Lower = calmer, less noise</p>
            </div>

            <div className="pt-2 border-t border-white/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className={cn(onDark.body, 'text-sm flex items-center gap-1.5')} htmlFor="auto-cycle">
                  <Timer className="h-3.5 w-3.5" />
                  Auto-cycle
                </label>
                <Switch
                  id="auto-cycle"
                  checked={autoCycleEnabled}
                  onCheckedChange={setAutoCycleEnabled}
                />
              </div>
              {autoCycleEnabled && (
                <Select
                  value={String(autoCycleMinutes)}
                  onValueChange={(v) => setAutoCycleMinutes(Number(v))}
                >
                  <SelectTrigger className={cn(brandStageSelectTriggerClass, 'h-8 text-sm')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={cn(brandStageSelectContentClass, zIndex.lightboxChrome)}>
                    {AUTO_CYCLE_DURATIONS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="pt-2 border-t border-white/20">
              <Button
                variant="outline"
                size="sm"
                className={cn(brandStageOutlineButtonClass, 'w-full flex items-center gap-2')}
                onClick={() => {
                  const id = vizIdRef.current;
                  const dev = selectedDeviceIdRef.current;
                  if (typeof localStorage !== 'undefined') localStorage.setItem(STAGE_VIZ_STORAGE_KEY, String(id));
                  const params = new URLSearchParams({ projection: '1', viz: String(id) });
                  if (dev) params.set('device', dev);
                  const url = `${window.location.origin}/stage?${params}`;
                  // Try to get existing projection window by name (works across tabs)
                  const existingByName = window.open('', 'stage-projection');
                  const existing = (existingByName && !existingByName.closed)
                    ? existingByName
                    : projectionWindowRef.current && !projectionWindowRef.current.closed
                      ? projectionWindowRef.current
                      : null;
                  if (existing && !existing.closed) {
                    existing.location.replace(url);
                    existing.focus();
                    projectionWindowRef.current = existing;
                  } else {
                    const win = window.open(url, 'stage-projection', 'noopener,width=1920,height=1080');
                    if (win) projectionWindowRef.current = win;
                  }
                }}
              >
                <Monitor className="h-4 w-4" />
                Project (viz only)
              </Button>
              <p className={cn(onDark.faint, 'text-xs mt-1.5')}>Opens a second window. Move to projector, then tap to present.</p>
            </div>
          </div>
        )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
