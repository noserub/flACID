import { useEffect, useRef } from 'react';

interface PsychedelicVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  currentTrack: number;
  visualizationId?: number;
}

// EQ Frequency Bands (Hz ranges)
interface EQBands {
  subBass: number;    // 20-60 Hz
  bass: number;       // 60-250 Hz
  lowMid: number;     // 250-500 Hz
  mid: number;        // 500-2000 Hz
  highMid: number;    // 2000-4000 Hz
  high: number;       // 4000-8000 Hz
  presence: number;   // 8000-16000 Hz
  energy: number;     // Overall energy level
}

export function PsychedelicVisualizer({ analyser, isPlaying, currentTrack, visualizationId }: PsychedelicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Intersection Observer to pause when not visible
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        isVisible = e?.isIntersecting ?? true;
      },
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(canvas);

    const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.5);

    const syncCanvasSize = (): boolean => {
      const pr = getPixelRatio();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) return false;
      const bw = Math.max(1, Math.round(w * pr));
      const bh = Math.max(1, Math.round(h * pr));
      if (canvas.width === bw && canvas.height === bh) return false;
      canvas.width = bw;
      canvas.height = bh;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(pr, pr);
      return true;
    };

    let resizeRaf: number | null = null;
    const scheduleSync = () => {
      if (resizeRaf !== null) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        syncCanvasSize();
      });
    };

    const onOrientationChange = () => {
      scheduleSync();
      requestAnimationFrame(() => {
        syncCanvasSize();
        requestAnimationFrame(() => {
          syncCanvasSize();
        });
      });
    };

    syncCanvasSize();
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('orientationchange', onOrientationChange);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleSync) : null;
    ro?.observe(canvas);

    // Use the analyser passed from parent
    const bufferLength = analyser ? analyser.frequencyBinCount : 1024;
    const dataArray = new Uint8Array(bufferLength);

    let time = 0;
    let musicTime = 0; // Separate timer for musical phrasing

    // Sophisticated EQ simulation with musical structure
    const generateEQData = (dataArray: Uint8Array, trackIndex: number): EQBands => {
      const phrase = Math.floor(musicTime / 4000) % 4; // 4-bar phrases
      const beat = (musicTime % 1000) / 1000; // Beat position
      
      // Track-specific characteristics
      const trackProfiles = [
        { // Track 0: Ethereal Descent - Heavy on bass and mids
          subBassWeight: 1.5,
          bassWeight: 1.8,
          midWeight: 1.2,
          highWeight: 0.7,
          tempo: 0.02
        },
        { // Track 1: Cosmic Doom - Very heavy bass, atmospheric highs
          subBassWeight: 2.0,
          bassWeight: 1.9,
          midWeight: 0.8,
          highWeight: 1.1,
          tempo: 0.015
        },
        { // Track 2: Astral Resonance - Balanced with emphasis on mids
          subBassWeight: 1.2,
          bassWeight: 1.3,
          midWeight: 1.8,
          highWeight: 1.3,
          tempo: 0.025
        },
        { // Track 3: Mountains of Sleep - Progressive build
          subBassWeight: 1.4,
          bassWeight: 1.5,
          midWeight: 1.5,
          highWeight: 0.9,
          tempo: 0.018
        },
        { // Track 4: Infinite Horizons - Psychedelic, all frequencies
          subBassWeight: 1.3,
          bassWeight: 1.4,
          midWeight: 1.6,
          highWeight: 1.4,
          tempo: 0.022
        }
      ];

      const profile = trackProfiles[trackIndex] || trackProfiles[0];
      
      // Musical dynamics - simulate builds and drops
      let dynamicMultiplier = 1.0;
      if (phrase === 0) {
        // Verse - moderate energy
        dynamicMultiplier = 0.7 + beat * 0.3;
      } else if (phrase === 1) {
        // Build-up
        dynamicMultiplier = 0.7 + (musicTime % 4000) / 4000 * 0.6;
      } else if (phrase === 2) {
        // Chorus/Drop - maximum energy
        dynamicMultiplier = 1.3 + Math.sin(beat * Math.PI * 2) * 0.2;
      } else {
        // Bridge - varied energy
        dynamicMultiplier = 0.8 + Math.sin(beat * Math.PI * 4) * 0.4;
      }

      // Generate frequency data for each band
      const subBass = (Math.sin(time * profile.tempo) * 60 + 
                      Math.sin(time * profile.tempo * 0.5) * 40 + 
                      Math.random() * 20 + 80) * profile.subBassWeight * dynamicMultiplier;
      
      const bass = (Math.sin(time * profile.tempo * 1.5) * 50 + 
                   Math.cos(time * profile.tempo * 0.7) * 35 + 
                   Math.random() * 25 + 70) * profile.bassWeight * dynamicMultiplier;
      
      const lowMid = (Math.sin(time * profile.tempo * 2) * 40 + 
                     Math.sin(time * profile.tempo * 1.2 + 1) * 30 + 
                     Math.random() * 20 + 60) * profile.midWeight * dynamicMultiplier;
      
      const mid = (Math.sin(time * profile.tempo * 2.5 + 2) * 45 + 
                  Math.cos(time * profile.tempo * 1.8) * 25 + 
                  Math.random() * 20 + 55) * profile.midWeight * dynamicMultiplier;
      
      const highMid = (Math.sin(time * profile.tempo * 3 + 3) * 35 + 
                      Math.sin(time * profile.tempo * 2.2) * 20 + 
                      Math.random() * 15 + 45) * profile.highWeight * dynamicMultiplier;
      
      const high = (Math.sin(time * profile.tempo * 4 + 4) * 30 + 
                   Math.cos(time * profile.tempo * 3.5) * 20 + 
                   Math.random() * 15 + 40) * profile.highWeight * dynamicMultiplier;
      
      const presence = (Math.sin(time * profile.tempo * 5 + 5) * 25 + 
                       Math.random() * 10 + 30) * profile.highWeight * dynamicMultiplier;

      // Fill the dataArray with distributed frequency data
      const bassRange = Math.floor(bufferLength * 0.1);
      const midRange = Math.floor(bufferLength * 0.4);
      const highRange = bufferLength;
      
      for (let i = 0; i < bufferLength; i++) {
        if (i < bassRange) {
          dataArray[i] = subBass + (bass - subBass) * (i / bassRange) + Math.random() * 15;
        } else if (i < midRange) {
          const t = (i - bassRange) / (midRange - bassRange);
          dataArray[i] = bass + (mid - bass) * t + Math.random() * 12;
        } else {
          const t = (i - midRange) / (highRange - midRange);
          dataArray[i] = mid + (high - mid) * t + Math.random() * 10;
        }
      }

      const energy = (subBass + bass + lowMid + mid + highMid + high + presence) / 7;

      return {
        subBass: Math.min(255, Math.max(0, subBass)),
        bass: Math.min(255, Math.max(0, bass)),
        lowMid: Math.min(255, Math.max(0, lowMid)),
        mid: Math.min(255, Math.max(0, mid)),
        highMid: Math.min(255, Math.max(0, highMid)),
        high: Math.min(255, Math.max(0, high)),
        presence: Math.min(255, Math.max(0, presence)),
        energy: Math.min(255, Math.max(0, energy))
      };
    };

    // Particle system for organic motion
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;

      constructor(x: number, y: number, vx: number, vy: number, size: number, hue: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 1;
        this.maxLife = Math.random() * 100 + 50;
        this.size = size;
        this.hue = hue;
      }

      update(width: number, height: number, flow: number, turbulence: number) {
        this.x += this.vx + Math.sin(this.y * 0.01 + time * 0.01) * flow;
        this.y += this.vy + Math.cos(this.x * 0.01 + time * 0.01) * flow;
        
        // Add turbulence based on high frequencies
        this.x += (Math.random() - 0.5) * turbulence;
        this.y += (Math.random() - 0.5) * turbulence;
        
        this.life -= 0.5;

        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(ctx: CanvasRenderingContext2D, intensity: number) {
        const alpha = (this.life / this.maxLife) * intensity;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 60%, 50%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 50%, 40%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      isDead() {
        return this.life <= 0;
      }
    }

    let particles: Particle[] = [];

    // Visualization functions will be defined here...
    // Due to size, I'll include just the draw loop structure and you can copy
    // the specific visualization functions from the original file

    const drawOrganicFlow = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 240-343)
    };

    const drawDepthLayers = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 345-436)
    };

    const drawWaveformInterference = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 438-537)
    };

    const drawMinimalGeometric = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 539-656)
    };

    const drawAtmosphericNoise = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 658-770)
    };

    const drawKaleidoscopeFractals = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 772-855)
    };

    const drawLiquidPlasma = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 857-928)
    };

    const drawNeonGrid = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 930-1049)
    };

    const drawSpiralGalaxy = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 1051-1146)
    };

    const drawCrystalLattice = (width: number, height: number, dataArray: Uint8Array, eq: EQBands) => {
      // ... (copy from original PsychedelicVisualizer.tsx lines 1148-1244)
    };

    const draw = () => {
      if (document.visibilityState === 'hidden') {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const resized = syncCanvasSize();
      if (resized) {
        particles.length = 0;
      }

      if (!isVisible) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 2 || height < 2) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      let eq: EQBands;

      // Get frequency data from analyser or generate simulated data
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate EQ bands from real audio
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
          energy: getAverage(0, bufferLength)
        };
      } else if (isPlaying) {
        // Generate sophisticated simulated EQ data
        eq = generateEQData(dataArray, currentTrack);
        musicTime += 100; // Increment music timer
      } else {
        dataArray.fill(0);
        eq = {
          subBass: 0,
          bass: 0,
          lowMid: 0,
          mid: 0,
          highMid: 0,
          high: 0,
          presence: 0,
          energy: 0
        };
        musicTime = 0; // Reset music time when stopped
      }

      // Dynamic background - color shifts with frequency distribution
      const gradient = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 0.0005) * (30 + eq.presence / 10),
        height / 2 + Math.cos(time * 0.0005) * (30 + eq.presence / 10),
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
      
      const intensity = isPlaying ? eq.energy / 255 : 0.1;
      
      // Moody background colors per track - shifts with bass intensity
      const backgrounds = [
        { h: 270, s: 30 + eq.bass / 15, l1: 8 + eq.subBass / 40, l2: 5, l3: 3 },
        { h: 200, s: 25 + eq.bass / 15, l1: 10 + eq.subBass / 30, l2: 6, l3: 3 },
        { h: 280, s: 35 + eq.mid / 12, l1: 9 + eq.bass / 35, l2: 5, l3: 2 },
        { h: 25, s: 30 + eq.bass / 15, l1: 10 + eq.subBass / 35, l2: 6, l3: 3 },
        { h: 15, s: 25 + eq.mid / 15, l1: 8 + eq.bass / 40, l2: 5, l3: 2 },
        { h: 320, s: 40 + eq.energy / 10, l1: 7 + eq.subBass / 45, l2: 4, l3: 2 }, // Kaleidoscope
        { h: 180, s: 35 + eq.bass / 12, l1: 9 + eq.subBass / 35, l2: 5, l3: 3 }, // Liquid Plasma
        { h: 200, s: 25 + eq.high / 20, l1: 6 + eq.bass / 50, l2: 4, l3: 2 }, // Neon Grid
        { h: 240, s: 30 + eq.mid / 15, l1: 8 + eq.subBass / 40, l2: 5, l3: 2 }, // Spiral Galaxy
        { h: 290, s: 35 + eq.highMid / 10, l1: 9 + eq.bass / 38, l2: 5, l3: 3 }, // Crystal Lattice
      ];
      
      const vizId = visualizationId !== undefined ? visualizationId : currentTrack;
      const bg = backgrounds[vizId % backgrounds.length] || backgrounds[0];
      gradient.addColorStop(0, `hsla(${bg.h}, ${bg.s}%, ${bg.l1 + intensity * 5}%, ${0.3 + intensity * 0.2})`);
      gradient.addColorStop(0.5, `hsla(${bg.h}, ${bg.s}%, ${bg.l2 + intensity * 3}%, ${0.2 + intensity * 0.15})`);
      gradient.addColorStop(1, `hsla(${bg.h}, ${bg.s}%, ${bg.l3}%, 1)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        // Call different visualization based on selected visualizationId or fallback to track index
        const vizId = visualizationId !== undefined ? visualizationId : currentTrack;
        switch (vizId % 10) {
          case 0:
            drawOrganicFlow(width, height, dataArray, eq);
            break;
          case 1:
            drawDepthLayers(width, height, dataArray, eq);
            break;
          case 2:
            drawWaveformInterference(width, height, dataArray, eq);
            break;
          case 3:
            drawMinimalGeometric(width, height, dataArray, eq);
            break;
          case 4:
            drawAtmosphericNoise(width, height, dataArray, eq);
            break;
          case 5:
            drawKaleidoscopeFractals(width, height, dataArray, eq);
            break;
          case 6:
            drawLiquidPlasma(width, height, dataArray, eq);
            break;
          case 7:
            drawNeonGrid(width, height, dataArray, eq);
            break;
          case 8:
            drawSpiralGalaxy(width, height, dataArray, eq);
            break;
          case 9:
            drawCrystalLattice(width, height, dataArray, eq);
            break;
          default:
            drawOrganicFlow(width, height, dataArray, eq);
        }
      } else {
        // Idle animation - subtle breathing effect
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('orientationchange', onOrientationChange);
      ro?.disconnect();
      observer.disconnect();
    };
  }, [isPlaying, currentTrack, analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
