/**
 * Resonant Cymatics — Chladni-style standing waves across the full frame.
 * FFT bands drive mode amplitudes; nodal lines glow where the field crosses zero.
 * Beats inject phase kicks and amplitude bursts for visible rhythmic snaps.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

type Mode = {
  nx: number;
  ny: number;
  /** 0–1 spectrum position for amplitude sampling */
  binT: number;
  /** Per-mode hue anchor for multi-color palette */
  hueOfs: number;
  phaseX: number;
  phaseY: number;
  ampSm: number;
};

const MODES: { nx: number; ny: number; binT: number; hueOfs: number }[] = [
  { nx: 1, ny: 1, binT: 0.04, hueOfs: 0 },
  { nx: 2, ny: 1, binT: 0.1, hueOfs: 42 },
  { nx: 1, ny: 2, binT: 0.16, hueOfs: 88 },
  { nx: 3, ny: 2, binT: 0.24, hueOfs: 135 },
  { nx: 2, ny: 3, binT: 0.32, hueOfs: 180 },
  { nx: 4, ny: 3, binT: 0.42, hueOfs: 220 },
  { nx: 3, ny: 4, binT: 0.52, hueOfs: 265 },
  { nx: 5, ny: 4, binT: 0.62, hueOfs: 300 },
  { nx: 4, ny: 5, binT: 0.72, hueOfs: 330 },
  { nx: 6, ny: 5, binT: 0.82, hueOfs: 15 },
  { nx: 5, ny: 6, binT: 0.9, hueOfs: 55 },
  { nx: 7, ny: 6, binT: 0.96, hueOfs: 105 },
];

const modes: Mode[] = MODES.map((m) => ({
  ...m,
  phaseX: Math.random() * Math.PI * 2,
  phaseY: Math.random() * Math.PI * 2,
  ampSm: 0.2,
}));

let gw = 0;
let gh = 0;
let off: HTMLCanvasElement | null = null;
let glow: HTMLCanvasElement | null = null;
let img: ImageData | null = null;
let fieldBuf: Float32Array | null = null;
let beatPhaseKick = 0;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function binAt(data: Uint8Array, bl: number, t: number): number {
  if (bl <= 0) return 0;
  return (data[clamp(Math.floor(t * (bl - 1)), 0, bl - 1)] ?? 0) / 255;
}

function chladniField(x: number, y: number, time: number, energyN: number): number {
  let sum = 0;
  for (const m of modes) {
    const wobble = Math.sin(time * 0.0018 + m.nx * 0.7 + m.ny * 0.5) * 0.04 * energyN;
    sum +=
      m.ampSm *
      Math.sin(m.nx * Math.PI * x + m.phaseX + wobble) *
      Math.sin(m.ny * Math.PI * y + m.phaseY - wobble * 0.6);
  }
  return sum;
}

function ensureGrid(width: number, height: number, descent: boolean) {
  const div = descent ? 5.5 : 3.8;
  const capW = descent ? 140 : 200;
  const capH = descent ? 100 : 150;
  const nextGw = Math.max(72, Math.min(capW, Math.floor(width / div)));
  const nextGh = Math.max(56, Math.min(capH, Math.floor(height / div)));
  if (gw === nextGw && gh === nextGh && off && glow && img && fieldBuf) return;

  gw = nextGw;
  gh = nextGh;
  off = document.createElement('canvas');
  off.width = gw;
  off.height = gh;
  glow = document.createElement('canvas');
  glow.width = gw;
  glow.height = gh;
  img = new ImageData(gw, gh);
  fieldBuf = new Float32Array(gw * gh);
}

function fieldAt(fieldBuf: Float32Array, gx: number, gy: number): number {
  const x = clamp(gx, 0, gw - 1);
  const y = clamp(gy, 0, gh - 1);
  return fieldBuf[y * gw + x] ?? 0;
}

function smoothGradient(fieldBuf: Float32Array, gx: number, gy: number): number {
  const f00 = fieldAt(fieldBuf, gx - 1, gy - 1);
  const f10 = fieldAt(fieldBuf, gx, gy - 1);
  const f20 = fieldAt(fieldBuf, gx + 1, gy - 1);
  const f01 = fieldAt(fieldBuf, gx - 1, gy);
  const f21 = fieldAt(fieldBuf, gx + 1, gy);
  const f02 = fieldAt(fieldBuf, gx - 1, gy + 1);
  const f12 = fieldAt(fieldBuf, gx, gy + 1);
  const f22 = fieldAt(fieldBuf, gx + 1, gy + 1);
  const dx = -f00 + f20 - f01 * 2 + f21 * 2 - f02 + f22;
  const dy = -f00 - f10 * 2 - f20 + f02 + f12 * 2 + f22;
  return Math.hypot(dx, dy);
}

export function drawResonantCymatics(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number,
  options?: VisualizerDrawOptions
): void {
  const beatPulse = options?.beatPulse ?? 0;
  const calm = options?.calm ?? 0.5;
  const descent = options?.descentOverlayActive ?? false;

  ensureGrid(width, height, descent);
  if (!off || !glow || !img || !fieldBuf) return;

  const bl = Math.max(1, bufferLength);
  const bassN = Math.min(1, eq.bass / 255);
  const midN = Math.min(1, eq.mid / 255);
  const highN = Math.min(1, eq.high / 255);
  const energyN = Math.min(1, eq.energy / 255);

  if (beatPulse > 0.28) {
    beatPhaseKick = Math.min(1.4, beatPhaseKick + beatPulse * 0.85);
    for (const m of modes) {
      m.phaseX += (Math.random() - 0.5) * beatPulse * 0.55;
      m.phaseY += (Math.random() - 0.5) * beatPulse * 0.55;
    }
  }
  beatPhaseKick *= 0.88;

  const drive = 0.35 + energyN * 0.55 + beatPulse * 0.45 - calm * 0.12;
  for (const m of modes) {
    const raw =
      binAt(dataArray, bl, m.binT) * 0.55 +
      bassN * (1 - m.binT) * 0.35 +
      midN * (1 - Math.abs(m.binT - 0.45)) * 0.4 +
      highN * m.binT * 0.35 +
      beatPulse * 0.5;
    const target = clamp(raw * drive + 0.08, 0.04, 1);
    m.ampSm += (target - m.ampSm) * (descent ? 0.14 : 0.22);
    m.phaseX += 0.006 + midN * 0.012 + highN * 0.008 + beatPhaseKick * 0.04;
    m.phaseY += 0.005 + bassN * 0.014 + beatPhaseKick * 0.035;
  }

  const hueBase = (time * 0.14 + eq.lowMid * 0.2 + bassN * 35 + beatPulse * 45) % 360;
  const nodeSharp = 6 + energyN * 8 + beatPulse * 10;
  const data = img.data;
  const invGw = 1 / Math.max(1, gw - 1);
  const invGh = 1 / Math.max(1, gh - 1);

  for (let gy = 0; gy < gh; gy++) {
    const y = gy * invGh;
    for (let gx = 0; gx < gw; gx++) {
      const x = gx * invGw;
      fieldBuf[gy * gw + gx] = chladniField(x, y, time, energyN);
    }
  }

  for (let gy = 0; gy < gh; gy++) {
    const yN = gy * invGh;
    for (let gx = 0; gx < gw; gx++) {
      const xN = gx * invGw;
      const p = (gy * gw + gx) * 4;
      const i = gy * gw + gx;
      const field = fieldBuf[i]!;
      const node = Math.exp(-field * field * nodeSharp);
      const ridge = clamp(smoothGradient(fieldBuf, gx, gy) * (4.5 + energyN * 6 + beatPulse * 8), 0, 1);
      const t = node * 0.72 + ridge * 0.62;

      const signHue = field >= 0 ? 0 : 155;
      const posHue = xN * 140 + yN * 95;
      const modeHue =
        modes.reduce((acc, m) => {
          const w = m.ampSm * Math.sin(m.nx * Math.PI * xN + m.phaseX) * Math.sin(m.ny * Math.PI * yN + m.phaseY);
          return acc + w * m.hueOfs;
        }, 0) * 0.35;
      const hue =
        (hueBase + signHue + posHue + modeHue + field * 72 + ridge * 85 + beatPulse * 30) % 360;

      const sat = clamp(0.78 + energyN * 0.18 + highN * 0.12 + Math.abs(field) * 0.15 + beatPulse * 0.1, 0.7, 1);
      const light = clamp(0.14 + t * 0.52 + beatPulse * 0.1 + highN * 0.06, 0.1, 0.82);
      const [r, g, b] = hslToRgb(hue, sat, light);

      data[p] = r;
      data[p + 1] = g;
      data[p + 2] = b;
      data[p + 3] = Math.round(255 * (0.28 + t * 0.72));
    }
  }

  const octx = off.getContext('2d');
  const gctx = glow.getContext('2d');
  if (!octx || !gctx) return;
  octx.putImageData(img, 0, 0);

  gctx.clearRect(0, 0, gw, gh);
  gctx.drawImage(off, 0, 0);
  gctx.filter = descent ? 'blur(2px)' : 'blur(3px)';
  gctx.drawImage(off, 0, 0);
  gctx.filter = 'none';

  ctx.fillStyle = `hsla(268, 42%, 4%, ${0.22 + calm * 0.06})`;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.globalCompositeOperation = 'screen';

  ctx.globalAlpha = descent ? 0.55 : 0.62;
  ctx.drawImage(glow, 0, 0, gw, gh, 0, 0, width, height);

  ctx.globalAlpha = descent ? 0.78 : 0.88;
  ctx.drawImage(off, 0, 0, gw, gh, 0, 0, width, height);
  ctx.restore();

  if (beatPulse > 0.18) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const wash = ctx.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, `hsla(${(hueBase + 20) % 360}, 92%, 62%, ${0.04 + beatPulse * 0.1})`);
    wash.addColorStop(0.45, `hsla(${(hueBase + 90) % 360}, 88%, 58%, ${0.03 + beatPulse * 0.08})`);
    wash.addColorStop(1, `hsla(${(hueBase + 200) % 360}, 90%, 65%, ${0.04 + beatPulse * 0.1})`);
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hue < 60) {
    rp = c;
    gp = x;
  } else if (hue < 120) {
    rp = x;
    gp = c;
  } else if (hue < 180) {
    gp = c;
    bp = x;
  } else if (hue < 240) {
    gp = x;
    bp = c;
  } else if (hue < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return [Math.round((rp + m) * 255), Math.round((gp + m) * 255), Math.round((bp + m) * 255)];
}
