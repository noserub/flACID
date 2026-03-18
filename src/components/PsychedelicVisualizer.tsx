import { useEffect, useRef } from 'react';
import type { EQBands } from './visualizer/types';
import { Particle } from './visualizer/Particle';
import { generateEQData } from '../lib/eqSimulator';
import { getVisualization } from './visualizer/visualizations';

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
];

export function PsychedelicVisualizer({
  analyser,
  isPlaying,
  currentTrack,
  visualizationId,
}: PsychedelicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const musicTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * pixelRatio;
      canvas.height = canvas.offsetHeight * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const bufferLength = analyser ? analyser.frequencyBinCount : 1024;
    const dataArray = new Uint8Array(bufferLength);
    let time = 0;

    const draw = () => {
      if (!isVisible) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      let eq: EQBands;

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
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
      } else if (isPlaying) {
        eq = generateEQData(dataArray, currentTrack, musicTimeRef.current, time);
        musicTimeRef.current += 100;
      } else {
        dataArray.fill(0);
        musicTimeRef.current = 0;
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

      const intensity = isPlaying ? eq.energy / 255 : 0.1;
      const vizId = visualizationId !== undefined ? visualizationId : currentTrack;
      const base = BACKGROUND_BASE[vizId % BACKGROUND_BASE.length] ?? BACKGROUND_BASE[0];
      const s = base.s + (vizId === 1 ? eq.bass / 15 : vizId === 2 ? eq.mid / 12 : eq.bass / 15);
      const l1 = base.l1 + eq.subBass / 40 + intensity * 5;
      const l2 = base.l2 + intensity * 3;
      const l3 = base.l3;
      const gradient = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 0.0005) * (30 + eq.presence / 10),
        height / 2 + Math.cos(time * 0.0005) * (30 + eq.presence / 10),
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
        const drawViz = getVisualization(vizId % 10);
        drawViz(ctx, width, height, dataArray, eq, time, bufferLength, {
          particles: particlesRef.current,
          isPlaying,
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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', setCanvasSize);
      observer.disconnect();
    };
  }, [isPlaying, currentTrack, analyser, visualizationId]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}
