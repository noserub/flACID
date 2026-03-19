/**
 * Stabilizes raw FFT / simulated EQ for visualizations:
 * - Per-band EMA smoothing (less jitter on quiet material)
 * - Slow vs fast energy + onset pulse (rhythmic accents, cooldown)
 * - Soft-signal gain so quiet tracks stay expressive without going erratic
 * - Groove / beat phase bus for tempo-aligned motion across all viz
 */

import type { EQBands, MusicMotionSnapshot } from '../components/visualizer/types';

const GROOVE_PERIOD_MIN = 280;
const GROOVE_PERIOD_MAX = 920;
const DEFAULT_GROOVE_MS = 500;

const BAND_KEYS = [
  'subBass',
  'bass',
  'lowMid',
  'mid',
  'highMid',
  'high',
  'presence',
] as const satisfies readonly (keyof EQBands)[];

function clamp255(n: number): number {
  return Math.min(255, Math.max(0, n));
}

function meanBandEnergy(eq: EQBands): number {
  let s = 0;
  for (const k of BAND_KEYS) {
    s += eq[k];
  }
  return s / BAND_KEYS.length;
}

/** Rolling median spacing between onsets → groove period + phase */
class GrooveEstimator {
  private readonly intervals: number[] = [];
  private lastOnsetMs = 0;
  groovePeriodMs = DEFAULT_GROOVE_MS;

  reset(): void {
    this.intervals.length = 0;
    this.lastOnsetMs = 0;
    this.groovePeriodMs = DEFAULT_GROOVE_MS;
  }

  onOnset(nowMs: number): void {
    if (this.lastOnsetMs > 0) {
      const dt = nowMs - this.lastOnsetMs;
      if (dt > 160 && dt < 1300) {
        this.intervals.push(dt);
        if (this.intervals.length > 10) {
          this.intervals.shift();
        }
        const sorted = [...this.intervals].sort((a, b) => a - b);
        const mid = sorted[Math.floor(sorted.length / 2)] ?? dt;
        this.groovePeriodMs = this.groovePeriodMs * 0.82 + mid * 0.18;
        this.groovePeriodMs = Math.min(
          GROOVE_PERIOD_MAX,
          Math.max(GROOVE_PERIOD_MIN, this.groovePeriodMs)
        );
      }
    }
    this.lastOnsetMs = nowMs;
  }

  getBeatPhase(nowMs: number): number {
    if (this.lastOnsetMs <= 0) {
      return ((nowMs * 0.003) % 1000) / 1000;
    }
    const p = (nowMs - this.lastOnsetMs) / this.groovePeriodMs;
    return p - Math.floor(p);
  }

  /** 0–1 from regularity of recent intervals */
  getConfidence(): number {
    if (this.intervals.length < 2) {
      return 0.15 + Math.min(0.35, this.intervals.length * 0.1);
    }
    const mean = this.intervals.reduce((a, b) => a + b, 0) / this.intervals.length;
    if (mean < 1) return 0.2;
    const variance =
      this.intervals.reduce((s, x) => s + (x - mean) * (x - mean), 0) / this.intervals.length;
    const std = Math.sqrt(variance);
    const cv = std / mean;
    return Math.min(1, Math.max(0, 1 - cv * 1.8));
  }
}

export interface VisualAudioSmootherResult {
  eq: EQBands;
  /** Smoothed spectrum for viz code that reads raw bins */
  smoothedSpectrum: Uint8Array;
  /** 0–1 rhythmic accent this frame (decays internally) */
  beatPulse: number;
  /** 0–1 calm factor (higher = softer / less motion) */
  calm: number;
  /** Shared motion bus for visualizations */
  motion: MusicMotionSnapshot;
}

export class VisualAudioSmoother {
  private prevEq: EQBands | null = null;
  private spectrumFloat: Float32Array | null = null;
  private slowEnergy = 0;
  private fastEnergy = 0;
  private pulse = 0;
  private lastOnsetMs = 0;
  private energyHistory: number[] = [];
  private readonly historyMax = 90; // ~1.5s at 60fps
  private readonly groove = new GrooveEstimator();

  reset(): void {
    this.prevEq = null;
    this.spectrumFloat = null;
    this.slowEnergy = 0;
    this.fastEnergy = 0;
    this.pulse = 0;
    this.lastOnsetMs = 0;
    this.energyHistory = [];
    this.groove.reset();
  }

  /**
   * @param rawEq bands 0–255
   * @param rawSpectrum same length as used by visualizer (byte frequency data or simulated fill)
   * @param nowMs performance.now()
   */
  process(rawEq: EQBands, rawSpectrum: Uint8Array, nowMs: number): VisualAudioSmootherResult {
    const mean = meanBandEnergy(rawEq);

    // Rolling history for adaptive floor / "loudness context"
    this.energyHistory.push(mean);
    if (this.energyHistory.length > this.historyMax) {
      this.energyHistory.shift();
    }
    const sorted = [...this.energyHistory].sort((a, b) => a - b);
    const low = sorted[Math.floor(sorted.length * 0.15)] ?? mean;
    const high = sorted[Math.floor(sorted.length * 0.85)] ?? mean;
    const spread = Math.max(12, high - low);

    // Soft-signal lift: map current mean into a gentler 0–1 curve
    const normalized = clamp255(((mean - low) / spread) * 255);
    const softLift = 0.55 + 0.45 * Math.pow(normalized / 255, 0.65);

    // Two time-scale energies (0–255 scale)
    this.slowEnergy = this.slowEnergy * 0.94 + mean * 0.06;
    this.fastEnergy = this.fastEnergy * 0.78 + mean * 0.22;

    const delta = Math.max(0, this.fastEnergy - this.slowEnergy);
    const adaptiveThresh = 6 + this.slowEnergy * 0.12;
    const minGapMs = 110 + (255 - this.slowEnergy) * 0.35;

    if (delta > adaptiveThresh * 1.35 && nowMs - this.lastOnsetMs > minGapMs) {
      const strength = Math.min(1, (delta - adaptiveThresh) / (40 + adaptiveThresh));
      this.pulse = Math.min(1, this.pulse + 0.35 + strength * 0.45);
      this.lastOnsetMs = nowMs;
      this.groove.onOnset(nowMs);
    }

    this.pulse *= 0.9;

    const bandAlpha = 0.14 + this.pulse * 0.1;
    const nextEq: EQBands = { ...rawEq };

    if (!this.prevEq) {
      this.prevEq = { ...rawEq };
    }

    for (const k of BAND_KEYS) {
      const v = rawEq[k] * softLift;
      this.prevEq[k] = this.prevEq[k] * (1 - bandAlpha) + v * bandAlpha;
      nextEq[k] = clamp255(this.prevEq[k]);
    }

    // Rhythmic emphasis: slightly favor bass / low-mid on pulse
    const bump = 1 + this.pulse * 0.28;
    nextEq.subBass = clamp255(nextEq.subBass * (1 + this.pulse * 0.15));
    nextEq.bass = clamp255(nextEq.bass * bump);
    nextEq.lowMid = clamp255(nextEq.lowMid * (1 + this.pulse * 0.12));

    const avgSmoothed =
      BAND_KEYS.reduce((s, k) => s + nextEq[k], 0) / BAND_KEYS.length;
    nextEq.energy = clamp255(avgSmoothed * (1 + this.pulse * 0.22));

    // Smooth spectrum bins (same path for real FFT and simulator-filled buffer)
    const len = rawSpectrum.length;
    if (!this.spectrumFloat || this.spectrumFloat.length !== len) {
      this.spectrumFloat = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        this.spectrumFloat[i] = rawSpectrum[i];
      }
    } else {
      const specAlpha = 0.16 + this.pulse * 0.08;
      for (let i = 0; i < len; i++) {
        const target = rawSpectrum[i] * (0.92 + softLift * 0.08);
        this.spectrumFloat[i] =
          this.spectrumFloat[i] * (1 - specAlpha) + target * specAlpha;
      }
    }

    const smoothedSpectrum = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      let v = this.spectrumFloat[i] * (1 + this.pulse * 0.12);
      if (i < len * 0.08) {
        v *= 1 + this.pulse * 0.08;
      }
      smoothedSpectrum[i] = clamp255(Math.round(v));
    }

    const calm01 = Math.min(1, Math.max(0, 1 - nextEq.energy / 200));

    const grooveConfidence = this.groove.getConfidence();
    const rawPhase = this.groove.getBeatPhase(nowMs);
    // Blend toward free phase when groove not confident (avoids wrong grid lock)
    const freePhase = ((nowMs * 0.0028) % 1000) / 1000;
    const beatPhase =
      grooveConfidence * rawPhase + (1 - grooveConfidence) * freePhase;

    const motion: MusicMotionSnapshot = {
      beatPhase: beatPhase - Math.floor(beatPhase),
      groovePeriodMs: this.groove.groovePeriodMs,
      grooveConfidence,
      intensityNorm: Math.min(1, Math.max(0, nextEq.energy / 255)),
      slowIntensity: Math.min(1, Math.max(0, this.slowEnergy / 255)),
      fastIntensity: Math.min(1, Math.max(0, this.fastEnergy / 255)),
      pulse: this.pulse,
    };

    return {
      eq: nextEq,
      smoothedSpectrum,
      beatPulse: this.pulse,
      calm: calm01,
      motion,
    };
  }
}
