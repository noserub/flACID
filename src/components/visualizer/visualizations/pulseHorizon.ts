/**
 * Pulse Horizon — synthwave-style horizon: thin spectrum spikes, layered neon ribbons,
 * reflective floor, diagonal streaks, soft particles. Heavier; throttles in Descend overlay.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

const spikeSmooth: number[] = [];
let ribbonPhaseLayers = [0, 0, 0];

function ensureSpikes(n: number) {
  while (spikeSmooth.length < n) spikeSmooth.push(0);
  if (spikeSmooth.length > n) spikeSmooth.length = n;
}

function spikeBinU(u: number, bl: number): number {
  return Math.min(bl - 1, Math.floor(Math.pow(Math.max(0.001, u), 0.8) * (bl - 1)));
}

function spikeSample(data: Uint8Array, bl: number, center: number, radius: number): number {
  const lo = Math.max(0, Math.floor(center - radius));
  const hi = Math.min(bl - 1, Math.ceil(center + radius));
  let m = 0;
  for (let k = lo; k <= hi; k++) m = Math.max(m, (data[k] ?? 0) / 255);
  return m;
}

function neonGradient(ctx: CanvasRenderingContext2D, y0: number, y1: number, width: number, time: number) {
  const g = ctx.createLinearGradient(0, y0, width, y1);
  const shift = (time * 0.018) % 360;
  g.addColorStop(0, `hsla(${(175 + shift) % 360}, 92%, 58%, 0.85)`);
  g.addColorStop(0.22, `hsla(${(265 + shift * 0.7) % 360}, 88%, 55%, 0.75)`);
  g.addColorStop(0.45, `hsla(${(310 + shift * 0.5) % 360}, 90%, 58%, 0.78)`);
  g.addColorStop(0.68, `hsla(${(28 + shift * 0.3) % 360}, 95%, 58%, 0.72)`);
  g.addColorStop(0.82, `hsla(${(48 + shift * 0.2) % 360}, 92%, 62%, 0.7)`);
  g.addColorStop(1, `hsla(${(195 + shift) % 360}, 85%, 52%, 0.65)`);
  return g;
}

function drawPerspectiveFloor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
  time: number,
  energyN: number,
  beatPulse: number,
  descent: boolean
) {
  const floorH = height - horizonY;
  const cx = width * 0.5;
  const vanishY = horizonY + 1;
  const marginX = width * 0.02;
  const nVert = descent ? 22 : 36;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < nVert; i++) {
    const t = i / Math.max(1, nVert - 1);
    const xTop = marginX + t * (width - marginX * 2);
    const wave = Math.sin(t * Math.PI * 2 + time * 0.0008) * width * 0.04;
    const xT = xTop + wave * 0.25;
    const spread = 2.4 + energyN * 0.55 + beatPulse * 0.35;
    const xBot = cx + (xT - cx) * spread;
    const hue = (255 + t * 100 + time * 0.04) % 360;
    ctx.strokeStyle = `hsla(${hue}, 62%, 48%, ${0.045 + (i % 4 === 0 ? 0.04 : 0) + beatPulse * 0.06})`;
    ctx.lineWidth = i % 5 === 0 ? 1.1 : 0.65;
    ctx.beginPath();
    ctx.moveTo(xT, vanishY);
    ctx.lineTo(xBot, height + 40);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const nH = descent ? 14 : 26;
  for (let k = 1; k <= nH; k++) {
    const u = k / nH;
    const y = horizonY + Math.pow(u, 1.55) * floorH * 1.02;
    const sway = Math.sin(time * 0.0018 + k * 0.35) * (3 + beatPulse * 8);
    ctx.beginPath();
    ctx.moveTo(0, y + sway);
    for (let x = 0; x <= width; x += 10) {
      const wav = Math.sin(x * 0.012 + k * 0.7 + time * 0.002) * 2.5 * u;
      ctx.lineTo(x, y + sway + wav);
    }
    ctx.strokeStyle = `hsla(${200 + k * 5 + time * 0.03}, 58%, 52%, ${0.04 + u * 0.1 + energyN * 0.05})`;
    ctx.lineWidth = 0.55 + u * 0.85;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const nRay = descent ? 9 : 17;
  const bx = width * 0.5;
  const by = height * 0.99;
  for (let r = 0; r < nRay; r++) {
    const t = r / Math.max(1, nRay - 1) - 0.5;
    const ang = -Math.PI / 2 - t * 0.62;
    const len = height * 1.15;
    const rh = (168 + r * 19 + beatPulse * 40 + time * 0.06) % 360;
    ctx.strokeStyle = `hsla(${rh}, 88%, 58%, ${0.08 + beatPulse * 0.2 + energyN * 0.08})`;
    ctx.lineWidth = 1.5 + beatPulse * 3 + Math.abs(t) * 2;
    ctx.shadowColor = `hsla(${rh}, 90%, 60%, 0.45)`;
    ctx.shadowBlur = descent ? 0 : 12 + beatPulse * 10;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function drawStarField(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
  time: number,
  descent: boolean
) {
  const n = descent ? 48 : 100;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let s = 0; s < n; s++) {
    const seed = s * 991 + 0.37;
    const sx = (Math.sin(seed) * 0.5 + 0.5) * width;
    const sy = (Math.cos(seed * 1.7) * 0.5 + 0.5) * horizonY * 0.94;
    const tw = 0.35 + (s % 7) * 0.08 + Math.sin(time * 0.003 + s) * 0.15;
    ctx.fillStyle = `hsla(210, 40%, 88%, ${tw * 0.38})`;
    ctx.fillRect(sx, sy, 1.2, 1.2);
  }
  ctx.restore();
}

export function drawPulseHorizon(
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
  const energyN = Math.min(1, eq.energy / 255);
  const bassN = Math.min(1, eq.bass / 255);
  const midN = Math.min(1, eq.mid / 255);
  const highN = Math.min(1, eq.high / 255);
  const highMidN = Math.min(1, eq.highMid / 255);
  const presenceN = Math.min(1, eq.presence / 255);

  const horizonY = height * (descent ? 0.44 : 0.4);
  const skyH = horizonY;

  const t = time * 0.00028;
  const bg = ctx.createLinearGradient(
    width * (0.1 + 0.15 * Math.sin(t)),
    0,
    width * (0.9 + 0.08 * Math.cos(t * 0.8)),
    skyH
  );
  bg.addColorStop(0, '#030308');
  bg.addColorStop(0.4, '#06051a');
  bg.addColorStop(1, '#0a0618');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, skyH);

  const floorBase = ctx.createLinearGradient(0, horizonY, 0, height);
  floorBase.addColorStop(0, '#07051c');
  floorBase.addColorStop(0.18, '#0a0628');
  floorBase.addColorStop(0.45, '#05030f');
  floorBase.addColorStop(0.72, '#08051a');
  floorBase.addColorStop(1, '#020208');
  ctx.fillStyle = floorBase;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  const floorGlow = ctx.createRadialGradient(
    width * 0.5,
    horizonY,
    0,
    width * 0.5,
    horizonY + (height - horizonY) * 0.35,
    Math.max(width, height) * 0.72
  );
  const fh = (time * 0.04 + 270) % 360;
  floorGlow.addColorStop(0, `hsla(${fh}, 55%, 28%, ${0.12 + energyN * 0.08 + beatPulse * 0.1})`);
  floorGlow.addColorStop(0.35, `hsla(${(fh + 60) % 360}, 50%, 16%, 0.06)`);
  floorGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  drawStarField(ctx, width, horizonY, time, descent);

  const sunX = width * (0.5 + 0.06 * Math.sin(t * 0.6));
  const sunY = skyH * (0.38 + 0.06 * Math.cos(t * 0.5));
  const sunR = Math.max(width, height) * 0.38;
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
  const sunHue = (280 + Math.sin(t * 1.1) * 25 + bassN * 30) % 360;
  sun.addColorStop(
    0,
    `hsla(${sunHue}, 70%, 35%, ${0.22 + energyN * 0.14 + beatPulse * 0.22})`
  );
  sun.addColorStop(0.35, `hsla(${(sunHue + 40) % 360}, 65%, 18%, 0.08)`);
  sun.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, skyH);

  const nSpikes = descent ? 52 : 96;
  ensureSpikes(nSpikes);
  const spikeMaxH = skyH * (descent ? 0.88 : 0.94);
  const marginX = width * 0.02;
  const stepX = (width - marginX * 2) / Math.max(1, nSpikes - 1);
  const smoothKBase = descent ? 0.32 : 0.26 + (1 - calm) * 0.08;
  const flow = energyN * 0.1 + beatPulse * 0.12 + midN * 0.05;

  for (let i = 0; i < nSpikes; i++) {
    const u = i / Math.max(1, nSpikes - 1);
    const bin = spikeBinU(u, bl);
    const rad = u > 0.5 ? 2 + Math.floor(u * 5) : u > 0.22 ? 1 : 1;
    let v = spikeSample(dataArray, bl, bin, rad);
    v *= Math.min(2.2, 0.5 + 2.1 * Math.pow(u, 2));
    if (u > 0.3) {
      v = Math.min(
        1,
        v +
          (highN * 0.38 + highMidN * 0.28 + presenceN * 0.22) *
            Math.pow((u - 0.3) / 0.7, 1.1) *
            0.55
      );
    }
    v = Math.min(1, v + flow * (0.3 + 0.7 * u));
    v = Math.min(1, v * (1 + beatPulse * (0.2 + 0.55 * u)));
    if (u < 0.12) v = Math.min(1, v * (1 + beatPulse * 0.95));
    v = Math.pow(Math.min(1, v), 0.48 - u * 0.12);
    const k = Math.max(0.14, smoothKBase * (1 - 0.52 * u * u));
    spikeSmooth[i] = spikeSmooth[i]! + (v - spikeSmooth[i]!) * k;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, horizonY + 16);
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < nSpikes; i++) {
    const a = spikeSmooth[i] ?? 0;
    if (a < 0.02) continue;
    const x = marginX + i * stepX;
    const u = i / Math.max(1, nSpikes - 1);
    const h =
      a *
      spikeMaxH *
      (0.78 + highN * 0.42 + energyN * 0.35 + beatPulse * (0.45 + 0.35 * u));
    const hue =
      (165 + (i / nSpikes) * 220 + time * 0.026 + midN * 22 + beatPulse * 50) % 360;
    const lw = descent ? 1.2 : 1.4 + a * 1.2;
    ctx.strokeStyle = `hsla(${hue}, 82%, ${58 + a * 12}%, ${0.35 + a * 0.45})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    ctx.lineTo(x, horizonY - h);
    ctx.stroke();
    if (!descent && a > 0.55) {
      ctx.strokeStyle = `hsla(${hue}, 40%, 92%, ${0.08 + a * 0.12})`;
      ctx.lineWidth = lw + 2;
      ctx.beginPath();
      ctx.moveTo(x, horizonY);
      ctx.lineTo(x, horizonY - h);
      ctx.stroke();
    }
  }
  ctx.restore();

  const steps = descent ? 48 : 80;
  const drawRibbon = (layer: number) => {
    const phase = ribbonPhaseLayers[layer] ?? 0;
    ribbonPhaseLayers[layer] =
      phase +
      0.014 *
        (layer + 1) *
        (0.85 + midN * 0.75 + energyN * 0.5 + beatPulse * (0.9 + layer * 0.35));

    const baseY = horizonY * (0.24 + layer * 0.055);
    const amp =
      height *
      (0.045 + layer * 0.018) *
      (0.52 +
        bassN * 0.62 +
        beatPulse * (layer === 0 ? 0.52 : 0.32) +
        energyN * 0.45);
    const freq = 0.008 + layer * 0.0045 + highN * 0.004 + beatPulse * 0.002;

    let yTop = baseY;
    ctx.beginPath();
    for (let xi = 0; xi <= steps; xi++) {
      const x = (xi / steps) * width;
      const u = xi / steps;
      const bCenter = spikeBinU(u, bl);
      const mag = spikeSample(dataArray, bl, bCenter, u > 0.45 ? 2 : 1);
      const magBoost = mag * (1 + 0.55 * Math.pow(u, 1.8)) + highN * 0.15 * u;
      const wobble =
        Math.sin(x * freq + phase) * amp * (0.58 + magBoost * 1.05 + beatPulse * 0.25) +
        Math.sin(x * freq * 2.1 + phase * 1.3) * amp * 0.22 * (magBoost + 0.15);
      const y = baseY + wobble + layer * 10;
      if (xi === 0) {
        ctx.moveTo(x, y);
        yTop = y;
      } else {
        ctx.lineTo(x, y);
        yTop = Math.min(yTop, y);
      }
    }
    ctx.lineTo(width, horizonY + 8 + layer * 6);
    ctx.lineTo(0, horizonY + 8 + layer * 6);
    ctx.closePath();

    const g = neonGradient(ctx, yTop, horizonY, width, time);
    ctx.globalAlpha = 0.38 - layer * 0.06 + energyN * 0.08 + beatPulse * 0.06;
    ctx.fillStyle = g;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `hsla(${(200 + layer * 40 + time * 0.06 + beatPulse * 55) % 360}, 82%, 74%, ${0.26 + beatPulse * 0.28 + energyN * 0.1})`;
    ctx.lineWidth = descent ? 1.2 : 1.8;
    ctx.setLineDash(descent ? [] : [6, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    if (!descent) {
      const gridN = 5;
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      for (let g = 0; g < gridN; g++) {
        const gy = yTop + ((g + 1) / (gridN + 1)) * (horizonY - yTop + 20);
        ctx.beginPath();
        for (let xi = 0; xi <= steps; xi++) {
          const x = (xi / steps) * width;
          const u = xi / steps;
          const bCenter = spikeBinU(u, bl);
          const mag = spikeSample(dataArray, bl, bCenter, u > 0.45 ? 2 : 1);
          const magBoost = mag * (1 + 0.55 * Math.pow(u, 1.8)) + highN * 0.15 * u;
          const wobble =
            Math.sin(x * freq + phase) * amp * (0.58 + magBoost * 1.05 + beatPulse * 0.25) +
            Math.sin(x * freq * 2.1 + phase * 1.3) * amp * 0.22 * (magBoost + 0.15);
          const y = baseY + wobble + layer * 10;
          const t2 = (g + 1) / (gridN + 1);
          const yy = y + (horizonY + 8 + layer * 6 - y) * t2;
          if (xi === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = `hsla(190, 65%, 72%, ${0.05 + midN * 0.06 + beatPulse * 0.08})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, horizonY + 16);
  ctx.clip();
  for (let L = 2; L >= 0; L--) drawRibbon(L);
  ctx.restore();

  drawPerspectiveFloor(ctx, width, height, horizonY, time, energyN, beatPulse, descent);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizonY - 2, width, height - horizonY + 2);
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  ctx.translate(0, horizonY * 2 - 2);
  ctx.scale(1, -(descent ? 0.48 : 0.58));
  ctx.globalAlpha = descent ? 0.14 : 0.24;
  for (let L = 2; L >= 0; L--) drawRibbon(L);
  ctx.globalAlpha = 1;
  ctx.restore();

  const nStreaks = descent ? 6 : 14;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let s = 0; s < nStreaks; s++) {
    const prog = s / Math.max(1, nStreaks - 1);
    const x0 = width * (-0.25 + prog * 1.45) + Math.sin(time * 0.0012 + s) * width * 0.1;
    const len = height * (0.62 + energyN * 0.12);
    const ang = 0.58 + beatPulse * 0.12 * (s % 3);
    ctx.save();
    ctx.translate(x0, horizonY + (height - horizonY) * 0.12);
    ctx.rotate(ang);
    const sg = ctx.createLinearGradient(0, 0, len, 0);
    const sh = (175 + s * 28 + time * 0.04) % 360;
    sg.addColorStop(0, 'rgba(0,0,0,0)');
    sg.addColorStop(0.35, `hsla(${sh}, 92%, 62%, ${0.1 + beatPulse * 0.22 + energyN * 0.08})`);
    sg.addColorStop(0.55, `hsla(${(sh + 40) % 360}, 88%, 60%, ${0.08 + energyN * 0.12 + beatPulse * 0.12})`);
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, -2, len, 5 + beatPulse * 8 + energyN * 3);
    ctx.restore();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = descent ? 0.22 : 0.34;
  for (let i = 0; i < nSpikes; i += descent ? 2 : 1) {
    const a = spikeSmooth[i] ?? 0;
    if (a < 0.06) continue;
    const x = marginX + i * stepX;
    const u = i / Math.max(1, nSpikes - 1);
    const h =
      a *
      spikeMaxH *
      (0.72 + beatPulse * 0.45 + energyN * 0.4 + u * 0.3) *
      (0.55 + (height - horizonY) / height * 0.5);
    const hue = (165 + (i / nSpikes) * 220 + time * 0.018) % 360;
    ctx.strokeStyle = `hsla(${hue}, 72%, 52%, ${0.22 + a * 0.42 + beatPulse * 0.15})`;
    ctx.lineWidth = 1.4 + a * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, horizonY + 2);
    ctx.lineTo(x, horizonY + 2 + h);
    ctx.stroke();
  }
  ctx.restore();

  const nPart = descent ? 28 : 64;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let p = 0; p < nPart; p++) {
    const seed = p * 17.13;
    const si = (p * 5 + Math.floor(beatPulse * 6)) % nSpikes;
    const u = si / Math.max(1, nSpikes - 1);
    const px =
      (width * (0.35 + 0.65 * Math.sin(seed + time * 0.001 + beatPulse * 0.8)) + u * width * 0.25) %
      width;
    const inFloor = p % 2 === 0;
    const py = inFloor
      ? horizonY + (height - horizonY) * (0.08 + ((p >> 1) / Math.max(1, nPart / 2)) * 0.88)
      : skyH * (0.08 + (p / nPart) * 0.82) + Math.sin(time * 0.002 + p) * 16;
    const spark =
      highN * 0.55 +
      highMidN * 0.25 +
      (spikeSmooth[si] ?? 0) * 0.55 +
      beatPulse * 0.35 +
      energyN * 0.2;
    if (spark < 0.18 + u * 0.12) continue;
    const ph = (p * 47 + time * 0.06) % 360;
    ctx.fillStyle = `hsla(${ph}, 88%, 78%, ${0.1 + spark * 0.28 + beatPulse * 0.12})`;
    ctx.beginPath();
    ctx.arc((px + width) % width, py, 0.8 + spark * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = `hsla(${sunHue}, 65%, 52%, ${0.38 + beatPulse * 0.25 + energyN * 0.12})`;
  ctx.lineWidth = 1.5 + beatPulse * 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width, horizonY);
  ctx.stroke();
}
