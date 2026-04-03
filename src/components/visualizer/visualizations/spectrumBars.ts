/**
 * Prism Spectrum — segmented bar spectrum sitting low on the canvas (“stage” EQ);
 * aurora sky, pulsing rings, wobbling columns, nebula + ribbon sheen, echo/reflection.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

const smoothed: number[] = [];
const echoSmoothed: number[] = [];
const peakHold: number[] = [];
const displayLevel: number[] = [];

function ensureSmoothed(n: number) {
  while (smoothed.length < n) smoothed.push(0);
  if (smoothed.length > n) smoothed.length = n;
  while (echoSmoothed.length < n) echoSmoothed.push(0);
  if (echoSmoothed.length > n) echoSmoothed.length = n;
  while (peakHold.length < n) peakHold.push(0);
  if (peakHold.length > n) peakHold.length = n;
  while (displayLevel.length < n) displayLevel.push(0);
  if (displayLevel.length > n) displayLevel.length = n;
}

/** Map bar index → FFT bin; gentler power spreads energy into upper bins (less “dead” right side). */
function barToBinU(u: number, bl: number): number {
  const spread = Math.pow(Math.max(0.001, u), 0.82);
  return Math.min(bl - 1, Math.floor(spread * (bl - 1)));
}

function sampleBandPeak(data: Uint8Array, bl: number, center: number, radius: number): number {
  const lo = Math.max(0, Math.floor(center - radius));
  const hi = Math.min(bl - 1, Math.ceil(center + radius));
  let m = 0;
  for (let k = lo; k <= hi; k++) m = Math.max(m, (data[k] ?? 0) / 255);
  return m;
}

function columnHue(
  i: number,
  nBars: number,
  time: number,
  eq: EQBands,
  energyN: number,
  beatPulse: number
): number {
  const t = i / Math.max(1, nBars - 1);
  const warp =
    Math.sin(time * 0.0022) * 28 +
    Math.sin(t * 6 + time * 0.0035) * 20 +
    Math.sin(i * 0.31 + time * 0.004) * 22;
  return (
    300 +
    t * 260 +
    time * (0.042 + energyN * 0.036) +
    (eq.mid / 255) * 32 +
    (eq.high / 255) * 18 +
    (eq.bass / 255) * 14 * t +
    Math.sin(t * Math.PI * 2 + time * 0.002) * 26 +
    beatPulse * 55 * (0.4 + t * 0.6) +
    warp
  ) % 360;
}

export function drawSpectrumBars(
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
  const nBars = descent ? 36 : 64;
  ensureSmoothed(nBars);
  const energyN = Math.min(1, eq.energy / 255);

  const tBg = time * 0.00035;
  const x0 = width * (0.15 + 0.2 * Math.sin(tBg));
  const y0 = height * (0.05 + 0.12 * Math.cos(tBg * 0.85));
  const x1 = width * (0.9 + 0.08 * Math.cos(tBg * 0.7));
  const y1 = height * (0.92 + 0.06 * Math.sin(tBg * 1.05));

  const baseGrad = ctx.createLinearGradient(x0, y0, x1, y1);
  baseGrad.addColorStop(0, '#06060c');
  baseGrad.addColorStop(0.35, '#0a0e18');
  baseGrad.addColorStop(0.65, '#080a14');
  baseGrad.addColorStop(1, '#050308');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  const cx = width * (0.5 + 0.08 * Math.sin(tBg * 0.55));
  const cy = height * (0.52 + 0.06 * Math.cos(tBg * 0.5));
  const glowR = Math.max(width, height) * (0.48 + (eq.energy / 255) * 0.06);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  const gh = (252 + Math.sin(tBg * 1.2) * 14 + (eq.bass / 255) * 20) % 360;
  glow.addColorStop(
    0,
    `hsla(${gh}, 52%, 24%, ${0.28 + (eq.energy / 255) * 0.12 + beatPulse * 0.14})`
  );
  glow.addColorStop(0.4, `hsla(${gh + 28}, 42%, 14%, 0.1)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const veil = ctx.createLinearGradient(0, 0, width, height);
  veil.addColorStop(
    0,
    `hsla(${(265 + time * 0.012) % 360}, 35%, 12%, ${0.08 + (1 - calm) * 0.06})`
  );
  veil.addColorStop(
    1,
    `hsla(${(195 + time * 0.01) % 360}, 40%, 10%, ${0.06 + (eq.high / 255) * 0.05})`
  );
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, width, height);

  const nb1 = ctx.createRadialGradient(
    width * (0.25 + 0.2 * Math.sin(tBg * 1.4)),
    height * (0.35 + 0.15 * Math.cos(tBg * 1.1)),
    0,
    width * 0.5,
    height * 0.4,
    Math.max(width, height) * 0.5
  );
  const nh = (time * 0.05 + 240) % 360;
  nb1.addColorStop(0, `hsla(${nh}, 68%, 40%, ${0.1 + energyN * 0.12 + beatPulse * 0.14})`);
  nb1.addColorStop(0.5, `hsla(${(nh + 90) % 360}, 58%, 24%, 0.06)`);
  nb1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nb1;
  ctx.fillRect(0, 0, width, height);

  const nb2 = ctx.createRadialGradient(
    width * (0.72 + 0.12 * Math.cos(tBg)),
    height * (0.28 + 0.12 * Math.sin(tBg * 0.9)),
    0,
    width * 0.65,
    height * 0.5,
    Math.max(width, height) * 0.38
  );
  nb2.addColorStop(0, `hsla(${(320 + time * 0.055) % 360}, 74%, 36%, ${0.08 + beatPulse * 0.08})`);
  nb2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nb2;
  ctx.fillRect(0, 0, width, height);

  const baseline = height * (descent ? 0.6 : 0.56);
  const maxH = height * (descent ? 0.36 : 0.42);
  const marginX = width * 0.035;
  const bandW = (width - marginX * 2) / nBars;
  const gap = Math.max(1, bandW * 0.14);
  const barW = Math.max(1.5, bandW - gap);
  const segH = Math.max(3.2, Math.min(5.8, height * 0.0075));
  const segGap = Math.max(1, segH * 0.24);
  const unit = segH + segGap;
  const maxSeg = Math.max(
    3,
    Math.floor((maxH / unit) * (0.82 + energyN * 0.28 + beatPulse * 0.22))
  );

  const wobbleX = (i: number) =>
    Math.sin(time * 0.0019 + i * 0.44) * (2.4 + beatPulse * 6) * (0.45 + (1 - calm) * 0.55);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const auroraBands = descent ? 4 : 7;
  const skyTop = baseline * 0.92;
  for (let b = 0; b < auroraBands; b++) {
    const gy = baseline * 0.05 + b * (skyTop * 0.13);
    const sway = Math.sin(time * 0.0013 + b * 1.05) * (14 + beatPulse * 22);
    const hA = (nh + b * 38 + time * 0.06 + beatPulse * 25) % 360;
    const ag = ctx.createLinearGradient(0, gy + sway, width, gy + sway + 70);
    ag.addColorStop(0, `hsla(${hA}, 75%, 48%, 0)`);
    ag.addColorStop(
      0.5,
      `hsla(${(hA + 70) % 360}, 85%, 58%, ${0.07 + energyN * 0.07 + beatPulse * 0.1})`
    );
    ag.addColorStop(1, `hsla(${(hA + 140) % 360}, 70%, 45%, 0)`);
    ctx.fillStyle = ag;
    ctx.fillRect(0, gy + sway, width, 62);
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const rcx = width * 0.5 + Math.sin(time * 0.0011) * width * 0.045;
  const rcy = baseline - maxH * 0.32;
  const nRing = descent ? 3 : 6;
  for (let r = 1; r <= nRing; r++) {
    const rad =
      22 +
      r * 36 +
      Math.sin(time * 0.0033 + r * 0.65) * 18 +
      beatPulse * 52 +
      energyN * 20;
    ctx.strokeStyle = `hsla(${(nh + r * 42 + time * 0.09) % 360}, 76%, 60%, ${0.06 + (1 - calm) * 0.05 + beatPulse * 0.11})`;
    ctx.lineWidth = 1.1 + beatPulse * 2.2;
    ctx.beginPath();
    ctx.arc(rcx, rcy, rad, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const smoothBase = 0.26 + (1 - calm) * 0.12 + (descent ? 0.05 : 0);
  const highN = Math.min(1, eq.high / 255);
  const highMidN = Math.min(1, eq.highMid / 255);
  const presenceN = Math.min(1, eq.presence / 255);
  const midN = Math.min(1, eq.mid / 255);
  const flowLift = Math.min(0.22, energyN * 0.12 + beatPulse * 0.14 + midN * 0.06);

  for (let i = 0; i < nBars; i++) {
    const u = i / Math.max(1, nBars - 1);
    const bin = barToBinU(u, bl);
    const win = u > 0.55 ? 2 + Math.floor(u * 4) : u > 0.28 ? 1 : 1;
    let v = sampleBandPeak(dataArray, bl, bin, win);

    const tilt = 0.52 + 2.35 * Math.pow(u, 2.15);
    v *= Math.min(2.4, tilt);

    if (u > 0.35) {
      const trebleMix =
        highN * 0.42 * Math.pow((u - 0.35) / 0.65, 1.2) +
        highMidN * 0.28 * Math.pow(u, 1.4) +
        presenceN * 0.24 * u;
      v = Math.min(1, v + trebleMix * 0.55);
    }

    v = Math.min(1, v + flowLift * (0.35 + 0.65 * u));
    v = Math.min(1, v * (1 + beatPulse * (0.18 + 0.62 * u)));
    if (u < 0.12) v = Math.min(1, v * (1 + beatPulse * 0.95));

    const gamma = 0.5 - u * 0.14;
    v = Math.pow(Math.min(1, Math.max(0, v)), gamma);

    const smoothA = Math.max(0.1, smoothBase * (1 - 0.58 * u * u));
    smoothed[i] = smoothed[i]! + (v - smoothed[i]!) * smoothA;

    const ph = peakHold[i] ?? 0;
    const pkDecay = 0.88 - u * 0.07 - beatPulse * 0.05;
    peakHold[i] = Math.max(v, ph * pkDecay);

    displayLevel[i] = Math.min(
      1,
      Math.max(smoothed[i]!, peakHold[i]! * (0.58 + 0.38 * u) + beatPulse * 0.08 * u)
    );

    const echoA = descent ? 0.16 : 0.11 + u * 0.06;
    echoSmoothed[i] = echoSmoothed[i]! + (displayLevel[i]! - echoSmoothed[i]!) * echoA;
  }

  const cornerR = Math.min(barW * 0.22, 2.8);
  const beatGlow = beatPulse * (descent ? 0.06 : 0.11);

  const drawRibbonSheen = () => {
    const steps = descent ? 28 : 46;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const passes = descent ? 2 : 3;
    for (let pass = 0; pass < passes; pass++) {
      const phase = time * (0.0015 + pass * 0.00045) + pass * 1.9 + beatPulse * 0.95;
      const amp =
        (0.02 + pass * 0.007) *
        height *
        (0.78 + energyN * 0.62 + beatPulse * 0.52 + midN * 0.24);
      const y0 = baseline - maxH * (0.32 + pass * 0.11);
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const x = marginX + t * (width - marginX * 2);
        const y =
          y0 +
          Math.sin(t * Math.PI * 4 + phase) * amp +
          Math.sin(t * Math.PI * 7 + phase * 1.3) * amp * 0.38 +
          Math.sin(t * 0.002 + t * 9) * amp * 0.12;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${(280 + pass * 55 + time * 0.095 + beatPulse * 48) % 360}, 90%, 66%, ${0.1 + beatGlow + (1 - calm) * 0.06 + energyN * 0.08})`;
      ctx.lineWidth = descent ? 2.1 : 2.6 + pass * 0.35;
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawEchoBars = () => {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const off = descent ? 3 : 5;
    for (let i = 0; i < nBars; i++) {
      const a = echoSmoothed[i] ?? 0;
      const lit = Math.min(maxSeg, Math.max(0, Math.ceil(a * maxSeg * 0.92)));
      const bx = marginX + i * bandW + gap * 0.5 + off + wobbleX(i) * 0.85;
      const hue = columnHue(i, nBars, time, eq, energyN, beatPulse);
      for (let s = 0; s < lit; s++) {
        const x = bx;
        const y = baseline - (s + 1) * unit + segGap * 0.5;
        const alpha = (0.14 + a * 0.12) * (0.75 + s / Math.max(1, lit) * 0.25);
        ctx.fillStyle = `hsla(${hue}, 92%, 58%, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW * 0.92, segH * 0.9, cornerR * 0.8);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  drawEchoBars();

  const floorH = height - baseline;
  const stageGrad = ctx.createLinearGradient(0, baseline, 0, height);
  stageGrad.addColorStop(0, `hsla(${gh}, 42%, 8%, 0.95)`);
  stageGrad.addColorStop(0.25, '#06040f');
  stageGrad.addColorStop(0.55, '#08051c');
  stageGrad.addColorStop(1, '#030206');
  ctx.fillStyle = stageGrad;
  ctx.fillRect(0, baseline, width, floorH);

  const stageGlow = ctx.createRadialGradient(
    width * 0.5,
    baseline,
    0,
    width * 0.5,
    baseline + floorH * 0.55,
    Math.max(width, floorH) * 0.85
  );
  stageGlow.addColorStop(0, `hsla(${(nh + 40) % 360}, 45%, 22%, ${0.1 + energyN * 0.08 + beatPulse * 0.08})`);
  stageGlow.addColorStop(0.45, `hsla(${gh}, 38%, 12%, 0.05)`);
  stageGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = stageGlow;
  ctx.fillRect(0, baseline, width, floorH);

  if (!descent) {
    const cx = width * 0.5;
    const nFan = 19;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let f = 0; f < nFan; f++) {
      const t = f / (nFan - 1) - 0.5;
      const x1 = cx + t * width * 0.48;
      const x2 = cx + t * width * 0.92;
      const y2 = height * 0.98;
      ctx.strokeStyle = `hsla(${(260 + f * 8) % 360}, 50%, 40%, ${0.03 + beatPulse * 0.05})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x1, baseline + 2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  const drawMainBars = () => {
    for (let i = 0; i < nBars; i++) {
      const a = displayLevel[i] ?? 0;
      const lit = Math.min(maxSeg, Math.max(0, Math.ceil(a * maxSeg)));
      const bx = marginX + i * bandW + gap * 0.5 + wobbleX(i);
      const hue = columnHue(i, nBars, time, eq, energyN, beatPulse);

      for (let s = 0; s < lit; s++) {
        const x = bx;
        const y = baseline - (s + 1) * unit + segGap * 0.5;
        const segT = s / Math.max(1, lit - 1);
        const depthFade = 0.88 + segT * 0.12;
        const alpha = (0.78 + a * 0.22) * depthFade;
        const light = 46 + segT * 16 + a * 12;
        const sat = 88 + Math.sin(time * 0.003 + i + s) * 8 + beatPulse * 6;
        const isPeak = s === lit - 1 && lit > 1;

        if (!descent && isPeak && a > 0.45) {
          ctx.shadowColor = `hsla(${hue}, 95%, 60%, ${0.45 + beatPulse * 0.35})`;
          ctx.shadowBlur = 10 + a * 22 + beatPulse * 18;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `hsla(${hue}, ${Math.min(100, sat)}%, ${light + beatPulse * 9}%, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, segH, cornerR);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (alpha > 0.35) {
          ctx.strokeStyle = `hsla(${hue}, 40%, 92%, ${0.12 + a * 0.15 + beatPulse * 0.12})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }
  };

  const drawReflectionBars = () => {
    const refAlpha = descent ? 0.22 : 0.34;
    for (let i = 0; i < nBars; i++) {
      const a = displayLevel[i] ?? 0;
      const lit = Math.min(maxSeg, Math.max(0, Math.ceil(a * maxSeg)));
      const bx = marginX + i * bandW + gap * 0.5 + wobbleX(i) * 0.9;
      const hue = columnHue(i, nBars, time, eq, energyN, beatPulse);

      for (let s = 0; s < lit; s++) {
        const jitter = Math.sin(s * 1.05 + i * 0.33 + time * 0.0025) * barW * 0.24;
        const x = bx + jitter;
        const stretch = 1.15 + (1 - a) * 0.12;
        const y = baseline + s * unit * stretch + segGap * 0.5;
        const falloff = (1 - s / maxSeg) * 0.92;
        const alpha = refAlpha * falloff * (0.72 + a * 0.38 + beatPulse * 0.12);
        const light = 36 + (1 - s / maxSeg) * 16;

        ctx.fillStyle = `hsla(${hue}, 68%, ${light}%, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, segH, cornerR);
        ctx.fill();
      }
    }
  };

  drawMainBars();

  if (!descent) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nBars; i += 3) {
      const a = displayLevel[i] ?? 0;
      if (a < 0.42) continue;
      const bx = marginX + i * bandW + gap * 0.5 + barW * 0.5 + wobbleX(i);
      const hue = columnHue(i, nBars, time, eq, energyN, beatPulse);
      const hTop = baseline - maxH * (0.85 + a * 0.12);
      ctx.strokeStyle = `hsla(${hue}, 75%, 72%, ${0.06 + a * 0.14 + beatPulse * 0.1})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx, baseline + 2);
      ctx.lineTo(bx, hTop);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRibbonSheen();

  const nSpark = descent ? 16 : 34;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let p = 0; p < nSpark; p++) {
    const i = (p * 7 + Math.floor(beatPulse * 5)) % nBars;
    const a = displayLevel[i] ?? 0;
    const u = i / Math.max(1, nBars - 1);
    if (a < 0.18 + u * 0.08) continue;
    const bx = marginX + i * bandW + gap * 0.5 + barW * 0.5 + wobbleX(i);
    const lit = Math.min(maxSeg, Math.ceil(a * maxSeg));
    const y = baseline - lit * unit - 4 + Math.sin(time * 0.004 + p) * 8;
    const hue = columnHue(i, nBars, time, eq, energyN, beatPulse);
    ctx.fillStyle = `hsla(${hue}, 90%, 78%, ${0.12 + a * 0.32 + beatPulse * 0.28 + energyN * 0.08})`;
    ctx.beginPath();
    ctx.arc(bx, y, 1.2 + a * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, baseline + 0.5, width, height - baseline);
  ctx.clip();
  drawReflectionBars();
  const scan = ctx.createLinearGradient(0, baseline, 0, height);
  scan.addColorStop(0, 'rgba(255,255,255,1)');
  scan.addColorStop(0.42, 'rgba(210,210,235,0.55)');
  scan.addColorStop(0.78, 'rgba(80,70,120,0.22)');
  scan.addColorStop(1, 'rgba(20,15,35,0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = scan;
  ctx.fillRect(0, baseline, width, height - baseline);
  ctx.restore();

  ctx.strokeStyle = `hsla(${gh}, 55%, 55%, ${0.2 + beatGlow * 2 + energyN * 0.12})`;
  ctx.lineWidth = 1 + beatPulse * 1.5;
  ctx.shadowColor = `hsla(${gh}, 80%, 60%, ${0.35 + beatPulse * 0.4})`;
  ctx.shadowBlur = descent ? 0 : 8 + beatPulse * 14;
  ctx.beginPath();
  ctx.moveTo(marginX, baseline);
  ctx.lineTo(width - marginX, baseline);
  ctx.stroke();
  ctx.shadowBlur = 0;
}
