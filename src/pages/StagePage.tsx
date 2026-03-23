/**
 * Stage / Live mode — for projecting visualizations at venues.
 * Reacts to live audio (mic/line-in) instead of playback.
 *
 * Hidden from visitors: only accessible when VITE_STAGE_MODE_AVAILABLE=true.
 * Navigate to /stage to use. No links from main site.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PsychedelicVisualizer } from '../components/PsychedelicVisualizer';
import { Mic, Home, Loader2, Settings2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { cn } from '../components/ui/utils';

interface AudioDevice {
  deviceId: string;
  label: string;
}

const STAGE_AVAILABLE =
  import.meta.env.VITE_STAGE_MODE_AVAILABLE === 'true' ||
  import.meta.env.VITE_STAGE_MODE_AVAILABLE === '1';

export function StagePage() {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [vizId, setVizId] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

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
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 2048;
        source.connect(analyserNode);
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

  // Restart when device changes
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startLiveInput(deviceId);
  };

  if (!STAGE_AVAILABLE) {
    return null; // App.tsx will redirect
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto" />
            <p className="text-white/80">Requesting microphone access…</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && !demoMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-6">
          <div className="text-center space-y-5 max-w-md">
            <Mic className="h-16 w-16 text-amber-500/80 mx-auto" />
            <p className="text-white/90 text-lg font-medium">{error}</p>
            <p className="text-white/60 text-sm">
              To allow mic access: click the lock or info icon in the address bar → Site settings → Microphone → Allow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => startLiveInput(selectedDeviceId || undefined)}
                variant="outline"
                className="text-white border-white/30 hover:bg-white/20"
              >
                Try again
              </Button>
              <Button
                onClick={() => {
                  setError(null);
                  setDemoMode(true);
                }}
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              >
                Use Demo Mode
              </Button>
            </div>
            <p className="text-white/40 text-xs">Demo mode shows simulated visuals for testing without a mic.</p>
          </div>
        </div>
      )}

      {/* Minimal controls — top-right, auto-hide */}
      <div
        className={cn(
          'absolute top-0 right-0 z-20 flex flex-col items-end gap-2 p-4 transition-opacity duration-300',
          showSettings ? 'opacity-100' : 'opacity-0 hover:opacity-100'
        )}
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings((s) => !s)}
            className="h-10 w-10 bg-black/50 text-white border-white/30 hover:bg-white/20"
            aria-label="Settings"
          >
            <Settings2 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-10 w-10 bg-black/50 text-white border-white/30 hover:bg-white/20"
            aria-label="Back to site"
          >
            <a href="/">
              <Home className="h-5 w-5" />
            </a>
          </Button>
        </div>

        {showSettings && (
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 space-y-3 min-w-[220px]">
            {demoMode ? (
              <div className="space-y-2">
                <p className="text-cyan-400/90 text-sm">Demo mode (simulated audio)</p>
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
                <label className="text-white/80 text-sm block">Audio input</label>
                <Select
                  value={selectedDeviceId || (devices[0]?.deviceId ?? '')}
                  onValueChange={handleDeviceChange}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
              <SelectContent className="z-[10050] bg-black/90 border-white/20 text-white">
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

            <label className="text-white/80 text-sm block">Visualization</label>
            <Select value={String(vizId)} onValueChange={(v) => setVizId(Number(v))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[10050] bg-black/90 border-white/20 text-white">
                {[
                  'Organic Flow',
                  'Depth Layers',
                  'Waveform Interference',
                  'Minimal Geometric',
                  'Atmospheric Noise',
                  'Kaleidoscope Fractals',
                  'Liquid Plasma',
                  'Neon Grid',
                  'Spiral Galaxy',
                  'Crystal Lattice',
                ].map((name, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
