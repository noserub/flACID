/**
 * Gray–Scott reaction–diffusion — spectrum-mapped injects, beat-driven catalyst, brighter render.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

let gw = 0;
let gh = 0;
let u: Float32Array | null = null;
let v: Float32Array | null = null;
let uN: Float32Array | null = null;
let vN: Float32Array | null = null;
let off: HTMLCanvasElement | null = null;
let img: ImageData | null = null;
let injectCooldown = 0;

function idx(x: number, y: number) {
  return y * gw + x;
}

function initGrid() {
  if (!u || !v || !uN || !vN) return;
  u.fill(1);
  v.fill(0);
  const cx = Math.floor(gw / 2);
  const cy = Math.floor(gh / 2);
  const rw = Math.max(4, Math.floor(gw * 0.14));
  const rh = Math.max(4, Math.floor(gh * 0.14));
  for (let y = cy - rh; y <= cy + rh; y++) {
    for (let x = cx - rw; x <= cx + rw; x++) {
      if (x > 0 && x < gw - 1 && y > 0 && y < gh - 1) {
        if (Math.random() < 0.7) v[idx(x, y)] = 1;
      }
    }
  }
}

function ensureSim(width: number, height: number, descent: boolean) {
  const capW = descent ? 88 : 112;
  const capH = descent ? 64 : 80;
  const nextGw = Math.max(56, Math.min(capW, Math.floor(width / (descent ? 9 : 8))));
  const nextGh = Math.max(44, Math.min(capH, Math.floor(height / (descent ? 9 : 8))));
  if (gw === nextGw && gh === nextGh && u && v && img) return;

  gw = nextGw;
  gh = nextGh;
  const n = gw * gh;
  u = new Float32Array(n);
  v = new Float32Array(n);
  uN = new Float32Array(n);
  vN = new Float32Array(n);
  off = document.createElement('canvas');
  off.width = gw;
  off.height = gh;
  img = new ImageData(gw, gh);
  injectCooldown = 0;
  initGrid();
}

function lapAt(arr: Float32Array, x: number, y: number): number {
  const i = idx(x, y);
  return arr[i - 1] + arr[i + 1] + arr[i - gw] + arr[i + gw] - 4 * arr[i];
}

function step(f: number, k: number, Du: number, Dv: number, dt: number) {
  if (!u || !v || !uN || !vN) return;
  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      const i = idx(x, y);
      const Lu = lapAt(u, x, y);
      const Lv = lapAt(v, x, y);
      const ui = u[i]!;
      const vi = v[i]!;
      const uvv = ui * vi * vi;
      uN[i] = ui + dt * (Du * Lu - uvv + f * (1 - ui));
      vN[i] = vi + dt * (Dv * Lv + uvv - (f + k) * vi);
    }
  }
  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      const i = idx(x, y);
      uN[i] = Math.min(1, Math.max(0, uN[i]!));
      vN[i] = Math.min(1, Math.max(0, vN[i]!));
    }
  }
  const tmpU = u;
  u = uN;
  uN = tmpU;
  const tmpV = v;
  v = vN;
  vN = tmpV;
}

function injectAt(gx: number, gy: number, radius: number, strength: number) {
  if (!u || !v) return;
  const r = Math.max(1, Math.floor(radius));
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const x = gx + dx;
      const y = gy + dy;
      if (x > 0 && x < gw - 1 && y > 0 && y < gh - 1 && dx * dx + dy * dy <= r * r) {
        const i = idx(x, y);
        v[i] = Math.min(1, v[i]! + strength);
        u[i] = Math.max(0, u[i]! - strength * 0.12);
      }
    }
  }
}

export function drawReactionDiffusion(
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
  const descent = options?.descentOverlayActive ?? false;

  ensureSim(width, height, descent);
  if (!u || !v || !off || !img) return;

  const midN = Math.min(1, eq.mid / 255);
  const highN = Math.min(1, eq.high / 255);
  const bassN = Math.min(1, eq.bass / 255);
  const energyN = Math.min(1, eq.energy / 255);

  const rhythm = 0.5 + 0.5 * Math.sin(time * 0.018);
  const f = 0.032 + midN * 0.042 + rhythm * 0.012 + Math.sin(time * 0.006) * 0.008;
  const k = 0.054 + highN * 0.032 + bassN * 0.008;
  const Du = 0.21;
  const Dv = 0.105;
  const dt = 0.52;

  const steps = descent
    ? 2 + Math.floor(energyN * 2) + Math.floor(beatPulse * 2)
    : 3 + Math.floor(energyN * 5) + Math.floor(beatPulse * 5);
  for (let s = 0; s < steps; s++) {
    step(f, k, Du, Dv, dt);
  }

  // Map spectrum bins → grid x (frequency), amplitude → inject strength (rhythmic “paint”)
  const peaks = descent ? 14 : 24;
  for (let p = 0; p < peaks; p++) {
    const bi = Math.min(bufferLength - 1, Math.floor((p / peaks) * bufferLength));
    const val = (dataArray[bi] ?? 0) / 255;
    if (val < 0.12) continue;
    const gx = 2 + Math.floor((p / peaks) * (gw - 4));
    let gy = Math.floor(gh / 2 + Math.sin(time * 0.04 + p * 0.5) * gh * 0.38);
    gy = Math.max(2, Math.min(gh - 3, gy));
    injectAt(gx, gy, 1 + val * 3, 0.08 + val * 0.22 * (0.5 + beatPulse));
  }

  injectCooldown = Math.max(0, injectCooldown - 1);
  if (injectCooldown === 0 && (bassN > 0.22 || beatPulse > 0.12 || energyN > 0.45)) {
    injectCooldown = beatPulse > 0.35 ? 2 : 3;
    const spots = Math.floor(
      descent
        ? 2 + bassN * 4 + beatPulse * 4 + energyN * 2
        : 3 + bassN * 8 + beatPulse * 10 + energyN * 4
    );
    for (let n = 0; n < spots; n++) {
      const rx = 1 + Math.floor(Math.random() * (gw - 2));
      const ry = 1 + Math.floor(Math.random() * (gh - 2));
      const r = 2 + Math.floor(beatPulse * 4 + bassN * 2);
      injectAt(rx, ry, r, 0.42 + beatPulse * 0.45);
    }
  }

  const data = img.data;
  let p = 0;
  const hueBase = (time * 0.09 + eq.lowMid * 0.14 + bassN * 25) % 360;

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = idx(x, y);
      const vi = v[i] ?? 0;
      const ui = u[i] ?? 1;
      const t = Math.min(1, vi * 2.6 + (1 - ui) * 0.22);
      const hue = (hueBase + t * 110 + vi * 55 + Math.sin(x * 0.08 + y * 0.08 + time * 0.02) * 18) % 360;
      const sat = 0.62 + t * 0.35 + highN * 0.08;
      const light = 0.14 + t * 0.52 + energyN * 0.1;
      const c = (1 - Math.abs(2 * light - 1)) * sat;
      const xh = (hue / 60) % 2;
      const xcol = c * (1 - Math.abs(xh - 1));
      const m = light - c / 2;
      let rp = 0;
      let gp = 0;
      let bp = 0;
      if (hue < 60) {
        rp = c;
        gp = xcol;
      } else if (hue < 120) {
        rp = xcol;
        gp = c;
      } else if (hue < 180) {
        gp = c;
        bp = xcol;
      } else if (hue < 240) {
        gp = xcol;
        bp = c;
      } else if (hue < 300) {
        rp = xcol;
        bp = c;
      } else {
        rp = c;
        bp = xcol;
      }
      data[p] = Math.round((rp + m) * 255);
      data[p + 1] = Math.round((gp + m) * 255);
      data[p + 2] = Math.round((bp + m) * 255);
      data[p + 3] = Math.round(255 * (0.38 + t * 0.58));
      p += 4;
    }
  }

  const octx = off.getContext('2d');
  if (!octx) return;
  octx.putImageData(img, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, 0, 0, gw, gh, 0, 0, width, height);
  ctx.restore();
}
