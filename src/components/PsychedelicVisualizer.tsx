import { useEffect, useRef } from 'react';
import type { EQBands } from './visualizer/types';
import { Particle } from './visualizer/Particle';
import { VisualAudioSmoother } from '../lib/audioVisualControl';
import { generateEQData } from '../lib/eqSimulator';
import {
  createNeonTunnelRenderer,
  getVisualization,
  NUM_VISUALIZATIONS,
  THREE_NEON_TUNNEL_VIZ_INDEX,
  type ThreeTunnelHandle,
} from './visualizer/visualizations';
import { useVizSensitivity } from '../contexts/VizSensitivityContext';
import { useDescentOverlayForVisualizer } from '../contexts/DescentModeContext';

interface PsychedelicVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  currentTrack: number;
  visualizationId?: number;
}

const BACKGROUND_BASE = [
  { h: 270, s: 30, l1: 8, l2: 5, l3: 3 },
  { h: 200, s: 25, l1: 10, l2: 6, l3: 3 },
  { h: 280, s: 35, l1: 9, l2: 5, l3: 2 },
  { h: 25, s: 30, l1: 10, l2: 6, l3: 3 },
  { h: 15, s: 25, l1: 8, l2: 5, l3: 2 },
  { h: 320, s: 40, l1: 7, l2: 4, l3: 2 },
  { h: 180, s: 35, l1: 9, l2: 5, l3: 3 },
  { h: 200, s: 25, l1: 6, l2: 4, l3: 2 },
  { h: 240, s: 30, l1: 8, l2: 5, l3: 2 },
  { h: 290, s: 35, l1: 9, l2: 5, l3: 3 },
  { h: 310, s: 38, l1: 9, l2: 5, l3: 2 },
  { h: 285, s: 42, l1: 8, l2: 4, l3: 2 },
  { h: 210, s: 32, l1: 10, l2: 6, l3: 3 },
  { h: 265, s: 40, l1: 7, l2: 4, l3: 2 },
  { h: 300, s: 36, l1: 8, l2: 5, l3: 2 },
  { h: 300, s: 55, l1: 7, l2: 4, l3: 2 },
  { h: 285, s: 55, l1: 10, l2: 6, l3: 3 },
];

export function PsychedelicVisualizer({
  analyser,
  isPlaying,
  currentTrack,
  visualizationId,
}: PsychedelicVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const musicTimeRef = useRef(0);
  const { sensitivity } = useVizSensitivity();
  const sensitivityRef = useRef(sensitivity);
  sensitivityRef.current = sensitivity;
  const isDescentOverlay = useDescentOverlayForVisualizer();
  const descentRef = useRef(false);
  descentRef.current = isDescentOverlay;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const webgl = webglRef.current;
    if (!container || !canvas || !webgl) return;

    const vizPick = visualizationId !== undefined ? visualizationId : currentTrack;
    const isThreeTunnel = vizPick % NUM_VISUALIZATIONS === THREE_NEON_TUNNEL_VIZ_INDEX;

    let ctx: CanvasRenderingContext2D | null = null;
    if (!isThreeTunnel) {
      ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
    }

    const threeHandle: ThreeTunnelHandle | null = isThreeTunnel ? createNeonTunnelRenderer(webgl) : null;

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        isVisible = e?.isIntersecting ?? true;
      },
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(isThreeTunnel ? webgl : canvas);

    const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.5);

    const LAYOUT_QUANT = 4;
    const quantizeLayoutDim = (n: number) =>
      Math.max(LAYOUT_QUANT, Math.round(n / LAYOUT_QUANT) * LAYOUT_QUANT);

    const readLayoutSize = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { w: quantizeLayoutDim(r.width), h: quantizeLayoutDim(r.height) };
    };

    let lastQuantW = 0;
    let lastQuantH = 0;

    type CanvasSync = { drawW: number; drawH: number; didResetViz: boolean };

    const syncLayout = (): CanvasSync => {
      const pr = getPixelRatio();
      const { w, h } = readLayoutSize(container);
      if (w < LAYOUT_QUANT || h < LAYOUT_QUANT) {
        return { drawW: Math.max(1, w), drawH: Math.max(1, h), didResetViz: false };
      }

      let didResetViz = false;
      if (lastQuantW !== 0 && (w !== lastQuantW || h !== lastQuantH)) {
        didResetViz = true;
      }
      lastQuantW = w;
      lastQuantH = h;

      if (isThreeTunnel && threeHandle) {
        threeHandle.setSize(w, h, pr);
      } else if (ctx) {
        const bw = Math.max(1, Math.round(w * pr));
        const bh = Math.max(1, Math.round(h * pr));
        if (canvas.width !== bw || canvas.height !== bh) {
          canvas.width = bw;
          canvas.height = bh;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(pr, pr);
          didResetViz = true;
        }
      }

      return { drawW: w, drawH: h, didResetViz };
    };

    let resizeRaf: number | null = null;
    const scheduleSync = () => {
      if (resizeRaf !== null) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        syncLayout();
      });
    };

    let roDebounceTimer: ReturnType<typeof window.setTimeout> | null = null;
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (roDebounceTimer !== null) clearTimeout(roDebounceTimer);
            roDebounceTimer = window.setTimeout(() => {
              roDebounceTimer = null;
              scheduleSync();
            }, 48);
          })
        : null;

    const onOrientationChange = () => {
      scheduleSync();
      requestAnimationFrame(() => {
        syncLayout();
        requestAnimationFrame(() => {
          syncLayout();
        });
      });
    };

    syncLayout();
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('orientationchange', onOrientationChange);
    const vv = window.visualViewport;
    const onVisualViewportChange = () => scheduleSync();
    vv?.addEventListener('resize', onVisualViewportChange);
    vv?.addEventListener('scroll', onVisualViewportChange);
    ro?.observe(container);

    const bufferLength = analyser ? analyser.frequencyBinCount : 1024;
    const dataArray = new Uint8Array(bufferLength);
    const audioSmoother = new VisualAudioSmoother();
    let time = 0;

    const draw = () => {
      if (document.visibilityState === 'hidden') {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const { drawW: width, drawH: height, didResetViz } = syncLayout();
      if (didResetViz) {
        particlesRef.current = [];
        audioSmoother.reset();
      }

      if (!isVisible) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      if (width < 2 || height < 2) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      let eq: EQBands;

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        let fftPeak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > fftPeak) fftPeak = dataArray[i];
        }
        if (fftPeak < 1) {
          eq = generateEQData(dataArray, currentTrack, musicTimeRef.current, time);
          musicTimeRef.current += 100;
        } else {
          const subBassRange = Math.floor(bufferLength * 0.03);
          const bassRange = Math.floor(bufferLength * 0.1);
          const lowMidRange = Math.floor(bufferLength * 0.15);
          const midRange = Math.floor(bufferLength * 0.4);
          const highMidRange = Math.floor(bufferLength * 0.6);
          const highRange = Math.floor(bufferLength * 0.8);
          const getAverage = (start: number, end: number) => {
            let sum = 0;
            for (let i = start; i < end; i++) sum += dataArray[i];
            return sum / (end - start);
          };
          eq = {
            subBass: getAverage(0, subBassRange),
            bass: getAverage(subBassRange, bassRange),
            lowMid: getAverage(bassRange, lowMidRange),
            mid: getAverage(lowMidRange, midRange),
            highMid: getAverage(midRange, highMidRange),
            high: getAverage(highMidRange, highRange),
            presence: getAverage(highRange, bufferLength),
            energy: getAverage(0, bufferLength),
          };
        }
      } else if (isPlaying) {
        eq = generateEQData(dataArray, currentTrack, musicTimeRef.current, time);
        musicTimeRef.current += 100;
      } else {
        dataArray.fill(0);
        musicTimeRef.current = 0;
        audioSmoother.reset();
        eq = {
          subBass: 0,
          bass: 0,
          lowMid: 0,
          mid: 0,
          highMid: 0,
          high: 0,
          presence: 0,
          energy: 0,
        };
      }

      let spectrumForViz = dataArray;
      let calm = 0.35;
      let beatPulse = 0;
      if (isPlaying) {
        const shaped = audioSmoother.process(eq, dataArray, performance.now(), {
          sensitivity: sensitivityRef.current,
        });
        eq = shaped.eq;
        spectrumForViz = shaped.smoothedSpectrum;
        calm = shaped.calm;
        beatPulse = shaped.beatPulse;
      }

      if (isThreeTunnel && threeHandle) {
        threeHandle.frame({
          eq,
          time,
          dataArray: spectrumForViz,
          bufferLength,
          beatPulse,
          calm,
          descent: descentRef.current,
          isPlaying,
        });
        time++;
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!ctx) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const intensity = isPlaying ? eq.energy / 255 : 0.1;
      const vizId = visualizationId !== undefined ? visualizationId : currentTrack;
      const base = BACKGROUND_BASE[vizId % BACKGROUND_BASE.length] ?? BACKGROUND_BASE[0];
      const s = base.s + (vizId === 1 ? eq.bass / 15 : vizId === 2 ? eq.mid / 12 : eq.bass / 15);
      const l1 = base.l1 + eq.subBass / 40 + intensity * 5;
      const l2 = base.l2 + intensity * 3;
      const l3 = base.l3;
      const driftScale = 0.0005 * (0.55 + calm * 0.45);
      const gradient = ctx.createRadialGradient(
        width / 2 +
          Math.sin(time * driftScale) * (26 + eq.presence / 12) * (0.7 + calm * 0.3),
        height / 2 +
          Math.cos(time * driftScale) * (26 + eq.presence / 12) * (0.7 + calm * 0.3),
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
      gradient.addColorStop(0, `hsla(${base.h}, ${s}%, ${l1}%, ${0.3 + intensity * 0.2})`);
      gradient.addColorStop(0.5, `hsla(${base.h}, ${base.s}%, ${l2}%, ${0.2 + intensity * 0.15})`);
      gradient.addColorStop(1, `hsla(${base.h}, ${base.s}%, ${l3}%, 1)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        const drawViz = getVisualization(vizId % NUM_VISUALIZATIONS);
        drawViz(ctx, width, height, spectrumForViz, eq, time, bufferLength, {
          particles: particlesRef.current,
          isPlaying,
          beatPulse,
          calm,
          descentOverlayActive: descentRef.current,
        });
      } else {
        const centerX = width / 2;
        const centerY = height / 2;
        const breathe = Math.sin(time * 0.001) * 0.1 + 0.9;
        const radius = 60 * breathe;
        const ringGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
        ringGradient.addColorStop(0, `hsla(270, 40%, 40%, 0)`);
        ringGradient.addColorStop(0.8, `hsla(270, 50%, 45%, 0.1)`);
        ringGradient.addColorStop(1, `hsla(270, 40%, 40%, 0)`);
        ctx.fillStyle = ringGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      time++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      threeHandle?.dispose();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      if (roDebounceTimer !== null) clearTimeout(roDebounceTimer);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('orientationchange', onOrientationChange);
      vv?.removeEventListener('resize', onVisualViewportChange);
      vv?.removeEventListener('scroll', onVisualViewportChange);
      ro?.disconnect();
      observer.disconnect();
    };
  }, [isPlaying, currentTrack, analyser, visualizationId]);

  const activeVizId = visualizationId !== undefined ? visualizationId : currentTrack;
  const showWebGLTunnel = activeVizId % NUM_VISUALIZATIONS === THREE_NEON_TUNNEL_VIZ_INDEX;

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full min-w-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full min-h-[1px] w-full"
        style={{ display: showWebGLTunnel ? 'none' : 'block' }}
      />
      <canvas
        ref={webglRef}
        className="absolute inset-0 block h-full min-h-[1px] w-full"
        style={{ display: showWebGLTunnel ? 'block' : 'none' }}
      />
    </div>
  );
}
