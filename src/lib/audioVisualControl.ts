/**
 * Stabilizes raw FFT / simulated EQ for visualizations:
 * - Per-band EMA smoothing (less jitter on quiet material)
 * - Slow vs fast energy + onset pulse (rhythmic accents, cooldown)
 * - Soft-signal gain so quiet tracks stay expressive without going erratic
 * - Spectral flux + per-band relative change for volume-independent pattern reactivity
 */

import type { EQBands } from '../components/visualizer/types';

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

export interface VisualAudioSmootherResult {
  eq: EQBands;
  /** Smoothed spectrum for viz code that reads raw bins */
  smoothedSpectrum: Uint8Array;
  /** 0–1 rhythmic accent this frame (decays internally) */
  beatPulse: number;
  /** 0–1 calm factor (higher = softer / less motion) */
  calm: number;
}

type BandKey = (typeof BAND_KEYS)[number];

export class VisualAudioSmoother {
  private prevEq: EQBands | null = null;
  private spectrumFloat: Float32Array | null = null;
  private prevSpectrum: Float32Array | null = null;
  private slowEnergy = 0;
  private fastEnergy = 0;
  private pulse = 0;
  private lastOnsetMs = 0;
  private energyHistory: number[] = [];
  private bandHistory: Partial<Record<BandKey, number[]>> = {};
  private fluxHistory: number[] = [];
  private bandBaselines: Partial<Record<keyof EQBands, number>> = {};
  private readonly historyMax = 90;
  private readonly fluxHistoryMax = 60;

  reset(): void {
    this.prevEq = null;
    this.spectrumFloat = null;
    this.prevSpectrum = null;
    this.slowEnergy = 0;
    this.fastEnergy = 0;
    this.pulse = 0;
    this.lastOnsetMs = 0;
    this.energyHistory = [];
    this.bandHistory = {};
    this.fluxHistory = [];
    this.bandBaselines = {};
  }

  /**
   * @param rawEq bands 0–255
   * @param rawSpectrum same length as used by visualizer (byte frequency data or simulated fill)
   * @param nowMs performance.now()
   */
  process(rawEq: EQBands, rawSpectrum: Uint8Array, nowMs: number): VisualAudioSmootherResult {
    const mean = meanBandEnergy(rawEq);

    // Per-band rolling history: each band normalizes within its own range
    // so bass/mids/highs don't get zeroed by a global floor
    const normEq: EQBands = { ...rawEq };
    for (const k of BAND_KEYS) {
      const v = rawEq[k];
      let hist = this.bandHistory[k];
      if (!hist) hist = this.bandHistory[k] = [];
      hist.push(v);
      if (hist.length > this.historyMax) hist.shift();
      const sorted = [...hist].sort((a, b) => a - b);
      const n = sorted.length;
      const low = sorted[Math.floor(n * 0.1)] ?? v;
      const high = sorted[Math.floor(n * 0.9)] ?? v;
      const spread = Math.max(12, high - low);
      const scale = 220 / spread;
      normEq[k] = clamp255((v - low) * scale);
    }

    // Energy from mean (global history for overall level)
    this.energyHistory.push(mean);
    if (this.energyHistory.length > this.historyMax) this.energyHistory.shift();
    const meanSorted = [...this.energyHistory].sort((a, b) => a - b);
    const n = meanSorted.length;
    const meanLow = meanSorted[Math.floor(n * 0.1)] ?? mean;
    const meanHigh = meanSorted[Math.floor(n * 0.9)] ?? mean;
    const meanSpread = Math.max(12, meanHigh - meanLow);
    normEq.energy = clamp255((mean - meanLow) * (220 / meanSpread));

    // Spectrum: use average of per-band floors for spectrum bins (spectrum is full-range)
    const spectrumLow = meanLow;
    const spectrumSpread = Math.max(12, meanSpread);
    const spectrumScale = 220 / spectrumSpread;
    const normSpectrum = new Uint8Array(rawSpectrum.length);
    for (let i = 0; i < rawSpectrum.length; i++) {
      normSpectrum[i] = clamp255((rawSpectrum[i] - spectrumLow) * spectrumScale);
    }

    // Spectral flux: change in spectrum (detects transients even at low volume)
    let flux = 0;
    if (this.prevSpectrum && this.prevSpectrum.length === rawSpectrum.length) {
      for (let i = 0; i < rawSpectrum.length; i++) {
        flux += Math.abs(rawSpectrum[i] - this.prevSpectrum[i]);
      }
      flux /= rawSpectrum.length;
    }
    if (!this.prevSpectrum || this.prevSpectrum.length !== rawSpectrum.length) {
      this.prevSpectrum = new Float32Array(rawSpectrum.length);
    }
    for (let i = 0; i < rawSpectrum.length; i++) {
      this.prevSpectrum[i] = rawSpectrum[i];
    }

    this.fluxHistory.push(flux);
    if (this.fluxHistory.length > this.fluxHistoryMax) this.fluxHistory.shift();
    const fluxSorted = [...this.fluxHistory].sort((a, b) => a - b);
    const fluxLow = fluxSorted[Math.floor(fluxSorted.length * 0.2)] ?? flux;
    const fluxHigh = fluxSorted[Math.floor(fluxSorted.length * 0.8)] ?? flux;
    const fluxSpread = Math.max(4, fluxHigh - fluxLow);
    const fluxNorm = Math.min(1, (flux - fluxLow) / fluxSpread);

    const normMean = meanBandEnergy(normEq);
    const softLift = 0.6 + 0.4 * Math.pow(normMean / 255, 0.6);

    // Per-band relative change (pattern-based: band vs its own baseline)
    const relativeBoost: Partial<Record<keyof EQBands, number>> = {};
    for (const k of BAND_KEYS) {
      const v = normEq[k];
      const base = this.bandBaselines[k] ?? v;
      this.bandBaselines[k] = base * 0.92 + v * 0.08;
      const rel = base > 8 ? Math.max(0, (v - base) / (base + 8)) : 0;
      relativeBoost[k] = Math.min(1, rel * 0.6);
    }

    // Two time-scale energies (now on normalized 0–255, so volume-independent)
    this.slowEnergy = this.slowEnergy * 0.94 + normMean * 0.06;
    this.fastEnergy = this.fastEnergy * 0.78 + normMean * 0.22;

    const delta = Math.max(0, this.fastEnergy - this.slowEnergy);
    const adaptiveThresh = 8 + this.slowEnergy * 0.08;
    const minGapMs = 100;

    // Onset: energy delta + spectral flux (both work at any volume after normalization)
    const fluxOnset = fluxNorm > 0.35 && fluxSpread > 2;
    const energyOnset = delta > adaptiveThresh * 1.2;

    if ((energyOnset || fluxOnset) && nowMs - this.lastOnsetMs > minGapMs) {
      const energyStrength = energyOnset
        ? Math.min(1, (delta - adaptiveThresh) / (30 + adaptiveThresh))
        : 0;
      const fluxStrength = fluxOnset ? Math.min(0.7, fluxNorm * 0.9) : 0;
      const strength = Math.max(energyStrength, fluxStrength);
      this.pulse = Math.min(1, this.pulse + 0.38 + strength * 0.45);
      this.lastOnsetMs = nowMs;
    }

    this.pulse *= 0.91;

    const bandAlpha = 0.15 + this.pulse * 0.1;
    const nextEq: EQBands = { ...normEq };

    if (!this.prevEq) {
      this.prevEq = { ...normEq };
    }

    for (const k of BAND_KEYS) {
      let v = normEq[k] * softLift;
      if ((relativeBoost[k] ?? 0) > 0.12) {
        v *= 1 + (relativeBoost[k] ?? 0) * 0.4;
      }
      this.prevEq[k] = this.prevEq[k]! * (1 - bandAlpha) + v * bandAlpha;
      nextEq[k] = clamp255(this.prevEq[k]!);
    }

    // Rhythmic emphasis: slightly favor bass / low-mid on pulse
    const bump = 1 + this.pulse * 0.28;
    nextEq.subBass = clamp255(nextEq.subBass * (1 + this.pulse * 0.15));
    nextEq.bass = clamp255(nextEq.bass * bump);
    nextEq.lowMid = clamp255(nextEq.lowMid * (1 + this.pulse * 0.12));

    const avgSmoothed =
      BAND_KEYS.reduce((s, k) => s + nextEq[k], 0) / BAND_KEYS.length;
    nextEq.energy = clamp255(avgSmoothed * (1 + this.pulse * 0.22));

    // Smooth spectrum bins (use normalized spectrum for volume independence)
    const len = normSpectrum.length;
    if (!this.spectrumFloat || this.spectrumFloat.length !== len) {
      this.spectrumFloat = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        this.spectrumFloat[i] = normSpectrum[i];
      }
    } else {
      const specAlpha = 0.16 + this.pulse * 0.08;
      for (let i = 0; i < len; i++) {
        let target = normSpectrum[i] * (0.92 + softLift * 0.08);
        if (fluxNorm > 0.3 && i < len * 0.15) {
          target *= 1 + fluxNorm * 0.12;
        }
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

    return {
      eq: nextEq,
      smoothedSpectrum,
      beatPulse: this.pulse,
      calm: calm01,
    };
  }
}
