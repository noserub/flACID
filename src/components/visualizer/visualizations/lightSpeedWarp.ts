/**
 * Light Speed Warp — hyperspace streaks with a drifting, smoothed vanishing point,
 * intensity-based cruise (fast when loud, slow when quiet), and rolling/skewing
 * so the tunnel keeps turning through space.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

const MAX_PART = 520;
let nActive = 0;
const pAngle = new Float32Array(MAX_PART);
const pRadius = new Float32Array(MAX_PART);
const pSpeed = new Float32Array(MAX_PART);
const pHueOfs = new Float32Array(MAX_PART);
const pLenScale = new Float32Array(MAX_PART);
let inited = false;

/** Smoothed flight path — origin, thrust, zoom, orientation */
let warpOx = 0.5;
let warpOy = 0.5;
let warpSpeedMul = 0.55;
let warpZoomSm = 1;
let warpRoll = 0;
let warpSkew = 0;

function initParticles(n: number, maxR: number) {
  if (inited && nActive === n) return;
  nActive = n;
  for (let i = 0; i < n; i++) {
    pAngle[i] = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    pRadius[i] = Math.random() * maxR;
    pSpeed[i] = 0.55 + Math.random() * 2.1;
    pHueOfs[i] = Math.random() * 360;
    pLenScale[i] = 0.65 + Math.random() * 0.9;
  }
  inited = true;
}

function clamp01(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function smoothstep01(t: number) {
  const x = clamp01(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/** Triangle wave in [-1, 1] with period 2 in `phase` (phase = e.g. fract(t) * 2). */
function triNeg1To1(phase: number) {
  const x = phase % 2;
  return x < 1 ? x * 2 - 1 : 3 - x * 2;
}

/** Normalized corners with margin — used as soft attractors, not a rim crawl. */
const WARP_CORNERS: [number, number][] = [
  [0.13, 0.13],
  [0.87, 0.13],
  [0.87, 0.87],
  [0.13, 0.87],
];

export function drawLightSpeedWarp(
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

  const bl = Math.max(8, bufferLength);
  const energyN = Math.min(1, eq.energy / 255);
  const bassN = Math.min(1, eq.bass / 255);
  const midN = Math.min(1, eq.mid / 255);
  const highN = Math.min(1, eq.high / 255);
  const intensity = Math.min(
    1,
    energyN * 0.45 + midN * 0.28 + bassN * 0.22 + highN * 0.15 + beatPulse * 0.35
  );

  const maxR = Math.hypot(width, height) * 0.72;
  const nPart = descent ? 220 : Math.min(MAX_PART, 420 + Math.floor(highN * 80));

  initParticles(nPart, maxR);

  const react = 0.022 + intensity * (descent ? 0.038 : 0.06);

  const m = time * (descent ? 0.000085 : 0.00011);

  /* Epicycle wander — fills the frame and crosses the center often (not edge-locked). */
  const wanderX =
    Math.sin(m * 0.91) * 0.36 +
    Math.sin(m * 1.73 + midN * 2.3) * 0.21 +
    Math.cos(m * 0.38 + bassN * 2.9) * 0.16 +
    Math.sin(m * 2.27 + highN * 3.2) * 0.09 * (0.45 + energyN);
  const wanderY =
    Math.cos(m * 0.87) * 0.34 +
    Math.sin(m * 1.69 + highN * 2.1) * 0.2 +
    Math.sin(m * 0.41 + midN * 2.6) * 0.15 +
    Math.cos(m * 2.05 + energyN * 4) * 0.085;

  /* Straight “run” along a heading, then triangle reverses — deviation comes from wander + EQ. */
  const legRate = (descent ? 0.000055 : 0.000092) * (1 + intensity * 0.55);
  const triRaw = (time * legRate) % 2;
  const triPhase = triRaw < 0 ? triRaw + 2 : triRaw;
  const u = triNeg1To1(triPhase);
  const legId = (time * (legRate * 0.42)) | 0;
  const heading =
    legId * 2.39996322972865332 +
    Math.sin(legId * 0.37) * 0.85 +
    intensity * 0.55;
  const legLen = (0.34 + intensity * 0.14) * (descent ? 0.82 : 1);
  const straightX = Math.cos(heading) * legLen * u;
  const straightY = Math.sin(heading) * legLen * u;

  /* Soft corner visits: peaked in the middle of each slot, zero at handoff — no perimeter crawl. */
  const cornerSlot = time * (descent ? 0.00009 : 0.00014);
  const cornerIdx = (cornerSlot | 0) % 4;
  const cornerFr = cornerSlot - (cornerSlot | 0);
  const cornerEase = Math.sin(Math.PI * smoothstep01(cornerFr));
  const cn = WARP_CORNERS[cornerIdx]!;
  const cornerPull = (0.38 + intensity * 0.22) * cornerEase;
  const cornerX = (cn[0] - 0.5) * cornerPull;
  const cornerY = (cn[1] - 0.5) * cornerPull;

  const offsX = wanderX * 0.36 + straightX * 0.52 + cornerX;
  const offsY = wanderY * 0.36 + straightY * 0.52 + cornerY;
  /* When high, pulls trajectory back through center from wherever it had drifted. */
  const centerPulse =
    Math.max(0, Math.sin(time * 0.000051) * Math.cos(time * 0.000067 + 1.4)) *
    (0.22 + intensity * 0.12);
  const centerPullX = -offsX * centerPulse * 0.45;
  const centerPullY = -offsY * centerPulse * 0.45;

  const wobbleX =
    Math.sin(time * 0.00036) * 0.048 +
    Math.sin(time * 0.00021 + midN * 2.4) * 0.036 +
    Math.cos(time * 0.0003 + bassN * 3.1) * 0.028 +
    Math.sin(time * 0.00051 + highN * 4) * 0.024 * (0.35 + energyN);
  const wobbleY =
    Math.cos(time * 0.00033) * 0.045 +
    Math.sin(time * 0.00024 + highN * 2.2) * 0.034 +
    Math.sin(time * 0.00018 + midN * 2) * 0.026 * (0.4 + energyN) +
    Math.cos(time * 0.00042 + bassN * 2.5) * 0.024;
  const beatSteerX = Math.sin(time * 0.085) * beatPulse * 0.052;
  const beatSteerY = Math.cos(time * 0.078) * beatPulse * 0.046;

  const tx = clamp01(0.5 + offsX + centerPullX + wobbleX + beatSteerX, 0.08, 0.92);
  const ty = clamp01(0.5 + offsY + centerPullY + wobbleY + beatSteerY, 0.08, 0.92);
  warpOx += (tx - warpOx) * react;
  warpOy += (ty - warpOy) * react;

  const cx = warpOx * width;
  const cy = warpOy * height;

  const speedTarget =
    0.22 +
    intensity * 1.55 +
    energyN * 0.45 +
    beatPulse * 0.5 +
    (1 - calm) * 0.3;
  warpSpeedMul += (speedTarget - warpSpeedMul) * (descent ? 0.045 : 0.062 + intensity * 0.035);

  const zoomTarget =
    0.82 + energyN * 1.25 + beatPulse * 1.05 + bassN * 0.5 + midN * 0.25;
  warpZoomSm += (zoomTarget - warpZoomSm) * (descent ? 0.055 : 0.075 + intensity * 0.045);

  const rollTarget =
    time * (0.00042 + intensity * 0.0011 + midN * 0.00065) +
    Math.sin(time * 0.00088 + bassN * 2) * (0.5 + energyN * 0.45) +
    Math.cos(time * 0.00062 + highN * 3) * 0.35 +
    beatPulse * 0.28;
  warpRoll += (rollTarget - warpRoll) * (descent ? 0.04 : 0.052 + intensity * 0.03);

  const skewTarget =
    Math.sin(time * 0.00055) * (0.42 + energyN * 0.55) +
    Math.cos(time * 0.00035 + midN * 4.2) * 0.32 +
    Math.sin(time * 0.00028 + bassN * 5) * 0.22 +
    beatPulse * 0.18;
  warpSkew += (skewTarget - warpSkew) * (descent ? 0.042 : 0.055 + intensity * 0.028);

  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.1);
  bg.addColorStop(0, '#050810');
  bg.addColorStop(0.35, '#03050e');
  bg.addColorStop(0.7, '#020208');
  bg.addColorStop(1, '#010104');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(cx, cy, maxR * 0.15, cx, cy, maxR);
  vignette.addColorStop(0, 'rgba(8, 20, 40, 0.35)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const twirlBase =
    time * (0.0005 + midN * 0.0009 + (1 - calm) * 0.00028) +
    beatPulse * 0.24 +
    Math.sin(time * 0.00115) * 0.09;
  const twirl = twirlBase + warpSkew * 0.35;

  const hueSpin = (time * 0.055 + eq.lowMid * 0.08 + beatPulse * 42 + warpRoll * 12) % 360;

  const thrust = warpSpeedMul * warpZoomSm;

  for (let i = 0; i < nPart; i++) {
    pRadius[i] += pSpeed[i] * thrust * (0.8 + highN * 0.38 + intensity * 0.15);
    const wrapJ = ((i * 127 + Math.floor(time * 0.05)) % 100) / 500;
    if (pRadius[i] > maxR * (0.93 + wrapJ)) {
      pRadius[i] = 5 + ((i * 17) % 20) + beatPulse * 18 + intensity * 12;
      pAngle[i] += (((i * 31) % 10) / 100 - 0.05) * (0.5 + beatPulse + intensity * 0.4);
    }
  }

  const binFor = (i: number) => {
    const bi = ((i * 13 + Math.floor(midN * 17)) % bl + bl) % bl;
    return (dataArray[bi] ?? 0) / 255;
  };

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < nPart; i++) {
    const spec = binFor(i);
    const r = pRadius[i]!;
    const bend = warpSkew * (r / maxR) * 1.05 + Math.sin(time * 0.0016 + i * 0.06) * 0.05;
    const ang = pAngle[i]! + twirl + warpRoll + bend;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const x = cx + ca * r;
    const y = cy + sa * r;
    const lenBoost = 0.65 + intensity * 0.55;
    const len =
      (6 + r * 0.095 * pLenScale[i]!) *
      (0.55 + spec * 0.95 + beatPulse * 0.65) *
      (0.75 + energyN * 0.5) *
      lenBoost;
    const hue = (hueSpin + pHueOfs[i]! + spec * 80 + (r / maxR) * 40) % 360;
    const sat = 72 + highN * 22 + spec * 15 + intensity * 10;
    const light = 52 + spec * 18 + beatPulse * 15 + intensity * 8;
    const alpha =
      0.11 +
      spec * 0.38 +
      (1 - r / maxR) * 0.24 +
      energyN * 0.12 +
      intensity * 0.08;

    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${Math.min(0.95, alpha)})`;
    ctx.lineWidth =
      0.85 +
      spec * 2.2 +
      beatPulse * 1.4 +
      (r / maxR) * 1.2 +
      intensity * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + ca * len, y + sa * len);
    ctx.stroke();
  }

  ctx.restore();

  const heroPulse = 0.6 + beatPulse * 1 + bassN * 0.5 + intensity * 0.35;
  const rotHero = warpRoll * 0.85 + time * 0.00035 * (0.6 + midN * 0.9) + warpSkew * 0.25;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.translate(cx, cy);
  ctx.rotate(rotHero);

  const drawHeroRay = (a: number, thick: number, hue: number, alpha: number) => {
    ctx.save();
    ctx.rotate(a);
    const g = ctx.createLinearGradient(0, 0, maxR, 0);
    g.addColorStop(0, `hsla(${hue}, 95%, 75%, ${alpha * heroPulse})`);
    g.addColorStop(0.35, `hsla(${(hue + 40) % 360}, 88%, 58%, ${alpha * 0.45 * heroPulse})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = thick * (1 + beatPulse * 0.55 + intensity * 0.35);
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.55)`;
    ctx.shadowBlur = descent ? 0 : 16 + beatPulse * 22 + intensity * 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(maxR * 1.05, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  drawHeroRay(0, 5 + energyN * 4, 185, 0.5);
  drawHeroRay(Math.PI, 5 + energyN * 4, 195, 0.48);
  drawHeroRay(Math.PI * 0.25, 4 + bassN * 3, 175, 0.42);
  drawHeroRay(Math.PI * 0.75, 4 + bassN * 3, 300, 0.4);
  drawHeroRay(-Math.PI * 0.25, 4 + bassN * 3, 320, 0.38);
  drawHeroRay(-Math.PI * 0.75, 4 + bassN * 3, 28, 0.4);

  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(cx, cy);
  ctx.rotate(warpRoll * 0.42 + warpSkew * 0.28);
  const half = Math.hypot(width, height) * 0.65;
  const vg = ctx.createLinearGradient(0, -half, 0, half);
  vg.addColorStop(0, `hsla(185, 90%, 65%, ${0.08 + beatPulse * 0.18 + intensity * 0.06})`);
  vg.addColorStop(0.45, `hsla(200, 75%, 55%, ${0.04 + energyN * 0.06})`);
  vg.addColorStop(0.5, `hsla(195, 85%, 72%, ${0.15 + beatPulse * 0.28 + bassN * 0.12 + intensity * 0.08})`);
  vg.addColorStop(0.55, `hsla(200, 75%, 55%, ${0.04 + energyN * 0.06})`);
  vg.addColorStop(1, `hsla(185, 90%, 65%, ${0.08 + beatPulse * 0.18 + intensity * 0.06})`);
  ctx.strokeStyle = vg;
  ctx.lineWidth = 3 + beatPulse * 8 + bassN * 5 + intensity * 4;
  if (!descent) {
    ctx.shadowColor = 'rgba(120, 240, 255, 0.55)';
    ctx.shadowBlur = 20 + beatPulse * 25 + intensity * 15;
  }
  ctx.beginPath();
  ctx.moveTo(0, -half);
  ctx.lineTo(0, half);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  const coreR =
    (42 + beatPulse * 55 + bassN * 35 + energyN * 28 + intensity * 22) * (descent ? 0.85 : 1);
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  core.addColorStop(0, `rgba(255, 255, 255, ${0.35 + beatPulse * 0.35 + intensity * 0.12})`);
  core.addColorStop(0.12, `rgba(180, 255, 255, ${0.45 + energyN * 0.2})`);
  core.addColorStop(0.35, `hsla(${(hueSpin + 40) % 360}, 85%, 55%, ${0.25 + bassN * 0.15})`);
  core.addColorStop(0.65, `hsla(${(hueSpin + 120) % 360}, 70%, 40%, 0.08)`);
  core.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  const nSpark = descent ? 28 : 56;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let s = 0; s < nSpark; s++) {
    const a = (s / nSpark) * Math.PI * 2 + twirlBase * 1.3 + warpRoll * 0.6;
    const rr = 30 + (s % 7) * 18 + Math.sin(time * 0.004 + s) * 12;
    const sx = cx + Math.cos(a) * rr;
    const sy = cy + Math.sin(a) * rr;
    const sp = (dataArray[s % bl] ?? 0) / 255;
    ctx.fillStyle = `hsla(${(hueSpin + s * 17) % 360}, 80%, 70%, ${0.06 + sp * 0.2 + beatPulse * 0.12 + intensity * 0.06})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.8 + sp * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
