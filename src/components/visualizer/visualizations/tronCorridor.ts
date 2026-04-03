/**
 * Tron canyon run — FFT bins drive spikes (ridges/sky/streaks), band peaks swell parallax &
 * canyon bite; sub-bass columns on kick echo; continuous forward dive.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

function frac(x: number) {
  return x - Math.floor(x);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/** Shortest-path hue blend (degrees). */
function lerpHueDeg(from: number, to: number, t: number) {
  const u = clamp(t, 0, 1);
  const d = ((((to - from) % 360) + 540) % 360) - 180;
  return (from + d * u + 360) % 360;
}

function hash01(n: number) {
  return frac(Math.sin(n * 12.9898) * 43758.5453);
}

/** Chunky stepped height for ridge / wall (low-poly 80s). */
function stepPeak(i: number, phase: number, steps: number): number {
  const t = i + phase * steps * 0.35;
  const k = Math.floor(t);
  const f = t - k;
  const h0 = hash01(k * 31 + steps * 7);
  const h1 = hash01((k + 1) * 31 + steps * 7);
  return h0 * (1 - f) + h1 * f;
}

/** Monotonic depth — continuous “flying forward”; speed from audio intensity. */
let corridorLastTime = 0;
let corridorDepth = 0;

export function drawTronCorridor(
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

  const bl = Math.max(16, bufferLength);
  const last = bl - 1;
  const binRaw = (i: number) => dataArray[clamp(i | 0, 0, last)] ?? 0;
  const binN = (i: number) => binRaw(i) / 255;
  /** Position 0–1 along spectrum (sub → Nyquist mapped left→right). */
  const binAt01 = (t: number) => binN(Math.floor(clamp(t, 0, 0.999999) * bl));
  /** Ridge segment maps across overlapping bands; deeper layers bias low, near layers bias high. */
  const ridgeBin = (p01: number, layer: number, nLayers: number) => {
    const l = layer / Math.max(1, nLayers - 1);
    const center = 0.06 + l * 0.72;
    const widthB = 0.28;
    const t = clamp(center + (p01 - 0.5) * widthB, 0, 0.999);
    return binAt01(t);
  };
  /** Running max in bin range (cheap transient emphasis). */
  let peakSub = 0;
  let peakMid = 0;
  let peakHigh = 0;
  const iCutSub = Math.max(2, Math.floor(bl * 0.07));
  const iCutMid = Math.max(iCutSub + 1, Math.floor(bl * 0.45));
  for (let i = 0; i < bl; i++) {
    const v = binN(i);
    if (i < iCutSub) peakSub = Math.max(peakSub, v);
    else if (i < iCutMid) peakMid = Math.max(peakMid, v);
    else peakHigh = Math.max(peakHigh, v);
  }

  const bassN = Math.min(1, eq.bass / 255);
  const midN = Math.min(1, eq.mid / 255);
  const highN = Math.min(1, eq.high / 255);
  const energyN = Math.min(1, eq.energy / 255);

  const intensity = Math.min(
    1,
    energyN * 0.48 +
      bassN * 0.24 +
      midN * 0.18 +
      highN * 0.14 +
      beatPulse * 0.42
  ) * (1 - calm * 0.22);

  /* Music → landscape: bass swells ridges & parallax, mids carve detail, energy/beats bite walls. */
  const ridgePump =
    0.5 +
    bassN * 0.85 +
    beatPulse * 0.95 +
    energyN * 0.35 +
    peakSub * 0.55;
  const ridgeParallaxMul = 1 + midN * 0.55 + beatPulse * 0.35 + peakMid * 0.4;
  const canyonBite =
    0.55 +
    energyN * 0.75 +
    beatPulse * 0.65 +
    bassN * 0.45 +
    peakMid * 0.35 +
    peakHigh * 0.22;
  const cliffShake = highN * 0.04 + beatPulse * 0.055 + peakHigh * 0.065;

  const rawDt = corridorLastTime > 0 ? time - corridorLastTime : 16.67;
  const dt =
    rawDt > 0 && rawDt < 180 ? clamp(rawDt, 8, 56) : rawDt >= 180 ? 20 : 16.67;
  corridorLastTime = time;
  const speedMin = descent ? 0.000018 : 0.000026;
  const speedMax = descent ? 0.00011 : 0.000175;
  const scrollSpeed = speedMin + intensity * (speedMax - speedMin);
  corridorDepth += dt * scrollSpeed;
  corridorDepth = frac(corridorDepth);

  const cx = width * 0.5;
  const scroll = corridorDepth;
  const designBlend = 0.5 + 0.5 * Math.sin(time * 0.000022 + midN * 2.1);
  const archTight = 0.55 + designBlend * 0.45;
  const wallSteep = 0.42 + (1 - designBlend) * 0.38;
  const ribExtra = Math.floor(designBlend * (descent ? 2 : 4));

  const vpX = cx + Math.sin(time * 0.00032) * width * 0.06 * (0.25 + midN * 0.75);
  const vpY = height * (0.34 + highN * 0.04) + Math.cos(time * 0.00026) * height * 0.028;

  /* Sky palette — slow dramatic shifts (sunset / toxic / cyan void). */
  const skyHue0 = (time * 0.0042 + bassN * 70 + midN * 40) % 360;
  const skyHue1 = (skyHue0 + 55 + highN * 35) % 360;
  const skyHue2 = (skyHue0 + 140 + energyN * 50) % 360;
  const skyHue3 = (skyHue0 + 220 + beatPulse * 30) % 360;

  const hueMain = (time * 0.011 + bassN * 55 + midN * 28 + highN * 15) % 360;
  const hueRail = (hueMain + 195 + highN * 40) % 360;
  const sat = 96 + energyN * 4 + intensity * 6;
  const satGrid = Math.min(100, sat + 4 + beatPulse * 5);
  const light = 58 + beatPulse * 18 + energyN * 14 + intensity * 10;
  const gridA = 0.68 + energyN * 0.22 + beatPulse * 0.28 + intensity * 0.12;
  const meshBoost = 1 + canyonBite * 0.14;
  const glowWide = (descent ? 3.2 : 4.8 + beatPulse * 4.2 + intensity * 1.8) * meshBoost;
  const glowCore = (descent ? 1.05 : 1.35 + beatPulse * 1 + intensity * 0.45) * meshBoost;
  const divePow = 1.06 + intensity * 0.38;

  const nRows = descent ? 12 : 20;
  const nVert = descent ? 8 : 11 + ribExtra;
  const nWallVert = descent ? 8 : 11 + ribExtra;
  const maxHalfW = width * 0.46;

  const mapDepth = (u: number) => Math.pow(clamp(u, 0, 1), divePow);

  const yFloorAt = (u: number) =>
    vpY + (height * 0.93 - vpY) * Math.pow(mapDepth(u), 1.08 + archTight * 0.08);
  const yCeilAt = (u: number) =>
    vpY - (vpY - height * 0.045) * Math.pow(mapDepth(u), 1.05 + wallSteep * 0.12);
  const halfWAt = (u: number) =>
    maxHalfW * (0.035 + 0.965 * Math.pow(mapDepth(u), 0.92));
  const halfWCeilAt = (u: number) => halfWAt(u) * (0.58 + designBlend * 0.22);

  /* Horizon pushed down — tall sky band (gradient + lines + ridge bases). */
  const skyBottom = clamp(vpY * 1.32 + height * 0.09, height * 0.42, height * 0.76);

  // --- deep ground (canyon floor ambient) ---
  const groundG = ctx.createLinearGradient(0, height * 0.55, 0, height);
  groundG.addColorStop(0, `hsla(${(hueMain + 260) % 360}, 35%, 4%, 1)`);
  groundG.addColorStop(1, `hsla(0, 0%, 1%, 1)`);
  ctx.fillStyle = groundG;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  // --- sky: rich vertical gradient ---
  const skyG = ctx.createLinearGradient(0, 0, 0, skyBottom);
  skyG.addColorStop(0, `hsla(${skyHue0}, 88%, 38%, 1)`);
  skyG.addColorStop(0.28, `hsla(${skyHue1}, 92%, 48%, 1)`);
  skyG.addColorStop(0.55, `hsla(${skyHue2}, 85%, 42%, 1)`);
  skyG.addColorStop(0.82, `hsla(${skyHue3}, 78%, 22%, 1)`);
  skyG.addColorStop(1, `hsla(${(hueMain + 280) % 360}, 55%, 8%, 1)`);
  ctx.fillStyle = skyG;
  ctx.fillRect(0, 0, width, skyBottom);

  // --- sky horizontal scan / grid = “sky lines” (color shifts per band) ---
  const nSkyLines = descent ? 9 : 14;
  for (let i = 0; i <= nSkyLines; i++) {
    const ty = (i / nSkyLines) * skyBottom * 0.97;
    const lineHue = (skyHue0 + i * 14 + midN * 40 + Math.sin(time * 0.001 + i) * 12) % 360;
    const hiBin = last - Math.floor((i / Math.max(1, nSkyLines)) * Math.min(24, bl * 0.35));
    const hiSpark = binN(hiBin);
    const la =
      0.22 +
      (i / nSkyLines) * 0.45 +
      beatPulse * 0.15 +
      bassN * 0.14 +
      hiSpark * 0.38;
    ctx.strokeStyle = `hsla(${lineHue}, 92%, ${62 + highN * 12 + hiSpark * 22}%, ${la})`;
    ctx.lineWidth = i % 3 === 0 ? 1.6 + hiSpark * 1.2 : 0.85 + hiSpark * 0.7;
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(width, ty);
    ctx.stroke();
    ctx.strokeStyle = `hsla(${(lineHue + 25) % 360}, 100%, 82%, ${la * 0.35})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // --- parallax mountain ridges (80s vector — tall, loud-reactive, neon-read silhouette) ---
  const ridgeLayers = descent ? 3 : 4;
  for (let L = 0; L < ridgeLayers; L++) {
    const layer = ridgeLayers - 1 - L;
    const parallax =
      scroll * (0.72 + layer * 0.52) * ridgeParallaxMul +
      time * 0.000014 * (layer + 1) +
      bassN * 0.12 * layer;
    const baseY =
      skyBottom * (0.42 + layer * 0.11) + vpY * 0.06 * layer + beatPulse * height * 0.012 * (layer + 1);
    const ampBase = 34 + layer * 48;
    const amp = ampBase * ridgePump * (1 + midN * 0.45);
    const segs = descent ? 26 : 40;
    ctx.beginPath();
    ctx.moveTo(0, skyBottom + 28);
    ctx.lineTo(0, baseY);
    for (let p = 0; p <= segs; p++) {
      const px = (p / segs) * width;
      const p01 = p / segs;
      const ph = stepPeak(p + layer * 17, parallax, 4 + layer) * amp;
      const spikeEvery = Math.max(2, 3 - layer);
      const sb = ridgeBin(p01, layer, ridgeLayers);
      const spectralSpike = sb * sb * amp * (0.55 + layer * 0.12);
      const spike =
        Math.floor((p + parallax * segs) % spikeEvery) === 0
          ? amp * (0.42 + beatPulse * 0.55 + bassN * 0.25 + peakSub * 0.35)
          : 0;
      ctx.lineTo(px, baseY - ph - spike - spectralSpike);
    }
    ctx.lineTo(width, skyBottom + 28);
    ctx.closePath();
    /* 0 = farthest ridge, 1 = nearest — color shifts from cool/hazy → warm/neon (heading toward them). */
    const farT =
      ridgeLayers <= 1 ? 1 : (ridgeLayers - 1 - layer) / (ridgeLayers - 1);
    const fillHueBase =
      (skyHue2 +
        (1 - farT) * 118 +
        farT * (-28) +
        farT * hueMain * 0.12 +
        midN * 8 * farT) %
      360;
    /* Near ridges pull toward pink / rose-magenta (depth read: driving into them). */
    const pinkFill = (316 + midN * 22 + beatPulse * 18 + highN * 14) % 360;
    const fillHue = lerpHueDeg(fillHueBase, pinkFill, farT * farT * 0.88);
    const fillSat = 38 + farT * 46 + midN * 8 * farT + farT * farT * 12;
    const fillL = 7 + farT * 24 + midN * 5 + farT * farT * 4;
    const fillA = 0.62 + farT * 0.32;
    ctx.fillStyle = `hsla(${fillHue}, ${clamp(fillSat, 0, 100)}%, ${fillL}%, ${fillA})`;
    ctx.fill();
    const rimHueBase =
      (fillHue + 22 + farT * 48 + beatPulse * 20 * farT + (1 - farT) * 38) % 360;
    const pinkRim = (326 + beatPulse * 22 + midN * 16 + highN * 8) % 360;
    const rimHue = lerpHueDeg(rimHueBase, pinkRim, farT * farT * 0.82);
    const rimLight = 36 + farT * 40 + beatPulse * 24 * farT + intensity * 14 * farT;
    const rimA = 0.38 + farT * 0.42 + intensity * 0.18 * farT + beatPulse * 0.25 * farT;
    ctx.strokeStyle = `hsla(${rimHue}, ${clamp(68 + farT * 28 + farT * farT * 8, 0, 100)}%, ${rimLight}%, ${rimA})`;
    ctx.lineWidth = 1.35 + farT * 2.85 + beatPulse * (0.8 + farT * 2.4);
    ctx.stroke();
    const innerRim = lerpHueDeg(
      (rimHue + (1 - farT) * 38 + farT * 28) % 360,
      342 + beatPulse * 14 + highN * 10,
      farT * farT * 0.75
    );
    ctx.strokeStyle = `hsla(${innerRim}, 100%, ${60 + farT * 26}%, ${0.22 + farT * 0.52 + beatPulse * 0.5})`;
    ctx.lineWidth = 0.75 + farT * 0.95;
    ctx.stroke();
  }

  /* Kick echo: sub-bass bins + beat; per-column sub energy for “punch columns”. */
  const echoGate = beatPulse * 0.65 + peakSub * 0.85 + bassN * 0.25;
  if (!descent || echoGate > 0.12) {
    const layer = 0;
    const parallax = scroll * 1.15 * ridgeParallaxMul + bassN * 0.18 + peakSub * 0.25;
    const baseY = skyBottom * 0.42 + beatPulse * height * 0.028 + peakSub * height * 0.018;
    const amp = (34 + beatPulse * 110 + bassN * 55 + peakSub * 95) * ridgePump * 0.55;
    const segs = 40;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let p = 0; p <= segs; p++) {
      const px = (p / segs) * width;
      const subCol = binN(Math.floor((p / segs) * iCutSub));
      const ph = stepPeak(p + layer * 17 + 3, parallax, 4) * amp * (0.65 + subCol * 0.85);
      ctx.lineTo(px, baseY - ph);
    }
    ctx.strokeStyle = `hsla(${(skyHue0 + 80) % 360}, 100%, 70%, ${0.1 + echoGate * 0.62})`;
    ctx.lineWidth = 2 + beatPulse * 4 + peakSub * 6;
    ctx.stroke();
    ctx.restore();
  }

  // --- canyon void under mountains ---
  const voidG = ctx.createLinearGradient(0, skyBottom * 0.65, width, vpY + height * 0.1);
  voidG.addColorStop(0, `hsla(${(hueMain + 300) % 360}, 50%, 5%, 0.92)`);
  voidG.addColorStop(0.5, `hsla(${hueMain}, 42%, 4%, 0.88)`);
  voidG.addColorStop(1, `hsla(${(hueMain + 240) % 360}, 38%, 6%, 0.95)`);
  ctx.fillStyle = voidG;
  ctx.fillRect(0, skyBottom * 0.5, width, height * 0.55);

  const fog = ctx.createRadialGradient(
    vpX,
    vpY,
    0,
    vpX,
    vpY,
    Math.max(width, height) * 0.72
  );
  fog.addColorStop(
    0,
    `hsla(${hueMain}, ${Math.min(100, sat + 8)}%, ${light + 12}%, ${0.38 + beatPulse * 0.2 + intensity * 0.14})`
  );
  fog.addColorStop(
    0.45,
    `hsla(${(hueMain + 55) % 360}, 88%, 22%, ${0.14 + intensity * 0.1})`
  );
  fog.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, width, height);

  /** Wide + core stroke */
  const strokeGlow = (pathFn: () => void) => {
    ctx.save();
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeStyle = `hsla(${hueMain}, ${satGrid}%, ${light}%, ${gridA * 0.38})`;
    ctx.lineWidth = glowWide;
    pathFn();
    ctx.stroke();
    ctx.strokeStyle = `hsla(${(hueMain + 18) % 360}, 100%, ${Math.min(
      96,
      light + 32
    )}%, ${gridA * 0.95})`;
    ctx.lineWidth = glowCore;
    pathFn();
    ctx.stroke();
    ctx.restore();
  };

  /** Jagged canyon bite — spectrum samples add per-column “rock” hits. */
  const wallJag = (s: number, u: number, side: number) => {
    const k = Math.floor(s * 19 + u * 11 + scroll * 6 + side * 13);
    const coarse = (k % 7) * 0.052 + hash01(k + side * 100) * 0.14;
    const fine =
      Math.sin(s * 21 + u * 17 + scroll * 9 + side) * cliffShake * (0.5 + highN);
    const bi = Math.floor(clamp(s * 0.35 + u * 0.55 + side * 0.07, 0, 0.999) * bl);
    const spec = binN(bi) * 0.11 * (0.45 + peakMid);
    return (coarse + fine + spec) * canyonBite;
  };

  /** Outer floor cliff — bin-driven edge warp */
  const floorJagX = (t: number, u: number, side: number) => {
    const k = Math.floor(t * 23 + u * 13 + scroll * 7);
    const j =
      (hash01(k * 3 + side) - 0.5) * halfWAt(u) * (0.14 + midN * 0.06) * canyonBite;
    const bi = Math.floor(clamp(t * 0.55 + u * 0.38, 0, 0.999) * bl);
    const specKick = (binN(bi) - 0.15) * halfWAt(u) * 0.12 * canyonBite;
    return (
      j +
      specKick +
      Math.sin(k * 2.1 + beatPulse * 8) * halfWAt(u) * beatPulse * 0.035
    );
  };

  // --- canyon ceiling (below sky — tunnel roof lines) ---
  for (let k = 0; k < nRows; k++) {
    const u = frac(k / nRows + scroll);
    const y = yCeilAt(u);
    if (y < skyBottom * 0.15) continue;
    const hw = halfWCeilAt(u);
    strokeGlow(() => {
      ctx.beginPath();
      ctx.moveTo(vpX - hw, y);
      ctx.lineTo(vpX + hw, y);
    });
  }

  // --- angular “vector” arch struts (fewer, sharper than smooth bilinear arch) ---
  const archSegs = 4 + ribExtra;
  for (let a = 0; a <= archSegs; a++) {
    const t = a / archSegs;
    ctx.save();
    ctx.beginPath();
    for (let k = 0; k < nRows; k++) {
      const u = frac(k / nRows + scroll);
      const yf = yFloorAt(u);
      const yc = yCeilAt(u);
      if (yc < skyBottom * 0.12 && k < nRows * 0.35) continue;
      const wf = halfWAt(u);
      const wc = halfWCeilAt(u);
      const ang = Math.PI * (0.82 + designBlend * 0.22) * t + Math.PI * 0.1;
      const archR = 0.5 + designBlend * 0.22;
      const px = vpX - (wf * (1 - t * archR) + wc * t) * Math.cos(ang * 0.92);
      const py = yf * (1 - t) + yc * t - Math.sin(ang) * wf * 0.14 * archTight;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    const archWide = glowWide * (0.92 + beatPulse * 0.22 + canyonBite * 0.08);
    const archCore = glowCore * (0.82 + beatPulse * 0.18);
    ctx.strokeStyle = `hsla(${(hueMain + 35) % 360}, ${satGrid}%, ${light}%, ${gridA * 0.42})`;
    ctx.lineWidth = archWide;
    ctx.stroke();
    ctx.strokeStyle = `hsla(${(hueMain + 22) % 360}, 100%, ${light + 28}%, ${gridA * 0.92})`;
    ctx.lineWidth = archCore;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    for (let k = 0; k < nRows; k++) {
      const u = frac(k / nRows + scroll);
      const yf = yFloorAt(u);
      const yc = yCeilAt(u);
      if (yc < skyBottom * 0.12 && k < nRows * 0.35) continue;
      const wf = halfWAt(u);
      const wc = halfWCeilAt(u);
      const ang = Math.PI * (0.82 + designBlend * 0.22) * t + Math.PI * 0.1;
      const archR = 0.5 + designBlend * 0.22;
      const px = vpX + (wf * (1 - t * archR) + wc * t) * Math.cos(ang * 0.92);
      const py = yf * (1 - t) + yc * t - Math.sin(ang) * wf * 0.14 * archTight;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `hsla(${(hueMain + 35) % 360}, ${satGrid}%, ${light}%, ${gridA * 0.42})`;
    ctx.lineWidth = archWide;
    ctx.stroke();
    ctx.strokeStyle = `hsla(${(hueMain + 22) % 360}, 100%, ${light + 28}%, ${gridA * 0.92})`;
    ctx.lineWidth = archCore;
    ctx.stroke();
    ctx.restore();
  }

  // --- floor horizontal ---
  for (let k = 0; k < nRows; k++) {
    const u = frac(k / nRows + scroll);
    const y = yFloorAt(u);
    const hw = halfWAt(u);
    strokeGlow(() => {
      ctx.beginPath();
      ctx.moveTo(vpX - hw + floorJagX(0, u, -1), y);
      ctx.lineTo(vpX + hw + floorJagX(1, u, 1), y);
    });
  }

  // --- floor verticals ---
  for (let j = 0; j <= nVert; j++) {
    const s = j / nVert;
    strokeGlow(() => {
      ctx.beginPath();
      for (let k = 0; k < nRows; k++) {
        const u = frac(k / nRows + scroll);
        const y = yFloorAt(u);
        const hw = halfWAt(u);
        const x = vpX + (s - 0.5) * 2 * hw;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });
  }

  // --- jagged canyon walls ---
  for (let j = 0; j <= nWallVert; j++) {
    const s = j / nWallVert;
    strokeGlow(() => {
      ctx.beginPath();
      for (let k = 0; k < nRows; k++) {
        const u = frac(k / nRows + scroll);
        const yf = yFloorAt(u);
        const yc = yCeilAt(u);
        const wf = halfWAt(u);
        const wc = halfWCeilAt(u);
        const jag = wallJag(s, u, -1) * wf;
        const x = vpX - (wf * (1 - s) + wc * s) - jag;
        const y = yf * (1 - s) + yc * s;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });
    strokeGlow(() => {
      ctx.beginPath();
      for (let k = 0; k < nRows; k++) {
        const u = frac(k / nRows + scroll);
        const yf = yFloorAt(u);
        const yc = yCeilAt(u);
        const wf = halfWAt(u);
        const wc = halfWCeilAt(u);
        const jag = wallJag(s, u, 1) * wf;
        const x = vpX + (wf * (1 - s) + wc * s) + jag;
        const y = yf * (1 - s) + yc * s;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });
  }

  // --- center rails ---
  const railSpread = 0.08 + highN * 0.045;
  for (const side of [-1, 1] as const) {
    ctx.save();
    ctx.beginPath();
    for (let k = 0; k < nRows; k++) {
      const u = frac(k / nRows + scroll);
      const y = yFloorAt(u);
      const hw = halfWAt(u);
      const x = vpX + side * hw * railSpread * 2.2;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${hueRail}, 96%, ${90 + beatPulse * 6 + intensity * 4}%, ${0.62 + beatPulse * 0.38 + intensity * 0.15})`;
    ctx.lineWidth = descent ? 2.2 : 2.8 + beatPulse * 2.2;
    ctx.shadowColor = `hsla(${hueRail}, 100%, 80%, 0.9)`;
    ctx.shadowBlur = descent ? 6 : 16 + beatPulse * 14;
    ctx.stroke();
    ctx.lineWidth = descent ? 0.9 : 1.1;
    ctx.strokeStyle = `hsla(200, 25%, 96%, ${0.75 + beatPulse * 0.2})`;
    ctx.stroke();
    ctx.restore();
  }

  // --- wall beacons ---
  const lightEvery = descent ? 4 : 3;
  for (let k = 0; k < nRows; k += lightEvery) {
    const u = frac(k / nRows + scroll);
    if (u < 0.04 || u > 0.97) continue;
    const yf = yFloorAt(u);
    const yc = yCeilAt(u);
    const wf = halfWAt(u);
    const wc = halfWCeilAt(u);
    const s = 0.22 + 0.12 * Math.sin(time * 0.003 + k * 0.7);
    for (const sign of [-1, 1] as const) {
      const jag = wallJag(s, u, sign) * wf;
      const wBlend = wf * (1 - s) + wc * s;
      const x = vpX + sign * (wBlend + jag);
      const y = yf * (1 - s) + yc * s;
      const tw = 5 + beatPulse * 8 + energyN * 4;
      const th = 3 + highN * 3;
      ctx.fillStyle = `hsla(${(hueRail + 35) % 360}, 88%, 78%, ${0.48 + u * 0.45 + beatPulse * 0.32 + intensity * 0.12})`;
      ctx.fillRect(x - tw / 2, y - th / 2, tw, th);
    }
  }

  // --- near speed streaks ---
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const nBurst = descent ? 6 : 10;
  for (let i = 0; i < nBurst; i++) {
    const u = frac(scroll + i / nBurst + beatPulse * 0.08);
    if (u < 0.55) continue;
    const y = yFloorAt(u);
    const hw = halfWAt(u);
    const streakBin = binN(
      iCutMid + Math.floor((i / Math.max(1, nBurst)) * (last - iCutMid))
    );
    const alpha =
      (u - 0.55) *
      2.4 *
      (0.18 + beatPulse * 0.42 + intensity * 0.28 + streakBin * 0.55);
    ctx.strokeStyle = `hsla(${hueMain}, 100%, ${72 + streakBin * 22}%, ${alpha})`;
    ctx.lineWidth = 1.2 + streakBin * 2.2;
    ctx.beginPath();
    ctx.moveTo(vpX - hw * 0.15, y);
    ctx.lineTo(vpX + hw * 0.15, y);
    ctx.stroke();
  }
  ctx.restore();
}
